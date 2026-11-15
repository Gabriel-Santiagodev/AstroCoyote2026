"""
Deterministic 4-Node Mission Decision Tree evaluator, scoring & NASA educational feedback.
Owner: Schoenstadt (Tasks SCH-04, SCH-05)
See docs/20-roadmap-schoenstadt.md and docs/10-tecnico.md before editing.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any

if __package__:
    from .juegos_espectrales import adaptadores_web
    from .models.session import (
        ConsolidatedMissionState,
        FlightQuestionNode,
        MissionResolutionOutcome,
    )
    from .models.subsystems import get_mission
else:
    from juegos_espectrales import adaptadores_web
    from models.session import (
        ConsolidatedMissionState,
        FlightQuestionNode,
        MissionResolutionOutcome,
    )
    from models.subsystems import get_mission

_STORY_PATH = Path(__file__).resolve().with_name("story_tree.json")

_DEFAULT_FACTS = {
    "artemis_moon": (
        "NASA Artemis I used a Free-Return Trajectory around the Moon to save hundreds of "
        "kilograms of propellant and tested Orion's heat shield during 40,000 km/h Earth reentry."
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
    if effective_dv < s.required_dv_ms:
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
    if s.link_margin_db < 3.0 or s.downlink_efficiency < 0.85 or not s.dtmf_code_ok:
        g4 = "DEGRADED"

    return {
        "NODE_1_LAUNCH": g1,
        "NODE_2_PROPULSION": g2,
        "NODE_3_EVENT": g3,
        "NODE_4_DOWNLINK": g4,
    }


def evaluate_mission_deployment(
    mission_id: str, state: ConsolidatedMissionState | dict[str, Any]
) -> dict[str, Any]:
    """Evaluate all 4 deterministic gates and return MissionResolutionOutcome dict."""
    s = _as_state(state, mission_id)
    mission = get_mission(mission_id)
    fact = mission.get("nasa_real_world_fact") or _DEFAULT_FACTS.get(
        mission_id, _DEFAULT_FACTS["artemis_moon"]
    )

    wet_mass_kg = s.dry_mass_kg + s.instruments_mass_kg + s.propellant_mass_kg
    total_cost_usd = s.launch_cost_usd + s.subsystems_cost_usd

    # NODE 1: Launch Capacity, Fairing & Budget Hard Gate
    if not s.fairing_ok:
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=0.0,
            total_score=90,
            failed_or_degraded_gate="NODE_1_LAUNCH",
            causal_chain_explanation=(
                f"LAUNCH MANIFEST VETO (Fairing Geometry Conflict): Spacecraft envelope exceeded "
                f"the payload fairing clearance of {s.selected_launcher} in Rol 1B."
            ),
            nasa_real_world_fact=fact,
        ).model_dump()

    if wet_mass_kg > s.launcher_max_mass_kg:
        excess = round(wet_mass_kg - s.launcher_max_mass_kg, 1)
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=0.0,
            total_score=100,
            failed_or_degraded_gate="NODE_1_LAUNCH",
            causal_chain_explanation=(
                f"LAUNCH MANIFEST VETO: Total wet mass ({wet_mass_kg:.1f} kg: {s.dry_mass_kg:.0f} kg bus + "
                f"{s.instruments_mass_kg:.0f} kg instruments + {s.propellant_mass_kg:.0f} kg propellant) "
                f"exceeded {s.selected_launcher} capacity ({s.launcher_max_mass_kg:.1f} kg) by {excess} kg."
            ),
            nasa_real_world_fact=fact,
        ).model_dump()

    if total_cost_usd > s.budget_limit_usd:
        overrun = round((total_cost_usd - s.budget_limit_usd) / 1e6, 1)
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=0.0,
            total_score=120,
            failed_or_degraded_gate="NODE_1_LAUNCH",
            causal_chain_explanation=(
                f"NUNN-MCCURDY BUDGET BREACH: Total mission cost (${total_cost_usd / 1e6:.1f}M USD) "
                f"exceeded the ${s.budget_limit_usd / 1e6:.0f}M USD budget cap by ${overrun}M USD "
                f"(UFE reserve was {s.ufe_reserve_pct:.0f}%)."
            ),
            nasa_real_world_fact=fact,
        ).model_dump()

    # NODE 2: Tsiolkovsky Propulsion & CG Multiplier Gate
    g0 = 9.80665
    mass_ratio = wet_mass_kg / max(wet_mass_kg - s.propellant_mass_kg, 1.0)
    available_dv = s.isp_seconds * g0 * math.log(max(1.0001, mass_ratio))
    effective_dv = available_dv / max(1.0, s.fuel_burn_multiplier)

    if effective_dv < s.required_dv_ms:
        cause_details: list[str] = []
        if not s.cg_balanced or s.fuel_burn_multiplier > 1.0:
            cause_details.append(
                f"off-center CG in Rol 2B triggered a {s.fuel_burn_multiplier:.1f}x fuel burn penalty "
                f"(dropping raw {available_dv:.0f} m/s to {effective_dv:.0f} m/s)"
            )
        if s.isp_seconds <= 230.0:
            cause_details.append(
                f"low-Isp Hydrazine monopropellant ({s.isp_seconds:.0f} s in Rol 3A) limited exhaust velocity"
            )
        if not cause_details:
            cause_details.append("propellant tank load was insufficient for the selected trajectory")
        reason_str = " and ".join(cause_details)
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=25.0,
            total_score=250,
            failed_or_degraded_gate="NODE_2_PROPULSION",
            causal_chain_explanation=(
                f"ORBITAL DRIFT: Effective Delta-v ({effective_dv:.0f} m/s) fell short of "
                f"required {s.required_dv_ms:.0f} m/s because {reason_str}."
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
                "REENTRY LOSS: The spacecraft completed its transit trajectory but disintegrated during "
                "atmospheric reentry because the Heat Shield / Sample Containment Capsule was omitted in Rol 2A."
            ),
            nasa_real_world_fact=fact,
        ).model_dump()

    event_survival = 1.0
    notes: list[str] = []
    if mission_id == "artemis_moon" and s.battery_reserve_pct < 15.0:
        event_survival = 0.65
        notes.append(
            f"Cislunar solar storm forced Safe Mode due to low battery reserve ({s.battery_reserve_pct:.0f}% < 15%)."
        )
    elif mission_id == "asteroid_hunter" and (not s.has_visual_autonomy or s.ufe_reserve_pct < 15.0):
        event_survival = 0.70
        notes.append(
            f"Asteroid dust cloud and micro-rocks disrupted close-proximity navigation "
            f"(Visual Autonomy={'ON' if s.has_visual_autonomy else 'OFF'}, UFE={s.ufe_reserve_pct:.0f}%)."
        )
    elif mission_id == "mars_sample_return" and (
        s.ufe_reserve_pct < 20.0 or (s.power_source != "rtg_nuclear" and s.battery_reserve_pct < 25.0)
    ):
        event_survival = 0.60
        notes.append(
            f"Seasonal Mars dust storm and sample arm jam halved collected tubes "
            f"(Power={s.power_source}, Battery={s.battery_reserve_pct:.0f}%, UFE={s.ufe_reserve_pct:.0f}%)."
        )

    # NODE 4: Science Calibration & DSN Downlink Gate
    spectral_quality = max(0.4, s.science_calibration_f1)
    if s.link_margin_db < 3.0:
        comms_factor = 0.45
    elif not s.dtmf_code_ok:
        comms_factor = min(s.downlink_efficiency, 0.65)
    else:
        comms_factor = s.downlink_efficiency
    effective_completion = min(1.0, event_survival * comms_factor * spectral_quality)

    obj_score = 500.0 * effective_completion
    sci_score = 300.0 * min(1.0, s.science_value / 100.0) * s.science_calibration_f1
    mass_eff = max(0.0, 1.0 - (wet_mass_kg / max(1.0, s.launcher_max_mass_kg)))
    budget_eff = max(0.0, 1.0 - (total_cost_usd / max(1.0, s.budget_limit_usd)))
    eff_score = 200.0 * (0.5 * mass_eff + 0.5 * budget_eff)
    final_score = int(round(obj_score + sci_score + eff_score))

    if effective_completion < 0.85:
        if comms_factor < 1.0:
            notes.append(
                f"DSN link bottleneck (margin {s.link_margin_db:.1f} dB vs +3.0 dB threshold, "
                f"efficiency {comms_factor:.2f}) left science packets queued in the 160 Gbit recorder."
            )
        if spectral_quality < 0.75:
            notes.append(
                f"Spectral calibration F1 ({s.science_calibration_f1:.2f} in Rol 4A) degraded chemical signature fidelity."
            )
        return MissionResolutionOutcome(
            outcome="PARTIAL_SUCCESS",
            completion_pct=round(effective_completion * 100.0, 1),
            total_score=min(1000, max(400, final_score)),
            failed_or_degraded_gate="NODE_4_DOWNLINK" if comms_factor < 1.0 or spectral_quality < 0.75 else "NODE_3_EVENT",
            causal_chain_explanation="PARTIAL MISSION SUCCESS: " + " ".join(notes),
            nasa_real_world_fact=fact,
        ).model_dump()

    return MissionResolutionOutcome(
        outcome="FULL_SUCCESS",
        completion_pct=100.0,
        total_score=min(1000, max(800, final_score)),
        failed_or_degraded_gate=None,
        causal_chain_explanation=(
            f"FULL MISSION SUCCESS! The engineering team balanced spacecraft wet mass "
            f"({wet_mass_kg:.0f}/{s.launcher_max_mass_kg:.0f} kg on {s.selected_launcher}), maintained stable CG, "
            f"survived deep-space contingencies with {s.ufe_reserve_pct:.0f}% UFE reserve, calibrated payload spectra "
            f"(F1={s.science_calibration_f1:.2f}), and locked DSN downlink at +{s.link_margin_db:.1f} dB."
        ),
        nasa_real_world_fact=fact,
    ).model_dump()



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
            if key in ("fuel_burn_multiplier", "downlink_efficiency", "link_margin_db"):
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
