"""Headless spectral error metrics and simulation helpers (no GUI/matplotlib)."""
from __future__ import annotations

from typing import Callable, Sequence

import numpy as np


def ErrorAbsolutoMedio(y_real: np.ndarray, y_pred: np.ndarray) -> float:
    """Mean Absolute Error (MAE) between observed and fitted spectra."""
    return float(np.mean(np.abs(np.asarray(y_real) - np.asarray(y_pred))))


def ErrorCuadraticoMedio(y_real: np.ndarray, y_pred: np.ndarray) -> float:
    """Mean Squared Error (MSE) between observed and fitted spectra."""
    diff = np.asarray(y_real) - np.asarray(y_pred)
    return float(np.mean(diff * diff))


def RaizErrorCuadraticoMedio(y_real: np.ndarray, y_pred: np.ndarray) -> float:
    """Root Mean Squared Error (RMSE) between observed and fitted spectra."""
    return float(np.sqrt(ErrorCuadraticoMedio(y_real, y_pred)))


def NormaEuclidiana(y_real: np.ndarray, y_pred: np.ndarray) -> float:
    """Euclidean (L2) norm of residual vector."""
    return float(np.linalg.norm(np.asarray(y_real) - np.asarray(y_pred)))


def coeficiente_determinacion_r2(y_real: np.ndarray, y_pred: np.ndarray) -> float:
    """Coefficient of determination R^2 clamped to [-1.0, 1.0]."""
    yr = np.asarray(y_real, dtype=float)
    yp = np.asarray(y_pred, dtype=float)
    ss_res = float(np.sum((yr - yp) ** 2))
    ss_tot = float(np.sum((yr - np.mean(yr)) ** 2))
    if ss_tot <= 1e-12:
        return 1.0 if ss_res <= 1e-12 else 0.0
    return float(max(-1.0, min(1.0, 1.0 - ss_res / ss_tot)))


def simular_espectro_bandas(
    x: np.ndarray,
    funcion_banda: Callable[..., np.ndarray],
    band_params: Sequence[Sequence[float]],
    noise_std: float = 0.0,
    baseline: np.ndarray | None = None,
    rng: np.random.Generator | None = None,
) -> dict[str, object]:
    """Generate a composite spectrum and its individual ground-truth sub-bands."""
    x_arr = np.asarray(x, dtype=float)
    y_clean = np.zeros_like(x_arr, dtype=float)
    bands: list[np.ndarray] = []
    for params in band_params:
        band_y = np.asarray(funcion_banda(x_arr, *params), dtype=float)
        bands.append(band_y)
        y_clean += band_y

    y_total = y_clean.copy()
    if baseline is not None:
        y_total += np.asarray(baseline, dtype=float)
    if noise_std > 0.0:
        gen = rng if rng is not None else np.random.default_rng()
        y_total += gen.normal(0.0, noise_std, size=len(x_arr))

    return {
        "x": x_arr,
        "y_total": y_total,
        "y_clean": y_clean,
        "bands": bands,
    }
