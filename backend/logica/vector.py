"""
Spectral Vector core class adapted for the Space Apps 2026 web engine.

Design principle (inherited from Abraham's desktop FTIR analyzer):
- ``Vector`` owns the spectral arrays (x, y), physical units/variable type,
  peak/valley/glitch indices, and standardized web chart serialization.
- ``AnalizadorFTIR`` operates on a ``Vector`` and produces derived ``Vector``
  instances (baseline-corrected, cropped, smoothed, deconvolved).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import numpy as np
from scipy.signal import find_peaks, savgol_filter

VALID_VARIABLES: tuple[str, ...] = (
    "Absorbancia",
    "Transmitancia",
    "Intensidad",
    "Reflectancia",
)
VALID_UNITS: tuple[str, ...] = ("cm-1", "nm", "Hz")

VARIABLE_ENGLISH_LABELS: dict[str, str] = {
    "Absorbancia": "Absorbance (A)",
    "Transmitancia": "Transmittance (%T)",
    "Intensidad": "Intensity (a.u.)",
    "Reflectancia": "Reflectance (R)",
}

UNIT_ENGLISH_LABELS: dict[str, str] = {
    "cm-1": "Wavenumber (cm^-1)",
    "nm": "Wavelength (nm)",
    "Hz": "Frequency (Hz)",
}


def distance_to_samples(x: np.ndarray, min_dx: float) -> int:
    """Convert a physical X-axis separation (cm-1, nm, Hz) into sample count."""
    x_arr = np.asarray(x, dtype=float)
    if len(x_arr) < 2 or min_dx <= 0:
        return 1
    diffs = np.abs(np.diff(x_arr))
    positive_diffs = diffs[diffs > 1e-12]
    if len(positive_diffs) == 0:
        return 1
    dx_step = float(np.median(positive_diffs))
    return max(1, int(abs(float(min_dx)) / dx_step))


def absorbancia_a_transmitancia(y: np.ndarray) -> np.ndarray:
    """Convert Absorbance (A) to percent Transmittance (%T = 100 * 10^-A)."""
    y_arr = np.asarray(y, dtype=float)
    return 100.0 * np.power(10.0, -np.clip(y_arr, -2.0, 10.0))


def transmitancia_a_absorbancia(y: np.ndarray) -> np.ndarray:
    """Convert Transmittance (%T in (0, 100] or fraction (0, 1]) to Absorbance."""
    y_arr = np.asarray(y, dtype=float)
    max_val = float(np.nanmax(y_arr)) if len(y_arr) else 100.0
    scale = 100.0 if max_val > 1.5 else 1.0
    ratio = np.clip(y_arr / scale, 1e-6, 1.0)
    return -np.log10(ratio)


def reflectancia_a_absorbancia(y: np.ndarray) -> np.ndarray:
    """Convert apparent reflectance R in (0, 1] to pseudo-absorbance -log10(R)."""
    y_arr = np.asarray(y, dtype=float)
    max_val = float(np.nanmax(y_arr)) if len(y_arr) else 1.0
    scale = 100.0 if max_val > 1.5 else 1.0
    ratio = np.clip(y_arr / scale, 1e-6, 1.0)
    return -np.log10(ratio)


def _safe_gradient(y: np.ndarray, x: np.ndarray) -> np.ndarray:
    """Compute dy/dx safely even if x has closely spaced or zero-diff samples."""
    if len(x) < 2:
        return np.zeros_like(y, dtype=float)
    diffs = np.diff(x)
    if np.any(np.abs(diffs) <= 1e-12):
        # Jitter duplicate steps minimally so gradient never divides by zero
        x_safe = np.linspace(float(x[0]), float(x[-1]), len(x))
        if abs(x_safe[-1] - x_safe[0]) <= 1e-12:
            return np.zeros_like(y, dtype=float)
        return np.gradient(y, x_safe)
    return np.gradient(y, x)


@dataclass
class Vector:
    """Core spectral data vector shared between analytical processing and minigames."""

    x: np.ndarray
    y: np.ndarray
    variable: str = "Absorbancia"
    unidadX: str = "cm-1"
    prominence: float = 0.05
    distance: float = 5
    distanceDy2: float = 5
    prominenceDy2: float = 0.001
    distance_x: float | None = None
    distanceDy2_x: float | None = None
    distance_is_physical: bool = False
    sort_x: bool = True
    label: str = "Spectrum"
    baseline_applied: bool = False
    region: tuple[float, float] | None = None

    # Computed fields populated in __post_init__
    dx: float = field(init=False, default=1.0)
    dy: np.ndarray = field(init=False, repr=False)
    dy2: np.ndarray = field(init=False, repr=False)
    idxPeaks: np.ndarray = field(init=False)
    idxDepressions: np.ndarray = field(init=False)
    idxFallos: np.ndarray = field(init=False)
    subBandas: list[dict[str, float]] = field(init=False, default_factory=list)

    def __post_init__(self) -> None:
        if self.variable not in VALID_VARIABLES:
            raise ValueError(
                f"Invalid variable '{self.variable}'. Expected one of {VALID_VARIABLES}."
            )
        if self.unidadX not in VALID_UNITS:
            raise ValueError(
                f"Invalid unidadX '{self.unidadX}'. Expected one of {VALID_UNITS}."
            )

        x_arr = np.asarray(self.x, dtype=float)
        y_arr = np.asarray(self.y, dtype=float)
        if len(x_arr) != len(y_arr):
            raise ValueError("Spectral arrays x and y must have identical lengths.")
        if len(x_arr) == 0:
            raise ValueError("Spectral vector cannot be empty.")

        # Replace non-finite values defensively for live gameplay safety
        finite_mask = np.isfinite(x_arr) & np.isfinite(y_arr)
        if not np.all(finite_mask):
            if not np.any(finite_mask):
                x_arr = np.arange(len(x_arr), dtype=float)
                y_arr = np.zeros_like(x_arr)
            else:
                x_arr = x_arr[finite_mask]
                y_arr = y_arr[finite_mask]

        if self.sort_x and len(x_arr) > 1 and np.any(np.diff(x_arr) < 0):
            order = np.argsort(x_arr)
            x_arr = x_arr[order]
            y_arr = y_arr[order]

        self.x = x_arr
        self.y = y_arr
        diffs = np.abs(np.diff(self.x)) if len(self.x) > 1 else np.array([1.0])
        pos_diffs = diffs[diffs > 1e-12]
        self.dx = float(np.median(pos_diffs)) if len(pos_diffs) else 1.0
        self.region = self.region or (float(np.min(self.x)), float(np.max(self.x)))

        self._recalcular()
        self._recalcularFallos()

    def _effective_distance_samples(self, raw_distance: float, explicit_x: float | None) -> int:
        if explicit_x is not None:
            return distance_to_samples(self.x, explicit_x)
        if self.distance_is_physical:
            return distance_to_samples(self.x, raw_distance)
        return max(1, int(round(raw_distance)))

    def _effective_prominence(self, base_prom: float) -> float:
        y_span = float(np.max(self.y) - np.min(self.y))
        if y_span <= 1e-12:
            return 1e-6
        # Keep sensitivity adaptive if prominence exceeds 40% of dynamic range
        if base_prom > 0.4 * y_span:
            return max(1e-6, 0.06 * y_span)
        return max(1e-6, float(base_prom))

    def _recalcular(self) -> None:
        """Recompute derivatives, peaks, valleys/depressions, and sub-band intervals."""
        self.dy = _safe_gradient(self.y, self.x)
        self.dy2 = _safe_gradient(self.dy, self.x)

        dist_samples = self._effective_distance_samples(self.distance, self.distance_x)
        prom = self._effective_prominence(self.prominence)

        if len(self.y) >= 3:
            peaks, _ = find_peaks(self.y, prominence=prom, distance=dist_samples)
            valleys, _ = find_peaks(-self.y, prominence=prom * 0.5, distance=max(1, dist_samples // 2))
        else:
            peaks = np.array([], dtype=int)
            valleys = np.array([], dtype=int)

        self.idxPeaks = peaks.astype(int)
        self.idxDepressions = valleys.astype(int)
        self.subBandas = self.subBandasInfo()

    def _recalcularFallos(self) -> None:
        """Detect sharp non-physical spikes / glitch anomalies using second derivative."""
        if len(self.y) < 5:
            self.idxFallos = np.array([], dtype=int)
            return

        dist_dy2 = self._effective_distance_samples(self.distanceDy2, self.distanceDy2_x)
        # Smooth signal slightly only when checking robust MAD residual for glitch detection
        dy2_abs = np.abs(self.dy2)
        med = float(np.median(dy2_abs))
        mad = float(np.median(np.abs(dy2_abs - med))) * 1.4826
        prom_dy2 = max(float(self.prominenceDy2), med + 6.0 * mad)
        glitches, _ = find_peaks(dy2_abs, prominence=prom_dy2, distance=dist_dy2)
        self.idxFallos = glitches.astype(int)

    def subBandasInfo(self) -> list[dict[str, float]]:
        """Pair each peak with enclosing valleys/boundaries to estimate FWHM and area."""
        if len(self.idxPeaks) == 0:
            return []

        n = len(self.x)
        # Merge detected valleys with spectrum endpoints so every peak is bracketed
        bounds = np.unique(np.concatenate(([0], self.idxDepressions, [n - 1])))
        info: list[dict[str, float]] = []

        for p_idx in self.idxPeaks:
            left_candidates = bounds[bounds < p_idx]
            right_candidates = bounds[bounds > p_idx]
            left_idx = int(left_candidates[-1]) if len(left_candidates) else 0
            right_idx = int(right_candidates[0]) if len(right_candidates) else n - 1
            if right_idx <= left_idx:
                left_idx = max(0, p_idx - 1)
                right_idx = min(n - 1, p_idx + 1)

            seg_x = self.x[left_idx : right_idx + 1]
            seg_y = self.y[left_idx : right_idx + 1]
            local_base = float(min(self.y[left_idx], self.y[right_idx]))
            height = max(0.0, float(self.y[p_idx]) - local_base)
            half_height = local_base + 0.5 * height

            above_half = seg_x[seg_y >= half_height]
            fwhm = (
                float(above_half[-1] - above_half[0])
                if len(above_half) >= 2
                else max(self.dx * 2.0, abs(float(seg_x[-1] - seg_x[0])) * 0.4)
            )
            area = float(np.trapezoid(np.maximum(seg_y - local_base, 0.0), seg_x)) if hasattr(np, "trapezoid") else float(np.trapz(np.maximum(seg_y - local_base, 0.0), seg_x))
            info.append(
                {
                    "peak_index": float(p_idx),
                    "center": float(self.x[p_idx]),
                    "amplitude": float(self.y[p_idx]),
                    "height": height,
                    "left_x": float(self.x[left_idx]),
                    "right_x": float(self.x[right_idx]),
                    "fwhm": fwhm,
                    "sigma_est": max(self.dx, fwhm / 2.355),
                    "area": abs(area),
                }
            )
        return info

    def derivar(self, orden: int = 1) -> "Vector":
        """Return a new Vector containing the 1st or 2nd derivative spectrum."""
        y_deriv = self.dy.copy() if orden == 1 else self.dy2.copy()
        return Vector(
            x=self.x.copy(),
            y=y_deriv,
            variable="Intensidad",
            unidadX=self.unidadX,
            prominence=max(1e-6, float(np.std(y_deriv)) * 0.5),
            distance=self.distance,
            distanceDy2=self.distanceDy2,
            prominenceDy2=self.prominenceDy2,
            distance_x=self.distance_x,
            distanceDy2_x=self.distanceDy2_x,
            distance_is_physical=self.distance_is_physical,
            label=f"d^{orden}({self.label})/dx^{orden}",
            baseline_applied=self.baseline_applied,
            region=self.region,
        )

    def recortar(self, lim_inf: float, lim_sup: float) -> "Vector":
        """Return a new cropped Vector restricted to [lim_inf, lim_sup]."""
        lo, hi = (lim_inf, lim_sup) if lim_inf <= lim_sup else (lim_sup, lim_inf)
        mask = (self.x >= lo) & (self.x <= hi)
        if not np.any(mask):
            raise ValueError(
                f"Crop range [{lo}, {hi}] {self.unidadX} contains no spectral points "
                f"(available: [{float(np.min(self.x)):.1f}, {float(np.max(self.x)):.1f}])."
            )
        return Vector(
            x=self.x[mask].copy(),
            y=self.y[mask].copy(),
            variable=self.variable,
            unidadX=self.unidadX,
            prominence=self.prominence,
            distance=self.distance,
            distanceDy2=self.distanceDy2,
            prominenceDy2=self.prominenceDy2,
            distance_x=self.distance_x,
            distanceDy2_x=self.distanceDy2_x,
            distance_is_physical=self.distance_is_physical,
            label=f"{self.label} [{lo:.0f}-{hi:.0f}]",
            baseline_applied=self.baseline_applied,
            region=(float(lo), float(hi)),
        )

    def suavizar(self, window_length: int = 9, polyorder: int = 2) -> "Vector":
        """Return a Savitzky-Golay smoothed copy without erasing macro peaks."""
        n = len(self.y)
        win = min(window_length, n if n % 2 == 1 else n - 1)
        if win < polyorder + 2 or win < 3:
            y_smooth = self.y.copy()
        else:
            y_smooth = savgol_filter(self.y, window_length=win, polyorder=polyorder)
        return Vector(
            x=self.x.copy(),
            y=y_smooth,
            variable=self.variable,
            unidadX=self.unidadX,
            prominence=self.prominence,
            distance=self.distance,
            distanceDy2=self.distanceDy2,
            prominenceDy2=self.prominenceDy2,
            distance_x=self.distance_x,
            distanceDy2_x=self.distanceDy2_x,
            distance_is_physical=self.distance_is_physical,
            label=f"{self.label} (denoised)",
            baseline_applied=self.baseline_applied,
            region=self.region,
        )

    def mutar(
        self,
        nuevo_y: np.ndarray | None = None,
        nueva_variable: str | None = None,
        baseline_applied: bool | None = None,
    ) -> "Vector":
        """
        Return a mutated/transformed Vector with automatic physical unit conversion
        when switching between Absorbancia and Transmitancia (or updating y values).
        """
        y_out = self.y.copy() if nuevo_y is None else np.asarray(nuevo_y, dtype=float)
        var_out = self.variable

        if nueva_variable is not None and nueva_variable != self.variable:
            if nueva_variable not in VALID_VARIABLES:
                raise ValueError(
                    f"Cannot convert to invalid variable '{nueva_variable}'."
                )
            if self.variable == "Absorbancia" and nueva_variable == "Transmitancia":
                y_out = absorbancia_a_transmitancia(y_out)
            elif self.variable == "Transmitancia" and nueva_variable == "Absorbancia":
                y_out = transmitancia_a_absorbancia(y_out)
            elif self.variable == "Reflectancia" and nueva_variable == "Absorbancia":
                y_out = reflectancia_a_absorbancia(y_out)
            var_out = nueva_variable

        return Vector(
            x=self.x.copy(),
            y=y_out,
            variable=var_out,
            unidadX=self.unidadX,
            prominence=self.prominence,
            distance=self.distance,
            distanceDy2=self.distanceDy2,
            prominenceDy2=self.prominenceDy2,
            distance_x=self.distance_x,
            distanceDy2_x=self.distanceDy2_x,
            distance_is_physical=self.distance_is_physical,
            label=self.label,
            baseline_applied=(
                self.baseline_applied if baseline_applied is None else baseline_applied
            ),
            region=self.region,
        )

    def to_points(self, max_points: int = 500) -> list[dict[str, float]]:
        """
        Serialize spectrum as <= max_points {x, y} dicts for frontend rendering,
        preserving detected peaks, valleys, and glitch spikes so sharp lines
        are never dropped by downsampling.
        """
        n = len(self.x)
        if n <= max_points:
            indices = np.arange(n, dtype=int)
        else:
            critical = np.unique(
                np.concatenate(
                    (
                        [0, n - 1],
                        self.idxPeaks,
                        self.idxDepressions,
                        self.idxFallos,
                    )
                )
            ).astype(int)
            critical = critical[(critical >= 0) & (critical < n)]
            if len(critical) >= max_points:
                sel = np.linspace(0, len(critical) - 1, max_points, dtype=int)
                indices = critical[sel]
            else:
                remaining = max_points - len(critical)
                uniform = np.linspace(0, n - 1, max_points, dtype=int)
                merged = np.unique(np.concatenate((critical, uniform)))
                if len(merged) > max_points:
                    # Drop non-critical points uniformly while keeping critical indices
                    crit_set = set(critical.tolist())
                    non_crit = np.array([i for i in merged if i not in crit_set], dtype=int)
                    keep_non = np.linspace(0, len(non_crit) - 1, max(0, remaining), dtype=int)
                    selected_non = non_crit[keep_non] if len(non_crit) and remaining > 0 else np.array([], dtype=int)
                    indices = np.sort(np.unique(np.concatenate((critical, selected_non))))
                else:
                    indices = merged

        return [
            {"x": round(float(self.x[i]), 4), "y": round(float(self.y[i]), 6)}
            for i in indices
        ]

    def to_visualization_dict(
        self, max_points: int = 500, role: str = "primary"
    ) -> dict[str, Any]:
        """Standardized chart payload consumable by all React spectral minigames."""
        return {
            "label": self.label,
            "role": role,
            "variable": self.variable,
            "y_label": VARIABLE_ENGLISH_LABELS.get(self.variable, self.variable),
            "x_unit": self.unidadX,
            "x_label": UNIT_ENGLISH_LABELS.get(self.unidadX, self.unidadX),
            "x_range": [round(float(np.min(self.x)), 4), round(float(np.max(self.x)), 4)],
            "y_range": [round(float(np.min(self.y)), 6), round(float(np.max(self.y)), 6)],
            "baseline_applied": self.baseline_applied,
            "points": self.to_points(max_points=max_points),
            "detected_peaks": [round(float(self.x[i]), 4) for i in self.idxPeaks],
            "detected_valleys": [round(float(self.x[i]), 4) for i in self.idxDepressions],
            "detected_glitches": [round(float(self.x[i]), 4) for i in self.idxFallos],
            "subbands_count": len(self.subBandas),
        }
