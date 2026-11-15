"""Spectral and communications minigame generators & web adapters (Owner: Abraham - Task ABR-02)."""

from .adaptadores_web import (
    cargar_espectro_csv,
    ejecutar_accion_espectral,
    evaluar_marcas,
    evaluar_respuesta_espectral,
    generar_bioespectro,
    generar_desde_csv_real,
    generar_detectives_luz,
    generar_reto_hacker,
    generar_reto_juego,
    generar_reto_oleada1,
)

__all__ = [
    "cargar_espectro_csv",
    "ejecutar_accion_espectral",
    "evaluar_marcas",
    "evaluar_respuesta_espectral",
    "generar_bioespectro",
    "generar_desde_csv_real",
    "generar_detectives_luz",
    "generar_reto_hacker",
    "generar_reto_juego",
    "generar_reto_oleada1",
]
