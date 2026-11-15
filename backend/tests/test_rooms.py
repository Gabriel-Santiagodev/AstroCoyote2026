"""Room-flow tests for GameManager (RUB-02). Uses a fake Socket.IO server, no network."""
from __future__ import annotations

import asyncio
from typing import Any

from backend.game_manager import ALL_ROLES, GameManager


class FakeSio:
    def __init__(self) -> None:
        self.emitted: list[tuple[str, dict[str, Any], dict[str, Any]]] = []
        self.rooms: dict[str, set[str]] = {}

    async def emit(self, event: str, data: Any = None, **kwargs: Any) -> None:
        self.emitted.append((event, data, kwargs))

    async def enter_room(self, sid: str, room: str) -> None:
        self.rooms.setdefault(room, set()).add(sid)

    def last(self, event: str) -> dict[str, Any]:
        return [d for e, d, _ in self.emitted if e == event][-1]

    def count(self, event: str) -> int:
        return sum(1 for e, _, _ in self.emitted if e == event)


def run(coro: Any) -> Any:
    return asyncio.run(coro)


def test_create_room_returns_6_char_pin() -> None:
    async def scenario() -> None:
        sio = FakeSio()
        gm = GameManager(sio)  # type: ignore[arg-type]
        await gm.handle_create_room("s1", {"mode": "multi", "host_name": "Ruben"})
        created = sio.last("sala_creada")
        assert len(created["pin"]) == 6
        assert created["player_id"] == "s1"
        state = sio.last("estado_sala_actualizado")
        assert state["players"][0]["name"] == "Ruben"
        assert gm.rooms[created["pin"]]["mode"] == "multi"

    run(scenario())


def test_join_room_max_4_humans_and_unknown_pin() -> None:
    async def scenario() -> None:
        sio = FakeSio()
        gm = GameManager(sio)  # type: ignore[arg-type]
        await gm.handle_create_room("s1", {"mode": "multi", "host_name": "A"})
        pin = sio.last("sala_creada")["pin"]
        for i in range(2, 5):
            await gm.handle_join_room(f"s{i}", {"pin": pin, "player_name": f"P{i}"})
        assert len(sio.last("estado_sala_actualizado")["players"]) == 4
        roles = [p["role"] for p in sio.last("estado_sala_actualizado")["players"]]
        assert sorted(roles) == sorted(ALL_ROLES)

        await gm.handle_join_room("s5", {"pin": pin, "player_name": "P5"})
        assert sio.count("error_sala") == 1
        await gm.handle_join_room("s6", {"pin": "ZZZZZZ", "player_name": "X"})
        assert sio.count("error_sala") == 2

    run(scenario())


def test_select_role_blocks_duplicates_and_updates_mission() -> None:
    async def scenario() -> None:
        sio = FakeSio()
        gm = GameManager(sio)  # type: ignore[arg-type]
        await gm.handle_create_room("s1", {"mode": "multi", "host_name": "A"})
        pin = sio.last("sala_creada")["pin"]
        await gm.handle_join_room("s2", {"pin": pin, "player_name": "B"})

        # s2 tries to take s1's role -> rejected, keeps its own
        s1_role = gm.rooms[pin]["players"]["s1"]["role"]
        s2_role = gm.rooms[pin]["players"]["s2"]["role"]
        await gm.handle_select_role_mission("s2", {"pin": pin, "role_id": s1_role})
        assert gm.rooms[pin]["players"]["s2"]["role"] == s2_role

        # s2 takes a free role + mission + difficulty
        free = next(r for r in ALL_ROLES if r not in (s1_role, s2_role))
        await gm.handle_select_role_mission(
            "s2",
            {
                "pin": pin,
                "player_id": "s2",
                "role_id": free,
                "mission_id": "mars_sample_return",
                "difficulty": "hard",
            },
        )
        state = sio.last("estado_sala_actualizado")
        assert gm.rooms[pin]["players"]["s2"]["role"] == free
        assert state["mission_id"] == "mars_sample_return"
        assert state["difficulty"] == "hard"
        assert free in state["taken_roles"]

        # invalid mission is ignored
        await gm.handle_select_role_mission("s1", {"pin": pin, "mission_id": "nope"})
        assert gm.rooms[pin]["mission_id"] == "mars_sample_return"

    run(scenario())


def test_two_humans_get_unique_roles_and_ai_fills_the_rest() -> None:
    """1-4 players: role-less humans get a free seat at start; only empty seats go to the AI."""

    async def scenario() -> None:
        sio = FakeSio()
        gm = GameManager(sio, wave_duration_sec=0)  # type: ignore[arg-type]
        await gm.handle_create_room("s1", {"mode": "multi", "host_name": "A"})
        pin = sio.last("sala_creada")["pin"]
        await gm.handle_join_room("s2", {"pin": pin, "player_name": "B"})
        gm.rooms[pin]["players"]["s2"]["role"] = None  # guest never claimed a seat

        await gm.handle_start_game("s1", {"pin": pin})

        roles = [p["role"] for p in gm.rooms[pin]["players"].values()]
        assert all(roles) and len(set(roles)) == 2
        ai_roles = set(sio.last("iniciar_oleada_1")["ai_wave1_state"].keys())
        assert ai_roles == set(ALL_ROLES) - set(roles)

    run(scenario())
