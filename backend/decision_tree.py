"""
Deterministic 4-Node Mission Decision Tree evaluator, scoring & NASA educational feedback.
Owner: Schoenstadt (Tasks SCH-04, SCH-05)
See docs/20-roadmap-schoenstadt.md and docs/10-tecnico.md before editing.
"""
from __future__ import annotations

import json
import math
import zlib
from pathlib import Path
from typing import Any

if __package__:
    from .juegos_espectrales import adaptadores_web
    from .models.session import (
        ConsolidatedMissionState,
        FlightQuestionNode,
        MissionResolutionOutcome,
    )
    from .models.subsystems import get_catalog, get_mission
else:
    from juegos_espectrales import adaptadores_web
    from models.session import (
        ConsolidatedMissionState,
        FlightQuestionNode,
        MissionResolutionOutcome,
    )
    from models.subsystems import get_catalog, get_mission

_STORY_PATH = Path(__file__).resolve().with_name("story_tree.json")

_DEFAULT_FACTS = {
    "artemis_moon": (
        "NASA's Artemis I (2022) flew Orion to a distant retrograde orbit around the Moon and "
        "tested its heat shield on a reentry at nearly 40,000 km/h."
    ),
    "asteroid_hunter": (
        "NASA OSIRIS-REx used autonomous Natural Feature Tracking at asteroid Bennu "
        "because deep-space signal delay prevented real-time Earth piloting near hazardous boulders."
    ),
    "mars_sample_return": (
        "Over 52% of NASA MRO's 2,180 kg launch mass was propellant (1,149 kg), and its "
        "3 m High-Gain Antenna downlinks up to 6 Mbps to the Deep Space Network from a 160 Gbit recorder."
    ),
}


def _load_story_tree() -> dict[str, Any]:
    with _STORY_PATH.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def _as_state(
    state: ConsolidatedMissionState | dict[str, Any], mission_id: str = "artemis_moon"
) -> ConsolidatedMissionState:
    if isinstance(state, ConsolidatedMissionState):
        return state
    raw = dict(state)
    if "mission_id" not in raw:
        raw["mission_id"] = mission_id
    if (
        "science_calibration_f1" not in raw
        and isinstance(raw.get("spectral_marks"), list)
        and raw["spectral_marks"]
    ):
        expected = raw.get("expected_peaks")
        if not isinstance(expected, list):
            challenge = adaptadores_web.generar_reto_oleada1(mission_id)
            expected = challenge.get("expected_peaks")
        raw["science_calibration_f1"] = adaptadores_web.evaluar_marcas(
            [float(x) for x in raw["spectral_marks"]], expected
        )
    return ConsolidatedMissionState.model_validate(raw)


def evaluate_preliminary_gates(
    mission_id: str, state: ConsolidatedMissionState | dict[str, Any]
) -> dict[str, str]:
    """Return quick status ('PASS' | 'DEGRADED' | 'CRITICAL') for each of the 4 deterministic gates."""
    s = _as_state(state, mission_id)
    wet_mass_kg = s.dry_mass_kg + s.instruments_mass_kg + s.propellant_mass_kg
    total_cost_usd = s.launch_cost_usd + s.subsystems_cost_usd

    g1 = "PASS"
    if wet_mass_kg > s.launcher_max_mass_kg or total_cost_usd > s.budget_limit_usd or not s.fairing_ok:
        g1 = "CRITICAL"
    elif wet_mass_kg > 0.95 * s.launcher_max_mass_kg or total_cost_usd > 0.95 * s.budget_limit_usd:
        g1 = "DEGRADED"

    g0 = 9.80665
    mass_ratio = wet_mass_kg / max(wet_mass_kg - s.propellant_mass_kg, 1.0)
    available_dv = s.isp_seconds * g0 * math.log(max(1.0001, mass_ratio))
    effective_dv = available_dv / max(1.0, s.fuel_burn_multiplier)
    g2 = "PASS"
    if effective_dv < s.required_dv_ms or engine_power_short(s.isp_seconds, s.power_generation_w):
        g2 = "CRITICAL"
    elif not s.cg_balanced or effective_dv < s.required_dv_ms * 1.05:
        g2 = "DEGRADED"

    g3 = "PASS"
    if mission_id in ("artemis_moon", "mars_sample_return") and not s.has_thermal_protection:
        g3 = "CRITICAL"
    elif (
        (mission_id == "artemis_moon" and s.battery_reserve_pct < 15.0)
        or (mission_id == "asteroid_hunter" and (not s.has_visual_autonomy or s.ufe_reserve_pct < 15.0))
        or (
            mission_id == "mars_sample_return"
            and (s.ufe_reserve_pct < 20.0 or (s.power_source != "rtg_nuclear" and s.battery_reserve_pct < 25.0))
        )
    ):
        g3 = "DEGRADED"

    g4 = "PASS"
    if (
        s.link_margin_db < 3.0
        or s.downlink_efficiency < 0.85
        or not s.dtmf_code_ok
        or data_return_ratio(s.data_generated_gbit, s.downlink_rate_mbps) < 1.0
    ):
        g4 = "DEGRADED"

    return {
        "NODE_1_LAUNCH": g1,
        "NODE_2_PROPULSION": g2,
        "NODE_3_EVENT": g3,
        "NODE_4_DOWNLINK": g4,
    }


def _score_breakdown(
    obj: float,
    sci: float,
    eff: float,
    completion: float,
    s: ConsolidatedMissionState,
    mass_eff: float,
    budget_eff: float,
    time_eff: float,
) -> dict[str, Any]:
    """Points per scoring part (50 % objective, 30 % science, 20 % efficiency) plus plain tips
    on where the missing points went, so players see what separates them from 1,000."""
    tips: list[str] = []
    if completion < 0.999:
        tips.append(
            f"Objective: mission quality reached {completion * 100:.0f}%. Hazards, the radio link and "
            f"instrument quality all count; strengthen the weakest one."
        )
    if s.science_value < 100.0:
        tips.append(f"Science: carry more or better instruments (science value {s.science_value:.0f} of 100).")
    if s.science_calibration_f1 < 0.999:
        tips.append(f"Science: calibrate the instruments more precisely (quality {s.science_calibration_f1:.2f} of 1.00).")
    if mass_eff < 0.5:
        tips.append("Efficiency: the ship used most of the rocket's capacity; a lighter ship or a bigger rocket scores higher.")
    if budget_eff < 0.3:
        tips.append("Efficiency: most of the budget was spent; cheaper choices leave more money unspent.")
    if time_eff < 0.999:
        tips.append("Efficiency: a faster route to the target saves time.")
    return {
        "objective_points": round(obj),
        "science_f1_points": round(sci),
        "efficiency_points": round(eff),
        "tips": tips[:4],
    }


def _with_breakdown(outcome: dict[str, Any], breakdown: dict[str, Any]) -> dict[str, Any]:
    """Attach the score breakdown; a success floor (min 400 / 800 pts) shows as its own line."""
    floor = int(outcome["total_score"]) - (
        breakdown["objective_points"] + breakdown["science_f1_points"] + breakdown["efficiency_points"]
    )
    outcome["score_breakdown"] = {**breakdown, "success_floor_points": max(0, floor)}
    return outcome


def evaluate_mission_deployment(
    mission_id: str,
    state: ConsolidatedMissionState | dict[str, Any],
    launch_state: ConsolidatedMissionState | dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Evaluate all 4 deterministic gates and return MissionResolutionOutcome dict.

    `launch_state` is the design frozen at liftoff: Node 1 (launch mass, fairing, budget) and the
    mass/budget efficiency are judged on it, so flight answers (e.g. "+30 kg fuel" saved in space)
    cannot retroactively break a launch that already happened. Defaults to `state`.
    """
    s = _as_state(state, mission_id)
    ls = _as_state(launch_state, mission_id) if launch_state else s
    mission = get_mission(mission_id)
    fact = mission.get("nasa_real_world_fact") or _DEFAULT_FACTS.get(
        mission_id, _DEFAULT_FACTS["artemis_moon"]
    )

    wet_mass_kg = ls.dry_mass_kg + ls.instruments_mass_kg + ls.propellant_mass_kg
    total_cost_usd = ls.launch_cost_usd + ls.subsystems_cost_usd

    # NODE 1: Launch Capacity, Fairing & Budget Hard Gate (judged on the liftoff snapshot)
    if not ls.fairing_ok:
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=0.0,
            total_score=90,
            failed_or_degraded_gate="NODE_1_LAUNCH",
            causal_chain_explanation=(
                f"LAUNCH SCRUBBED: the spacecraft does not fit inside the nose cone (fairing) of "
                f"{ls.selected_launcher}. Seal the fairing or pick a bigger rocket in station 1B."
            ),
            nasa_real_world_fact=fact,
        ).model_dump()

    if wet_mass_kg > ls.launcher_max_mass_kg:
        excess = round(wet_mass_kg - ls.launcher_max_mass_kg, 1)
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=0.0,
            total_score=100,
            failed_or_degraded_gate="NODE_1_LAUNCH",
            causal_chain_explanation=(
                f"TOO HEAVY TO LAUNCH: the loaded ship weighed {wet_mass_kg:.0f} kg ({ls.dry_mass_kg:.0f} kg body + "
                f"{ls.instruments_mass_kg:.0f} kg instruments + {ls.propellant_mass_kg:.0f} kg fuel), but "
                f"{ls.selected_launcher} can only send {ls.launcher_max_mass_kg:.0f} kg to this destination: "
                f"{excess:.0f} kg over."
            ),
            nasa_real_world_fact=fact,
        ).model_dump()

    if total_cost_usd > ls.budget_limit_usd:
        overrun = round((total_cost_usd - ls.budget_limit_usd) / 1e6, 1)
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=0.0,
            total_score=120,
            failed_or_degraded_gate="NODE_1_LAUNCH",
            causal_chain_explanation=(
                f"OVER BUDGET: the mission cost ${total_cost_usd / 1e6:.1f}M, ${overrun}M over the "
                f"${ls.budget_limit_usd / 1e6:.0f}M limit (the reserve fund was {ls.ufe_reserve_pct:.0f}%). "
                f"Real NASA missions that overrun this much face cancellation reviews."
            ),
            nasa_real_world_fact=fact,
        ).model_dump()

    # NODE 2: Tsiolkovsky Propulsion & CG Multiplier Gate
    g0 = 9.80665
    # Node 2+ fly the in-flight ship: fuel saved or spent during the flight counts here.
    flight_wet_kg = s.dry_mass_kg + s.instruments_mass_kg + s.propellant_mass_kg
    mass_ratio = flight_wet_kg / max(flight_wet_kg - s.propellant_mass_kg, 1.0)
    available_dv = s.isp_seconds * g0 * math.log(max(1.0001, mass_ratio))
    effective_dv = available_dv / max(1.0, s.fuel_burn_multiplier)

    if effective_dv < s.required_dv_ms:
        cause_details: list[str] = []
        if not s.cg_balanced or s.fuel_burn_multiplier > 1.0:
            cause_details.append(
                f"an unbalanced ship (station 2B) burned {s.fuel_burn_multiplier:.1f}x the fuel "
                f"(from {available_dv:.0f} down to {effective_dv:.0f} m/s)"
            )
        if s.isp_seconds <= 230.0:
            cause_details.append(
                f"the simple hydrazine engine (efficiency {s.isp_seconds:.0f} s, station 3A) gets less push "
                f"from each kilogram of fuel"
            )
        if not cause_details:
            cause_details.append("the fuel load was too small for the chosen route")
        reason_str = " and ".join(cause_details)
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=25.0,
            total_score=250,
            failed_or_degraded_gate="NODE_2_PROPULSION",
            causal_chain_explanation=(
                f"OUT OF FUEL BEFORE ARRIVAL: the ship could change its speed by only {effective_dv:.0f} m/s "
                f"(delta-v) but the route needs {s.required_dv_ms:.0f} m/s, because {reason_str}."
            ),
            nasa_real_world_fact=fact,
        ).model_dump()

    # NODE 3: Critical Hardware & Mission Crisis Gate
    if mission_id in ("artemis_moon", "mars_sample_return") and not s.has_thermal_protection:
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=45.0,
            total_score=300,
            failed_or_degraded_gate="NODE_3_EVENT",
            causal_chain_explanation=(
                "LOST ON RE-ENTRY: the ship made the whole trip but burned up when it hit Earth's "
                "atmosphere, because the heat shield / sample capsule was left out in station 2A."
            ),
            nasa_real_world_fact=fact,
        ).model_dump()

    event_survival = 1.0
    notes: list[str] = []
    if mission_id == "artemis_moon" and s.battery_reserve_pct < 15.0:
        event_survival = 0.65
        notes.append(
            f"A solar storm forced the ship into safe mode: its battery reserve was "
            f"{s.battery_reserve_pct:.0f}%, below the 15% it needs."
        )
    elif mission_id == "asteroid_hunter" and (not s.has_visual_autonomy or s.ufe_reserve_pct < 15.0):
        event_survival = 0.70
        notes.append(
            f"Dust and small rocks near the asteroid confused navigation "
            f"(self-driving camera {'on' if s.has_visual_autonomy else 'off'}, reserve fund {s.ufe_reserve_pct:.0f}%)."
        )
    elif mission_id == "mars_sample_return" and (
        s.ufe_reserve_pct < 20.0 or (s.power_source != "rtg_nuclear" and s.battery_reserve_pct < 25.0)
    ):
        event_survival = 0.60
        notes.append(
            f"A Mars dust storm and a jammed sample arm cut the samples collected "
            f"(power: {s.power_source}, battery {s.battery_reserve_pct:.0f}%, reserve fund {s.ufe_reserve_pct:.0f}%)."
        )

    # NODE 4: Science Calibration & DSN Downlink Gate
    spectral_quality = max(0.4, s.science_calibration_f1)
    if s.link_margin_db < 3.0:
        comms_factor = 0.45
    elif not s.dtmf_code_ok:
        comms_factor = min(s.downlink_efficiency, 0.65)
    else:
        comms_factor = s.downlink_efficiency
    # Data budget (challenge resource "Data"): only the share that fits in a day of contact returns.
    data_ratio = data_return_ratio(s.data_generated_gbit, s.downlink_rate_mbps)
    if data_ratio < 1.0:
        comms_factor *= data_ratio
        notes.append(
            f"Too much data for the radio: the instruments make {s.data_generated_gbit:.0f} Gbit a day, but a "
            f"{s.downlink_rate_mbps:.1f} Mbps link sends at most "
            f"{s.downlink_rate_mbps * float(get_catalog().get('constants', {}).get('dsn_data_hours_per_day', 24.0)) * 3.6:.0f} "
            f"Gbit in the ~{get_catalog().get('constants', {}).get('dsn_data_hours_per_day', 24)} h a day "
            f"a mission really gets on NASA's big antennas."
        )
    effective_completion = min(1.0, event_survival * comms_factor * spectral_quality)

    obj_score = 500.0 * effective_completion
    sci_score = 300.0 * min(1.0, s.science_value / 100.0) * s.science_calibration_f1
    mass_eff = max(0.0, 1.0 - (wet_mass_kg / max(1.0, ls.launcher_max_mass_kg)))
    budget_eff = max(0.0, 1.0 - (total_cost_usd / max(1.0, s.budget_limit_usd)))
    # Challenge resource "Time": a slower route keeps the mission (and its costs and risks) going
    # longer. time_eff = fastest catalog route / chosen route (1.0 when the route is unknown).
    time_eff, chosen_days, fastest_days = time_efficiency(mission_id, str(getattr(s, "trajectory_choice", "") or ""))
    eff_score = 200.0 * (0.4 * mass_eff + 0.4 * budget_eff + 0.2 * time_eff)
    if chosen_days and fastest_days and chosen_days > fastest_days:
        notes.append(
            f"Time: the chosen route takes {chosen_days:.0f} days vs {fastest_days:.0f} on the fastest one, "
            f"lowering mission efficiency."
        )
    final_score = int(round(obj_score + sci_score + eff_score))
    breakdown = _score_breakdown(
        obj_score, sci_score, eff_score, effective_completion, s, mass_eff, budget_eff, time_eff
    )

    if effective_completion < 0.85:
        if comms_factor < 1.0:
            notes.append(
                f"Weak radio link: the signal margin was {s.link_margin_db:.1f} dB (3 dB needed), so only "
                f"{comms_factor * 100:.0f}% of the science made it home; the rest stayed on the recorder."
            )
        if spectral_quality < 0.75:
            notes.append(
                f"The instruments were roughly calibrated (quality {s.science_calibration_f1:.2f} of 1.00 in "
                f"station 4A), so the chemical readings were less reliable."
            )
        return _with_breakdown(MissionResolutionOutcome(
            outcome="PARTIAL_SUCCESS",
            completion_pct=round(effective_completion * 100.0, 1),
            total_score=min(1000, max(400, final_score)),
            failed_or_degraded_gate="NODE_4_DOWNLINK" if comms_factor < 1.0 or spectral_quality < 0.75 else "NODE_3_EVENT",
            causal_chain_explanation="PARTIAL SUCCESS: " + " ".join(notes),
            nasa_real_world_fact=fact,
        ).model_dump(), breakdown)

    return _with_breakdown(MissionResolutionOutcome(
        outcome="FULL_SUCCESS",
        completion_pct=100.0,
        total_score=min(1000, max(800, final_score)),
        failed_or_degraded_gate=None,
        causal_chain_explanation=(
            f"FULL SUCCESS! Your team launched a {wet_mass_kg:.0f} kg ship on {ls.selected_launcher} "
            f"(limit {ls.launcher_max_mass_kg:.0f} kg), kept it balanced, saved a {s.ufe_reserve_pct:.0f}% reserve fund "
            f"for surprises, calibrated the instruments (quality {s.science_calibration_f1:.2f} of 1.00) and kept a "
            f"strong {s.link_margin_db:.1f} dB radio link home." + (" " + " ".join(notes) if notes else "")
        ),
        nasa_real_world_fact=fact,
    ).model_dump(), breakdown)



def _is_gate_critical(
    gate: str, mission_id: str, s: ConsolidatedMissionState
) -> bool:
    wet_mass = s.dry_mass_kg + s.instruments_mass_kg + s.propellant_mass_kg
    total_cost = s.launch_cost_usd + s.subsystems_cost_usd

    if gate == "NODE_1_LAUNCH":
        return (
            not s.fairing_ok
            or wet_mass > 0.95 * s.launcher_max_mass_kg
            or total_cost > 0.95 * s.budget_limit_usd
        )

    if gate == "NODE_2_PROPULSION":
        g0 = 9.80665
        mass_ratio = wet_mass / max(wet_mass - s.propellant_mass_kg, 1.0)
        available_dv = s.isp_seconds * g0 * math.log(max(1.0001, mass_ratio))
        effective_dv = available_dv / max(1.0, s.fuel_burn_multiplier)
        return (
            not s.cg_balanced
            or s.fuel_burn_multiplier > 1.0
            or effective_dv < s.required_dv_ms * 1.05
        )

    if gate == "NODE_3_EVENT":
        if mission_id in ("artemis_moon", "mars_sample_return") and not s.has_thermal_protection:
            return True
        if mission_id == "artemis_moon":
            return s.battery_reserve_pct < 15.0 or s.ufe_reserve_pct < 15.0
        if mission_id == "asteroid_hunter":
            return not s.has_visual_autonomy or s.ufe_reserve_pct < 15.0 or s.battery_reserve_pct < 15.0
        if mission_id == "mars_sample_return":
            return s.ufe_reserve_pct < 20.0 or (
                s.power_source != "rtg_nuclear" and s.battery_reserve_pct < 25.0
            )
        return s.ufe_reserve_pct < 20.0 or s.battery_reserve_pct < 20.0

    if gate == "NODE_4_DOWNLINK":
        return (
            s.link_margin_db < 3.0
            or s.downlink_efficiency < 1.0
            or not s.dtmf_code_ok
        )

    return False


def select_flight_round_question(
    round_num: int,
    mission_id: str,
    state: ConsolidatedMissionState | dict[str, Any],
) -> dict[str, Any]:
    """
    Select conditional 60 Seconds! style flight logbook node for stage 1..4
    based on mission_id and real packed spacecraft state (critical vs nominal).
    """
    story = _load_story_tree().get("nodes", {})
    gate_order = [
        "NODE_1_LAUNCH",
        "NODE_2_PROPULSION",
        "NODE_3_EVENT",
        "NODE_4_DOWNLINK",
    ]
    gate = gate_order[max(0, min(3, round_num - 1))]
    gate_nodes = story.get(gate, {})

    resolved_mission = mission_id if mission_id in ("artemis_moon", "asteroid_hunter", "mars_sample_return") else "artemis_moon"
    s = _as_state(state, resolved_mission)
    is_critical = _is_gate_critical(gate, resolved_mission, s)
    branch = "critical" if is_critical else "nominal"

    mission_branches = gate_nodes.get("missions", {}).get(resolved_mission, {})
    raw_node = dict(mission_branches.get(branch) or gate_nodes.get(branch) or {})
    raw_node["mission_id"] = resolved_mission
    raw_node["branch"] = branch

    validated = FlightQuestionNode.model_validate(raw_node)
    out = validated.model_dump()
    out["branch"] = branch
    return out


def engine_power_short(isp_seconds: float, power_w: float) -> bool:
    """True when the catalog engine with this Isp needs more electrical power than the ship makes."""
    for engine in get_catalog().get("engines", []):
        if abs(float(engine.get("isp_seconds", -1.0)) - float(isp_seconds)) < 0.5:
            return float(engine.get("power_demand_w", 0.0)) > float(power_w)
    return False


def time_efficiency(mission_id: str, trajectory_choice: str) -> tuple[float, float, float]:
    """(time_eff, chosen_days, fastest_days) from the catalog's mission_routes transit_days."""
    routes = get_catalog().get("mission_routes", {}).get(mission_id) or []
    days = [float(r.get("transit_days", 0.0)) for r in routes if float(r.get("transit_days", 0.0)) > 0]
    route_id = trajectory_choice.split("__")[0] if trajectory_choice else ""
    chosen = next((float(r.get("transit_days", 0.0)) for r in routes if r.get("id") == route_id), 0.0)
    if not days or chosen <= 0:
        return 1.0, chosen, min(days) if days else 0.0
    fastest = min(days)
    return min(1.0, fastest / chosen), chosen, fastest


def data_return_ratio(data_gbit_day: float, rate_mbps: float) -> float:
    """Share of daily science data a link can return in 24 h (unit conversion only)."""
    if rate_mbps <= 0 or data_gbit_day <= 0:
        return 1.0
    hours = float(get_catalog().get("constants", {}).get("dsn_data_hours_per_day", 24.0))
    capacity_gbit_day = rate_mbps * hours * 3600.0 / 1000.0
    return min(1.0, capacity_gbit_day / data_gbit_day)


def pick_random_event(mission_id: str, seed: str) -> dict[str, Any] | None:
    """Pick the match's random survival event, deterministically from `seed` (room PIN)."""
    events = _load_story_tree().get("random_events", {}).get(mission_id) or []
    if not isinstance(events, list) or not events:
        return None
    index = zlib.crc32(f"{seed}:{mission_id}".encode("utf-8")) % len(events)
    return dict(events[index])


def difficulty_tuning(difficulty: str | None) -> dict[str, float]:
    """Events per match and effect scale for a difficulty (story_tree.json random_events._difficulty)."""
    table = _load_story_tree().get("random_events", {}).get("_difficulty", {})
    row = table.get(str(difficulty or "easy")) or table.get("easy") or {}
    return {"count": float(row.get("count", 1)), "scale": float(row.get("scale", 1.0))}


def pick_random_events(mission_id: str, seed: str, difficulty: str | None = None) -> list[dict[str, Any]]:
    """Pick this match's distinct survival events (more on harder difficulties), deterministic per seed."""
    events = _load_story_tree().get("random_events", {}).get(mission_id) or []
    if not isinstance(events, list) or not events:
        return []
    count = max(1, min(len(events), int(difficulty_tuning(difficulty)["count"])))
    start = zlib.crc32(f"{seed}:{mission_id}".encode("utf-8")) % len(events)
    return [dict(events[(start + i) % len(events)]) for i in range(count)]


def apply_random_event(
    state: dict[str, Any],
    event: dict[str, Any] | None,
    mission_id: str | None = None,
    scale: float = 1.0,
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    """Apply the event's effects to the flight state unless the crew's design mitigates it.

    Missing keys use the ConsolidatedMissionState defaults (never a silent 0), both for the
    value being hit and for the mitigation check.
    """
    if not event:
        return state, None
    resolved = mission_id or str(state.get("mission_id") or "artemis_moon")
    merged = {**_as_state(state, resolved).model_dump(), **dict(state)}
    next_state = dict(state)
    mitigators = event.get("mitigated_if") or {}
    mitigated = bool(mitigators) and all(merged.get(k) == v for k, v in mitigators.items())
    applied: dict[str, float] = {}
    if not mitigated:
        for key, raw_delta in (event.get("effects") or {}).items():
            if isinstance(raw_delta, (int, float)):
                delta = round(float(raw_delta) * float(scale), 2)
                base = float(merged.get(key, 0.0) or 0.0)
                next_state[key] = round(max(0.0, base + float(delta)) if key.endswith("_pct") else base + float(delta), 2)
                applied[key] = float(delta)
        if "link_margin_db" in applied:
            # Remembered so absolute link values from later flight options keep the penalty.
            next_state["event_link_penalty_db"] = round(
                float(next_state.get("event_link_penalty_db", 0.0) or 0.0) + applied["link_margin_db"], 2
            )
    summary = {
        "event_id": event.get("event_id"),
        "title": event.get("title"),
        "description": event.get("description"),
        "mitigated": mitigated,
        "mitigation_text": event.get("mitigation_text") if mitigated else None,
        "applied_effects": applied,
        "fuente": event.get("fuente"),
    }
    next_state["active_event_id"] = event.get("event_id")
    return next_state, summary


def _iter_all_question_nodes(story_nodes: dict[str, Any]):
    for gate_data in story_nodes.values():
        if not isinstance(gate_data, dict):
            continue
        missions_map = gate_data.get("missions", {})
        if isinstance(missions_map, dict):
            for m_branches in missions_map.values():
                if isinstance(m_branches, dict):
                    for node in m_branches.values():
                        if isinstance(node, dict) and "question_id" in node:
                            yield node
        for key in ("critical", "nominal"):
            node = gate_data.get(key)
            if isinstance(node, dict) and "question_id" in node:
                yield node


def apply_flight_option(
    state: dict[str, Any], question_id: str, option_id: str
) -> dict[str, Any]:
    """
    Apply chosen 60 Seconds! style flight logbook option's delta_effects
    onto the spacecraft state dict while respecting hard physical laws.
    """
    mission_id = str(state.get("mission_id") or "artemis_moon")
    baseline = _as_state(state, mission_id).model_dump()
    updated = {**baseline, **dict(state)}

    story = _load_story_tree().get("nodes", {})
    matched_opt: dict[str, Any] | None = None
    for branch_node in _iter_all_question_nodes(story):
        if branch_node.get("question_id") == question_id:
            for opt in branch_node.get("options", []):
                if opt.get("option_id") == option_id:
                    matched_opt = opt
                    break
            if matched_opt is not None:
                break

    if matched_opt is None:
        return updated

    for key, val in matched_opt.get("delta_effects", {}).items():
        if isinstance(val, bool):
            updated[key] = val
        elif isinstance(val, (int, float)):
            if key == "link_margin_db":
                # Absolute link value from the option, still degraded by an active survival event.
                updated[key] = float(val) + float(updated.get("event_link_penalty_db", 0.0) or 0.0)
            elif key in ("fuel_burn_multiplier", "downlink_efficiency"):
                updated[key] = float(val)
            elif key == "science_calibration_f1":
                curr_f1 = float(updated.get("science_calibration_f1", 0.85))
                updated[key] = round(min(1.0, max(0.0, curr_f1 + float(val) if float(val) <= 0.25 else float(val))), 3)
            else:
                curr_val = float(updated.get(key, 0.0))
                new_val = curr_val + float(val)
                if key in ("ufe_reserve_pct", "battery_reserve_pct", "science_value"):
                    new_val = min(100.0, max(0.0, new_val))
                elif key in ("dry_mass_kg", "bus_dry_mass_kg"):
                    new_val = max(50.0, new_val)
                    updated["dry_mass_kg"] = new_val
                    if "bus_dry_mass_kg" in updated and updated["bus_dry_mass_kg"] is not None:
                        updated["bus_dry_mass_kg"] = new_val
                elif key in ("propellant_mass_kg", "subsystems_cost_usd"):
                    new_val = max(0.0, new_val)
                updated[key] = round(new_val, 2)
        else:
            updated[key] = val

    updated["last_log_feedback"] = matched_opt.get("engineering_tradeoff_hint", "")
    return updated
