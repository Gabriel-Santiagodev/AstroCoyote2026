"""Symmetric Gaussian spectral band model."""
from __future__ import annotations

import numpy as np


def gaussiana(x: np.ndarray, A: float, centro: float, sigma: float) -> np.ndarray:
    """Single symmetric Gaussian band."""
    s = max(abs(float(sigma)), 1e-6)
    return A * np.exp(-((x - centro) ** 2) / (2.0 * s * s))


def modelo_gaussiano(x: np.ndarray, *p: float) -> np.ndarray:
    """Sum of N Gaussian bands with parameters (A, center, sigma) per band."""
    y = np.zeros_like(x, dtype=float)
    for i in range(0, len(p), 3):
        A, c, s = p[i : i + 3]
        y += gaussiana(x, abs(A), c, abs(s))
    return y
