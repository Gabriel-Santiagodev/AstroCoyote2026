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
    from .models.session import ConsolidatedMissionState, MissionResolutionOutcome
    from .models.subsystems import get_mission
else:
    from models.session import ConsolidatedMissionState, MissionResolutionOutcome
    from models.subsystems import get_mission

_STORY_PATH = Path(__file__).resolve().with_name("story_tree.json")

_DEFAULT_FACTS = {
    "artemis_moon": (
        "NASA Artemis I used a Free-Return Trajectory around the Moon and tested "
        "Orion's heat shield during 40,000 km/h Earth reentry."
    ),
    "asteroid_hunter": (
        "NASA OSIRIS-REx used autonomous Natural Feature Tracking at asteroid Bennu "
        "because signal delay prevented real-time Earth piloting."
    ),
    "mars_sample_return": (
        "Over 52% of NASA MRO's 2,180 kg launch mass was propellant (1,149 kg), and its "
        "3 m High-Gain Antenna downlinks up to 6 Mbps to the Deep Space Network."
    ),
}


def _load_story_tree() -> dict[str, Any]:
    with _STORY_PATH.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def _as_state(state: ConsolidatedMissionState | dict[str, Any]) -> ConsolidatedMissionState:
    if isinstance(state, ConsolidatedMissionState):
        return state
    return ConsolidatedMissionState.model_validate(state)


def evaluate_mission_deployment(
    mission_id: str, state: ConsolidatedMissionState | dict[str, Any]
) -> dict[str, Any]:
    """Evaluate all 4 deterministic gates and return MissionResolutionOutcome dict."""
    s = _as_state(state)
    mission = get_mission(mission_id)
    fact = mission.get("nasa_real_world_fact") or _DEFAULT_FACTS.get(
        mission_id, _DEFAULT_FACTS["artemis_moon"]
    )

    wet_mass_kg = s.dry_mass_kg + s.instruments_mass_kg + s.propellant_mass_kg
    total_cost_usd = s.launch_cost_usd + s.subsystems_cost_usd

    # NODE 1: Launch Capacity, Fairing & Budget Hard Gate
    if wet_mass_kg > s.launcher_max_mass_kg or not s.fairing_ok:
        excess = round(wet_mass_kg - s.launcher_max_mass_kg, 1)
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=0.0,
            total_score=100,
            failed_or_degraded_gate="NODE_1_LAUNCH",
            causal_chain_explanation=(
                f"LAUNCH MANIFEST VETO: Total wet mass ({wet_mass_kg:.1f} kg) exceeded "
                f"{s.selected_launcher} capacity ({s.launcher_max_mass_kg:.1f} kg) by {excess} kg."
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
                f"NUNN-MCCURDY BUDGET BREACH: Total mission cost exceeded the budget cap "
                f"by ${overrun}M USD due to insufficient UFE reserve."
            ),
            nasa_real_world_fact=fact,
        ).model_dump()

    # NODE 2: Tsiolkovsky Propulsion & CG Multiplier Gate
    g0 = 9.80665
    mass_ratio = wet_mass_kg / max(wet_mass_kg - s.propellant_mass_kg, 1.0)
    available_dv = s.isp_seconds * g0 * math.log(max(1.0001, mass_ratio))
    effective_dv = available_dv / max(1.0, s.fuel_burn_multiplier)

    if effective_dv < s.required_dv_ms:
        cg_note = (
            " Off-center CG (Rol 2B) triggered a 1.5x fuel burn penalty."
            if not s.cg_balanced
            else ""
        )
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=25.0,
            total_score=250,
            failed_or_degraded_gate="NODE_2_PROPULSION",
            causal_chain_explanation=(
                f"ORBITAL DRIFT: Effective Delta-v ({effective_dv:.0f} m/s) fell short of "
                f"required {s.required_dv_ms:.0f} m/s.{cg_note}"
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
                "REENTRY LOSS: The spacecraft reached the target but was lost during "
                "reentry because Heat Shield / Sample Capsule was omitted in Rol 2A."
            ),
            nasa_real_world_fact=fact,
        ).model_dump()

    event_survival = 1.0
    notes: list[str] = []
    if mission_id == "artemis_moon" and s.battery_reserve_pct < 15.0:
        event_survival = 0.65
        notes.append("Cislunar solar storm forced Safe Mode due to <15% battery reserve.")
    elif mission_id == "asteroid_hunter" and (not s.has_visual_autonomy or s.ufe_reserve_pct < 15.0):
        event_survival = 0.70
        notes.append("Dust cloud disrupted navigation due to missing Visual Autonomy or <15% UFE.")
    elif mission_id == "mars_sample_return" and (
        s.ufe_reserve_pct < 20.0 or (s.power_source != "rtg_nuclear" and s.battery_reserve_pct < 25.0)
    ):
        event_survival = 0.60
        notes.append("Mars dust storm cut sample tubes collected due to missing RTG or <20% UFE.")

    # NODE 4: Science Calibration & DSN Downlink Gate
    spectral_quality = max(0.4, s.science_calibration_f1)
    comms_factor = s.downlink_efficiency if s.link_margin_db >= 3.0 else 0.45
    effective_completion = min(1.0, event_survival * comms_factor * spectral_quality)

    obj_score = 500.0 * effective_completion
    sci_score = 300.0 * min(1.0, s.science_value / 100.0) * s.science_calibration_f1
    mass_eff = max(0.0, 1.0 - (wet_mass_kg / max(1.0, s.launcher_max_mass_kg)))
    budget_eff = max(0.0, 1.0 - (total_cost_usd / max(1.0, s.budget_limit_usd)))
    eff_score = 200.0 * (0.5 * mass_eff + 0.5 * budget_eff)
    final_score = int(round(obj_score + sci_score + eff_score))

    if effective_completion < 0.85:
        if comms_factor < 1.0:
            notes.append("DSN link bottleneck (< +3 dB or DTMF mismatch) left packets in the 160 Gbit buffer.")
        if spectral_quality < 0.75:
            notes.append(f"Spectral calibration F1 ({s.science_calibration_f1:.2f}) degraded data fidelity.")
        return MissionResolutionOutcome(
            outcome="PARTIAL_SUCCESS",
            completion_pct=round(effective_completion * 100.0, 1),
            total_score=max(400, final_score),
            failed_or_degraded_gate="NODE_4_DOWNLINK" if comms_factor < 1.0 else "NODE_3_EVENT",
            causal_chain_explanation="PARTIAL SUCCESS: " + " ".join(notes),
            nasa_real_world_fact=fact,
        ).model_dump()

    return MissionResolutionOutcome(
        outcome="FULL_SUCCESS",
        completion_pct=100.0,
        total_score=max(800, final_score),
        failed_or_degraded_gate=None,
        causal_chain_explanation=(
            f"FULL MISSION SUCCESS! Balanced mass ({wet_mass_kg:.0f}/{s.launcher_max_mass_kg:.0f} kg), "
            f"kept {s.ufe_reserve_pct:.0f}% UFE reserve, calibrated science spectra (F1={s.science_calibration_f1:.2f}), "
            f"and downlinked cleanly via DSN."
        ),
        nasa_real_world_fact=fact,
    ).model_dump()


def select_flight_round_question(
    round_num: int, mission_id: str, state: dict[str, Any]
) -> dict[str, Any]:
    """Select conditional 60s flight crisis node for round 1..4 based on spacecraft state."""
    story = _load_story_tree().get("nodes", {})
    gate_order = [
        "NODE_1_LAUNCH",
        "NODE_2_PROPULSION",
        "NODE_3_EVENT",
        "NODE_4_DOWNLINK",
    ]
    gate = gate_order[max(0, min(3, round_num - 1))]
    gate_nodes = story.get(gate, {})

    s = _as_state(state)
    wet_mass = s.dry_mass_kg + s.instruments_mass_kg + s.propellant_mass_kg
    is_critical = False
    if gate == "NODE_1_LAUNCH":
        is_critical = wet_mass > 0.9 * s.launcher_max_mass_kg or (s.launch_cost_usd + s.subsystems_cost_usd) > 0.9 * s.budget_limit_usd
    elif gate == "NODE_2_PROPULSION":
        is_critical = not s.cg_balanced
    elif gate == "NODE_3_EVENT":
        is_critical = s.ufe_reserve_pct < 20.0 or s.battery_reserve_pct < 20.0
    elif gate == "NODE_4_DOWNLINK":
        is_critical = s.link_margin_db < 3.0 or s.downlink_efficiency < 1.0

    branch = "critical" if is_critical else "nominal"
    node = dict(gate_nodes.get(branch) or {})
    node["mission_id"] = mission_id
    return node


def apply_flight_option(
    state: dict[str, Any], question_id: str, option_id: str
) -> dict[str, Any]:
    """Apply chosen flight option's delta_effects onto consolidated state dict."""
    updated = dict(state)
    story = _load_story_tree().get("nodes", {})
    for gate_branches in story.values():
        for branch_node in gate_branches.values():
            if branch_node.get("question_id") == question_id:
                for opt in branch_node.get("options", []):
                    if opt.get("option_id") == option_id:
                        for key, val in opt.get("delta_effects", {}).items():
                            if isinstance(val, (int, float)) and isinstance(updated.get(key), (int, float)):
                                if key in ("fuel_burn_multiplier", "downlink_efficiency", "link_margin_db"):
                                    updated[key] = val
                                else:
                                    updated[key] = float(updated[key]) + float(val)
                            else:
                                updated[key] = val
    return updated
