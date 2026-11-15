"""
Pytest unit tests for physics_engine, randomizer, decision_tree, subsystems and spectral adapters.
Owner: Schoenstadt (Tasks SCH-02 to SCH-05)
See docs/20-roadmap-schoenstadt.md before editing.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend import decision_tree, physics_engine, randomizer
from backend.juegos_espectrales import adaptadores_web
from backend.models import subsystems


def test_wgs84_orbit_fspl_values() -> None:
    d_leo = physics_engine.slant_range_km(350.0, 10.0)
    assert physics_engine.compute_fspl_db(d_leo, 2.2) == 161.6

    d_geo = physics_engine.slant_range_km(35786.0, 10.0)
    assert physics_engine.compute_fspl_db(d_geo, 2.2) == 191.5


def test_catalog_subsystems_loaded() -> None:
    artemis = subsystems.get_mission("artemis_moon")
    assert artemis["budget_limit_usd"] == 800000000
    assert len(subsystems.get_instruments()) >= 5


def test_unbalanced_cg_penalizes_propulsion_gate() -> None:
    outcome = decision_tree.evaluate_mission_deployment(
        "artemis_moon",
        {
            "dry_mass_kg": 400.0,
            "instruments_mass_kg": 68.0,
            "propellant_mass_kg": 600.0,
            "required_dv_ms": 2200.0,
            "isp_seconds": 225.0,
            "cg_balanced": False,
            "fuel_burn_multiplier": 1.5,
            "launcher_max_mass_kg": 4020.0,
        },
    )
    assert outcome["outcome"] == "FAILED"
    assert outcome["failed_or_degraded_gate"] == "NODE_2_PROPULSION"
    assert outcome["causal_chain_explanation"]
    assert outcome["nasa_real_world_fact"]


def test_flight_rounds_and_randomizer_smoke() -> None:
    w1 = randomizer.synthesize_ai_role_wave1("finance_launch", "medium", "artemis_moon")
    metrics = physics_engine.compute_live_metrics(w1, "artemis_moon")
    w2 = randomizer.synthesize_ai_role_wave2("finance_launch", "medium", metrics, "artemis_moon")
    assert "selected_launcher" in w2

    q1 = decision_tree.select_flight_round_question(1, "artemis_moon", {})
    assert q1["gate"] == "NODE_1_LAUNCH"
    assert len(q1["options"]) >= 2


def test_spectral_adapters_smoke() -> None:
    reto = adaptadores_web.generar_reto_oleada1("mars_sample_return", "hard")
    assert len(reto["points"]) <= 500
    f1 = adaptadores_web.evaluar_marcas(reto["expected_peaks"], reto["expected_peaks"])
    assert f1 == 1.0
