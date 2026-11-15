"""Black-background sprite segmentation helpers for the art pipeline.

Used by ``procesar_arte.py``. Pure functions over numpy arrays; no file
layout knowledge lives here.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


@dataclass
class SheetParams:
    """Per-sheet tuning for black-to-alpha conversion and component search."""

    t_lo: float = 14.0       # value (max RGB) at or below which alpha = 0
    t_hi: float = 46.0       # value at or above which alpha = 1
    t_mask: float = 26.0     # binary threshold used to find components
    dilate: int = 6          # px dilation so multi-piece objects stay together
    min_area: int = 1500     # drop components smaller than this (mask px)
    fill_holes_max: int = 900  # enclosed dark holes up to this area become opaque
    pad: int = 4             # padding around the trimmed bbox


@dataclass
class Component:
    label: int
    bbox: tuple[int, int, int, int]  # x0, y0, x1, y1 (exclusive)
    area: int
    centroid: tuple[float, float]


def value_channel(rgb: np.ndarray) -> np.ndarray:
    """Max RGB channel. Keeps dark coloured metal brighter than luminance does."""
    return rgb.max(axis=2).astype(np.float32)


def soft_alpha(v: np.ndarray, p: SheetParams) -> np.ndarray:
    """Smoothstep ramp between t_lo and t_hi: light feathering, no hard jaggies."""
    x = np.clip((v - p.t_lo) / max(p.t_hi - p.t_lo, 1e-3), 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def find_components(rgb: np.ndarray, p: SheetParams) -> tuple[np.ndarray, list[Component]]:
    """Label connected components on a dilated binary mask."""
    v = value_channel(rgb)
    mask = v > p.t_mask
    mask = ndi.binary_opening(mask, iterations=1)  # kill JPEG speckle
    if p.dilate > 0:
        st = ndi.generate_binary_structure(2, 1)
        grown = ndi.binary_dilation(mask, structure=st, iterations=p.dilate)
    else:
        grown = mask
    labels, n = ndi.label(grown)
    comps: list[Component] = []
    if n == 0:
        return labels, comps
    areas = ndi.sum(mask, labels, index=np.arange(1, n + 1))
    slices = ndi.find_objects(labels)
    coms = ndi.center_of_mass(mask, labels, index=np.arange(1, n + 1))
    for i, (sl, a, c) in enumerate(zip(slices, areas, coms), start=1):
        if sl is None or a < p.min_area:
            continue
        ys, xs = sl
        comps.append(Component(i, (xs.start, ys.start, xs.stop, ys.stop), int(a), (float(c[1]), float(c[0]))))
    return labels, comps


def label_at(labels: np.ndarray, x: int, y: int, radius: int = 25) -> int:
    """Label under (x, y); falls back to the nearest labelled pixel in a radius."""
    h, w = labels.shape
    x = int(np.clip(x, 0, w - 1))
    y = int(np.clip(y, 0, h - 1))
    if labels[y, x]:
        return int(labels[y, x])
    y0, y1 = max(0, y - radius), min(h, y + radius + 1)
    x0, x1 = max(0, x - radius), min(w, x + radius + 1)
    win = labels[y0:y1, x0:x1]
    ys, xs = np.nonzero(win)
    if len(ys) == 0:
        return 0
    d = (ys + y0 - y) ** 2 + (xs + x0 - x) ** 2
    k = int(np.argmin(d))
    return int(win[ys[k], xs[k]])


def cut_sprite(
    rgb: np.ndarray,
    labels: np.ndarray,
    label_ids: list[int],
    p: SheetParams,
    clip: tuple[int, int, int, int] | None = None,
) -> tuple[Image.Image, tuple[int, int]] | None:
    """Cut the union of ``label_ids`` into a trimmed RGBA image.

    Returns the image and its top-left origin in sheet pixels.
    """
    region = np.isin(labels, label_ids)
    if clip is not None:
        x0, y0, x1, y1 = clip
        box = np.zeros_like(region)
        box[y0:y1, x0:x1] = True
        region &= box
    if not region.any():
        return None
    ys, xs = np.nonzero(region)
    h, w = region.shape
    bx0, bx1 = max(0, xs.min() - p.pad), min(w, xs.max() + 1 + p.pad)
    by0, by1 = max(0, ys.min() - p.pad), min(h, ys.max() + 1 + p.pad)
    sub = rgb[by0:by1, bx0:bx1].astype(np.float32)
    reg = region[by0:by1, bx0:bx1]
    v = value_channel(sub)
    a = soft_alpha(v, p)

    # Opaque interior: fill small enclosed dark holes (dark metal, shadows)
    # but keep large enclosed gaps (ladder rungs, truss windows) transparent.
    solid = (v > p.t_mask) & reg
    filled = ndi.binary_fill_holes(solid)
    holes = filled & ~solid
    body = solid.copy()
    if holes.any() and p.fill_holes_max > 0:
        hl, hn = ndi.label(holes)
        sizes = ndi.sum(holes, hl, index=np.arange(1, hn + 1))
        keep = np.zeros(hn + 1, dtype=bool)
        keep[1:] = sizes <= p.fill_holes_max
        body |= keep[hl]
    # Everything 2 px inside the object body is fully opaque; only the outer
    # rim keeps the luminance feathering.
    core = ndi.binary_erosion(body, iterations=2)
    a = np.maximum(a, core.astype(np.float32))
    a *= reg.astype(np.float32)

    # Trim to where alpha actually exists.
    nz = np.nonzero(a > 0.02)
    if len(nz[0]) == 0:
        return None
    ty0, ty1 = max(0, nz[0].min() - p.pad), min(a.shape[0], nz[0].max() + 1 + p.pad)
    tx0, tx1 = max(0, nz[1].min() - p.pad), min(a.shape[1], nz[1].max() + 1 + p.pad)
    sub = sub[ty0:ty1, tx0:tx1]
    a = a[ty0:ty1, tx0:tx1]
    out = np.dstack([np.clip(sub, 0, 255), np.clip(a * 255.0, 0, 255)]).astype(np.uint8)
    return Image.fromarray(out, "RGBA"), (bx0 + tx0, by0 + ty0)


def fit_max_side(im: Image.Image, max_side: int) -> Image.Image:
    w, h = im.size
    s = max(w, h)
    if s <= max_side:
        return im
    k = max_side / s
    return im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.Resampling.LANCZOS)
