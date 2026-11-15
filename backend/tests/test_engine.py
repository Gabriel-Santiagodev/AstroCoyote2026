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
from backend.models import session, subsystems


def test_sch01_session_pydantic_contracts_three_missions() -> None:
    expected_budgets = {
        "artemis_moon": 800_000_000.0,
        "asteroid_hunter": 1_200_000_000.0,
        "mars_sample_return": 2_500_000_000.0,
    }
    for mission_id, expected_budget in expected_budgets.items():
        cfg = session.MissionSessionConfig(
            room_pin="NASA26",
            mission_id=mission_id,  # type: ignore[arg-type]
            difficulty="medium",
            player_count=2,
            human_roles=["finance_launch", "spacecraft_mass"],
            ai_roles=["orbit_power", "science_comms"],
        )
        assert cfg.mission_id == mission_id
        assert cfg.wave2_spectral_game == "espectro_hacker"

        state = session.ConsolidatedMissionState.model_validate(
            {
                "mission_id": mission_id,
                "bus_dry_mass_kg": 461.0,
                "ballast_jettisoned_kg": 11.0,
                "cg_balanced": False,
                "selected_instruments": ["hirise", {"id": "ctx", "mass_kg": 3.0}],
            }
        )
        assert state.budget_limit_usd == expected_budget
        assert state.dry_mass_kg == 450.0
        assert state.fuel_burn_multiplier == 1.5
        assert len(state.selected_instruments) == 2

    node = session.FlightQuestionNode(
        question_id="q_test",
        gate="NODE_1_LAUNCH",
        assigned_role="finance_launch",
        title="Max-Q Check",
        scenario_context="Rocket approaching Max-Q.",
        nasa_concept_badge="NPR 7120.5 UFE",
        options=[
            session.FlightQuestionOption(
                option_id="opt_a",
                label="Hold nominal throttle",
                engineering_tradeoff_hint="Preserves delta-v margin",
                delta_effects={"ufe_reserve_pct": -5.0},
            )
        ],
    )
    assert node.gate == "NODE_1_LAUNCH"

    outcome = session.MissionResolutionOutcome(
        outcome="FULL_SUCCESS",
        completion_pct=100.0,
        total_score=920,
        failed_or_degraded_gate=None,
        causal_chain_explanation="Nominal flight.",
        nasa_real_world_fact="Verified NASA fact.",
    )
    assert outcome.total_score == 920



def test_wgs84_orbit_fspl_values() -> None:
    # Full 9-row table from docs/06-datos-nasa.md §3
    expected_table = [
        # (alt_km, vel, period, ecl_min, ecl_pct, sso_inc, half_ang, slant_km, fspl_s, fspl_x)
        (350.0, 7.697, 91.54, 36.33, 39.7, 96.85, 11.00, 1303.6, 161.6, 173.0),
        (420.0, 7.657, 92.97, 36.03, 38.8, 97.10, 12.49, 1492.6, 162.8, 174.2),
        (500.0, 7.613, 94.62, 35.75, 37.8, 97.40, 14.05, 1695.1, 163.9, 175.3),
        (550.0, 7.585, 95.65, 35.61, 37.2, 97.59, 14.96, 1815.7, 164.5, 175.9),
        (700.0, 7.504, 98.77, 35.29, 35.7, 98.19, 17.45, 2155.3, 166.0, 177.4),
        (800.0, 7.452, 100.87, 35.13, 34.8, 98.60, 18.95, 2366.9, 166.8, 178.2),
        (2000.0, 6.898, 127.20, 35.03, 27.5, 104.89, 31.43, 4436.7, 172.2, 183.7),
        (20200.0, 3.873, 718.70, 55.44, 7.7, None, 66.33, 24717.7, 187.2, 198.6),
        (35786.0, 3.075, 1436.07, 69.41, 4.8, None, 71.43, 40586.1, 191.5, 202.9),
    ]
    for alt, vel, per, ecl_m, ecl_p, sso, h_ang, slant, fspl_s, fspl_x in expected_table:
        v_calc, p_calc = physics_engine.orbital_velocity_and_period(alt)
        assert v_calc == vel
        assert p_calc == per
        assert physics_engine.eclipse_duration_min(alt) == ecl_m
        assert physics_engine.eclipse_fraction_pct(alt) == ecl_p
        assert physics_engine.sso_inclination_deg(alt) == sso
        assert physics_engine.coverage_half_angle_deg(alt, 10.0) == h_ang
        d_calc = physics_engine.slant_range_km(alt, 10.0)
        assert d_calc == slant
        assert physics_engine.compute_fspl_db(d_calc, 2.2) == fspl_s
        assert physics_engine.compute_fspl_db(d_calc, 8.2) == fspl_x


def test_sch02_live_metrics_and_causal_mutations() -> None:
    # Verify Tsiolkovsky wet mass with 2200 kg dry mass to GEO from GTO (dv=1803.6 m/s)
    # Hydrazine (225s) -> ~4982.2 kg vs Hall (1600s) -> ~2468.0 kg (from arquitectura doc §6)
    assert physics_engine.compute_wet_mass_kg(2200.0, 1803.6, 225.0, 1.0) == 4982.2
    assert physics_engine.compute_wet_mass_kg(2200.0, 1803.6, 1600.0, 1.0) == 2468.0

    # Verify CG calculation and unbalanced placements detection
    x_cg, y_cg, d_cg = physics_engine.compute_cg_distance(
        [
            {"mass_kg": 65.0, "x_m": 0.4, "y_m": 0.0},
            {"mass_kg": 65.0, "x_m": -0.4, "y_m": 0.0},
        ]
    )
    assert (x_cg, y_cg, d_cg) == (0.0, 0.0, 0.0)

    # Verify live metrics updates across all 4 roles
    m_live = physics_engine.compute_live_metrics(
        {
            "budget_engineering_usd": 300_000_000.0,
            "budget_science_usd": 150_000_000.0,
            "selected_launcher": "electron",
            "bus_dry_mass_kg": 400.0,
            "ballast_jettisoned_kg": 27.0,
            "selected_instruments": ["hirise", "ctx"],
            "trajectory_choice": "geo_35786",
            "placements": [{"mass_kg": 65.0, "x_m": 0.5, "y_m": 0.5}],
            "total_energy_mj": 200.0,
            "funding_factor_F": 0.5,
        },
        "artemis_moon",
    )
    assert m_live["instruments_mass_kg"] == 68.0
    assert m_live["fspl_loss_db"] == 191.5
    assert m_live["cg_balanced"] is False
    assert m_live["fuel_burn_multiplier"] == 1.5
    assert m_live["remaining_budget_usd"] == 800_000_000.0 - 450_000_000.0 - 9_200_000.0
    assert m_live["available_power_w"] == 740.0

    probs_mid = physics_engine.compute_power_spawn_probabilities(0.5)
    assert probs_mid == {"chemical_pack": 0.4, "battery_pack": 0.4, "h2_fuel_cell": 0.2}
    assert physics_engine.compute_rover_effective_speed_factor([8.0, 8.0, 8.0]) == 1.24
    assert physics_engine.compute_rover_effective_speed_factor([-14.0, -14.0, -14.0]) == 0.58



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
    assert "Hydrazine" in outcome["causal_chain_explanation"]
    assert "1.5x" in outcome["causal_chain_explanation"]
    assert outcome["nasa_real_world_fact"]


def test_sch04_all_four_nodes_failed_partial_and_full_success() -> None:
    # 1. NODE_1_LAUNCH: Mass excess
    out_mass = decision_tree.evaluate_mission_deployment(
        "artemis_moon",
        {
            "selected_launcher": "electron",
            "launcher_max_mass_kg": 300.0,
            "dry_mass_kg": 373.0,
            "instruments_mass_kg": 68.0,
            "propellant_mass_kg": 200.0,
        },
    )
    assert out_mass["outcome"] == "FAILED"
    assert out_mass["failed_or_degraded_gate"] == "NODE_1_LAUNCH"
    assert "exceeded electron capacity" in out_mass["causal_chain_explanation"]

    # 2. NODE_1_LAUNCH: Nunn-McCurdy Budget Breach
    out_budget = decision_tree.evaluate_mission_deployment(
        "artemis_moon",
        {
            "budget_limit_usd": 800_000_000.0,
            "subsystems_cost_usd": 760_000_000.0,
            "launch_cost_usd": 74_000_000.0,
        },
    )
    assert out_budget["outcome"] == "FAILED"
    assert out_budget["failed_or_degraded_gate"] == "NODE_1_LAUNCH"
    assert "NUNN-MCCURDY" in out_budget["causal_chain_explanation"]

    # 3. NODE_3_EVENT: Missing Thermal Protection on reentry mission
    out_reentry = decision_tree.evaluate_mission_deployment(
        "mars_sample_return",
        {
            "has_thermal_protection": False,
        },
    )
    assert out_reentry["outcome"] == "FAILED"
    assert out_reentry["failed_or_degraded_gate"] == "NODE_3_EVENT"
    assert "REENTRY LOSS" in out_reentry["causal_chain_explanation"]

    # 4. PARTIAL_SUCCESS: Low DSN margin (< 3.0 dB)
    out_partial = decision_tree.evaluate_mission_deployment(
        "asteroid_hunter",
        {
            "link_margin_db": 1.8,
            "has_visual_autonomy": True,
            "ufe_reserve_pct": 25.0,
        },
    )
    assert out_partial["outcome"] == "PARTIAL_SUCCESS"
    assert out_partial["failed_or_degraded_gate"] == "NODE_4_DOWNLINK"
    assert 400 <= out_partial["total_score"] < 800

    # 5. FULL_SUCCESS: Nominal Mars Sample Return with RTG + 25% UFE + spectral_marks
    # Marks must match the peaks of Abraham's real spectral generator (they are mission-specific).
    mars_expected_peaks = adaptadores_web.generar_reto_oleada1("mars_sample_return")["expected_peaks"]
    out_full = decision_tree.evaluate_mission_deployment(
        "mars_sample_return",
        {
            "power_source": "rtg_nuclear",
            "ufe_reserve_pct": 25.0,
            "battery_reserve_pct": 30.0,
            "link_margin_db": 4.5,
            "downlink_efficiency": 1.0,
            "spectral_marks": [float(p) for p in mars_expected_peaks],
        },
    )
    assert out_full["outcome"] == "FULL_SUCCESS"
    assert out_full["failed_or_degraded_gate"] is None
    assert 800 <= out_full["total_score"] <= 1000



def test_flight_rounds_and_randomizer_smoke() -> None:
    w1 = randomizer.synthesize_ai_role_wave1("finance_launch", "medium", "artemis_moon")
    metrics = physics_engine.compute_live_metrics(w1, "artemis_moon")
    w2 = randomizer.synthesize_ai_role_wave2("finance_launch", "medium", metrics, "artemis_moon")
    assert "selected_launcher" in w2

    # Also test numeric budget parameter compatibility (arquitectura doc §7)
    w1_num = randomizer.synthesize_ai_role_wave1("finance_launch", "easy", 800_000_000.0)
    assert w1_num["budget_limit_usd"] == 800_000_000.0

    q1 = decision_tree.select_flight_round_question(1, "artemis_moon", {})
    assert q1["gate"] == "NODE_1_LAUNCH"
    assert len(q1["options"]) >= 2


def test_sch03_randomizer_1_to_3_players_constraint_clamping() -> None:
    for mission_id in ("artemis_moon", "asteroid_hunter", "mars_sample_return"):
        for arch in ("CONSERVATIVE", "AMBITIOUS", "CHALLENGING"):
            # Simulate 1 human player (finance_launch) + 3 AI roles
            ai_roles = randomizer.get_ai_roles(["finance_launch"])
            assert len(ai_roles) == 3

            state: dict[str, object] = {
                "mission_id": mission_id,
                **randomizer.synthesize_ai_role_wave1(
                    "finance_launch", "medium", mission_id, archetype=arch
                ),
            }
            for r in ai_roles:
                w1_ai = randomizer.synthesize_ai_role_wave1(
                    r, "medium", mission_id, archetype=arch
                )
                if r == "spacecraft_mass":
                    assert w1_ai["has_thermal_protection"] is True
                state.update(w1_ai)

            w1_metrics = physics_engine.compute_live_metrics(state, mission_id)
            state.update(w1_metrics)

            for r in randomizer.ALL_ROLES:
                w2_ai = randomizer.synthesize_ai_role_wave2(
                    r, "hard", state, mission_id, archetype=arch
                )
                state.update(w2_ai)

            outcome = decision_tree.evaluate_mission_deployment(mission_id, state)
            assert outcome["outcome"] in ("FULL_SUCCESS", "PARTIAL_SUCCESS")



def test_spectral_adapters_smoke() -> None:
    reto = adaptadores_web.generar_reto_oleada1("mars_sample_return", "hard")
    assert len(reto["points"]) <= 500
    f1 = adaptadores_web.evaluar_marcas(reto["expected_peaks"], reto["expected_peaks"])
    assert f1 == 1.0


def test_sch05_story_tree_24_conditional_nodes_and_logbook_rescue() -> None:
    missions = ("artemis_moon", "asteroid_hunter", "mars_sample_return")
    seen_question_ids: set[str] = set()

    for m_id in missions:
        nominal_state = {
            "mission_id": m_id,
            "selected_launcher": "falcon9_block5",
            "launcher_max_mass_kg": 4020.0,
            "dry_mass_kg": 400.0,
            "instruments_mass_kg": 68.0,
            "propellant_mass_kg": 900.0,
            "required_dv_ms": 1803.6,
            "isp_seconds": 315.0,
            "cg_balanced": True,
            "fuel_burn_multiplier": 1.0,
            "has_thermal_protection": True,
            "has_visual_autonomy": True,
            "power_source": "rtg_nuclear" if m_id == "mars_sample_return" else "fuel_cell",
            "ufe_reserve_pct": 28.0,
            "battery_reserve_pct": 30.0,
            "link_margin_db": 4.2,
            "downlink_efficiency": 1.0,
            "dtmf_code_ok": True,
        }
        critical_state = {
            **nominal_state,
            "dry_mass_kg": 3000.0,  # >95% of 4020 kg
            "cg_balanced": False,
            "fuel_burn_multiplier": 1.5,
            "has_visual_autonomy": False,
            "ufe_reserve_pct": 12.0,
            "battery_reserve_pct": 10.0,
            "link_margin_db": 1.9,
            "downlink_efficiency": 0.70,
        }

        for rnd in (1, 2, 3, 4):
            q_nom = decision_tree.select_flight_round_question(rnd, m_id, nominal_state)
            q_crit = decision_tree.select_flight_round_question(rnd, m_id, critical_state)
            assert q_nom["branch"] == "nominal"
            assert q_crit["branch"] == "critical"
            assert q_nom["question_id"] != q_crit["question_id"]
            assert len(q_nom["options"]) >= 3
            assert len(q_crit["options"]) >= 3
            seen_question_ids.add(q_nom["question_id"])
            seen_question_ids.add(q_crit["question_id"])

    # Exactly 24 distinct conditional logbook nodes (4 stages x 3 missions x 2 branches)
    assert len(seen_question_ids) == 24

    # Verify that a borderline spacecraft with unbalanced CG is rescued by the logbook choice
    borderline_state = {
        "mission_id": "artemis_moon",
        "dry_mass_kg": 400.0,
        "instruments_mass_kg": 68.0,
        "propellant_mass_kg": 550.0,
        "required_dv_ms": 1803.6,
        "isp_seconds": 315.0,
        "cg_balanced": False,
        "fuel_burn_multiplier": 1.5,
        "battery_reserve_pct": 28.0,
        "ufe_reserve_pct": 25.0,
        "link_margin_db": 4.2,
        "downlink_efficiency": 1.0,
    }
    before_rescue = decision_tree.evaluate_mission_deployment("artemis_moon", borderline_state)
    assert before_rescue["outcome"] == "FAILED"
    assert before_rescue["failed_or_degraded_gate"] == "NODE_2_PROPULSION"

    q2 = decision_tree.select_flight_round_question(2, "artemis_moon", borderline_state)
    assert q2["question_id"] == "Q2_ARTEMIS_CRIT"
    rescued_state = decision_tree.apply_flight_option(
        borderline_state, q2["question_id"], "reaction_wheel_retrim"
    )
    after_rescue = decision_tree.evaluate_mission_deployment("artemis_moon", rescued_state)
    assert after_rescue["outcome"] == "FULL_SUCCESS"

    # Verify hard physical law violation (missing heat shield on reentry) still fails honestly
    no_shield_state = {**rescued_state, "has_thermal_protection": False}
    no_shield_outcome = decision_tree.evaluate_mission_deployment("artemis_moon", no_shield_state)
    assert no_shield_outcome["outcome"] == "FAILED"
    assert no_shield_outcome["failed_or_degraded_gate"] == "NODE_3_EVENT"

