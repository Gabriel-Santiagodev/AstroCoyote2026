"""Inherited analytical FTIR spectroscopy core (Owner: Abraham - Task ABR-02)."""

from .Analizador import AnalizadorFTIR, DeconvolutionResult, ErrorAnalisis
from .lineaBase import LineaBase, algoritmoLiga, correccion_lineal, correccion_splines, modelo_escalar, modelo_rubberband
from .modelos import MODEL_GUIDE_EN, Models, resolve_model
from .proyecto import Muestra, PENALTY_PER_VIOLATION, Plantilla, Proyecto, cargar_espectro_csv
from .vector import (
    UNIT_ENGLISH_LABELS,
    VALID_UNITS,
    VALID_VARIABLES,
    VARIABLE_ENGLISH_LABELS,
    Vector,
    absorbancia_a_transmitancia,
    distance_to_samples,
    reflectancia_a_absorbancia,
    transmitancia_a_absorbancia,
)

__all__ = [
    "AnalizadorFTIR",
    "DeconvolutionResult",
    "ErrorAnalisis",
    "LineaBase",
    "algoritmoLiga",
    "correccion_lineal",
    "correccion_splines",
    "modelo_escalar",
    "modelo_rubberband",
    "MODEL_GUIDE_EN",
    "Models",
    "resolve_model",
    "Muestra",
    "PENALTY_PER_VIOLATION",
    "Plantilla",
    "Proyecto",
    "cargar_espectro_csv",
    "UNIT_ENGLISH_LABELS",
    "VALID_UNITS",
    "VALID_VARIABLES",
    "VARIABLE_ENGLISH_LABELS",
    "Vector",
    "absorbancia_a_transmitancia",
    "distance_to_samples",
    "reflectancia_a_absorbancia",
    "transmitancia_a_absorbancia",
]
