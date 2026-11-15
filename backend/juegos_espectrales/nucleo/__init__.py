"""Spectral minigame core engines (Owner: Abraham - Task ABR-02)."""

from .biblioteca import (
    DTMF_FREQUENCIES,
    EDUCATIONAL_GUIDES,
    FTIR_BANDS_CM1,
    MISSION_ARCHETYPE_PRESETS,
    OPTICAL_MEDIA_CAUCHY,
    STELLAR_LINES_NM,
    WIEN_DISPLACEMENT_NM_K,
)
from .generador import (
    GAME_GENERATORS,
    generar_bioespectro,
    generar_cazadores_estrellas,
    generar_desde_csv_real,
    generar_detectives_luz,
    generar_ecoespectro,
    generar_espectro_hacker,
    generar_laboratorio_musical,
    generar_ladron_colores,
    generar_mision_foton,
)
from .puntaje import cosine_similarity, emparejar, evaluar_con_penalizacion

__all__ = [
    "DTMF_FREQUENCIES",
    "EDUCATIONAL_GUIDES",
    "FTIR_BANDS_CM1",
    "MISSION_ARCHETYPE_PRESETS",
    "OPTICAL_MEDIA_CAUCHY",
    "STELLAR_LINES_NM",
    "WIEN_DISPLACEMENT_NM_K",
    "GAME_GENERATORS",
    "generar_bioespectro",
    "generar_cazadores_estrellas",
    "generar_desde_csv_real",
    "generar_detectives_luz",
    "generar_ecoespectro",
    "generar_espectro_hacker",
    "generar_laboratorio_musical",
    "generar_ladron_colores",
    "generar_mision_foton",
    "cosine_similarity",
    "emparejar",
    "evaluar_con_penalizacion",
]
