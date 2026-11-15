"""
In-memory room controller (PIN rooms, 30s wave timers, live concurrency & 60s flight turns).
Owner: Rubén (Tasks RUB-02, RUB-03, RUB-04, RUB-05)
See docs/17-roadmap-ruben.md and docs/08-controles.md before editing.
"""
from __future__ import annotations

import asyncio
import secrets
import string
from typing import Any

import socketio

if __package__:
    from . import decision_tree, physics_engine, randomizer
    from .juegos_espectrales import adaptadores_web
    from .models.subsystems import get_launcher, get_mission
else:
    import decision_tree
    import physics_engine
    import randomizer
    from juegos_espectrales import adaptadores_web
    from models.subsystems import get_launcher, get_mission

ALL_ROLES = ["finance_launch", "spacecraft_mass", "orbit_power", "science_comms"]
VALID_MISSIONS = {"artemis_moon", "asteroid_hunter", "mars_sample_return"}
VALID_DIFFICULTIES = {"easy", "medium", "hard"}


class GameManager:
    def __init__(
        self,
        sio: socketio.AsyncServer,
        wave_duration_sec: float = 0.0,
        sync_delay_sec: float = 3.0,
        flight_round_sec: float = 0.0,
        flight_feedback_sec: float = 4.0,
        station_grace_sec: float = 2.0,
        launch_transition_sec: float = 4.5,
        wave_backstop_sec: float = 150.0,
        flight_backstop_sec: float = 90.0,
    ) -> None:
        self.sio = sio
        # 0 = untimed (docs/03, 2026-11-15): players lock when ready. The client shows no clock.
        self.wave_duration_sec = wave_duration_sec
        self.sync_delay_sec = sync_delay_sec
        self.flight_round_sec = flight_round_sec
        self.flight_feedback_sec = flight_feedback_sec
        # Extra slack before a *timed* station is forced (client walk animation + network).
        self.station_grace_sec = station_grace_sec
        # Walk to the launchpad (2.2 s) + liftoff cutscene (2.3 s) in LinearStationTrack/App.tsx.
        self.launch_transition_sec = launch_transition_sec
        # Hidden AFK backstops for untimed play: an idle player can never block the room forever.
        # Not shown to players; generous enough that nobody playing normally ever hits them.
        self.wave_backstop_sec = wave_backstop_sec
        self.flight_backstop_sec = flight_backstop_sec

        self.rooms: dict[str, dict[str, Any]] = {}
        self.locks: dict[str, asyncio.Lock] = {}
        self.timers: dict[str, asyncio.Task[Any]] = {}
        self.sid_to_pin: dict[str, str] = {}

    def _get_lock(self, pin: str) -> asyncio.Lock:
        if pin not in self.locks:
            self.locks[pin] = asyncio.Lock()
        return self.locks[pin]

    def _cancel_timer(self, pin: str) -> None:
        task = self.timers.pop(pin, None)
        # Never cancel the task we are running in: a timeout handler that advances the match
        # (e.g. an auto-answered flight round) would otherwise cancel itself mid-transition and
        # the next question / wave would never be emitted (frozen "0s" screen).
        if task and not task.done() and task is not asyncio.current_task():
            task.cancel()

    def _generate_pin(self) -> str:
        alphabet = string.ascii_uppercase + string.digits
        for _ in range(50):
            candidate = "".join(secrets.choice(alphabet) for _ in range(6))
            if candidate not in self.rooms:
                return candidate
        return "".join(secrets.choice(alphabet) for _ in range(6))

    async def handle_connect(self, sid: str) -> None:
        """No-op hook when a Socket.IO client connects."""
        return None

    async def handle_disconnect(self, sid: str) -> None:
        """Clean up disconnected player and ensure no wave or flight round hangs."""
        pin = self.sid_to_pin.pop(sid, None)
        if not pin:
            for candidate_pin, room_data in list(self.rooms.items()):
                if sid in room_data.get("players", {}):
                    pin = candidate_pin
                    break
        if not pin or pin not in self.rooms:
            return

        advance_wave: int | None = None
        async with self._get_lock(pin):
            room = self.rooms.get(pin)
            if not room:
                return
            room["players"].pop(sid, None)
            if not room["players"]:
                self._cancel_timer(pin)
                return

            phase = room.get("phase", "lobby")
            human_roles = {p["role"] for p in room["players"].values() if p.get("role")}
            if phase == "wave1" and human_roles and human_roles.issubset(set(room["wave1_takes"].keys())):
                self._cancel_timer(pin)
                advance_wave = 1
            elif phase == "wave2" and human_roles and human_roles.issubset(set(room["wave2_takes"].keys())):
                self._cancel_timer(pin)
                advance_wave = 2

        await self._emit_room_state(pin)
        if advance_wave == 1:
            await self._transition_to_wave2(pin)
        elif advance_wave == 2:
            await self._transition_to_flight(pin)

    @staticmethod
    def _sync_alias_pair(
        state: dict[str, Any], key_a: str, key_b: str, changed: dict[str, Any] | None
    ) -> None:
        """Keep two alias keys equal. The key a player just changed wins over a stale one."""
        source: str | None = None
        for key in (key_a, key_b):
            if changed and changed.get(key) is not None:
                source = key
                break
        if source is None:
            source = next((k for k in (key_b, key_a) if state.get(k) is not None), None)
        if source is None:
            state.pop(key_a, None)
            state.pop(key_b, None)
            return
        value = float(state[source])
        state[key_a] = value
        state[key_b] = value

    def _normalize_state_aliases(
        self, state: dict[str, Any], mission_id: str, changed: dict[str, Any] | None = None
    ) -> None:
        """Keep state keys synchronized with ConsolidatedMissionState schema.

        `changed` is the partial payload that just arrived (if any): for alias pairs such as
        dry_mass_kg / bus_dry_mass_kg the freshly changed key overrides the older one.
        """
        mission = get_mission(mission_id)
        state.setdefault("budget_limit_usd", float(mission.get("budget_limit_usd", 800_000_000.0)))
        self._sync_alias_pair(state, "dry_mass_kg", "bus_dry_mass_kg", changed)
        self._sync_alias_pair(state, "available_power_w", "power_generation_w", changed)
        # Every mission leaves Earth: the usable capacity is the launcher's Earth-escape (Mars)
        # capacity from nasa_catalog.json. LEO-only vehicles (rideshare, Electron) or vehicles
        # without a sourced escape figure get 0 kg, so Node 1 fails with "cannot reach target".
        if not state.get("selected_launcher") and state.get("selected_launcher_id"):
            state["selected_launcher"] = str(state["selected_launcher_id"])
        if state.get("selected_launcher"):
            wanted = str(state["selected_launcher"])
            launcher = get_launcher(wanted)
            matched = launcher.get("id") == wanted or launcher.get("name") == wanted
            escape_kg = launcher.get("max_mass_mars_kg") if matched else None
            # The Moon only needs trans-lunar injection (TLI); asteroids and Mars need Earth escape.
            tli_kg = launcher.get("max_mass_tli_kg") if matched and mission_id == "artemis_moon" else None
            state["launcher_max_mass_kg"] = float(max(float(escape_kg or 0.0), float(tli_kg or 0.0)))

        marks = state.get("spectral_marks")
        expected = state.get("_expected_spectral_peaks")
        if isinstance(marks, list) and marks:
            numeric_marks = [float(m) for m in marks if isinstance(m, (int, float))]
            if numeric_marks:
                state["science_calibration_f1"] = adaptadores_web.evaluar_marcas(
                    numeric_marks, expected if isinstance(expected, list) else None
                )

    def _build_toast_alert(
        self,
        source_role: str | None,
        prev_metrics: dict[str, Any],
        new_metrics: dict[str, Any],
        delta: dict[str, Any],
        live_state: dict[str, Any],
    ) -> str | None:
        """Generate a causal English toast alert when a threshold changes significantly."""
        if "cg_balanced" in delta:
            if not new_metrics.get("cg_balanced", True):
                return "CG off-center! Thruster fuel burn multiplied by 1.5x & DSN drift increased!"
            if not prev_metrics.get("cg_balanced", True) and new_metrics.get("cg_balanced", True):
                return "Center of Gravity balanced: nominal 1.0x burn restored."

        if "has_thermal_protection" in delta and not new_metrics.get("has_thermal_protection", True):
            return "Heat Shield omitted in Spacecraft Assembly: critical reentry risk at Node 3!"

        old_fspl = float(prev_metrics.get("fspl_loss_db", 166.0))
        new_fspl = float(new_metrics.get("fspl_loss_db", 166.0))
        if abs(new_fspl - old_fspl) >= 3.0 or "trajectory_choice" in delta:
            traj = str(delta.get("trajectory_choice", live_state.get("trajectory_choice", "orbit"))).upper()
            return f"Orbit updated ({traj}): Free-Space Path Loss shifted to {new_fspl:.1f} dB!"

        old_mass = float(prev_metrics.get("estimated_wet_mass_kg", 0.0))
        new_mass = float(new_metrics.get("estimated_wet_mass_kg", 0.0))
        launcher_cap = float(live_state.get("launcher_max_mass_kg", 4020.0))
        if new_mass > launcher_cap:
            return f"Mass Alert: Wet mass ({new_mass:.0f} kg) exceeds launcher cap ({launcher_cap:.0f} kg)!"
        if old_mass <= 831.0 < new_mass:
            return f"Wet mass reached {new_mass:.0f} kg: SpaceX Rideshare XL (831 kg) exceeded!"
        if abs(new_mass - old_mass) >= 120.0:
            return f"Live mass mutation from {source_role or 'station'}: wet mass now {new_mass:.0f} kg."

        old_ufe = float(prev_metrics.get("ufe_reserve_pct", 25.0))
        new_ufe = float(new_metrics.get("ufe_reserve_pct", 25.0))
        if new_ufe < 20.0 and (old_ufe >= 20.0 or "ufe_reserve_pct" in delta):
            return f"UFE Reserve dropped to {new_ufe:.0f}% (below NASA NPR 7120.5 20% safety floor)!"

        if "funding_factor_F" in delta:
            f_val = float(new_metrics.get("funding_factor_F", 0.6))
            return f"R&D Funding Factor F set to {f_val:.2f}: H2 Fuel Cell spawn rate updated in 3D Rover!"

        return None

    async def handle_create_room(self, sid: str, data: dict[str, Any]) -> None:
        pin = self._generate_pin()
        player_id = sid
        mode = "multi" if data.get("mode") == "multi" else "single"
        host_name = str(data.get("host_name") or "Commander").strip() or "Commander"
        mission_id = str(data.get("mission_id") or "artemis_moon")
        if mission_id not in VALID_MISSIONS:
            mission_id = "artemis_moon"
        difficulty = str(data.get("difficulty") or "easy")
        if difficulty not in VALID_DIFFICULTIES:
            difficulty = "easy"

        self.rooms[pin] = {
            "pin": pin,
            "mode": mode,
            "phase": "lobby",
            "mission_id": mission_id,
            "difficulty": difficulty,
            "players": {
                player_id: {
                    "name": host_name,
                    "role": "finance_launch",
                }
            },
            "live_state": {},
            "last_metrics": {},
            "wave1_takes": {},
            "wave2_takes": {},
            "flight_state": {},
            "decision_history": [],
            "round": 1,
            "round_answered": False,
            "current_question": None,
        }
        self.sid_to_pin[sid] = pin
        await self.sio.enter_room(sid, pin)
        await self.sio.emit("sala_creada", {"pin": pin, "player_id": player_id}, to=sid)
        await self._emit_room_state(pin)

    async def handle_join_room(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).strip().upper()
        room = self.rooms.get(pin)
        if not room:
            await self.sio.emit("error_sala", {"message": "Room not found or full."}, to=sid)
            return

        async with self._get_lock(pin):
            if sid not in room["players"] and len(room["players"]) >= 4:
                await self.sio.emit("error_sala", {"message": "Room not found or full."}, to=sid)
                return
            taken = {
                p["role"]
                for pid, p in room["players"].items()
                if pid != sid and p.get("role")
            }
            free_role = next((r for r in ALL_ROLES if r not in taken), ALL_ROLES[0])
            player_name = str(data.get("player_name") or "Crewmate").strip() or "Crewmate"
            room["players"][sid] = {"name": player_name, "role": free_role}
            self.sid_to_pin[sid] = pin

        await self.sio.enter_room(sid, pin)
        await self._emit_room_state(pin)

    async def handle_select_role_mission(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).strip().upper()
        room = self.rooms.get(pin)
        if not room:
            return
        async with self._get_lock(pin):
            mission_id = data.get("mission_id")
            if isinstance(mission_id, str) and mission_id in VALID_MISSIONS:
                room["mission_id"] = mission_id

            difficulty = data.get("difficulty")
            if isinstance(difficulty, str) and difficulty in VALID_DIFFICULTIES:
                room["difficulty"] = difficulty

            target_pid = str(data.get("player_id") or sid)
            if target_pid not in room["players"] and sid in room["players"]:
                target_pid = sid

            role_id = data.get("role_id")
            if isinstance(role_id, str) and role_id in ALL_ROLES and target_pid in room["players"]:
                taken_by_others = {
                    p["role"]
                    for pid, p in room["players"].items()
                    if pid != target_pid and p.get("role")
                }
                if role_id not in taken_by_others:
                    room["players"][target_pid]["role"] = role_id

        await self._emit_room_state(pin)

    async def handle_start_game(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).strip().upper()
        room = self.rooms.get(pin)
        if not room:
            return

        async with self._get_lock(pin):
            self._cancel_timer(pin)
            mission_id = room["mission_id"]
            difficulty = room["difficulty"]
            mission_cfg = get_mission(mission_id)

            room["phase"] = "wave1"
            room["wave1_takes"] = {}
            room["wave2_takes"] = {}
            room["decision_history"] = []
            room["round"] = 1
            room["round_answered"] = False
            room["live_state"] = {
                "budget_limit_usd": float(mission_cfg.get("budget_limit_usd", 800_000_000.0)),
                "required_dv_ms": float(mission_cfg.get("default_required_dv_ms", 1803.6)),
            }

            # 1-4 players: a connected human who never claimed a role gets the first free one, so
            # every human plays a unique station and only truly empty seats go to the AI autopilot.
            roles_assigned = self._assign_free_roles(room)
            human_roles = {p["role"] for p in room["players"].values() if p.get("role")}
            if roles_assigned:
                await self._emit_room_state(pin)
            ai_wave1 = {
                r: randomizer.synthesize_ai_role_wave1(r, difficulty, mission_id)
                for r in ALL_ROLES
                if r not in human_roles
            }
            for role_id, role_data in ai_wave1.items():
                room["wave1_takes"][role_id] = role_data
                room["live_state"].update(role_data)

            spectral = adaptadores_web.generar_reto_oleada1(mission_id, difficulty)
            room["live_state"]["_expected_spectral_peaks"] = spectral.get("expected_peaks", [])
            self._normalize_state_aliases(room["live_state"], mission_id)
            initial_metrics = physics_engine.compute_live_metrics(room["live_state"], mission_id)
            room["last_metrics"] = dict(initial_metrics)

            await self.sio.emit(
                "iniciar_oleada_1",
                {
                    "duration_sec": int(self.wave_duration_sec),
                    "mission_config": mission_cfg,
                    "ai_wave1_state": ai_wave1,
                    "spectral_challenge": spectral,
                    "initial_constraints": initial_metrics,
                    "gate_forecast": self._gate_forecast(room),
                },
                room=pin,
            )

            if self._wave_limit_sec() > 0:
                self.timers[pin] = asyncio.create_task(self._wave1_timeout(pin))

    def _wave_limit_sec(self) -> float:
        return self.wave_duration_sec if self.wave_duration_sec > 0 else self.wave_backstop_sec

    def _flight_limit_sec(self) -> float:
        return self.flight_round_sec if self.flight_round_sec > 0 else self.flight_backstop_sec

    async def _wave1_timeout(self, pin: str) -> None:
        try:
            await asyncio.sleep(self._wave_limit_sec() + self.station_grace_sec)
            await self._transition_to_wave2(pin, forced_by_timeout=True)
        except asyncio.CancelledError:
            return

    async def handle_partial_action(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).strip().upper()
        room = self.rooms.get(pin)
        if not room:
            return
        async with self._get_lock(pin):
            delta = data.get("partial_delta", {})
            prev_metrics = dict(room.get("last_metrics") or {})
            if isinstance(delta, dict):
                room["live_state"].update({k: v for k, v in delta.items() if v is not None})
            self._normalize_state_aliases(
                room["live_state"], room["mission_id"], delta if isinstance(delta, dict) else None
            )
            metrics = physics_engine.compute_live_metrics(room["live_state"], room["mission_id"])
            room["last_metrics"] = dict(metrics)
            toast_alert = self._build_toast_alert(
                data.get("role_id"),
                prev_metrics,
                metrics,
                delta if isinstance(delta, dict) else {},
                room["live_state"],
            )

        payload: dict[str, Any] = {
            "source_role": data.get("role_id"),
            "live_metrics": metrics,
            "gate_forecast": self._gate_forecast(room),
        }
        if toast_alert:
            payload["toast_alert"] = toast_alert
        await self.sio.emit("mutacion_en_vivo", payload, room=pin)

    async def handle_lock_take(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).strip().upper()
        room = self.rooms.get(pin)
        if not room:
            return
        role_id = str(data.get("role_id") or "")
        if role_id not in ALL_ROLES and sid in room["players"]:
            role_id = str(room["players"][sid].get("role") or "finance_launch")
        wave = int(data.get("wave", 1))
        payload = data.get("payload", {})

        advance_to_wave2 = False
        advance_to_flight = False

        async with self._get_lock(pin):
            if isinstance(payload, dict):
                room["live_state"].update({k: v for k, v in payload.items() if v is not None})
            self._normalize_state_aliases(
                room["live_state"], room["mission_id"], payload if isinstance(payload, dict) else None
            )
            room["last_metrics"] = physics_engine.compute_live_metrics(
                room["live_state"], room["mission_id"]
            )

            target_map = room["wave1_takes"] if wave == 1 else room["wave2_takes"]
            target_map[role_id] = payload if isinstance(payload, dict) else {}
            await self.sio.emit(
                "jugador_bloqueo_toma",
                {"role_id": role_id, "wave": wave},
                room=pin,
            )
            # A locked take changes the shared state: refresh everyone's metrics + gate forecast.
            await self.sio.emit(
                "mutacion_en_vivo",
                {
                    "source_role": role_id,
                    "live_metrics": room["last_metrics"],
                    "gate_forecast": self._gate_forecast(room),
                    "quiet": True,
                },
                room=pin,
            )

            human_roles = {p["role"] for p in room["players"].values() if p.get("role")}
            if human_roles and human_roles.issubset(set(target_map.keys())):
                self._cancel_timer(pin)
                if wave == 1 and room.get("phase") == "wave1":
                    advance_to_wave2 = True
                elif wave == 2 and room.get("phase") in ("wave1", "wave2"):
                    advance_to_flight = True

        if advance_to_wave2:
            await self._transition_to_wave2(pin, forced_by_timeout=False)
        elif advance_to_flight:
            await self._transition_to_flight(pin, forced_by_timeout=False)

    async def _transition_to_wave2(self, pin: str, forced_by_timeout: bool = False) -> None:
        async with self._get_lock(pin):
            room = self.rooms.get(pin)
            if not room or room.get("phase") != "wave1":
                return
            room["phase"] = "wave2"
            mission_id = room["mission_id"]
            difficulty = room["difficulty"]
            human_roles = {p["role"] for p in room["players"].values() if p.get("role")}

            # Fill any human role that timed out without submitting Wave 1
            for r in human_roles:
                if r not in room["wave1_takes"]:
                    fallback_w1 = randomizer.synthesize_ai_role_wave1(r, difficulty, mission_id)
                    room.setdefault("human_fallbacks", []).append({"role": r, "wave": 1})
                    if r == "spacecraft_mass" and forced_by_timeout:
                        # Timeout penalty per docs/03-decisiones.md A5
                        fallback_w1["has_thermal_protection"] = False
                    room["wave1_takes"][r] = fallback_w1
                    for k, v in fallback_w1.items():
                        room["live_state"].setdefault(k, v)
                    await self.sio.emit("jugador_bloqueo_toma", {"role_id": r, "wave": 1}, room=pin)

            self._normalize_state_aliases(room["live_state"], mission_id)
            w1_metrics = physics_engine.compute_live_metrics(room["live_state"], mission_id)
            room["last_metrics"] = dict(w1_metrics)

            for r in ALL_ROLES:
                if r not in human_roles:
                    ai_w2 = randomizer.synthesize_ai_role_wave2(
                        r, difficulty, w1_metrics, mission_id
                    )
                    room["wave2_takes"][r] = ai_w2
                    room["live_state"].update(ai_w2)

            self._normalize_state_aliases(room["live_state"], mission_id)
            hacker = adaptadores_web.generar_reto_hacker(mission_id, difficulty)

            await self.sio.emit(
                "iniciar_oleada_2",
                {
                    "sync_delay_sec": int(self.sync_delay_sec),
                    "duration_sec": int(self.wave_duration_sec),
                    "consolidated_wave1": w1_metrics,
                    "spectral_challenge": hacker,
                },
                room=pin,
            )

            if self._wave_limit_sec() > 0:
                self.timers[pin] = asyncio.create_task(self._wave2_timeout(pin))

    async def _wave2_timeout(self, pin: str) -> None:
        try:
            await asyncio.sleep(self.sync_delay_sec + self._wave_limit_sec() + self.station_grace_sec)
            await self._transition_to_flight(pin, forced_by_timeout=True)
        except asyncio.CancelledError:
            return

    @staticmethod
    def _collaboration_score(room: dict[str, Any]) -> dict[str, Any]:
        """Crew coordination score 0-100 (challenge: reward successful collaboration).

        40 % stations locked by the humans themselves (no AI fallback after a timeout),
        30 % flight calls answered by the crew (not auto-answered), 30 % gates Ready at liftoff
        (the subsystems the roles designed fit together). Fair in solo: it measures coordination.
        """
        human_roles = {p["role"] for p in room["players"].values() if p.get("role")}
        human_stations = max(1, 2 * len(human_roles))
        fallbacks = len(room.get("human_fallbacks", []))
        own_locks = max(0.0, (human_stations - fallbacks) / human_stations)
        history = room.get("decision_history", [])
        answered = (sum(1 for h in history if not h.get("timed_out")) / len(history)) if history else 1.0
        gates = room.get("launch_gates") or {}
        gates_ready = (sum(1 for v in gates.values() if v == "PASS") / len(gates)) if gates else 1.0
        score = round(100 * (0.4 * own_locks + 0.3 * answered + 0.3 * gates_ready))
        return {
            "score": int(score),
            "humans": len(human_roles),
            "own_locks_pct": round(own_locks * 100),
            "answered_pct": round(answered * 100),
            "gates_ready_at_liftoff": sum(1 for v in gates.values() if v == "PASS"),
        }

    @staticmethod
    def _gate_forecast(room: dict[str, Any], source: dict[str, Any] | None = None) -> dict[str, str]:
        """Live forecast of the 4 flight gates from the current shared state (server authority)."""
        try:
            base = source if source is not None else room.get("live_state", {})
            state = {k: v for k, v in base.items() if not str(k).startswith("_")}
            return decision_tree.evaluate_preliminary_gates(room["mission_id"], state)
        except Exception:  # forecast is advisory: never break the match over it
            return {}

    @staticmethod
    def _assign_free_roles(room: dict[str, Any]) -> bool:
        """Give role-less players the first free roles (ALL_ROLES order). Returns True if any changed."""
        taken = {p["role"] for p in room["players"].values() if p.get("role")}
        free = [r for r in ALL_ROLES if r not in taken]
        changed = False
        for player in room["players"].values():
            if player.get("role") or not free:
                continue
            player["role"] = free.pop(0)
            changed = True
        return changed

    def _select_active_player_for_round(
        self, room: dict[str, Any], round_num: int, assigned_role: str
    ) -> tuple[str, str]:
        """Assign turn to matching human role, or rotate cleanly across connected humans."""
        players_list = list(room["players"].values())
        if not players_list:
            return assigned_role, "AI Commander"

        for p in players_list:
            if p.get("role") == assigned_role:
                return assigned_role, str(p.get("name") or "Commander")

        chosen_player = players_list[(round_num - 1) % len(players_list)]
        active_role = str(chosen_player.get("role") or assigned_role)
        active_name = str(chosen_player.get("name") or "Commander")
        return active_role, active_name

    async def _transition_to_flight(self, pin: str, forced_by_timeout: bool = False) -> None:
        async with self._get_lock(pin):
            room = self.rooms.get(pin)
            if not room or room.get("phase") == "flight":
                return
            room["phase"] = "flight"
            mission_id = room["mission_id"]
            difficulty = room["difficulty"]
            human_roles = {p["role"] for p in room["players"].values() if p.get("role")}
            w1_metrics = physics_engine.compute_live_metrics(room["live_state"], mission_id)

            for r in human_roles:
                if r not in room["wave2_takes"]:
                    fallback_w2 = randomizer.synthesize_ai_role_wave2(
                        r, difficulty, w1_metrics, mission_id
                    )
                    room.setdefault("human_fallbacks", []).append({"role": r, "wave": 2})
                    if r == "spacecraft_mass" and forced_by_timeout:
                        fallback_w2["cg_balanced"] = False
                        fallback_w2["fuel_burn_multiplier"] = 1.5
                    room["wave2_takes"][r] = fallback_w2
                    for k, v in fallback_w2.items():
                        room["live_state"].setdefault(k, v)
                    await self.sio.emit("jugador_bloqueo_toma", {"role_id": r, "wave": 2}, room=pin)

            self._normalize_state_aliases(room["live_state"], mission_id)
            room["round"] = 1
            room["round_answered"] = False
            room["flight_state"] = {
                k: v for k, v in room["live_state"].items() if not str(k).startswith("_")
            }
            # Survival phase: one random hazard per match (seeded by PIN), softened by good design.
            room["launch_gates"] = self._gate_forecast(room, room["flight_state"])
            room["attempt"] = int(room.get("attempt", 0)) + 1
            tuning = decision_tree.difficulty_tuning(room.get("difficulty"))
            summaries: list[dict[str, Any]] = []
            for event in decision_tree.pick_random_events(
                room["mission_id"], f"{pin}:{room['attempt']}", room.get("difficulty")
            ):
                room["flight_state"], summary = decision_tree.apply_random_event(
                    room["flight_state"], event, room["mission_id"], tuning["scale"]
                )
                if summary:
                    summaries.append(summary)
            room["random_events"] = summaries
            room["random_event"] = summaries[0] if summaries else None

            await self.sio.emit(
                "iniciar_vuelo_60s",
                {
                    "total_duration_sec": 60,
                    "consolidated_state": room["flight_state"],
                    "preliminary_gates": self._gate_forecast(room, room["flight_state"]),
                    "random_event": room.get("random_event"),
                    "random_events": room.get("random_events", []),
                },
                room=pin,
            )

        if self.launch_transition_sec > 0:
            await asyncio.sleep(self.launch_transition_sec)
        await self._emit_flight_round_question(pin, 1)

    async def _emit_flight_round_question(self, pin: str, round_num: int) -> None:
        async with self._get_lock(pin):
            room = self.rooms.get(pin)
            if not room or room.get("phase") != "flight":
                return
            self._cancel_timer(pin)
            room["round"] = round_num
            room["round_answered"] = False

            q = decision_tree.select_flight_round_question(
                round_num, room["mission_id"], room["flight_state"]
            )
            assigned_role = str(q.get("assigned_role") or ALL_ROLES[(round_num - 1) % 4])
            active_role, active_player_name = self._select_active_player_for_round(
                room, round_num, assigned_role
            )
            q_payload = dict(q)
            q_payload["assigned_role"] = active_role
            room["current_question"] = q_payload

            await self.sio.emit(
                "pregunta_vuelo_60s",
                {
                    "round": round_num,
                    "duration_sec": int(self.flight_round_sec),
                    "gate": q_payload.get("gate", f"NODE_{round_num}_LAUNCH"),
                    "active_role": active_role,
                    "active_player_name": active_player_name,
                    "question": q_payload,
                },
                room=pin,
            )

            if self._flight_limit_sec() > 0:
                self.timers[pin] = asyncio.create_task(
                    self._flight_round_timeout(pin, round_num)
                )

    async def _flight_round_timeout(self, pin: str, round_num: int) -> None:
        try:
            await asyncio.sleep(self._flight_limit_sec())
            room = self.rooms.get(pin)
            if not room or room.get("phase") != "flight" or room.get("round") != round_num:
                return
            q = room.get("current_question") or {}
            options = q.get("options") or []
            default_opt = options[-1].get("option_id", "safe_mode") if options else "safe_mode"
            await self._process_flight_turn(
                pin,
                str(q.get("question_id") or f"Q{round_num}_NOM"),
                str(default_opt),
                timed_out=True,
            )
        except asyncio.CancelledError:
            return

    async def handle_flight_answer(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).strip().upper()
        if not pin or pin not in self.rooms:
            return
        q_id = str(data.get("question_id") or "")
        opt_id = str(data.get("option_id") or "")
        await self._process_flight_turn(pin, q_id, opt_id, timed_out=False)

    async def _process_flight_turn(
        self, pin: str, q_id: str, opt_id: str, timed_out: bool = False
    ) -> None:
        next_round: int | None = None
        finish_mission = False

        async with self._get_lock(pin):
            room = self.rooms.get(pin)
            if not room or room.get("round_answered"):
                return
            room["round_answered"] = True
            self._cancel_timer(pin)

            rnd = int(room.get("round", 1))
            current_q = room.get("current_question") or decision_tree.select_flight_round_question(
                rnd, room["mission_id"], room["flight_state"]
            )
            if not q_id:
                q_id = str(current_q.get("question_id") or f"Q{rnd}_NOM")

            chosen_label = opt_id
            chosen_hint = "Course correction applied."
            for opt in current_q.get("options", []):
                if opt.get("option_id") == opt_id:
                    chosen_label = str(opt.get("label") or opt_id)
                    chosen_hint = str(opt.get("engineering_tradeoff_hint") or chosen_hint)
                    break

            room["flight_state"] = decision_tree.apply_flight_option(
                room["flight_state"], q_id, opt_id
            )
            self._normalize_state_aliases(room["flight_state"], room["mission_id"])

            is_crit = "CRIT" in q_id
            gate_status = "DEGRADED" if timed_out else ("PASS" if not is_crit else "DEGRADED")
            health = 85.0 if gate_status == "DEGRADED" else 100.0
            feedback_prefix = "Auto-Safe Timeout: " if timed_out else ""
            immediate_feedback = f"{feedback_prefix}{chosen_label} — {chosen_hint}"

            room["decision_history"].append(
                {
                    "round": rnd,
                    "gate": current_q.get("gate", f"NODE_{rnd}"),
                    "question_id": q_id,
                    "chosen_option": opt_id,
                    "label": chosen_label,
                    "gate_status": gate_status,
                    "timed_out": bool(timed_out),
                }
            )

            await self.sio.emit(
                "resultado_turno_vuelo",
                {
                    "round": rnd,
                    "chosen_option": opt_id,
                    "immediate_feedback": immediate_feedback,
                    "rocket_health_pct": health,
                    "gate_status": gate_status,
                },
                room=pin,
            )

            if rnd < 4:
                next_round = rnd + 1
            else:
                finish_mission = True

        if next_round is not None:
            if self.flight_feedback_sec > 0:
                await asyncio.sleep(self.flight_feedback_sec)
            await self._emit_flight_round_question(pin, next_round)
        elif finish_mission:
            if self.flight_feedback_sec > 0:
                await asyncio.sleep(self.flight_feedback_sec)
            await self._emit_final_report(pin)

    @staticmethod
    def _summarize_role_contribution(
        role_id: str, wave1: dict[str, Any], wave2: dict[str, Any], is_ai: bool
    ) -> str:
        """Build the one-line English contribution text shown per role in the final report."""
        take: dict[str, Any] = {**wave1, **wave2}

        def num(key: str) -> float | None:
            value = take.get(key)
            return float(value) if isinstance(value, (int, float)) else None

        parts: list[str] = []
        if role_id == "finance_launch":
            eng, sci = num("budget_engineering_usd"), num("budget_science_usd")
            if eng is not None and sci is not None:
                parts.append(f"Budget split ${eng / 1e6:.0f}M engineering / ${sci / 1e6:.0f}M science")
            if num("ufe_reserve_pct") is not None:
                parts.append(f"UFE vault {num('ufe_reserve_pct'):.0f}%")
            if take.get("selected_launcher"):
                parts.append(f"launcher {take['selected_launcher']}")
        elif role_id == "spacecraft_mass":
            mass = num("bus_dry_mass_kg") if num("bus_dry_mass_kg") is not None else num("dry_mass_kg")
            if mass is not None:
                parts.append(f"Bus dry mass {mass:.0f} kg")
            if "has_thermal_protection" in take:
                parts.append("heat shield fitted" if take["has_thermal_protection"] else "NO heat shield")
            if "cg_balanced" in take:
                parts.append("CG balanced" if take["cg_balanced"] else "CG UNBALANCED (1.5x fuel burn)")
        elif role_id == "orbit_power":
            if take.get("trajectory_choice"):
                parts.append(f"Trajectory {take['trajectory_choice']}")
            if num("isp_seconds") is not None:
                parts.append(f"Isp {num('isp_seconds'):.0f} s")
            if num("propellant_mass_kg") is not None:
                parts.append(f"propellant {num('propellant_mass_kg'):.0f} kg")
            if take.get("power_source"):
                parts.append(f"power {take['power_source']}")
        elif role_id == "science_comms":
            if num("instruments_mass_kg") is not None:
                parts.append(f"Instruments {num('instruments_mass_kg'):.0f} kg")
            if num("science_calibration_f1") is not None:
                parts.append(f"spectral F1 {num('science_calibration_f1'):.2f}")
            if num("link_margin_db") is not None:
                parts.append(f"DSN link margin {num('link_margin_db'):+.1f} dB")
        text = ", ".join(parts) if parts else "No decisions recorded for this role"
        return f"{text} (AI autopilot)" if is_ai else text

    async def _emit_final_report(self, pin: str) -> None:
        async with self._get_lock(pin):
            room = self.rooms.get(pin)
            if not room:
                return
            room["phase"] = "report"
            self._cancel_timer(pin)
            outcome = decision_tree.evaluate_mission_deployment(
                room["mission_id"], room["flight_state"]
            )
            human_roles = {p["role"] for p in room["players"].values() if p.get("role")}
            role_contributions = [
                {
                    "role": r,
                    "role_id": r,
                    "is_ai": r not in human_roles,
                    "controlled_by": "human" if r in human_roles else "ai_randomizer",
                    "summary": self._summarize_role_contribution(
                        r,
                        room["wave1_takes"].get(r, {}),
                        room["wave2_takes"].get(r, {}),
                        r not in human_roles,
                    ),
                    "wave1": room["wave1_takes"].get(r, {}),
                    "wave2": room["wave2_takes"].get(r, {}),
                }
                for r in ALL_ROLES
            ]
            final_payload = {
                **outcome,
                "random_event": room.get("random_event"),
                "random_events": room.get("random_events", []),
                "collaboration": self._collaboration_score(room),
                "role_contributions": role_contributions,
                "decision_history": list(room.get("decision_history", [])),
            }
            await self.sio.emit("reporte_final_mision", final_payload, room=pin)

    async def handle_restart_room(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).strip().upper()
        room = self.rooms.get(pin)
        if not room:
            return
        async with self._get_lock(pin):
            self._cancel_timer(pin)
            room["phase"] = "lobby"
            room["live_state"] = {}
            room["last_metrics"] = {}
            room["wave1_takes"] = {}
            room["wave2_takes"] = {}
            room["flight_state"] = {}
            room["random_event"] = None
            room["random_events"] = []
            room["human_fallbacks"] = []
            room["launch_gates"] = {}
            room["decision_history"] = []
            room["round"] = 1
            room["round_answered"] = False
            room["current_question"] = None
        await self._emit_room_state(pin)

    async def _emit_room_state(self, pin: str) -> None:
        room = self.rooms.get(pin)
        if not room:
            return
        players = [{"id": pid, **info} for pid, info in room["players"].items()]
        taken_roles = [info["role"] for info in room["players"].values() if info.get("role")]
        await self.sio.emit(
            "estado_sala_actualizado",
            {
                "pin": pin,
                "players": players,
                "mission_id": room["mission_id"],
                "difficulty": room["difficulty"],
                "taken_roles": taken_roles,
            },
            room=pin,
        )

