"""
Web adapters bridging the Python spectral engine (Vector / AnalizadorFTIR / Plantilla)
with FastAPI / Socket.IO rooms and React spectral minigames.

Owner: Abraham (Task ABR-02).
Preserves exact signatures required by ``backend/game_manager.py`` and
``backend/tests/test_engine.py`` while exposing all 8 spectral game generators,
interactive Vector pipeline actions, and real-CSV spectrum loading.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np

from ..logica.Analizador import AnalizadorFTIR
from ..logica.proyecto import Plantilla, cargar_espectro_csv
from ..logica.vector import VALID_UNITS, VALID_VARIABLES, Vector
from .nucleo.biblioteca import MISSION_ARCHETYPE_PRESETS
from .nucleo.generador import (
    DEFAULT_REAL_DATA_DIR,
    GAME_GENERATORS,
    generar_bioespectro,
    generar_desde_csv_real,
    generar_detectives_luz,
    generar_espectro_hacker,
)
from .nucleo.puntaje import emparejar, evaluar_con_penalizacion


def _normalize_mission_game(mission_id: str, game_id: str | None = None) -> str:
    if game_id and game_id in GAME_GENERATORS:
        return game_id
    preset = MISSION_ARCHETYPE_PRESETS.get(mission_id)
    if preset:
        return str(preset["primary_game"])
    return "bioespectro"


def generar_reto_juego(
    game_id: str,
    mission_id: str = "mars_sample_return",
    difficulty: str = "medium",
    seed: int | None = None,
    real_csv_path: str | Path | None = None,
) -> dict[str, Any]:
    """
    Generate a challenge for any of the 8 spectral game archetypes, or load
    from a real experimental CSV spectrum when ``real_csv_path`` is supplied.
    """
    if real_csv_path is not None and Path(real_csv_path).exists():
        return generar_desde_csv_real(
            csv_path=real_csv_path,
            game_id=game_id if game_id in GAME_GENERATORS else "bioespectro",
            mission_id=mission_id,
            difficulty=difficulty,
        )

    generator_fn = GAME_GENERATORS.get(game_id)
    if generator_fn is None:
        raise ValueError(
            f"Unknown spectral game '{game_id}'. Expected one of {sorted(GAME_GENERATORS.keys())}."
        )
    return generator_fn(mission_id=mission_id, difficulty=difficulty, seed=seed)


def generar_reto_oleada1(
    mission_id: str,
    difficulty: str = "medium",
    game_id: str | None = None,
    seed: int | None = None,
) -> dict[str, Any]:
    """
    Generate the synchronized Wave-1 spectral payload sent to all players in the mission.

    Automatically matches the NASA mission archetype (e.g. LRO Moon -> Wien thermal /
    Artemis; OSIRIS-REx / Mars -> BioSpectrum FTIR) and caps points at <= 500.
    If ``datos_reales/<mission_id>.csv`` exists, loads the real CSV spectrum automatically.
    """
    resolved_game = _normalize_mission_game(mission_id, game_id=game_id)
    candidate_real = DEFAULT_REAL_DATA_DIR / f"{mission_id}.csv"
    if candidate_real.exists():
        return generar_desde_csv_real(
            csv_path=candidate_real,
            game_id=resolved_game,
            mission_id=mission_id,
            difficulty=difficulty,
        )
    return generar_reto_juego(
        game_id=resolved_game,
        mission_id=mission_id,
        difficulty=difficulty,
        seed=seed,
    )


def generar_reto_hacker(
    mission_id: str,
    difficulty: str = "medium",
    seed: int | None = None,
) -> dict[str, Any]:
    """Generate Wave-2 Comms / Spectrum Hacker DTMF + glitch challenge."""
    return generar_espectro_hacker(
        mission_id=mission_id,
        difficulty=difficulty,
        seed=seed,
    )


def ejecutar_accion_espectral(
    points: list[dict[str, float]],
    x_unit: str,
    y_label: str,
    action: str,
    params: dict[str, Any] | None = None,
    completed_steps: list[str] | None = None,
    current_penalty: float = 0.0,
) -> dict[str, Any]:
    """
    Execute an interactive spectral action (baseline, crop, deconvolve, tracker,
    or variable switch) on a Vector and enforce Plantilla order rules (-3 pts penalty).
    """
    opts = params or {}
    if not points:
        raise ValueError("Cannot transform an empty spectrum.")

    x_arr = np.asarray([float(p["x"]) for p in points], dtype=float)
    y_arr = np.asarray([float(p["y"]) for p in points], dtype=float)
    unit = x_unit if x_unit in VALID_UNITS else "cm-1"
    var = y_label if y_label in VALID_VARIABLES else "Absorbancia"

    vec = Vector(x=x_arr, y=y_arr, variable=var, unidadX=unit, sort_x=True)
    plantilla = Plantilla(
        pasos_completados=list(completed_steps or []),
        penalizacion_pts=float(current_penalty),
    )

    act = action.lower().strip()
    allowed = True
    message = "Action applied."
    deconv_data: dict[str, Any] | None = None
    tracker_data: dict[str, Any] | None = None
    out_vec = vec

    if act in ("baseline", "linea_base"):
        model = str(opts.get("modelo", "rubberband"))
        allowed, message = plantilla.registrar("baseline", model, force=True)
        out_vec = AnalizadorFTIR.ajustarLineaBase(vec, modelo=model, clip_zero=bool(opts.get("clip_zero", True)))
    elif act in ("crop", "region", "recortar"):
        lo = float(opts.get("lim_inf", float(np.min(vec.x))))
        hi = float(opts.get("lim_sup", float(np.max(vec.x))))
        allowed, message = plantilla.registrar("region", (lo, hi), force=True)
        out_vec = AnalizadorFTIR.Recortar(vec, lo, hi)
    elif act in ("deconvolve", "deconvolucion", "modelo"):
        model = str(opts.get("modelo", "psd_voigt1"))
        allowed, message = plantilla.registrar("modelo", model, force=True)
        res = AnalizadorFTIR.Deconvolucion(vec, modelo_nombre=model)
        deconv_data = res.to_visualization_dict(max_points=350)
        message = f"{message} {res.educational_summary}" if allowed else message
    elif act == "tracker":
        tracker_data = AnalizadorFTIR.Tracker(vec)
        message = str(tracker_data["explanation"])
    elif act == "switch_variable":
        target_var = str(opts.get("variable", "Absorbancia"))
        out_vec = vec.mutar(nueva_variable=target_var)
        message = f"Converted spectral axis to {target_var}."
    elif act == "denoise":
        out_vec = AnalizadorFTIR.Suavizar(vec, window_length=int(opts.get("window", 9)))
        message = "Applied Savitzky-Golay noise smoothing while preserving macro bands."
    else:
        raise ValueError(f"Unsupported interactive spectral action '{action}'.")

    return {
        "action": act,
        "workflow_valid": allowed,
        "feedback_message": message,
        "completed_steps": plantilla.pasos_completados,
        "penalty_pts": plantilla.penalizacion_pts,
        "spectrum": out_vec.to_visualization_dict(max_points=500),
        "deconvolution": deconv_data,
        "tracker": tracker_data,
    }


def evaluar_marcas(
    marcas_usuario: list[float],
    verdad: list[float] | None = None,
    tolerancia: float = 15.0,
) -> float:
    """Return F1 accuracy score in [0.0, 1.0] for user-submitted peak positions."""
    if not verdad:
        return 0.0 if not marcas_usuario else 0.75
    metrics = emparejar(marcas_usuario, verdad, tolerancia=tolerancia)
    return float(metrics["f1"])


def evaluar_respuesta_espectral(
    marcas_usuario: list[float],
    verdad: list[float],
    tolerancia: float = 15.0,
    workflow_penalty_pts: float = 0.0,
) -> dict[str, Any]:
    """Return rich F1, precision, recall, workflow penalty, and educational verdict."""
    graded = evaluar_con_penalizacion(
        marcas_usuario,
        verdad,
        tolerancia=tolerancia,
        workflow_penalty_pts=workflow_penalty_pts,
    )
    score = float(graded["final_score_100"])
    if score >= 85.0:
        verdict = "Excellent spectral lock! Signal bands matched verified NASA reference targets."
    elif score >= 60.0:
        verdict = "Partial lock: key lines identified, refine peak centers or apply Baseline before Crop."
    else:
        verdict = "Low spectral confidence: remove drift/noise first and re-target the tallest diagnostic crests."
    return {**graded, "verdict": verdict}


__all__ = [
    "cargar_espectro_csv",
    "ejecutar_accion_espectral",
    "evaluar_marcas",
    "evaluar_respuesta_espectral",
    "generar_bioespectro",
    "generar_detectives_luz",
    "generar_desde_csv_real",
    "generar_reto_hacker",
    "generar_reto_juego",
    "generar_reto_oleada1",
]
