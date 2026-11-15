"""
AnalizadorFTIR — Spectral transformation and deconvolution engine.

Operates on ``Vector`` objects and returns derived ``Vector`` objects or
standardized deconvolution results, enforcing live web-gameplay protections
so curve fitting never crashes 30-second missions.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
from scipy.optimize import curve_fit

from .lineaBase import LineaBase
from .modelos import (
    Models,
    NormaEuclidiana,
    RaizErrorCuadraticoMedio,
    coeficiente_determinacion_r2,
    resolve_model,
)
from .vector import Vector


class ErrorAnalisis(Exception):
    """Raised when an invalid analytical configuration cannot proceed."""


@dataclass
class DeconvolutionResult:
    """Structured output of spectral band deconvolution for APIs and minigames."""

    model_name: str
    params: list[float]
    band_centers: list[float]
    band_amplitudes: list[float]
    fitted_vector: Vector
    residual_vector: Vector
    subband_vectors: list[Vector]
    r2: float
    rmse: float
    euclidean_error: float
    fallback_used: bool
    educational_summary: str

    def to_visualization_dict(self, max_points: int = 500) -> dict[str, Any]:
        """Serialize total fit, residual, and individual sub-bands for web UI."""
        return {
            "model_name": self.model_name,
            "band_centers": [round(float(c), 4) for c in self.band_centers],
            "band_amplitudes": [round(float(a), 6) for a in self.band_amplitudes],
            "r2": round(float(self.r2), 4),
            "rmse": round(float(self.rmse), 6),
            "fallback_used": self.fallback_used,
            "educational_summary": self.educational_summary,
            "fitted_points": self.fitted_vector.to_points(max_points=max_points),
            "residual_points": self.residual_vector.to_points(max_points=max_points),
            "subbands": [
                {
                    "center": round(float(self.band_centers[idx]), 4),
                    "amplitude": round(float(self.band_amplitudes[idx]), 6),
                    "points": sb.to_points(max_points=min(max_points, 250)),
                }
                for idx, sb in enumerate(self.subband_vectors)
            ],
        }


class AnalizadorFTIR:
    """Stateless spectral analysis operations producing derived Vectors."""

    @staticmethod
    def lineaBase(vector: Vector, modelo: str = "rubberband", offset: float | None = None) -> Vector:
        """Compute the estimated baseline as its own Vector."""
        lb = LineaBase(vector.x, vector.y, modelo=modelo, offset=offset)
        return Vector(
            x=vector.x.copy(),
            y=lb.baseline,
            variable=vector.variable,
            unidadX=vector.unidadX,
            prominence=max(1e-6, vector.prominence * 0.5),
            distance=vector.distance,
            distanceDy2=vector.distanceDy2,
            prominenceDy2=vector.prominenceDy2,
            distance_x=vector.distance_x,
            distanceDy2_x=vector.distanceDy2_x,
            distance_is_physical=vector.distance_is_physical,
            label=f"Baseline ({modelo})",
            baseline_applied=False,
            region=vector.region,
        )

    @staticmethod
    def ajustarLineaBase(
        vector: Vector,
        modelo: str = "rubberband",
        offset: float | None = None,
        clip_zero: bool = False,
    ) -> Vector:
        """Subtract estimated baseline from vector and return a corrected Vector."""
        lb = LineaBase(vector.x, vector.y, modelo=modelo, offset=offset)
        y_corr = lb.corrected
        if clip_zero:
            y_corr = np.maximum(y_corr, 0.0)
        return vector.mutar(nuevo_y=y_corr, baseline_applied=True)

    @staticmethod
    def Recortar(vector: Vector, lim_inf: float, lim_sup: float) -> Vector:
        """Crop the spectrum cleanly to an analytical region of interest."""
        return vector.recortar(lim_inf, lim_sup)

    @staticmethod
    def Suavizar(vector: Vector, window_length: int = 9, polyorder: int = 2) -> Vector:
        """Apply Savitzky-Golay noise suppression returning a new Vector."""
        return vector.suavizar(window_length=window_length, polyorder=polyorder)

    @staticmethod
    def Tracker(vector: Vector) -> dict[str, Any]:
        """Inspect second-derivative glitches / cosmic-ray or dead-pixel spikes."""
        glitch_indices = [int(i) for i in vector.idxFallos]
        glitch_x = [round(float(vector.x[i]), 4) for i in glitch_indices]
        return {
            "count": len(glitch_indices),
            "indices": glitch_indices,
            "x_positions": glitch_x,
            "has_glitches": len(glitch_indices) > 0,
            "explanation": (
                f"Detected {len(glitch_indices)} sharp non-physical spike(s) via d^2y/dx^2 MAD thresholding."
                if glitch_indices
                else "No sharp sensor glitches detected in the current region."
            ),
        }

    @staticmethod
    def _p0_inicial(
        vector: Vector,
        num_parametros: int,
        modelo_nombre: str = "voigt",
        target_centers: list[float] | None = None,
    ) -> tuple[list[float], list[float], list[float]]:
        """
        Compute safe initial guesses (p0, lower_bounds, upper_bounds) for N bands.

        Web protection #3: When a clean synthetic spectrum has no detected peaks
        or no intermediate depressions, falls back to argmax and synthetic edge
        boundaries [0, len(x)-1] instead of raising ValueError/IndexError.
        """
        n = len(vector.x)
        x_min, x_max = float(np.min(vector.x)), float(np.max(vector.x))
        x_span = max(1e-3, x_max - x_min)
        y_min = float(np.min(vector.y))
        y_span = max(1e-4, float(np.max(vector.y)) - y_min)

        if target_centers:
            peak_indices = [
                int(np.argmin(np.abs(vector.x - c))) for c in target_centers
            ]
        elif len(vector.idxPeaks) > 0:
            peak_indices = [int(i) for i in vector.idxPeaks]
        else:
            # Safe synthetic fallback when spectrum has no clear prominence peak
            peak_indices = [int(np.argmax(vector.y))]

        # Inject synthetic boundary depressions so bracketing never fails
        raw_deps = vector.idxDepressions if len(vector.idxDepressions) > 0 else np.array([], dtype=int)
        synthetic_bounds = np.unique(np.concatenate(([0], raw_deps, [n - 1]))).astype(int)

        p0: list[float] = []
        lb: list[float] = []
        ub: list[float] = []
        key = modelo_nombre.lower().strip()
        min_width = max(vector.dx, x_span * 0.005)
        max_width = max(min_width * 2.0, x_span * 0.6)

        for p_idx in peak_indices:
            left_c = synthetic_bounds[synthetic_bounds < p_idx]
            right_c = synthetic_bounds[synthetic_bounds > p_idx]
            left_i = int(left_c[-1]) if len(left_c) else 0
            right_i = int(right_c[0]) if len(right_c) else n - 1
            width_est = abs(float(vector.x[right_i] - vector.x[left_i])) * 0.3
            width_est = float(np.clip(width_est, min_width * 1.5, max_width * 0.6))

            center = float(vector.x[p_idx])
            height = max(1e-4, float(vector.y[p_idx]) - min(0.0, y_min))

            # Voigt and Lorentz integrate area rather than peak height
            if key in ("lorentz", "voigt"):
                amp_guess = height * width_est * 2.5
                amp_upper = max(amp_guess * 10.0, y_span * x_span)
            else:
                amp_guess = height
                amp_upper = max(amp_guess * 5.0, y_span * 3.0)

            p0.extend([amp_guess, center])
            lb.extend([0.0, max(x_min - x_span * 0.05, center - width_est * 3.0)])
            ub.extend([amp_upper, min(x_max + x_span * 0.05, center + width_est * 3.0)])

            if num_parametros == 3:
                p0.append(width_est)
                lb.append(min_width)
                ub.append(max_width)
            elif num_parametros == 4:
                if key in ("psd_voigt1",):
                    p0.extend([width_est, 0.5])
                    lb.extend([min_width, 0.0])
                    ub.extend([max_width, 1.0])
                else:
                    p0.extend([width_est * 0.7, max(min_width, width_est * 0.5)])
                    lb.extend([min_width, min_width])
                    ub.extend([max_width, max_width])
            elif num_parametros == 5:
                p0.extend([width_est * 1.6, width_est * 1.6, 0.5])
                lb.extend([min_width, min_width, 0.0])
                ub.extend([max_width * 2.0, max_width * 2.0, 1.0])

        return p0, lb, ub

    @staticmethod
    def _modelo_seguro(
        vector: Vector,
        modelo_nombre: str = "voigt",
        target_centers: list[float] | None = None,
        maxfev: int = 3500,
    ) -> tuple[list[float], bool]:
        """Run bounded nonlinear curve_fit with safe fallback to physical initial p0."""
        _, sum_fn, n_params = resolve_model(modelo_nombre)
        p0, lb, ub = AnalizadorFTIR._p0_inicial(
            vector, n_params, modelo_nombre=modelo_nombre, target_centers=target_centers
        )
        # Ensure p0 lies strictly inside bounds for SciPy trust-region reflective solver
        p0_safe = [
            float(np.clip(val, lo + 1e-9, hi - 1e-9)) if hi > lo + 2e-9 else float(lo)
            for val, lo, hi in zip(p0, lb, ub)
        ]
        try:
            popt, _ = curve_fit(
                sum_fn,
                vector.x,
                vector.y,
                p0=p0_safe,
                bounds=(lb, ub),
                maxfev=maxfev,
            )
            return [float(v) for v in popt], False
        except Exception:
            return p0_safe, True

    @staticmethod
    def Deconvolucion(
        vector: Vector,
        modelo_nombre: str = "voigt",
        target_centers: list[float] | None = None,
        maxfev: int = 3500,
    ) -> DeconvolutionResult:
        """Deconvolve overlapping spectral peaks into individual sub-bands safely."""
        if modelo_nombre.lower().strip() not in Models:
            raise ErrorAnalisis(f"Unsupported deconvolution model: '{modelo_nombre}'")

        single_fn, sum_fn, n_params = resolve_model(modelo_nombre)
        popt, fallback_used = AnalizadorFTIR._modelo_seguro(
            vector,
            modelo_nombre=modelo_nombre,
            target_centers=target_centers,
            maxfev=maxfev,
        )

        y_fit = np.asarray(sum_fn(vector.x, *popt), dtype=float)
        y_res = vector.y - y_fit

        fitted_vec = vector.mutar(nuevo_y=y_fit, baseline_applied=vector.baseline_applied)
        fitted_vec.label = f"Fit ({modelo_nombre})"
        residual_vec = Vector(
            x=vector.x.copy(),
            y=y_res,
            variable="Intensidad",
            unidadX=vector.unidadX,
            prominence=max(1e-5, float(np.std(y_res)) * 0.5),
            distance=vector.distance,
            distance_x=vector.distance_x,
            distance_is_physical=vector.distance_is_physical,
            label="Residual (Observed - Fit)",
            baseline_applied=vector.baseline_applied,
            region=vector.region,
        )

        subband_vectors: list[Vector] = []
        centers: list[float] = []
        amps: list[float] = []
        for idx, i in enumerate(range(0, len(popt), n_params), start=1):
            chunk = popt[i : i + n_params]
            band_y = np.asarray(single_fn(vector.x, *chunk), dtype=float)
            centers.append(float(chunk[1]))
            amps.append(float(np.max(band_y)))
            subband_vectors.append(
                Vector(
                    x=vector.x.copy(),
                    y=band_y,
                    variable=vector.variable,
                    unidadX=vector.unidadX,
                    prominence=max(1e-5, float(np.max(band_y)) * 0.1),
                    distance=vector.distance,
                    distance_x=vector.distance_x,
                    distance_is_physical=vector.distance_is_physical,
                    label=f"Band {idx} @ {chunk[1]:.1f} {vector.unidadX}",
                    baseline_applied=True,
                    region=vector.region,
                )
            )

        r2 = coeficiente_determinacion_r2(vector.y, y_fit)
        rmse = RaizErrorCuadraticoMedio(vector.y, y_fit)
        l2 = NormaEuclidiana(vector.y, y_fit)
        summary = (
            f"Deconvolved {len(subband_vectors)} overlapping band(s) using the {modelo_nombre} profile "
            f"(R^2 = {r2:.3f}, RMSE = {rmse:.4f})."
        )
        if fallback_used:
            summary += " Used geometric initial-estimate fallback to keep live mission response instantaneous."

        return DeconvolutionResult(
            model_name=modelo_nombre,
            params=popt,
            band_centers=centers,
            band_amplitudes=amps,
            fitted_vector=fitted_vec,
            residual_vector=residual_vec,
            subband_vectors=subband_vectors,
            r2=r2,
            rmse=rmse,
            euclidean_error=l2,
            fallback_used=fallback_used,
            educational_summary=summary,
        )
