"""
JSON serializer & challenge dispatcher from spectral core to React PlayerPad (<=500 pts).
Owner: Abraham (Task ABR-02)
See docs/19-roadmap-abraham.md before editing.
"""
from __future__ import annotations

from typing import Any


def generar_reto_oleada1(mission_id: str, difficulty: str = "medium") -> dict[str, Any]:
    """Return lightweight (<=500 pts) spectral challenge payload for Rol 4A."""
    archetype = {
        "artemis_moon": "cazadores_estrellas",
        "asteroid_hunter": "detectives_luz",
        "mars_sample_return": "bioespectro",
    }.get(mission_id, "cazadores_estrellas")

    expected_peaks = {
        "cazadores_estrellas": [486.1, 589.0, 656.3],
        "detectives_luz": [1050.0, 1700.0, 3350.0],
        "bioespectro": [1625.0, 1654.0, 1685.0],
    }[archetype]

    # Starter synthetic curve; Abraham replaces this with real backend/logica + nucleo generator in ABR-02
    x_start = 400.0 if archetype == "cazadores_estrellas" else 1000.0
    step = 2.0 if archetype == "cazadores_estrellas" else 10.0
    points = []
    for i in range(200):
        x = x_start + i * step
        y = 0.1
        for peak in expected_peaks:
            diff = (x - peak) / 18.0
            y += 0.8 * pow(2.71828, -(diff * diff))
        points.append({"x": round(x, 2), "y": round(y, 4)})

    return {
        "archetype": archetype,
        "mission_id": mission_id,
        "difficulty": difficulty,
        "x_unit": "nm" if archetype == "cazadores_estrellas" else "cm-1",
        "y_label": "Intensity" if archetype == "cazadores_estrellas" else "Absorbance",
        "points": points,
        "expected_peaks": expected_peaks,
    }


def generar_reto_hacker(mission_id: str, difficulty: str = "medium") -> dict[str, Any]:
    """Return Wave 2 DTMF anomaly spectrum challenge for Rol 4B."""
    return {
        "archetype": "espectro_hacker",
        "mission_id": mission_id,
        "difficulty": difficulty,
        "dtmf_pair_hz": [770.0, 1336.0],
        "expected_key": "5",
    }


def evaluar_marcas(
    marcas_usuario: list[float],
    verdad: list[float] | None = None,
    tolerancia: float = 15.0,
) -> float:
    """Return normalized F1 calibration score in [0.0, 1.0]."""
    truth = verdad or [486.1, 589.0, 656.3]
    if not marcas_usuario or not truth:
        return 0.4
    hits = sum(1 for t in truth if any(abs(m - t) <= tolerancia for m in marcas_usuario))
    precision = hits / max(1, len(marcas_usuario))
    recall = hits / max(1, len(truth))
    if precision + recall == 0:
        return 0.4
    f1 = (2.0 * precision * recall) / (precision + recall)
    return round(min(1.0, max(0.0, f1)), 3)
