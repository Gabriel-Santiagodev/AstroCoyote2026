"""
FastAPI + Socket.IO ASGI Entrypoint.
Owner: Rubén (Task RUB-01)
See docs/17-roadmap-ruben.md and docs/08-controles.md before editing.
"""
from __future__ import annotations

from typing import Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

if __package__:
    from .game_manager import GameManager
    from .models.subsystems import get_catalog, get_mission
else:
    from game_manager import GameManager
    from models.subsystems import get_catalog, get_mission

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app = FastAPI(title="Space Apps 2026 — Mission Design Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = GameManager(sio)


def _lan_ip() -> str:
    """IPv4 of the interface on the default route (no packets are sent by a UDP connect)."""
    import socket

    probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        probe.connect(("10.255.255.255", 1))
        return str(probe.getsockname()[0])
    except OSError:
        return "127.0.0.1"
    finally:
        probe.close()


@app.get("/health")
async def health_check() -> dict[str, str]:
    # lan_ip lets the host's lobby show phones a reachable join address instead of localhost.
    return {"status": "ok", "lan_ip": _lan_ip()}


@app.get("/api/catalog")
async def get_nasa_catalog() -> dict[str, Any]:
    return get_catalog()


@app.get("/api/missions/{mission_id}")
async def get_mission_by_id(mission_id: str) -> dict[str, Any]:
    return get_mission(mission_id)


@app.get("/api/rooms/{pin}")
async def get_room_snapshot(pin: str) -> dict[str, Any]:
    room = manager.rooms.get(pin.upper())
    if not room:
        return {"found": False, "pin": pin.upper()}
    return {
        "found": True,
        "pin": room["pin"],
        "phase": room.get("phase", "lobby"),
        "mission_id": room["mission_id"],
        "difficulty": room["difficulty"],
        "player_count": len(room["players"]),
    }


@sio.event
async def connect(sid: str, environ: dict[str, Any]) -> None:
    await manager.handle_connect(sid)


@sio.event
async def disconnect(sid: str) -> None:
    await manager.handle_disconnect(sid)


@sio.event
async def crear_sala(sid: str, data: dict[str, Any] | None = None) -> None:
    await manager.handle_create_room(sid, data or {})


@sio.event
async def unirse_sala(sid: str, data: dict[str, Any] | None = None) -> None:
    await manager.handle_join_room(sid, data or {})


@sio.event
async def seleccionar_rol_mision(sid: str, data: dict[str, Any] | None = None) -> None:
    await manager.handle_select_role_mission(sid, data or {})


@sio.event
async def iniciar_partida(sid: str, data: dict[str, Any] | None = None) -> None:
    await manager.handle_start_game(sid, data or {})


@sio.event
async def accion_parcial_minijuego(sid: str, data: dict[str, Any] | None = None) -> None:
    await manager.handle_partial_action(sid, data or {})


@sio.event
async def bloquear_toma_minijuego(sid: str, data: dict[str, Any] | None = None) -> None:
    await manager.handle_lock_take(sid, data or {})


@sio.event
async def respuesta_turno_vuelo(sid: str, data: dict[str, Any] | None = None) -> None:
    await manager.handle_flight_answer(sid, data or {})


@sio.event
async def reiniciar_partida(sid: str, data: dict[str, Any] | None = None) -> None:
    await manager.handle_restart_room(sid, data or {})


socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

