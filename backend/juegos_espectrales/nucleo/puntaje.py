"""
Precision/Recall/F1 peak matching, spectral curve similarity, and workflow penalty grading.

Provides deterministic grading for all 8 spectral games, keeping compatibility
with ``adaptadores_web.evaluar_marcas`` while supporting efficiency penalties
from ``Plantilla.puede`` (-3 pts per out-of-order spectroscopy step).
"""
from __future__ import annotations

from typing import Sequence

import numpy as np


def emparejar(
    marcas_usuario: Sequence[float],
    verdad: Sequence[float],
    tolerancia: float = 15.0,
) -> dict[str, object]:
    """
    Greedy bipartite 1-to-1 matching between user-marked X positions and ground truth.

    Returns dict with matched pairs, precision, recall, f1 in [0.0, 1.0],
    and mean positional error among matched peaks.
    """
    user = sorted(float(v) for v in marcas_usuario)
    truth = sorted(float(v) for v in verdad)

    if not truth and not user:
        return {
            "matches": [],
            "tp": 0,
            "fp": 0,
            "fn": 0,
            "precision": 1.0,
            "recall": 1.0,
            "f1": 1.0,
            "mean_abs_error": 0.0,
        }
    if not truth or not user:
        return {
            "matches": [],
            "tp": 0,
            "fp": len(user),
            "fn": len(truth),
            "precision": 0.0,
            "recall": 0.0,
            "f1": 0.0,
            "mean_abs_error": 0.0,
        }

    # Build all candidate pairs within tolerance sorted by distance
    candidates: list[tuple[float, int, int]] = []
    for ui, u_val in enumerate(user):
        for ti, t_val in enumerate(truth):
            dist = abs(u_val - t_val)
            if dist <= tolerancia:
                candidates.append((dist, ui, ti))
    candidates.sort(key=lambda item: item[0])

    used_u: set[int] = set()
    used_t: set[int] = set()
    matches: list[dict[str, float]] = []
    for dist, ui, ti in candidates:
        if ui in used_u or ti in used_t:
            continue
        used_u.add(ui)
        used_t.add(ti)
        matches.append(
            {
                "user_x": round(user[ui], 4),
                "truth_x": round(truth[ti], 4),
                "error_x": round(dist, 4),
            }
        )

    tp = len(matches)
    fp = len(user) - tp
    fn = len(truth) - tp
    precision = tp / len(user)
    recall = tp / len(truth)
    f1 = (2.0 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    mean_err = float(np.mean([m["error_x"] for m in matches])) if matches else 0.0

    return {
        "matches": matches,
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
        "mean_abs_error": round(mean_err, 4),
    }


def cosine_similarity(vec_a: Sequence[float], vec_b: Sequence[float]) -> float:
    """Compute normalized cosine similarity in [0.0, 1.0] between two equal curves."""
    a = np.asarray(vec_a, dtype=float)
    b = np.asarray(vec_b, dtype=float)
    if len(a) != len(b) or len(a) == 0:
        return 0.0
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom <= 1e-12:
        return 0.0
    return round(float(np.clip(np.dot(a, b) / denom, 0.0, 1.0)), 4)


def evaluar_con_penalizacion(
    marcas_usuario: Sequence[float],
    verdad: Sequence[float],
    tolerancia: float = 15.0,
    workflow_penalty_pts: float = 0.0,
) -> dict[str, object]:
    """
    Evaluate F1 peak score and apply ``Plantilla.puede`` efficiency penalties (-3 pts/violation).
    Score is returned on both 0-1 F1 scale and 0-100 calibrated scale.
    """
    metrics = emparejar(marcas_usuario, verdad, tolerancia=tolerancia)
    raw_score_100 = float(metrics["f1"]) * 100.0
    adjusted_score_100 = max(0.0, raw_score_100 - max(0.0, float(workflow_penalty_pts)))
    return {
        **metrics,
        "raw_score_100": round(raw_score_100, 2),
        "workflow_penalty_pts": round(float(workflow_penalty_pts), 2),
        "final_score_100": round(adjusted_score_100, 2),
    }
