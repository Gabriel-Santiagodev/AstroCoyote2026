"""
Baseline estimation and correction models for spectral Vectors.

Adapted from Abraham's desktop FTIR analyzer for the Space Apps 2026 web engine:
supports ascending and descending X axes (e.g. FTIR 4000 -> 600 cm-1) safely
without external GUI or DataFrame dependencies.
"""
from __future__ import annotations

import numpy as np
from scipy.interpolate import CubicSpline
from scipy.spatial import ConvexHull


def _ensure_sorted_xy(x: np.ndarray, y: np.ndarray) -> tuple[np.ndarray, np.ndarray, bool]:
    """Return arrays sorted in strictly ascending X order plus whether reversed."""
    x_arr = np.asarray(x, dtype=float)
    y_arr = np.asarray(y, dtype=float)
    if len(x_arr) < 2:
        return x_arr, y_arr, False
    order = np.argsort(x_arr)
    is_reordered = not np.array_equal(order, np.arange(len(x_arr)))
    return x_arr[order], y_arr[order], is_reordered


def _casco_inferior(points: np.ndarray) -> np.ndarray:
    """Extract sorted lower convex hull vertices for 2D (x, y) points."""
    if len(points) <= 2:
        return points
    try:
        hull = ConvexHull(points)
        vertices = hull.vertices
    except Exception:
        return np.vstack([points[0], points[-1]])

    # Start at minimum-X vertex and walk lower envelope
    start_pos = int(np.argmin(points[vertices, 0]))
    end_pos = int(np.argmax(points[vertices, 0]))
    if start_pos == end_pos:
        return points[[0, -1]]

    # Walk both arcs around the convex hull and pick the one with lower mean y
    n_v = len(vertices)
    arc_a = []
    idx = start_pos
    while True:
        arc_a.append(vertices[idx])
        if idx == end_pos:
            break
        idx = (idx + 1) % n_v

    arc_b = []
    idx = start_pos
    while True:
        arc_b.append(vertices[idx])
        if idx == end_pos:
            break
        idx = (idx - 1) % n_v

    pts_a = points[arc_a]
    pts_b = points[arc_b]
    lower = pts_a if np.mean(pts_a[:, 1]) <= np.mean(pts_b[:, 1]) else pts_b
    lower = lower[np.argsort(lower[:, 0])]
    # Deduplicate X to keep interpolation valid
    _, unique_idx = np.unique(lower[:, 0], return_index=True)
    return lower[np.sort(unique_idx)]


def modelo_escalar(x: np.ndarray, y: np.ndarray, offset: float | None = None) -> np.ndarray:
    """Flat scalar baseline using explicit offset or low quantile (5th percentile)."""
    y_arr = np.asarray(y, dtype=float)
    base_val = float(np.nanpercentile(y_arr, 5)) if offset is None else float(offset)
    return np.full_like(y_arr, base_val, dtype=float)


def correccion_lineal(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    """Linear baseline anchored between the spectrum endpoints."""
    x_arr = np.asarray(x, dtype=float)
    y_arr = np.asarray(y, dtype=float)
    if len(x_arr) < 2:
        return y_arr.copy()
    x_s, y_s, _ = _ensure_sorted_xy(x_arr, y_arr)
    left_y = float(np.median(y_s[: min(5, len(y_s))]))
    right_y = float(np.median(y_s[max(0, len(y_s) - 5) :]))
    baseline_s = np.interp(x_s, [x_s[0], x_s[-1]], [left_y, right_y])
    return np.interp(x_arr, x_s, baseline_s)


def modelo_rubberband(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    """Piecewise-linear lower convex hull ('rubberband') baseline."""
    x_arr = np.asarray(x, dtype=float)
    y_arr = np.asarray(y, dtype=float)
    if len(x_arr) < 4:
        return correccion_lineal(x_arr, y_arr)
    x_s, y_s, _ = _ensure_sorted_xy(x_arr, y_arr)
    pts = np.column_stack([x_s, y_s])
    lower = _casco_inferior(pts)
    if len(lower) < 2:
        return correccion_lineal(x_arr, y_arr)
    return np.interp(x_arr, lower[:, 0], lower[:, 1])


def algoritmoLiga(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    """Alias preserved from original FTIR desktop library."""
    return modelo_rubberband(x, y)


def correccion_splines(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    """Smooth cubic-spline baseline through lower-envelope anchor points."""
    x_arr = np.asarray(x, dtype=float)
    y_arr = np.asarray(y, dtype=float)
    if len(x_arr) < 6:
        return modelo_rubberband(x_arr, y_arr)

    x_s, y_s, _ = _ensure_sorted_xy(x_arr, y_arr)
    pts = np.column_stack([x_s, y_s])
    lower = _casco_inferior(pts)
    if len(lower) < 4:
        # Build binned quantile anchors if convex hull has too few points
        n_bins = min(8, max(4, len(x_s) // 15))
        edges = np.linspace(0, len(x_s), n_bins + 1, dtype=int)
        anchors_x = []
        anchors_y = []
        for i in range(n_bins):
            seg_x = x_s[edges[i] : edges[i + 1]]
            seg_y = y_s[edges[i] : edges[i + 1]]
            if len(seg_x) == 0:
                continue
            min_idx = int(np.argmin(seg_y))
            anchors_x.append(float(seg_x[min_idx]))
            anchors_y.append(float(seg_y[min_idx]))
        lower = np.column_stack([anchors_x, anchors_y])
        _, unique_idx = np.unique(lower[:, 0], return_index=True)
        lower = lower[np.sort(unique_idx)]

    if len(lower) < 4:
        return np.interp(x_arr, lower[:, 0], lower[:, 1])

    cs = CubicSpline(lower[:, 0], lower[:, 1], bc_type="natural")
    baseline = cs(x_arr)
    # Clamp extreme spline overshoots near edges
    y_min, y_max = float(np.min(y_arr)), float(np.max(y_arr))
    return np.clip(baseline, y_min - 0.1 * max(1e-6, y_max - y_min), y_max)


class LineaBase:
    """Container computing a baseline vector and corrected intensity values."""

    MODELS = ("rubberband", "splines", "lineal", "escalar")

    def __init__(
        self,
        x: np.ndarray,
        y: np.ndarray,
        modelo: str = "rubberband",
        offset: float | None = None,
    ) -> None:
        self.x = np.asarray(x, dtype=float)
        self.y_raw = np.asarray(y, dtype=float)
        self.modelo = modelo.lower().strip()

        if self.modelo == "escalar":
            self.y = modelo_escalar(self.x, self.y_raw, offset=offset)
        elif self.modelo == "lineal":
            self.y = correccion_lineal(self.x, self.y_raw)
        elif self.modelo == "splines":
            self.y = correccion_splines(self.x, self.y_raw)
        elif self.modelo in ("rubberband", "liga"):
            self.y = modelo_rubberband(self.x, self.y_raw)
        else:
            raise ValueError(
                f"Unknown baseline model '{modelo}'. Expected one of {self.MODELS}."
            )

    @property
    def baseline(self) -> np.ndarray:
        """Estimated baseline array aligned with x."""
        return self.y

    @property
    def corrected(self) -> np.ndarray:
        """Baseline-subtracted signal (y_raw - baseline)."""
        return self.y_raw - self.y
