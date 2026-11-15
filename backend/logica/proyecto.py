"""
Workflow validation (Plantilla), sample containers, and real CSV spectral loading.

Implements Web Protection #4: ``Plantilla.puede(paso)`` guides players through
the scientific spectroscopy order (Baseline -> Region -> Model/Deconvolution)
and returns ``(False, educational_reason)`` with a -3 pt efficiency penalty
rather than crashing 30-second gameplay. Also supports loading real experimental
CSV spectra (without pandas) for immediate or future real NASA/lab data integration.
"""
from __future__ import annotations

import csv
import io
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, Sequence

import numpy as np

from .Analizador import AnalizadorFTIR, DeconvolutionResult
from .modelos import Models
from .vector import VALID_UNITS, VALID_VARIABLES, Vector

WORKFLOW_ORDER: tuple[str, ...] = ("baseline", "region", "modelo")
PENALTY_PER_VIOLATION: float = 3.0

_STEP_ALIASES: dict[str, str] = {
    "baseline": "baseline",
    "linea_base": "baseline",
    "lineabase": "baseline",
    "region": "region",
    "recortar": "region",
    "crop": "region",
    "modelo": "modelo",
    "deconvolucion": "modelo",
    "deconvolution": "modelo",
}


def _infer_unit_from_header(header_x: str) -> str:
    low = header_x.lower()
    if "nm" in low or "wave" in low or "lambda" in low:
        return "nm"
    if "hz" in low or "freq" in low:
        return "Hz"
    return "cm-1"


def _infer_variable_from_header(header_y: str) -> str:
    low = header_y.lower()
    if "%t" in low or "trans" in low:
        return "Transmitancia"
    if "refl" in low:
        return "Reflectancia"
    if "int" in low or "min" in low or "counts" in low or "flux" in low:
        return "Intensidad"
    return "Absorbancia"


def cargar_espectro_csv(
    source: str | Path | Iterable[str],
    x_col: int = 0,
    y_col: int = 1,
    variable: str | None = None,
    unidadX: str | None = None,
    label: str | None = None,
    distance_x: float | None = None,
) -> Vector:
    """
    Load a real experimental CSV spectrum into a normalized spectral ``Vector``.

    Handles single-column Y headers (e.g. ``cm-1,%T`` with tabbed values) and
    multi-series CSVs (e.g. ``cm-1,min0,min15,...``) using Python's stdlib csv.
    """
    if isinstance(source, (str, Path)) and Path(source).exists():
        path = Path(source)
        raw_text = path.read_text(encoding="utf-8-sig", errors="replace")
        default_label = label or path.stem
    elif isinstance(source, str):
        raw_text = source
        default_label = label or "CSV Spectrum"
    else:
        raw_text = "\n".join(source)
        default_label = label or "CSV Spectrum"

    reader = csv.reader(io.StringIO(raw_text))
    rows = [[cell.strip() for cell in row] for row in reader if any(c.strip() for c in row)]
    if len(rows) < 2:
        raise ValueError("Spectral CSV must contain a header or at least two data rows.")

    header = rows[0]
    try:
        float(header[x_col])
        data_rows = rows
        x_header = "cm-1"
        y_header = "Absorbancia"
    except (ValueError, IndexError):
        data_rows = rows[1:]
        x_header = header[x_col] if x_col < len(header) else "cm-1"
        y_header = header[y_col] if y_col < len(header) else "Absorbancia"

    xs: list[float] = []
    ys: list[float] = []
    for row in data_rows:
        if len(row) <= max(x_col, y_col):
            continue
        try:
            x_val = float(row[x_col])
            y_val = float(row[y_col])
        except ValueError:
            continue
        xs.append(x_val)
        ys.append(y_val)

    if len(xs) < 2:
        raise ValueError("Could not parse numeric spectral columns from CSV.")

    resolved_unit = unidadX if unidadX in VALID_UNITS else _infer_unit_from_header(x_header)
    resolved_var = variable if variable in VALID_VARIABLES else _infer_variable_from_header(y_header)
    y_arr = np.asarray(ys, dtype=float)
    prom = max(1e-4, float(np.ptp(y_arr)) * 0.05)

    return Vector(
        x=np.asarray(xs, dtype=float),
        y=y_arr,
        variable=resolved_var,
        unidadX=resolved_unit,
        prominence=prom,
        distance_x=distance_x,
        label=default_label if y_header == "Absorbancia" else f"{default_label} ({y_header})",
    )


@dataclass
class Plantilla:
    """
    Interactive spectroscopy pipeline rule guard.

    Teaches the scientific sequence (Baseline -> Region -> Model) without
    halting the 30-second game: out-of-order steps return ``(False, message)``
    and accumulate a -3 point penalty per violation.
    """

    pasos_completados: list[str] = field(default_factory=list)
    violaciones: list[str] = field(default_factory=list)
    penalizacion_pts: float = 0.0

    def reiniciar(self) -> None:
        self.pasos_completados.clear()
        self.violaciones.clear()
        self.penalizacion_pts = 0.0

    def puede(self, paso: str, valor: object = None) -> tuple[bool, str]:
        """
        Validate whether ``paso`` can run now under spectroscopy best practices.
        Returns ``(allowed, educational_message)``.
        """
        key = _STEP_ALIASES.get(paso.lower().strip())
        if key is None:
            return (
                False,
                f"Unknown pipeline step '{paso}'. Valid sequence: Baseline -> Region -> Model.",
            )

        if key == "baseline":
            return True, "Baseline correction removes instrumental drift before peak analysis."

        if key == "region":
            if "baseline" not in self.pasos_completados:
                reason = (
                    "Order penalty (-3 pts): Apply baseline correction BEFORE cropping the region "
                    "so background tilt does not distort band heights."
                )
                self.violaciones.append(reason)
                self.penalizacion_pts += PENALTY_PER_VIOLATION
                return False, reason
            if isinstance(valor, Sequence) and len(valor) == 2:
                try:
                    lo, hi = float(valor[0]), float(valor[1])
                    if lo >= hi:
                        return False, "Invalid region bounds: lower X limit must be smaller than upper limit."
                except (TypeError, ValueError):
                    return False, "Region bounds must be two numeric coordinates (min, max)."
            return True, "Region isolated cleanly around the diagnostic absorption bands."

        # key == "modelo"
        missing: list[str] = []
        if "baseline" not in self.pasos_completados:
            missing.append("Baseline correction")
        if "region" not in self.pasos_completados:
            missing.append("Region crop")
        if missing:
            reason = (
                f"Order penalty (-3 pts): Complete {' and '.join(missing)} before running "
                "peak deconvolution so the fitter models real signal instead of background slope."
            )
            self.violaciones.append(reason)
            self.penalizacion_pts += PENALTY_PER_VIOLATION
            return False, reason

        if isinstance(valor, str) and valor.lower().strip() not in Models:
            return False, f"Unknown analytical model '{valor}'."

        return True, "Ready to fit overlapping bands with nonlinear deconvolution."

    def registrar(self, paso: str, valor: object = None, force: bool = False) -> tuple[bool, str]:
        """Validate a step and record completion if allowed (or forced in arcade mode)."""
        allowed, message = self.puede(paso, valor=valor)
        key = _STEP_ALIASES.get(paso.lower().strip(), paso)
        if allowed or force:
            if key not in self.pasos_completados and key in WORKFLOW_ORDER:
                self.pasos_completados.append(key)
        return allowed, message


@dataclass
class Muestra:
    """Single spectroscopic sample pairing raw and current transformed Vector."""

    nombre: str
    raw_vector: Vector
    vector_actual: Vector = field(init=False)
    plantilla: Plantilla = field(default_factory=Plantilla)
    deconvolucion: DeconvolutionResult | None = None

    def __post_init__(self) -> None:
        self.vector_actual = self.raw_vector

    def aplicar_baseline(self, modelo: str = "rubberband", force: bool = True) -> tuple[bool, str]:
        ok, msg = self.plantilla.registrar("baseline", modelo, force=force)
        if ok or force:
            self.vector_actual = AnalizadorFTIR.ajustarLineaBase(self.vector_actual, modelo=modelo)
        return ok, msg

    def aplicar_region(self, lim_inf: float, lim_sup: float, force: bool = True) -> tuple[bool, str]:
        ok, msg = self.plantilla.registrar("region", (lim_inf, lim_sup), force=force)
        if ok or force:
            self.vector_actual = AnalizadorFTIR.Recortar(self.vector_actual, lim_inf, lim_sup)
        return ok, msg

    def aplicar_deconvolucion(
        self,
        modelo_nombre: str = "voigt",
        target_centers: list[float] | None = None,
        force: bool = True,
    ) -> tuple[bool, str, DeconvolutionResult | None]:
        ok, msg = self.plantilla.registrar("modelo", modelo_nombre, force=force)
        res = None
        if ok or force:
            res = AnalizadorFTIR.Deconvolucion(
                self.vector_actual,
                modelo_nombre=modelo_nombre,
                target_centers=target_centers,
            )
            self.deconvolucion = res
        return ok, msg, res


@dataclass
class Proyecto:
    """Collection of spectroscopic samples for batch mission analysis."""

    nombre: str
    muestras: dict[str, Muestra] = field(default_factory=dict)

    def agregar_muestra(self, nombre: str, vector: Vector) -> Muestra:
        muestra = Muestra(nombre=nombre, raw_vector=vector)
        self.muestras[nombre] = muestra
        return muestra

    def agregar_csv(self, nombre: str, source: str | Path, **kwargs: object) -> Muestra:
        vec = cargar_espectro_csv(source, label=nombre, **kwargs)  # type: ignore[arg-type]
        return self.agregar_muestra(nombre, vec)
