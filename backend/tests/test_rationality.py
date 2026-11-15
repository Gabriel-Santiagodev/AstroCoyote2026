"""Rationality fixes (2026-11-15): launcher reach, power-source aliases, random survival events."""
from __future__ import annotations

from backend import decision_tree
from backend.game_manager import GameManager
from backend.tests.test_rooms import FakeSio

BASE_STATE = {
    "launch_cost_usd": 74_000_000.0,
    "fairing_ok": True,
    "dry_mass_kg": 420.0,
    "instruments_mass_kg": 30.0,
    "propellant_mass_kg": 700.0,
    "required_dv_ms": 1480.0,
    "isp_seconds": 320.0,
    "cg_balanced": True,
    "fuel_burn_multiplier": 1.0,
    "has_thermal_protection": True,
    "ufe_reserve_pct": 30.0,
    "battery_reserve_pct": 40.0,
    "link_margin_db": 5.0,
    "downlink_efficiency": 1.0,
    "dtmf_code_ok": True,
    "subsystems_cost_usd": 400_000_000.0,
}


def _normalized(launcher: str) -> dict:
    gm = GameManager(FakeSio())  # type: ignore[arg-type]
    state = {**BASE_STATE, "selected_launcher": launcher}
    gm._normalize_state_aliases(state, "artemis_moon")
    return state


def test_leo_only_launcher_cannot_reach_the_moon() -> None:
    state = _normalized("rideshare_xl")
    assert state["launcher_max_mass_kg"] == 0.0
    assert decision_tree.evaluate_preliminary_gates("artemis_moon", state)["NODE_1_LAUNCH"] == "CRITICAL"


def test_escape_capable_launcher_passes_liftoff() -> None:
    state = _normalized("falcon9_block5")
    assert state["launcher_max_mass_kg"] > 0
    assert decision_tree.evaluate_preliminary_gates("artemis_moon", state)["NODE_1_LAUNCH"] == "PASS"


def test_solar_arrays_power_source_does_not_crash_the_flight() -> None:
    state = {**BASE_STATE, "selected_launcher": "falcon9_block5", "power_source": "solar_arrays"}
    question = decision_tree.select_flight_round_question(1, "artemis_moon", state)
    assert question["question_id"]


def test_random_event_is_deterministic_per_pin() -> None:
    a = decision_tree.pick_random_event("mars_sample_return", "ABC123")
    b = decision_tree.pick_random_event("mars_sample_return", "ABC123")
    assert a is not None and a == b


def test_random_event_hits_or_is_mitigated_by_design() -> None:
    event = {
        "event_id": "EVT_TEST",
        "effects": {"battery_reserve_pct": -15.0},
        "mitigated_if": {"power_source": "rtg_nuclear"},
        "mitigation_text": "RTG",
    }
    hit, summary = decision_tree.apply_random_event({"battery_reserve_pct": 40.0, "power_source": "fuel_cell"}, event)
    assert hit["battery_reserve_pct"] == 25.0 and summary and not summary["mitigated"]
    safe, summary2 = decision_tree.apply_random_event({"battery_reserve_pct": 40.0, "power_source": "rtg_nuclear"}, event)
    assert safe["battery_reserve_pct"] == 40.0 and summary2 and summary2["mitigated"]


def test_random_event_uses_schema_defaults_for_missing_keys() -> None:
    """A role that locked an empty take must not turn a storm into a battery drop from 0."""
    event = {"event_id": "EVT_TEST", "effects": {"battery_reserve_pct": -10.0}, "mitigated_if": {"power_source": "rtg_nuclear"}}
    hit, summary = decision_tree.apply_random_event({}, event, "artemis_moon")
    assert summary and not summary["mitigated"]
    assert hit["battery_reserve_pct"] > 0.0


def test_event_link_penalty_survives_absolute_flight_options() -> None:
    event = {"event_id": "EVT_TEST", "effects": {"link_margin_db": -3.0}, "mitigated_if": {"dtmf_code_ok": True}}
    state, summary = decision_tree.apply_random_event({"link_margin_db": 5.0, "dtmf_code_ok": False}, event, "mars_sample_return")
    assert summary and state["link_margin_db"] == 2.0 and state["event_link_penalty_db"] == -3.0


def test_launcher_name_resolves_like_its_id() -> None:
    gm = GameManager(FakeSio())  # type: ignore[arg-type]
    state = {**BASE_STATE, "selected_launcher": "SpaceX Falcon 9 Block 5"}
    gm._normalize_state_aliases(state, "artemis_moon")
    assert state["launcher_max_mass_kg"] > 0



def test_hard_missions_face_more_and_harsher_hazards() -> None:
    assert decision_tree.difficulty_tuning("easy") == {"count": 1.0, "scale": 1.0}
    hard = decision_tree.difficulty_tuning("hard")
    events = decision_tree.pick_random_events("mars_sample_return", "PIN1", "hard")
    assert hard["count"] == 2 and len(events) == 2
    assert events[0]["event_id"] != events[1]["event_id"]
    event = {"event_id": "EVT_TEST", "effects": {"battery_reserve_pct": -10.0}, "mitigated_if": {"power_source": "rtg_nuclear"}}
    hit, _ = decision_tree.apply_random_event({"battery_reserve_pct": 40.0, "power_source": "fuel_cell"}, event, "mars_sample_return", hard["scale"])
    assert hit["battery_reserve_pct"] == 25.0


def test_data_and_time_resources_are_derived_from_catalog() -> None:
    from backend import physics_engine

    data_day, rate, hours = physics_engine.data_downlink_budget({"data_generated_gbit": 86.4, "downlink_rate_mbps": 1.0})
    assert (data_day, rate, hours) == (86.4, 1.0, 24.0)  # 1 Mbps = 3.6 Gbit/h -> 86.4 Gbit needs 24 h
    assert physics_engine.data_downlink_budget({"data_generated_gbit": 50.0})[2] == 0.0  # rate unknown
    days = physics_engine.mission_duration_days({"trajectory_choice": "orbital_insertion__sso_700"}, "asteroid_hunter")
    assert days > 0


def test_data_bottleneck_degrades_call_earth_gate() -> None:
    state = {**BASE_STATE, "selected_launcher": "falcon9_block5", "data_generated_gbit": 200.0, "downlink_rate_mbps": 1.0}
    assert decision_tree.data_return_ratio(200.0, 1.0) < 1.0
    assert decision_tree.evaluate_preliminary_gates("artemis_moon", state)["NODE_4_DOWNLINK"] == "DEGRADED"
    # 10 h/day of DSN data time (MRO): 6 Mbps sends 216 Gbit/day >= 200; 4 Mbps (144) does not.
    assert decision_tree.data_return_ratio(200.0, 4.0) < 1.0
    ok_state = {**state, "downlink_rate_mbps": 6.0}
    assert decision_tree.evaluate_preliminary_gates("artemis_moon", ok_state)["NODE_4_DOWNLINK"] == "PASS"


def test_ai_never_picks_an_engine_the_ship_cannot_power() -> None:
    from backend import randomizer

    for arch in ("CONSERVATIVE", "AMBITIOUS", "CHALLENGING"):
        take = randomizer.synthesize_ai_role_wave1("orbit_power", "hard", "mars_sample_return", archetype=arch)
        assert not decision_tree.engine_power_short(take["isp_seconds"], 750.0)
    assert decision_tree.engine_power_short(1600.0, 750.0)  # Hall thruster needs 1200 W


def test_slower_route_lowers_time_efficiency() -> None:
    fast, chosen_fast, fastest = decision_tree.time_efficiency("asteroid_hunter", "fast_flyby_15m__sso_700")
    slow, chosen_slow, _ = decision_tree.time_efficiency("asteroid_hunter", "orbital_insertion__sso_700")
    assert fast == 1.0 and slow < 1.0 and chosen_slow > chosen_fast == fastest


def test_collaboration_score_rewards_own_locks_answers_and_ready_gates() -> None:
    room = {
        "players": {"s1": {"role": "finance_launch"}, "s2": {"role": "science_comms"}},
        "human_fallbacks": [{"role": "science_comms", "wave": 2}],
        "decision_history": [{"timed_out": False}, {"timed_out": False}, {"timed_out": True}, {"timed_out": False}],
        "launch_gates": {"NODE_1_LAUNCH": "PASS", "NODE_2_PROPULSION": "PASS", "NODE_3_EVENT": "DEGRADED", "NODE_4_DOWNLINK": "PASS"},
    }
    collab = GameManager._collaboration_score(room)
    assert collab["humans"] == 2 and collab["own_locks_pct"] == 75 and collab["answered_pct"] == 75
    assert collab["gates_ready_at_liftoff"] == 3 and 0 < collab["score"] < 100


def test_moon_mission_uses_sourced_tli_capacity() -> None:
    gm = GameManager(FakeSio())  # type: ignore[arg-type]
    moon: dict = {"selected_launcher": "vulcan_vc6"}
    gm._normalize_state_aliases(moon, "artemis_moon")
    assert moon["launcher_max_mass_kg"] == 11500.0  # ULA: VC6 TLI 11,500 kg
    mars: dict = {"selected_launcher": "vulcan_vc6"}
    gm._normalize_state_aliases(mars, "mars_sample_return")
    assert mars["launcher_max_mass_kg"] == 0.0  # no published escape figure
    electron: dict = {"selected_launcher": "electron"}
    gm._normalize_state_aliases(electron, "artemis_moon")
    assert electron["launcher_max_mass_kg"] == 25.0  # CAPSTONE via Lunar Photon


def test_dsn_data_hours_come_from_catalog() -> None:
    from backend.models.subsystems import get_catalog

    hours = get_catalog()["constants"]["dsn_data_hours_per_day"]
    assert hours == 10
    assert abs(decision_tree.data_return_ratio(3.6 * hours, 1.0) - 1.0) < 1e-6


def test_flight_answers_cannot_break_a_launch_that_already_happened() -> None:
    launch = {**BASE_STATE, "selected_launcher": "falcon9_block5"}
    gm = GameManager(FakeSio())  # type: ignore[arg-type]
    gm._normalize_state_aliases(launch, "artemis_moon")
    cap = float(launch["launcher_max_mass_kg"])
    dry = float(launch.get("dry_mass_kg", 0)) + float(launch.get("instruments_mass_kg", 0))
    launch["propellant_mass_kg"] = max(0.0, cap - dry - 5.0)  # liftoff 5 kg under the limit
    flight = {**launch, "propellant_mass_kg": launch["propellant_mass_kg"] + 30.0}  # "+30 kg fuel"
    after = decision_tree.evaluate_mission_deployment("artemis_moon", flight, launch)
    assert after["failed_or_degraded_gate"] != "NODE_1_LAUNCH" or after["outcome"] != "FAILED"
    legacy = decision_tree.evaluate_mission_deployment("artemis_moon", flight)
    assert legacy["outcome"] == "FAILED" and legacy["failed_or_degraded_gate"] == "NODE_1_LAUNCH"
