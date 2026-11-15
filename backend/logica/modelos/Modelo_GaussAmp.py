"""Amplitude-parameterized Gaussian spectral peak model (GaussAmp)."""
from __future__ import annotations

import numpy as np


def gauss_amp(x: np.ndarray, A: float, centro: float, sigma: float) -> np.ndarray:
    """Single Gaussian band where A is peak height."""
    s = max(abs(float(sigma)), 1e-6)
    return A * np.exp(-((x - centro) ** 2) / (2.0 * s * s))


def modelo_gauss_amp(x: np.ndarray, *p: float) -> np.ndarray:
    """Sum of N GaussAmp bands with parameters (A, center, sigma) per band."""
    y = np.zeros_like(x, dtype=float)
    for i in range(0, len(p), 3):
        A, c, s = p[i : i + 3]
        y += gauss_amp(x, abs(A), c, abs(s))
    return y
