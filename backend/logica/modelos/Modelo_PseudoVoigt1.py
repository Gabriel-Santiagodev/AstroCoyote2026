"""Pseudo-Voigt Type 1 spectral band model (weighted Gaussian/Lorentzian sum)."""
from __future__ import annotations

import numpy as np


def psd_voigt1(
    x: np.ndarray, A: float, centro: float, sigma: float, eta: float
) -> np.ndarray:
    """Single Pseudo-Voigt Type 1 band with shared width sigma and mixing eta."""
    s = max(abs(float(sigma)), 1e-6)
    mix = float(np.clip(eta, 0.0, 1.0))
    g = np.exp(-((x - centro) ** 2) / (2.0 * s * s))
    l = 1.0 / (1.0 + ((x - centro) / s) ** 2)
    return A * (mix * l + (1.0 - mix) * g)


def modelo_psd_voigt1(x: np.ndarray, *p: float) -> np.ndarray:
    """Sum of N Pseudo-Voigt 1 bands with parameters (A, center, sigma, eta)."""
    y = np.zeros_like(x, dtype=float)
    for i in range(0, len(p), 4):
        A, c, s, e = p[i : i + 4]
        y += psd_voigt1(x, abs(A), c, abs(s), e)
    return y
