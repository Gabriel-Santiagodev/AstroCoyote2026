"""Baseline estimation and subtraction helpers for spectral analysis."""

from .modeloLineaBase import (
    LineaBase,
    algoritmoLiga,
    correccion_lineal,
    correccion_splines,
    modelo_escalar,
    modelo_rubberband,
)

__all__ = [
    "LineaBase",
    "algoritmoLiga",
    "correccion_lineal",
    "correccion_splines",
    "modelo_escalar",
    "modelo_rubberband",
]
