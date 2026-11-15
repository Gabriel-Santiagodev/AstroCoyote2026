"""Cauchy-Lorentz spectral peak model for natural/collisional broadening."""
from __future__ import annotations

import numpy as np


def lorentziana(x: np.ndarray, A: float, centro: float, gamma: float) -> np.ndarray:
    """Single Lorentzian band parameterized by integrated area A and HWHM gamma."""
    g = max(abs(float(gamma)), 1e-6)
    return (A / np.pi) * (g / ((x - centro) ** 2 + g * g))


def modelo_lorentziano(x: np.ndarray, *p: float) -> np.ndarray:
    """Sum of N Lorentzian bands with parameters (A, center, gamma) per band."""
    y = np.zeros_like(x, dtype=float)
    for i in range(0, len(p), 3):
        A, c, g = p[i : i + 3]
        y += lorentziana(x, abs(A), c, abs(g))
    return y
