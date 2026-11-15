"""Pseudo-Voigt Type 2 spectral band model (independent Gaussian/Lorentzian FWHM)."""
from __future__ import annotations

import numpy as np


def psd_voigt2(
    x: np.ndarray, A: float, centro: float, w_g: float, w_l: float, fraction: float
) -> np.ndarray:
    """Single Pseudo-Voigt Type 2 band with independent FWHM widths."""
    wg = max(abs(float(w_g)), 1e-6)
    wl = max(abs(float(w_l)), 1e-6)
    mix = float(np.clip(fraction, 0.0, 1.0))
    g = np.exp(-4.0 * np.log(2.0) * ((x - centro) ** 2) / (wg * wg))
    l = 1.0 / (1.0 + 4.0 * ((x - centro) / wl) ** 2)
    return A * (mix * l + (1.0 - mix) * g)


def modelo_psd_voigt2(x: np.ndarray, *p: float) -> np.ndarray:
    """Sum of N Pseudo-Voigt 2 bands with parameters (A, center, w_g, w_l, fraction)."""
    y = np.zeros_like(x, dtype=float)
    for i in range(0, len(p), 5):
        A, c, wg, wl, f = p[i : i + 5]
        y += psd_voigt2(x, abs(A), c, abs(wg), abs(wl), f)
    return y
