"""
Adaptive AI role synthesizer (Constraint-Aware Clamping for 1-3 human players).
Owner: Schoenstadt (Task SCH-03)
See docs/20-roadmap-schoenstadt.md before editing.
"""
from __future__ import annotations

from typing import Any


def synthesize_ai_role_wave1(
    role_id: str, difficulty: str = "medium", mission_id: str = "artemis_moon"
) -> dict[str, Any]:
    """Synthesize safe, coherent Wave 1 choices for empty AI-controlled roles."""
    is_hard = difficulty == "hard"
    if role_id == "finance_launch":
        return {
            "budget_engineering_usd": 350_000_000.0,
            "budget_science_usd": 200_000_000.0,
            "ufe_reserve_pct": 25.0 if not is_hard else 20.0,
            "funding_factor_F": 0.65,
            "subsystems_cost_usd": 250_000_000.0,
        }
    if role_id == "spacecraft_mass":
        return {
            "bus_dry_mass_kg": 461.0 if mission_id == "mars_sample_return" else 373.0,
            "has_thermal_protection": True,
            "assembly_integrity_pct": 95.0 if not is_hard else 85.0,
            "has_deorbit_device": True,
        }
    if role_id == "orbit_power":
        return {
            "trajectory_choice": "sso_700",
            "required_dv_ms": 1803.6,
            "isp_seconds": 315.0,
            "propellant_mass_kg": 820.0,
            "max_eclipse_min": 35.29,
            "fspl_loss_db": 166.0,
        }
    if role_id == "science_comms":
        return {
            "instruments_mass_kg": 68.0,
            "instruments_power_w": 67.0,
            "data_generated_gbit": 115.0,
            "science_value": 85.0,
            "science_calibration_f1": 0.86,
            "has_visual_autonomy": True,
            "selected_instruments": [
                {"id": "hirise", "name": "HiRISE Camera", "mass_kg": 65.0},
                {"id": "ctx", "name": "Context Camera (CTX)", "mass_kg": 3.0},
            ],
        }
    return {}


def synthesize_ai_role_wave2(
    role_id: str,
    difficulty: str = "medium",
    consolidated_wave1: dict[str, Any] | None = None,
    mission_id: str = "artemis_moon",
) -> dict[str, Any]:
    """Synthesize Wave 2 AI choices clamped to real Wave 1 human constraints."""
    w1 = consolidated_wave1 or {}
    wet_mass = float(w1.get("estimated_wet_mass_kg", 1500.0))

    if role_id == "finance_launch":
        if wet_mass <= 831.0:
            return {
                "selected_launcher": "rideshare_xl",
                "launcher_max_mass_kg": 831.0,
                "fairing_ok": True,
                "launch_cost_usd": 2_100_000.0,
            }
        if wet_mass <= 4020.0:
            return {
                "selected_launcher": "falcon9_block5",
                "launcher_max_mass_kg": 4020.0,
                "fairing_ok": True,
                "launch_cost_usd": 74_000_000.0,
            }
        return {
            "selected_launcher": "falcon_heavy",
            "launcher_max_mass_kg": 16800.0,
            "fairing_ok": True,
            "launch_cost_usd": 115_000_000.0,
        }
    if role_id == "spacecraft_mass":
        return {
            "cg_balanced": True,
            "fuel_burn_multiplier": 1.0,
            "mass_growth_margin_pct": 35.0,
            "ballast_jettisoned_kg": 0.0,
        }
    if role_id == "orbit_power":
        return {
            "power_source": "rtg_nuclear" if mission_id == "mars_sample_return" else "fuel_cell",
            "total_energy_mj": 240.0,
            "power_generation_w": 850.0,
            "battery_reserve_pct": 28.0 if difficulty != "hard" else 22.0,
        }
    if role_id == "science_comms":
        return {
            "link_margin_db": 4.2,
            "downlink_rate_mbps": 4.5,
            "downlink_efficiency": 1.0,
            "dtmf_code_ok": True,
            "solar_conjunction_warning": mission_id == "mars_sample_return",
        }
    return {}
