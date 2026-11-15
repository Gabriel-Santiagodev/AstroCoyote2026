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
    from .models.subsystems import get_mission
else:
    import decision_tree
    import physics_engine
    import randomizer
    from juegos_espectrales import adaptadores_web
    from models.subsystems import get_mission

ALL_ROLES = ["finance_launch", "spacecraft_mass", "orbit_power", "science_comms"]


class GameManager:
    def __init__(self, sio: socketio.AsyncServer) -> None:
        self.sio = sio
        self.rooms: dict[str, dict[str, Any]] = {}
        self.locks: dict[str, asyncio.Lock] = {}

    def _get_lock(self, pin: str) -> asyncio.Lock:
        if pin not in self.locks:
            self.locks[pin] = asyncio.Lock()
        return self.locks[pin]

    def _generate_pin(self) -> str:
        alphabet = string.ascii_uppercase + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(6))

    async def handle_create_room(self, sid: str, data: dict[str, Any]) -> None:
        pin = self._generate_pin()
        player_id = sid
        self.rooms[pin] = {
            "pin": pin,
            "mode": data.get("mode", "single"),
            "mission_id": "artemis_moon",
            "difficulty": "easy",
            "players": {player_id: {"name": data.get("host_name", "Commander"), "role": "finance_launch"}},
            "live_state": {},
            "wave1_takes": {},
            "wave2_takes": {},
            "flight_state": {},
            "round": 1,
        }
        await self.sio.enter_room(sid, pin)
        await self.sio.emit("sala_creada", {"pin": pin, "player_id": player_id}, to=sid)
        await self._emit_room_state(pin)

    async def handle_join_room(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).upper()
        room = self.rooms.get(pin)
        if not room or len(room["players"]) >= 4:
            await self.sio.emit("error_sala", {"message": "Room not found or full."}, to=sid)
            return
        taken = {p["role"] for p in room["players"].values() if p.get("role")}
        free_role = next((r for r in ALL_ROLES if r not in taken), None)
        room["players"][sid] = {"name": data.get("player_name", "Crewmate"), "role": free_role}
        await self.sio.enter_room(sid, pin)
        await self._emit_room_state(pin)

    async def handle_select_role_mission(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).upper()
        room = self.rooms.get(pin)
        if not room:
            return
        async with self._get_lock(pin):
            if "mission_id" in data and data["mission_id"]:
                room["mission_id"] = data["mission_id"]
            if "difficulty" in data and data["difficulty"]:
                room["difficulty"] = data["difficulty"]
            if "role_id" in data and data["role_id"] in ALL_ROLES:
                taken_by_others = {
                    p["role"] for pid, p in room["players"].items() if pid != sid
                }
                if data["role_id"] not in taken_by_others and sid in room["players"]:
                    room["players"][sid]["role"] = data["role_id"]
        await self._emit_room_state(pin)

    async def handle_start_game(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).upper()
        room = self.rooms.get(pin)
        if not room:
            return
        mission_id = room["mission_id"]
        difficulty = room["difficulty"]
        human_roles = {p["role"] for p in room["players"].values() if p.get("role")}
        ai_wave1 = {
            r: randomizer.synthesize_ai_role_wave1(r, difficulty, mission_id)
            for r in ALL_ROLES
            if r not in human_roles
        }
        for role_data in ai_wave1.values():
            room["live_state"].update(role_data)
        spectral = adaptadores_web.generar_reto_oleada1(mission_id, difficulty)
        await self.sio.emit(
            "iniciar_oleada_1",
            {
                "duration_sec": 30,
                "mission_config": get_mission(mission_id),
                "ai_wave1_state": ai_wave1,
                "spectral_challenge": spectral,
                "initial_constraints": physics_engine.compute_live_metrics(
                    room["live_state"], mission_id
                ),
            },
            room=pin,
        )

    async def handle_partial_action(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).upper()
        room = self.rooms.get(pin)
        if not room:
            return
        async with self._get_lock(pin):
            delta = data.get("partial_delta", {})
            if isinstance(delta, dict):
                room["live_state"].update(delta)
            metrics = physics_engine.compute_live_metrics(room["live_state"], room["mission_id"])
        await self.sio.emit(
            "mutacion_en_vivo",
            {"source_role": data.get("role_id"), "live_metrics": metrics},
            room=pin,
        )

    async def handle_lock_take(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).upper()
        room = self.rooms.get(pin)
        if not room:
            return
        role_id = str(data.get("role_id", ""))
        wave = int(data.get("wave", 1))
        payload = data.get("payload", {})
        async with self._get_lock(pin):
            if isinstance(payload, dict):
                room["live_state"].update(payload)
            target_map = room["wave1_takes"] if wave == 1 else room["wave2_takes"]
            target_map[role_id] = payload
            await self.sio.emit("jugador_bloqueo_toma", {"role_id": role_id, "wave": wave}, room=pin)

            human_roles = {p["role"] for p in room["players"].values() if p.get("role")}
            if human_roles and human_roles.issubset(set(target_map.keys())):
                if wave == 1:
                    w1_metrics = physics_engine.compute_live_metrics(room["live_state"], room["mission_id"])
                    for r in ALL_ROLES:
                        if r not in human_roles:
                            ai_w2 = randomizer.synthesize_ai_role_wave2(
                                r, room["difficulty"], w1_metrics, room["mission_id"]
                            )
                            room["live_state"].update(ai_w2)
                    hacker = adaptadores_web.generar_reto_hacker(room["mission_id"], room["difficulty"])
                    await self.sio.emit(
                        "iniciar_oleada_2",
                        {
                            "sync_delay_sec": 5,
                            "duration_sec": 30,
                            "consolidated_wave1": w1_metrics,
                            "spectral_challenge": hacker,
                        },
                        room=pin,
                    )
                else:
                    room["round"] = 1
                    room["flight_state"] = dict(room["live_state"])
                    await self.sio.emit(
                        "iniciar_vuelo_60s",
                        {
                            "total_duration_sec": 60,
                            "consolidated_state": room["flight_state"],
                            "preliminary_gates": {},
                        },
                        room=pin,
                    )
                    q = decision_tree.select_flight_round_question(1, room["mission_id"], room["flight_state"])
                    await self.sio.emit(
                        "pregunta_vuelo_60s",
                        {
                            "round": 1,
                            "duration_sec": 15,
                            "gate": q.get("gate", "NODE_1_LAUNCH"),
                            "active_role": q.get("assigned_role", "finance_launch"),
                            "active_player_name": "Crew",
                            "question": q,
                        },
                        room=pin,
                    )

    async def handle_flight_answer(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).upper()
        room = self.rooms.get(pin)
        if not room:
            return
        async with self._get_lock(pin):
            q_id = str(data.get("question_id", ""))
            opt_id = str(data.get("option_id", ""))
            room["flight_state"] = decision_tree.apply_flight_option(room["flight_state"], q_id, opt_id)
            rnd = room["round"]
            await self.sio.emit(
                "resultado_turno_vuelo",
                {
                    "round": rnd,
                    "chosen_option": opt_id,
                    "immediate_feedback": "Course correction applied.",
                    "rocket_health_pct": 100.0,
                    "gate_status": "PASS",
                },
                room=pin,
            )
            if rnd < 4:
                room["round"] = rnd + 1
                q = decision_tree.select_flight_round_question(
                    room["round"], room["mission_id"], room["flight_state"]
                )
                await self.sio.emit(
                    "pregunta_vuelo_60s",
                    {
                        "round": room["round"],
                        "duration_sec": 15,
                        "gate": q.get("gate", "NODE_2_PROPULSION"),
                        "active_role": q.get("assigned_role", "spacecraft_mass"),
                        "active_player_name": "Crew",
                        "question": q,
                    },
                    room=pin,
                )
            else:
                outcome = decision_tree.evaluate_mission_deployment(
                    room["mission_id"], room["flight_state"]
                )
                await self.sio.emit("reporte_final_mision", outcome, room=pin)

    async def handle_restart_room(self, sid: str, data: dict[str, Any]) -> None:
        pin = str(data.get("pin", "")).upper()
        room = self.rooms.get(pin)
        if not room:
            return
        room["live_state"] = {}
        room["wave1_takes"] = {}
        room["wave2_takes"] = {}
        room["flight_state"] = {}
        room["round"] = 1
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
