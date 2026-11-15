"""
Adaptive AI role synthesizer (Constraint-Aware Clamping for 1-3 human players).
Owner: Schoenstadt (Task SCH-03)
See docs/20-roadmap-schoenstadt.md and arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md §7.
"""
from __future__ import annotations

import math
import random
from typing import Any

if __package__:
    from . import physics_engine
    from .models.subsystems import get_mission
else:
    import physics_engine
    from models.subsystems import get_mission

ALL_ROLES: tuple[str, ...] = (
    "finance_launch",
    "spacecraft_mass",
    "orbit_power",
    "science_comms",
)

ARCHETYPE_WEIGHTS: dict[str, dict[str, float]] = {
    "easy": {"CONSERVATIVE": 0.70, "AMBITIOUS": 0.20, "CHALLENGING": 0.10},
    "medium": {"CONSERVATIVE": 0.40, "AMBITIOUS": 0.40, "CHALLENGING": 0.20},
    "hard": {"CONSERVATIVE": 0.20, "AMBITIOUS": 0.50, "CHALLENGING": 0.30},
}


def pick_archetype(difficulty: str = "medium", rng: random.Random | None = None) -> str:
    """Select an AI behavioral archetype weighted by difficulty."""
    weights = ARCHETYPE_WEIGHTS.get(difficulty, ARCHETYPE_WEIGHTS["medium"])
    populations = list(weights.keys())
    probs = list(weights.values())
    chooser = rng if rng is not None else random
    return chooser.choices(populations, weights=probs, k=1)[0]


def get_ai_roles(human_roles: list[str] | set[str]) -> list[str]:
    """Return the remaining roles controlled by the AI (4 - N humans)."""
    taken = set(human_roles)
    return [r for r in ALL_ROLES if r not in taken]


def _resolve_mission_and_budget(mission_or_budget: str | float | int) -> tuple[str, float]:
    if isinstance(mission_or_budget, (int, float)):
        budget = float(mission_or_budget)
        if budget <= 900_000_000.0:
            return "artemis_moon", budget
        if budget <= 1_500_000_000.0:
            return "asteroid_hunter", budget
        return "mars_sample_return", budget
    mission_id = str(mission_or_budget or "artemis_moon")
    mission = get_mission(mission_id)
    return mission_id, float(mission.get("budget_limit_usd", 800_000_000.0))


def synthesize_ai_role_wave1(
    role_id: str,
    difficulty: str = "medium",
    mission_id: str | float = "artemis_moon",
    *,
    archetype: str | None = None,
) -> dict[str, Any]:
    """
    Synthesize safe, coherent Wave 1 choices for empty AI-controlled roles.
    Accepts either mission_id (str) or mission_budget (float) as third parameter.
    Never sabotages with instant-death omissions (has_thermal_protection is always True).
    """
    resolved_mission_id, mission_budget = _resolve_mission_and_budget(mission_id)
    arch = archetype or pick_archetype(difficulty)

    if role_id == "finance_launch":
        if arch == "CONSERVATIVE":
            ufe_pct = 30.0
            funding_f = 0.55
            sci_pct = 0.20
            eng_pct = 0.40
        elif arch == "AMBITIOUS":
            ufe_pct = 22.0 if resolved_mission_id == "mars_sample_return" else 20.0
            funding_f = 0.85
            sci_pct = 0.28
            eng_pct = 0.42
        else:  # CHALLENGING
            ufe_pct = 20.0 if resolved_mission_id == "mars_sample_return" else 16.0
            funding_f = 0.40
            sci_pct = 0.25
            eng_pct = 0.45

        budget_eng = round(mission_budget * eng_pct, 0)
        budget_sci = round(mission_budget * sci_pct, 0)
        subsystems_cost = round(budget_eng * 0.55 + budget_sci, 0)
        return {
            "budget_limit_usd": mission_budget,
            "budget_engineering_usd": budget_eng,
            "budget_science_usd": budget_sci,
            "ufe_reserve_pct": ufe_pct,
            "funding_factor_F": funding_f,
            "science_budget_pct": sci_pct,
            "subsystems_cost_usd": subsystems_cost,
            "ai_archetype": arch,
        }

    if role_id == "spacecraft_mass":
        base_bus = 461.0 if resolved_mission_id == "mars_sample_return" else 373.0
        if arch == "CHALLENGING":
            bus_mass = base_bus + 47.0
            integrity = 85.0
        elif arch == "AMBITIOUS":
            bus_mass = base_bus + 15.0
            integrity = 96.0
        else:
            bus_mass = base_bus
            integrity = 100.0
        return {
            "bus_dry_mass_kg": bus_mass,
            "dry_mass_kg": bus_mass,
            "has_thermal_protection": True,
            "assembly_integrity_pct": integrity,
            "has_deorbit_device": True,
            "ai_archetype": arch,
        }

    if role_id == "orbit_power":
        if arch == "CONSERVATIVE":
            traj = "sso_700"
            req_dv = 1480.0 if resolved_mission_id == "artemis_moon" else 1803.6
            isp = 315.0
            alt_km = 700.0
        elif arch == "AMBITIOUS":
            traj = "sso_700"
            req_dv = 1803.6
            isp = 1600.0
            alt_km = 700.0
        else:  # CHALLENGING
            traj = "leo_550" if resolved_mission_id != "mars_sample_return" else "sso_700"
            req_dv = 1803.6
            isp = 225.0
            alt_km = 550.0 if traj == "leo_550" else 700.0

        est_dry = (461.0 if resolved_mission_id == "mars_sample_return" else 373.0) + 68.0
        f_prop = physics_engine.compute_propellant_fraction(req_dv * 1.12, isp, 1.0)
        est_wet = est_dry / max(0.08, 1.0 - f_prop)
        prop_mass = round(max(120.0, est_wet - est_dry), 1)
        return {
            "trajectory_choice": traj,
            "required_dv_ms": req_dv,
            "isp_seconds": isp,
            "propellant_mass_kg": prop_mass,
            "max_eclipse_min": physics_engine.eclipse_duration_min(alt_km),
            "fspl_loss_db": physics_engine.compute_fspl_db(
                physics_engine.slant_range_km(alt_km, 10.0), 2.2
            ),
            "ai_archetype": arch,
        }

    if role_id == "science_comms":
        if arch == "CONSERVATIVE":
            selected = [
                {"id": "hirise", "name": "HiRISE Camera", "mass_kg": 65.0},
                {"id": "ctx", "name": "Context Camera (CTX)", "mass_kg": 3.0},
            ]
            inst_mass = 68.0
            inst_power = 67.0
            data_gbit = 115.0
            sci_val = 85.0
            f1 = 0.88
            autonomy = True
        elif arch == "AMBITIOUS":
            selected = [
                {"id": "hirise", "name": "HiRISE Camera", "mass_kg": 65.0},
                {"id": "crism", "name": "CRISM Spectrometer", "mass_kg": 33.0},
                {"id": "ctx", "name": "Context Camera (CTX)", "mass_kg": 3.0},
            ]
            inst_mass = 101.0
            inst_power = 112.0
            data_gbit = 145.0
            sci_val = 95.0
            f1 = 0.94
            autonomy = True
        else:  # CHALLENGING
            selected = [
                {"id": "hirise", "name": "HiRISE Camera", "mass_kg": 65.0},
                {"id": "mcs", "name": "Mars Climate Sounder (MCS)", "mass_kg": 9.0},
                {"id": "ctx", "name": "Context Camera (CTX)", "mass_kg": 3.0},
            ]
            inst_mass = 77.0
            inst_power = 78.0
            data_gbit = 125.0
            sci_val = 82.0
            f1 = 0.78
            autonomy = True

        return {
            "instruments_mass_kg": inst_mass,
            "instruments_power_w": inst_power,
            "data_generated_gbit": data_gbit,
            "science_value": sci_val,
            "science_calibration_f1": f1,
            "has_visual_autonomy": autonomy,
            "selected_instruments": selected,
            "ai_archetype": arch,
        }

    return {}


def synthesize_ai_role_wave2(
    role_id: str,
    difficulty: str = "medium",
    consolidated_wave1: dict[str, Any] | None = None,
    mission_id: str = "artemis_moon",
    *,
    archetype: str | None = None,
) -> dict[str, Any]:
    """
    Synthesize Wave 2 AI choices clamped to real Wave 1 human constraints
    (Constraint-Aware Clamping).
    """
    w1 = consolidated_wave1 or {}
    resolved_mission_id, mission_budget = _resolve_mission_and_budget(
        w1.get("mission_id") or mission_id
    )
    arch = archetype or pick_archetype(difficulty)

    dry_mass = float(
        w1.get("dry_mass_kg", w1.get("bus_dry_mass_kg", 461.0 if resolved_mission_id == "mars_sample_return" else 373.0))
    )
    inst_mass = float(w1.get("instruments_mass_kg", 68.0))
    prop_mass = float(w1.get("propellant_mass_kg", 750.0))
    explicit_wet = dry_mass + inst_mass + prop_mass
    est_wet = float(w1.get("estimated_wet_mass_kg", explicit_wet))
    wet_mass = max(explicit_wet, est_wet)

    subsystems_cost = float(w1.get("subsystems_cost_usd", 250_000_000.0))
    budget_limit = float(w1.get("budget_limit_usd", mission_budget))
    remaining_budget = float(
        w1.get("remaining_budget_usd", max(0.0, budget_limit - subsystems_cost))
    )

    if role_id == "finance_launch":
        # Select the most cost-effective verified launcher that fits wet_mass and budget
        candidates = [
            ("rideshare_xl", 831.0, 2_100_000.0),
            ("falcon9_block5", 4020.0, 74_000_000.0),
            ("vulcan_vc6", 14400.0, 120_000_000.0),
            ("falcon_heavy", 16800.0, 115_000_000.0),
        ]
        for lid, max_kg, cost_usd in candidates:
            if wet_mass <= max_kg and cost_usd <= max(remaining_budget, 2_100_000.0):
                return {
                    "selected_launcher": lid,
                    "launcher_max_mass_kg": max_kg,
                    "fairing_ok": True,
                    "launch_cost_usd": cost_usd,
                    "ai_archetype": arch,
                }
        # Fallback if human built a super-heavy spacecraft: Falcon Heavy max capacity
        return {
            "selected_launcher": "falcon_heavy",
            "launcher_max_mass_kg": 16800.0,
            "fairing_ok": True,
            "launch_cost_usd": 115_000_000.0,
            "ai_archetype": arch,
        }

    if role_id == "spacecraft_mass":
        # Constraint-Aware Clamping: check if propellant has enough delta-v margin for a 1.5x burn
        isp = float(w1.get("isp_seconds", 315.0))
        req_dv = float(w1.get("required_dv_ms", 1803.6))
        mass_ratio = wet_mass / max(1.0, wet_mass - prop_mass)
        avail_dv = isp * physics_engine.G0_M_S2 * math.log(max(1.0001, mass_ratio))
        can_survive_unbalanced = (avail_dv / 1.5) >= (req_dv * 1.02)

        balanced = True
        if arch == "CHALLENGING" and difficulty == "hard" and can_survive_unbalanced:
            balanced = False

        launcher_cap = float(w1.get("launcher_max_mass_kg", 4020.0))
        ballast_jettisoned = 0.0
        if explicit_wet > launcher_cap:
            ballast_jettisoned = round(min(120.0, explicit_wet - launcher_cap + 10.0), 1)

        return {
            "cg_balanced": balanced,
            "fuel_burn_multiplier": 1.0 if balanced else 1.5,
            "mass_growth_margin_pct": 35.0 if balanced else 22.0,
            "ballast_jettisoned_kg": ballast_jettisoned,
            "ai_archetype": arch,
        }

    if role_id == "orbit_power":
        funding_f = float(w1.get("funding_factor_F", 0.6))
        spawn_probs = physics_engine.compute_power_spawn_probabilities(funding_f)
        expected_mj_per_crate = (
            spawn_probs["chemical_pack"] * 15.0
            + spawn_probs["battery_pack"] * 45.0
            + spawn_probs["h2_fuel_cell"] * 100.0
        )
        total_mj = round(max(160.0, expected_mj_per_crate * 4.5), 1)
        power_src = "rtg_nuclear" if resolved_mission_id == "mars_sample_return" else "fuel_cell"
        power_w = 850.0 if arch != "CHALLENGING" else 680.0
        batt_reserve = 28.0 if arch == "CONSERVATIVE" else (25.0 if resolved_mission_id == "mars_sample_return" else 20.0)
        return {
            "power_source": power_src,
            "total_energy_mj": total_mj,
            "power_generation_w": power_w,
            "battery_reserve_pct": batt_reserve,
            "ai_archetype": arch,
        }

    if role_id == "science_comms":
        fspl_db = float(w1.get("fspl_loss_db", 166.0))
        # Compensate higher orbital path loss while keeping link margin >= 3.0 dB
        base_margin = 4.5 if arch != "CHALLENGING" else 3.2
        margin_db = round(max(3.1, base_margin - max(0.0, (fspl_db - 166.0) * 0.03)), 2)
        eff = 1.0 if arch != "CHALLENGING" else 0.90
        return {
            "link_margin_db": margin_db,
            "downlink_rate_mbps": 4.5 if fspl_db <= 175.0 else 3.2,
            "downlink_efficiency": eff,
            "dtmf_code_ok": True,
            "solar_conjunction_warning": resolved_mission_id == "mars_sample_return",
            "ai_archetype": arch,
        }

    return {}

