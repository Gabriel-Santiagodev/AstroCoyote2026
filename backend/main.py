"""
FastAPI + Socket.IO ASGI Entrypoint.
Owner: Rubén (Task RUB-01)
See docs/17-roadmap-ruben.md and docs/08-controles.md before editing.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

if __package__:
    from .game_manager import GameManager
    from .models.subsystems import get_catalog
else:
    from game_manager import GameManager
    from models.subsystems import get_catalog

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


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/catalog")
async def get_nasa_catalog() -> dict:
    return get_catalog()


@sio.event
async def crear_sala(sid: str, data: dict) -> None:
    await manager.handle_create_room(sid, data or {})


@sio.event
async def unirse_sala(sid: str, data: dict) -> None:
    await manager.handle_join_room(sid, data or {})


@sio.event
async def seleccionar_rol_mision(sid: str, data: dict) -> None:
    await manager.handle_select_role_mission(sid, data or {})


@sio.event
async def iniciar_partida(sid: str, data: dict) -> None:
    await manager.handle_start_game(sid, data or {})


@sio.event
async def accion_parcial_minijuego(sid: str, data: dict) -> None:
    await manager.handle_partial_action(sid, data or {})


@sio.event
async def bloquear_toma_minijuego(sid: str, data: dict) -> None:
    await manager.handle_lock_take(sid, data or {})


@sio.event
async def respuesta_turno_vuelo(sid: str, data: dict) -> None:
    await manager.handle_flight_answer(sid, data or {})


@sio.event
async def reiniciar_partida(sid: str, data: dict) -> None:
    await manager.handle_restart_room(sid, data or {})


socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
