"""Exact Voigt profile (Gaussian + Lorentzian convolution) for spectroscopy."""
from __future__ import annotations

import numpy as np
from scipy.special import voigt_profile


def voigt_func(
    x: np.ndarray, A: float, centro: float, sigma: float, gamma: float
) -> np.ndarray:
    """Single exact Voigt band parameterized by area A, center, sigma, gamma."""
    s = max(abs(float(sigma)), 1e-6)
    g = max(abs(float(gamma)), 1e-6)
    return A * voigt_profile(x - centro, s, g)


def modelo_voigt(x: np.ndarray, *p: float) -> np.ndarray:
    """Sum of N Voigt bands with parameters (A, center, sigma, gamma) per band."""
    y = np.zeros_like(x, dtype=float)
    for i in range(0, len(p), 4):
        A, c, s, g = p[i : i + 4]
        y += voigt_func(x, abs(A), c, abs(s), abs(g))
    return y
