"""Analytical spectral peak models for simulation and deconvolution."""

from .model import MODEL_GUIDE_EN, Models, resolve_model
from .Modelo_GaussAmp import gauss_amp, modelo_gauss_amp
from .Modelo_Gaussiano import gaussiana, modelo_gaussiano
from .Modelo_Lorentz import lorentziana, modelo_lorentziano
from .Modelo_PseudoVoigt1 import modelo_psd_voigt1, psd_voigt1
from .Modelo_PseudoVoigt2 import modelo_psd_voigt2, psd_voigt2
from .Modelo_Voigt import modelo_voigt, voigt_func
from .simulacion import (
    ErrorAbsolutoMedio,
    ErrorCuadraticoMedio,
    NormaEuclidiana,
    RaizErrorCuadraticoMedio,
    coeficiente_determinacion_r2,
    simular_espectro_bandas,
)

__all__ = [
    "MODEL_GUIDE_EN",
    "Models",
    "resolve_model",
    "gauss_amp",
    "modelo_gauss_amp",
    "gaussiana",
    "modelo_gaussiano",
    "lorentziana",
    "modelo_lorentziano",
    "voigt_func",
    "modelo_voigt",
    "psd_voigt1",
    "modelo_psd_voigt1",
    "psd_voigt2",
    "modelo_psd_voigt2",
    "ErrorAbsolutoMedio",
    "ErrorCuadraticoMedio",
    "RaizErrorCuadraticoMedio",
    "NormaEuclidiana",
    "coeficiente_determinacion_r2",
    "simular_espectro_bandas",
]
