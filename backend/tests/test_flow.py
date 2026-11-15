"""Full-flow test for GameManager (RUB-02..05) with fast timers and a fake Socket.IO."""
from __future__ import annotations

import asyncio

from backend.game_manager import ALL_ROLES, GameManager
from backend.tests.test_rooms import FakeSio


def make_manager(sio: FakeSio) -> GameManager:
    return GameManager(
        sio,  # type: ignore[arg-type]
        wave_duration_sec=0.2,
        sync_delay_sec=0.05,
        flight_round_sec=0.1,
        flight_feedback_sec=0.0,
        station_grace_sec=0.0,
        launch_transition_sec=0.0,
    )


def test_singleplayer_full_flow_via_timeouts() -> None:
    async def scenario() -> None:
        sio = FakeSio()
        gm = make_manager(sio)
        await gm.handle_create_room("s1", {"mode": "single", "host_name": "Ruben"})
        pin = sio.last("sala_creada")["pin"]
        await gm.handle_start_game("s1", {"pin": pin})

        w1 = sio.last("iniciar_oleada_1")
        assert w1["duration_sec"] == 0
        assert len(w1["ai_wave1_state"]) == 3  # 3 empty roles filled by AI

        await asyncio.sleep(1.5)  # wave1 -> wave2 -> flight (4 rounds) -> report
        assert sio.count("iniciar_oleada_2") == 1
        assert sio.count("iniciar_vuelo_60s") == 1
        assert sio.count("pregunta_vuelo_60s") == 4
        assert sio.count("resultado_turno_vuelo") == 4
        assert sio.count("reporte_final_mision") == 1

    asyncio.run(scenario())


def test_multiplayer_lock_takes_advance_waves_and_live_mutation() -> None:
    async def scenario() -> None:
        sio = FakeSio()
        gm = GameManager(
            sio,  # type: ignore[arg-type]
            wave_duration_sec=30,
            sync_delay_sec=0,
            flight_round_sec=30,
            flight_feedback_sec=0.0,
            station_grace_sec=0.0,
            launch_transition_sec=0.0,
        )
        await gm.handle_create_room("s1", {"mode": "multi", "host_name": "A"})
        pin = sio.last("sala_creada")["pin"]
        await gm.handle_join_room("s2", {"pin": pin, "player_name": "B"})
        roles = {sid: gm.rooms[pin]["players"][sid]["role"] for sid in ("s1", "s2")}
        await gm.handle_start_game("s1", {"pin": pin})

        await gm.handle_partial_action(
            "s1", {"pin": pin, "role_id": roles["s1"], "wave": 1, "partial_delta": {"trajectory_choice": "geo"}}
        )
        assert "live_metrics" in sio.last("mutacion_en_vivo")

        for sid in ("s1", "s2"):
            await gm.handle_lock_take(sid, {"pin": pin, "role_id": roles[sid], "wave": 1, "payload": {}})
        assert sio.count("iniciar_oleada_2") == 1

        for sid in ("s1", "s2"):
            await gm.handle_lock_take(sid, {"pin": pin, "role_id": roles[sid], "wave": 2, "payload": {}})
        assert sio.count("iniciar_vuelo_60s") == 1
        assert sio.count("pregunta_vuelo_60s") == 1

        for rnd in range(1, 5):
            q = sio.last("pregunta_vuelo_60s")["question"]
            await gm.handle_flight_answer(
                "s1", {"pin": pin, "question_id": q["question_id"], "option_id": q["options"][0]["option_id"]}
            )
        assert sio.count("reporte_final_mision") == 1
        gm._cancel_timer(pin)

    asyncio.run(scenario())


def test_timed_out_flight_round_still_advances_with_feedback_pause() -> None:
    """Regression: a timed-out round must not cancel itself during the feedback pause."""

    async def scenario() -> None:
        sio = FakeSio()
        gm = GameManager(
            sio,  # type: ignore[arg-type]
            wave_duration_sec=0.05,
            sync_delay_sec=0.0,
            flight_round_sec=0.05,
            flight_feedback_sec=0.05,
            station_grace_sec=0.0,
            launch_transition_sec=0.0,
        )
        await gm.handle_create_room("s1", {"mode": "single", "host_name": "Ruben"})
        pin = sio.last("sala_creada")["pin"]
        await gm.handle_start_game("s1", {"pin": pin})
        await asyncio.sleep(1.5)
        assert sio.count("pregunta_vuelo_60s") == 4
        assert sio.count("resultado_turno_vuelo") == 4
        assert sio.count("reporte_final_mision") == 1

    asyncio.run(scenario())


def test_default_manager_is_untimed() -> None:
    """Untimed play (docs/03, 2026-11-15): stations and flight rounds announce no clock."""

    async def scenario() -> None:
        sio = FakeSio()
        gm = GameManager(sio)  # type: ignore[arg-type]
        await gm.handle_create_room("s1", {"mode": "single", "host_name": "Ruben"})
        pin = sio.last("sala_creada")["pin"]
        await gm.handle_start_game("s1", {"pin": pin})
        assert sio.last("iniciar_oleada_1")["duration_sec"] == 0
        gm._cancel_timer(pin)

    asyncio.run(scenario())
