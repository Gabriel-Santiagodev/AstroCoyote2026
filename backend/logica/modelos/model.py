"""Registry mapping spectral peak model names to (single_fn, sum_fn, n_params)."""
from __future__ import annotations

from typing import Callable

from .Modelo_GaussAmp import gauss_amp, modelo_gauss_amp
from .Modelo_Gaussiano import gaussiana, modelo_gaussiano
from .Modelo_Lorentz import lorentziana, modelo_lorentziano
from .Modelo_PseudoVoigt1 import modelo_psd_voigt1, psd_voigt1
from .Modelo_PseudoVoigt2 import modelo_psd_voigt2, psd_voigt2
from .Modelo_Voigt import modelo_voigt, voigt_func

ModelEntry = tuple[Callable[..., object], Callable[..., object], int]

Models: dict[str, ModelEntry] = {
    "gauss_amp": (gauss_amp, modelo_gauss_amp, 3),
    # Preserve original key spelling while supporting standard alias below
    "guassiano": (gaussiana, modelo_gaussiano, 3),
    "gaussiano": (gaussiana, modelo_gaussiano, 3),
    "gaussian": (gaussiana, modelo_gaussiano, 3),
    "lorentz": (lorentziana, modelo_lorentziano, 3),
    "voigt": (voigt_func, modelo_voigt, 4),
    "psd_voigt1": (psd_voigt1, modelo_psd_voigt1, 4),
    "psd_voigt2": (psd_voigt2, modelo_psd_voigt2, 5),
}

MODEL_GUIDE_EN: dict[str, dict[str, str]] = {
    "gaussiano": {
        "title": "Gaussian Profile",
        "when": "Best when broadening comes from thermal Doppler motion or spectrometer slit optics.",
    },
    "gauss_amp": {
        "title": "Amplitude Gaussian Profile",
        "when": "Directly estimates true peak height alongside center and sigma width.",
    },
    "lorentz": {
        "title": "Cauchy-Lorentz Profile",
        "when": "Captures sharp peaks with heavy tails from pressure/collisional broadening.",
    },
    "voigt": {
        "title": "Voigt Profile",
        "when": "Physics gold standard combining Gaussian thermal width and Lorentzian lifetime tails.",
    },
    "psd_voigt1": {
        "title": "Pseudo-Voigt Type 1",
        "when": "Fast linear blend between Gaussian and Lorentzian shapes for rapid quantitative fits.",
    },
    "psd_voigt2": {
        "title": "Pseudo-Voigt Type 2",
        "when": "High-resolution spectroscopy with independent Gaussian and Lorentzian widths.",
    },
}


def resolve_model(nombre: str) -> ModelEntry:
    """Resolve a spectral deconvolution model name safely."""
    key = nombre.lower().strip()
    if key not in Models:
        raise KeyError(
            f"Unknown spectral model '{nombre}'. Available: {sorted(Models.keys())}"
        )
    return Models[key]
