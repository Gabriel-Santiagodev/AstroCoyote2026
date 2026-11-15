"""
Spectral puzzle & real-spectrum challenge generator for all 8 Space Apps games.

Core design:
1. Synthesizes physically grounded spectra built with ``Vector`` and analyzed
   through ``AnalizadorFTIR`` and analytical peak ``Models``.
2. Seamlessly plugs into real experimental CSV spectra (``cargar_espectro_csv``)
   when a real NASA/lab file path or ``datos_reales/`` sample is supplied.
3. Enforces a <= 500 point visualization payload and bundles step-by-step
   educational context so players always understand axes, tools, and NASA science.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np

from ...logica.Analizador import AnalizadorFTIR
from ...logica.modelos import Models, gauss_amp, lorentziana, psd_voigt1, simular_espectro_bandas
from ...logica.proyecto import Plantilla, cargar_espectro_csv
from ...logica.vector import Vector
from .biblioteca import (
    DTMF_FREQUENCIES,
    EDUCATIONAL_GUIDES,
    FTIR_BANDS_CM1,
    MISSION_ARCHETYPE_PRESETS,
    OPTICAL_MEDIA_CAUCHY,
    PLANCK_H_J_S,
    BOLTZMANN_K_J_K,
    SPEED_OF_LIGHT_M_S,
    STELLAR_LINES_NM,
    WIEN_DISPLACEMENT_NM_K,
)

DIFFICULTY_PROFILES: dict[str, dict[str, float]] = {
    "easy": {"noise": 0.012, "baseline_slope": 0.12, "glitches": 1, "tolerance": 18.0},
    "medium": {"noise": 0.025, "baseline_slope": 0.24, "glitches": 2, "tolerance": 15.0},
    "hard": {"noise": 0.042, "baseline_slope": 0.38, "glitches": 3, "tolerance": 12.0},
}

DEFAULT_REAL_DATA_DIR = Path(__file__).resolve().parent.parent / "datos_reales"


def _seed_rng(seed: int | None) -> np.random.Generator:
    return np.random.default_rng(seed) if seed is not None else np.random.default_rng()


def _difficulty_cfg(difficulty: str) -> dict[str, float]:
    return DIFFICULTY_PROFILES.get(difficulty.lower().strip(), DIFFICULTY_PROFILES["medium"])


def _build_educational_block(game_id: str, mission_id: str, extra_note: str = "") -> dict[str, Any]:
    preset = MISSION_ARCHETYPE_PRESETS.get(
        mission_id, MISSION_ARCHETYPE_PRESETS["mars_sample_return"]
    )
    guide = EDUCATIONAL_GUIDES.get(game_id, EDUCATIONAL_GUIDES["bioespectro"])
    return {
        "title": guide["title"],
        "mission_context": preset["mission_name"],
        "concept_summary": guide["concept_summary"],
        "how_to_read_chart": guide["how_to_read_chart"],
        "component_guide": guide["component_guide"],
        "step_by_step_hint": guide["step_by_step_hint"],
        "extra_note": extra_note,
    }


def _pack_vector_challenge(
    game_id: str,
    mission_id: str,
    difficulty: str,
    raw_vec: Vector,
    expected_peaks: list[float],
    tolerance: float,
    candidate_labels: list[dict[str, Any]] | None = None,
    clean_vec: Vector | None = None,
    deconv_preview: dict[str, Any] | None = None,
    extra_fields: dict[str, Any] | None = None,
    data_source: str = "synthetic_nasa_model",
    extra_note: str = "",
) -> dict[str, Any]:
    """Standardize any spectral challenge for the frontend charting engine (<= 500 pts)."""
    baseline_vec = AnalizadorFTIR.lineaBase(raw_vec, modelo="rubberband")
    corrected_vec = clean_vec or AnalizadorFTIR.ajustarLineaBase(raw_vec, modelo="rubberband")
    tracker = AnalizadorFTIR.Tracker(raw_vec)

    payload: dict[str, Any] = {
        "archetype": game_id,
        "mission_id": mission_id,
        "difficulty": difficulty,
        "data_source": data_source,
        "x_unit": raw_vec.unidadX,
        "y_label": raw_vec.variable,
        "points": raw_vec.to_points(max_points=500),
        "baseline_points": baseline_vec.to_points(max_points=250),
        "corrected_points": corrected_vec.to_points(max_points=500),
        "expected_peaks": [round(float(p), 4) for p in expected_peaks],
        "tolerance": float(tolerance),
        "detected_peaks": [round(float(raw_vec.x[i]), 4) for i in raw_vec.idxPeaks],
        "glitch_tracker": tracker,
        "candidate_labels": candidate_labels or [],
        "deconvolution_preview": deconv_preview,
        "workflow_rules": {
            "order": ["baseline", "region", "modelo"],
            "out_of_order_penalty_pts": 3.0,
            "sample_applied_baseline": corrected_vec.baseline_applied,
        },
        "educational_guide": _build_educational_block(game_id, mission_id, extra_note=extra_note),
    }
    if extra_fields:
        payload.update(extra_fields)
    return payload


def generar_cazadores_estrellas(
    mission_id: str = "mars_sample_return",
    difficulty: str = "medium",
    seed: int | None = None,
) -> dict[str, Any]:
    """Game 1: Stellar / Plume Atomic Emission Spectrum (nm, Intensidad)."""
    cfg = _difficulty_cfg(difficulty)
    rng = _seed_rng(seed)

    line_keys = ["H-alpha", "H-beta", "Na-D1", "O-III", "H-gamma"]
    n_lines = 3 if difficulty == "easy" else (4 if difficulty == "medium" else 5)
    chosen = line_keys[:n_lines]
    redshift = 0.0 if difficulty == "easy" else round(float(rng.uniform(-2.0, 4.5)), 2)

    x = np.linspace(380.0, 700.0, 900)
    band_params = []
    expected_peaks = []
    labels = []
    for k in chosen:
        ref = STELLAR_LINES_NM[k]
        shifted = float(ref["wavelength_nm"]) + redshift
        amp = float(rng.uniform(0.65, 1.15))
        sigma = 2.4 if difficulty == "hard" else 3.0
        band_params.append((amp, shifted, sigma))
        expected_peaks.append(shifted)
        labels.append(
            {
                "name": k,
                "element": ref["element"],
                "rest_wavelength_nm": ref["wavelength_nm"],
                "shifted_wavelength_nm": round(shifted, 2),
                "source": ref["source"],
            }
        )

    continuum = 0.08 + cfg["baseline_slope"] * 0.4 * np.exp(-((x - 510.0) / 140.0) ** 2)
    sim = simular_espectro_bandas(
        x, gauss_amp, band_params, noise_std=cfg["noise"], baseline=continuum, rng=rng
    )
    raw_vec = Vector(
        x=x,
        y=np.asarray(sim["y_total"]),
        variable="Intensidad",
        unidadX="nm",
        prominence=0.14,
        distance_x=12.0,
        label="Star/Plume Emission Spectrum",
    )
    clean_vec = AnalizadorFTIR.ajustarLineaBase(raw_vec, modelo="rubberband")
    return _pack_vector_challenge(
        game_id="cazadores_estrellas",
        mission_id=mission_id,
        difficulty=difficulty,
        raw_vec=raw_vec,
        clean_vec=clean_vec,
        expected_peaks=expected_peaks,
        tolerance=max(8.0, cfg["tolerance"] * 0.75),
        candidate_labels=labels,
        extra_fields={"doppler_shift_nm": redshift},
        extra_note=(
            f"Observed Doppler shift: {redshift:+.2f} nm relative to NIST laboratory rest frames."
            if redshift != 0.0
            else "Zero Doppler shift calibration target."
        ),
    )


def generar_detectives_luz(
    mission_id: str = "artemis_moon",
    difficulty: str = "medium",
    seed: int | None = None,
) -> dict[str, Any]:
    """Game 2: Planck Blackbody Radiance & Wien's Law (nm, Intensidad)."""
    cfg = _difficulty_cfg(difficulty)
    rng = _seed_rng(seed)

    temps = MISSION_ARCHETYPE_PRESETS.get(
        mission_id, MISSION_ARCHETYPE_PRESETS["artemis_moon"]
    )["blackbody_targets_k"]
    temp_k = float(rng.choice(temps))
    # Map target temperature to visible-SWIR or thermal IR window cleanly
    wien_peak_nm = WIEN_DISPLACEMENT_NM_K / temp_k
    x_min = max(1500.0, wien_peak_nm * 0.35)
    x_max = wien_peak_nm * 2.4
    x = np.linspace(x_min, x_max, 800)

    # Exact Planck radiance normalized to peak = 1.0
    lam_m = x * 1e-9
    exponent = np.clip((PLANCK_H_J_S * SPEED_OF_LIGHT_M_S) / (lam_m * BOLTZMANN_K_J_K * temp_k), 1e-4, 500.0)
    planck_raw = 1.0 / ((lam_m ** 5) * np.expm1(exponent))
    planck_norm = planck_raw / max(float(np.max(planck_raw)), 1e-12)
    y_noisy = planck_norm + cfg["noise"] * 0.5 * rng.normal(size=len(x))

    raw_vec = Vector(
        x=x,
        y=y_noisy,
        variable="Intensidad",
        unidadX="nm",
        prominence=0.15,
        distance_x=(x_max - x_min) * 0.15,
        label=f"Planck Thermal Radiance (~{temp_k:.0f} K)",
    )
    return _pack_vector_challenge(
        game_id="detectives_luz",
        mission_id=mission_id,
        difficulty=difficulty,
        raw_vec=raw_vec,
        clean_vec=raw_vec,
        expected_peaks=[round(wien_peak_nm, 2)],
        tolerance=(x_max - x_min) * 0.05,
        candidate_labels=[
            {
                "name": "Wien Peak",
                "expected_wavelength_nm": round(wien_peak_nm, 2),
                "temperature_k": round(temp_k, 1),
                "formula": "lambda_max = 2,897,772 nm*K / T",
            }
        ],
        extra_fields={"target_temperature_k": round(temp_k, 1)},
        extra_note=f"Use Wien's Law: 2,897,772 / {round(wien_peak_nm, 1)} nm = {temp_k:.0f} K surface temperature.",
    )


def generar_ecoespectro(
    mission_id: str = "mars_sample_return",
    difficulty: str = "medium",
    seed: int | None = None,
) -> dict[str, Any]:
    """Game 3: Planetary Multispectral Reflectance & Spectral Indices (nm, Reflectancia)."""
    cfg = _difficulty_cfg(difficulty)
    rng = _seed_rng(seed)
    x = np.linspace(450.0, 2400.0, 900)

    # Mineral reflectance continuum with water/clay absorption troughs and NIR reflectance shelf
    continuum = 0.52 - 0.08 * ((x - 450.0) / 1950.0)
    nir_shelf = 0.22 / (1.0 + np.exp(-(x - 730.0) / 22.0))
    clay_1400 = -0.18 * np.exp(-((x - 1410.0) / 28.0) ** 2)
    h2o_1900 = -0.26 * np.exp(-((x - 1920.0) / 36.0) ** 2)
    clay_2200 = -0.19 * np.exp(-((x - 2205.0) / 24.0) ** 2)
    y = np.clip(
        continuum + nir_shelf + clay_1400 + h2o_1900 + clay_2200 + rng.normal(0.0, cfg["noise"] * 0.25, len(x)),
        0.02,
        0.98,
    )

    # Invert for peak markers on pseudo-absorbance OR focus on diagnostic reflectance shoulders/bands
    red_val = float(y[int(np.argmin(np.abs(x - 670.0)))])
    nir_val = float(y[int(np.argmin(np.abs(x - 860.0)))])
    swir_val = float(y[int(np.argmin(np.abs(x - 1920.0)))])
    ndvi = (nir_val - red_val) / max(1e-6, nir_val + red_val)
    hydrated_idx = (nir_val - swir_val) / max(1e-6, nir_val + swir_val)

    raw_vec = Vector(
        x=x,
        y=y,
        variable="Reflectancia",
        unidadX="nm",
        prominence=0.05,
        distance_x=120.0,
        label="Orbital VNIR/SWIR Reflectance",
    )
    abs_vec = raw_vec.mutar(nueva_variable="Absorbancia")
    expected_bands = [1410.0, 1920.0, 2205.0] if difficulty != "easy" else [1920.0, 2205.0]

    return _pack_vector_challenge(
        game_id="ecoespectro",
        mission_id=mission_id,
        difficulty=difficulty,
        raw_vec=raw_vec,
        clean_vec=abs_vec,
        expected_peaks=expected_bands,
        tolerance=45.0,
        candidate_labels=[
            {"name": "OH Hydration Band", "wavelength_nm": 1410.0},
            {"name": "Bound H2O Trough", "wavelength_nm": 1920.0},
            {"name": "Phyllosilicate Al-OH Clay", "wavelength_nm": 2205.0},
        ],
        extra_fields={
            "indices": {
                "ndvi_equivalent": round(ndvi, 3),
                "hydration_index": round(hydrated_idx, 3),
            }
        },
        extra_note="Notice how converting Reflectance -> Pseudo-Absorbance (-log10 R) turns downward troughs into sharp diagnostic peaks!",
    )


def generar_laboratorio_musical(
    mission_id: str = "artemis_moon",
    difficulty: str = "medium",
    seed: int | None = None,
) -> dict[str, Any]:
    """Game 4: Acoustic Harmonic Telemetry in Hz (fundamental f0 + overtones)."""
    cfg = _difficulty_cfg(difficulty)
    rng = _seed_rng(seed)

    f0 = float(rng.choice([180.0, 220.0, 260.0, 310.0]))
    n_harmonics = 3 if difficulty == "easy" else 4
    expected = [f0 * k for k in range(1, n_harmonics + 1)]

    x = np.linspace(50.0, f0 * (n_harmonics + 1.2), 950)
    params = [(1.0 / (0.65 * k + 0.35), f0 * k, 9.0) for k in range(1, n_harmonics + 1)]
    hum = cfg["baseline_slope"] * 0.45 * np.exp(-x / 320.0)
    sim = simular_espectro_bandas(
        x, lorentziana, params, noise_std=cfg["noise"], baseline=hum, rng=rng
    )
    # Normalize intensity cleanly
    y_arr = np.asarray(sim["y_total"])
    y_arr = y_arr / max(float(np.max(y_arr)), 1e-6)

    raw_vec = Vector(
        x=x,
        y=y_arr,
        variable="Intensidad",
        unidadX="Hz",
        prominence=0.12,
        distance_x=f0 * 0.45,
        label="Thruster & Structural Acoustic Spectrum",
    )
    return _pack_vector_challenge(
        game_id="laboratorio_musical",
        mission_id=mission_id,
        difficulty=difficulty,
        raw_vec=raw_vec,
        expected_peaks=expected,
        tolerance=22.0,
        candidate_labels=[
            {"name": f"Harmonic f{k}", "frequency_hz": round(f0 * k, 1)}
            for k in range(1, n_harmonics + 1)
        ],
        extra_fields={"fundamental_hz": f0},
        extra_note=f"Fundamental frequency f0 = {f0:.0f} Hz; integer harmonics occur at 2*f0, 3*f0...",
    )


def generar_mision_foton(
    mission_id: str = "artemis_moon",
    difficulty: str = "medium",
    seed: int | None = None,
) -> dict[str, Any]:
    """Game 5: Optical Cauchy Dispersion & Passband Filter Alignment (nm, Transmitancia)."""
    cfg = _difficulty_cfg(difficulty)
    rng = _seed_rng(seed)
    x = np.linspace(380.0, 760.0, 800)

    medium_name = rng.choice(list(OPTICAL_MEDIA_CAUCHY.keys()))
    cauchy = OPTICAL_MEDIA_CAUCHY[str(medium_name)]
    n_curve = cauchy["A"] + cauchy["B"] / ((x / 1000.0) ** 2)

    centers = [455.0, 560.0, 650.0] if difficulty != "easy" else [470.0, 620.0]
    y_trans = np.full_like(x, 8.0)
    for c in centers:
        y_trans += 84.0 * np.exp(-((x - c) ** 2) / (2.0 * 14.0 ** 2))
    y_trans = np.clip(y_trans + rng.normal(0.0, cfg["noise"] * 35.0, len(x)), 1.0, 99.5)

    raw_vec = Vector(
        x=x,
        y=y_trans,
        variable="Transmitancia",
        unidadX="nm",
        prominence=12.0,
        distance_x=50.0,
        label=f"{medium_name} Passbands (%T)",
    )
    abs_vec = raw_vec.mutar(nueva_variable="Absorbancia")
    return _pack_vector_challenge(
        game_id="mision_foton",
        mission_id=mission_id,
        difficulty=difficulty,
        raw_vec=raw_vec,
        clean_vec=abs_vec,
        expected_peaks=centers,
        tolerance=16.0,
        candidate_labels=[
            {
                "name": f"Optical Channel {idx+1}",
                "wavelength_nm": c,
                "refractive_index": round(float(n_curve[int(np.argmin(np.abs(x - c)))]), 4),
            }
            for idx, c in enumerate(centers)
        ],
        extra_fields={"optical_medium": str(medium_name), "cauchy_A": cauchy["A"], "cauchy_B": cauchy["B"]},
        extra_note=f"Dispersion medium: {medium_name} (blue bends stronger than red via n(lambda) = A + B/lambda^2).",
    )


def generar_bioespectro(
    mission_id: str = "mars_sample_return",
    difficulty: str = "medium",
    seed: int | None = None,
) -> dict[str, Any]:
    """
    Game 6: FTIR Mineral & Amide-I Deconvolution Lab (cm^-1, Absorbancia).

    Directly executes the canonical Plantilla + AnalizadorFTIR workflow:
    1) Synthetic composite overlapping Voigt/Pseudo-Voigt bands + tilted baseline
    2) Plantilla workflow tracking ('baseline' -> 'region' -> 'modelo')
    3) Safe AnalizadorFTIR.Deconvolucion preview returning sub-bands without crashes.
    """
    cfg = _difficulty_cfg(difficulty)
    rng = _seed_rng(seed)

    preset = MISSION_ARCHETYPE_PRESETS.get(
        mission_id, MISSION_ARCHETYPE_PRESETS["mars_sample_return"]
    )
    keys = preset["ftir_targets"]
    if difficulty == "easy":
        selected_keys = keys[:2]
    elif difficulty == "medium":
        selected_keys = keys[:3]
    else:
        selected_keys = keys

    # Build wavenumber window spanning selected targets comfortably
    centers = [float(FTIR_BANDS_CM1[k]["center_cm1"]) for k in selected_keys]
    x_lo = max(400.0, min(centers) - 120.0)
    x_hi = min(4000.0, max(centers) + 120.0)
    x = np.linspace(x_lo, x_hi, 1000)

    band_params = []
    labels = []
    for k in selected_keys:
        meta = FTIR_BANDS_CM1[k]
        amp = float(rng.uniform(0.45, 0.95))
        band_params.append((amp, float(meta["center_cm1"]), float(meta["width"]), 0.45))
        labels.append(
            {
                "name": k,
                "molecule": meta["molecule"],
                "wavenumber_cm1": float(meta["center_cm1"]),
            }
        )

    tilt = cfg["baseline_slope"] * (0.35 + 0.65 * ((x - x_lo) / max(1.0, x_hi - x_lo)))
    sim = simular_espectro_bandas(
        x, psd_voigt1, band_params, noise_std=cfg["noise"], baseline=tilt, rng=rng
    )
    raw_vec = Vector(
        x=x,
        y=np.asarray(sim["y_total"]),
        variable="Absorbancia",
        unidadX="cm-1",
        prominence=0.08,
        distance_x=18.0,
        label="FTIR Mineral / Bio-Signature Sample",
    )

    # Execute full Plantilla-verified pipeline to power interactive preview
    plantilla = Plantilla()
    plantilla.registrar("baseline", "rubberband")
    corr_vec = AnalizadorFTIR.ajustarLineaBase(raw_vec, modelo="rubberband", clip_zero=True)
    plantilla.registrar("region", (x_lo + 20.0, x_hi - 20.0))
    crop_vec = AnalizadorFTIR.Recortar(corr_vec, x_lo + 20.0, x_hi - 20.0)
    plantilla.registrar("modelo", "psd_voigt1")
    deconv = AnalizadorFTIR.Deconvolucion(crop_vec, modelo_nombre="psd_voigt1", target_centers=centers)

    return _pack_vector_challenge(
        game_id="bioespectro",
        mission_id=mission_id,
        difficulty=difficulty,
        raw_vec=raw_vec,
        clean_vec=corr_vec,
        expected_peaks=centers,
        tolerance=max(14.0, cfg["tolerance"] * 1.4),
        candidate_labels=labels,
        deconv_preview=deconv.to_visualization_dict(max_points=350),
        extra_note="Notice how overlapping broad FTIR bands separate cleanly once Baseline -> Crop -> Voigt Deconvolution run in order!",
    )


def generar_ladron_colores(
    mission_id: str = "asteroid_hunter",
    difficulty: str = "medium",
    seed: int | None = None,
) -> dict[str, Any]:
    """Game 7: RGB Chromatic Optical Filter Loss & Reconstruction (nm, Transmitancia)."""
    cfg = _difficulty_cfg(difficulty)
    rng = _seed_rng(seed)
    x = np.linspace(380.0, 720.0, 680)

    rgb_bands = [
        ("Blue Filter (455 nm)", 455.0, 22.0),
        ("Green Filter (535 nm)", 535.0, 24.0),
        ("Red Filter (635 nm)", 635.0, 22.0),
    ]
    missing_idx = int(rng.integers(0, 3))
    y = np.full_like(x, 4.0)
    expected = []
    labels = []
    for idx, (label, center, sigma) in enumerate(rgb_bands):
        if idx == missing_idx:
            labels.append({"name": label, "wavelength_nm": center, "status": "damaged_channel"})
            continue
        y += 82.0 * np.exp(-((x - center) ** 2) / (2.0 * sigma ** 2))
        expected.append(center)
        labels.append({"name": label, "wavelength_nm": center, "status": "intact_channel"})

    y = np.clip(y + rng.normal(0.0, cfg["noise"] * 30.0, len(x)), 0.0, 100.0)
    raw_vec = Vector(
        x=x,
        y=y,
        variable="Transmitancia",
        unidadX="nm",
        prominence=12.0,
        distance_x=40.0,
        label="Camera Optical Filter Wheel (%T)",
    )
    return _pack_vector_challenge(
        game_id="ladron_colores",
        mission_id=mission_id,
        difficulty=difficulty,
        raw_vec=raw_vec,
        expected_peaks=expected,
        tolerance=20.0,
        candidate_labels=labels,
        extra_fields={"missing_channel": rgb_bands[missing_idx][0]},
        extra_note=f"Channel offline: {rgb_bands[missing_idx][0]}. Identify the remaining active filter peaks!",
    )


def generar_espectro_hacker(
    mission_id: str = "mars_sample_return",
    difficulty: str = "medium",
    seed: int | None = None,
) -> dict[str, Any]:
    """
    Game 8: Deep Space Communications / DTMF Dual-Tone + Solar Drift + Glitch Tracker.

    Combines genuine ITU-T Q.23 dual tones (Hz) with slow baseline drift and
    sharp 1-sample radiation glitches detected by ``AnalizadorFTIR.Tracker``.
    """
    cfg = _difficulty_cfg(difficulty)
    rng = _seed_rng(seed)

    if difficulty == "easy":
        key_pool = ["1", "2", "3", "5", "9"]
    elif difficulty == "medium":
        key_pool = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    else:
        key_pool = list(DTMF_FREQUENCIES.keys())

    chosen_key = str(rng.choice(key_pool))
    low_hz, high_hz = DTMF_FREQUENCIES[chosen_key]

    x = np.linspace(550.0, 1800.0, 900)
    drift = cfg["baseline_slope"] * 0.55 * (1.0 - (x - 550.0) / 1250.0)
    sim = simular_espectro_bandas(
        x,
        gauss_amp,
        [(0.88, low_hz, 16.0), (0.94, high_hz, 16.0)],
        noise_std=cfg["noise"] * 0.65,
        baseline=drift,
        rng=rng,
    )
    y = np.asarray(sim["y_total"], dtype=float)

    # Inject sharp non-physical cosmic-ray glitches away from true DTMF peaks
    glitch_positions_hz: list[float] = []
    n_glitches = int(cfg["glitches"])
    candidates = [620.0, 1060.0, 1710.0, 1140.0]
    for g_hz in candidates[:n_glitches]:
        if min(abs(g_hz - low_hz), abs(g_hz - high_hz)) > 85.0:
            g_idx = int(np.argmin(np.abs(x - g_hz)))
            y[g_idx] += 1.35  # 1-sample narrow radiation spike caught by d2y/dx2 Tracker
            glitch_positions_hz.append(round(float(x[g_idx]), 2))

    raw_vec = Vector(
        x=x,
        y=y,
        variable="Intensidad",
        unidadX="Hz",
        prominence=0.18,
        distance_x=95.0,
        distanceDy2_x=30.0,
        label=f"DSN Telemetry Audio Spectrum (Key '{chosen_key}')",
    )
    clean_vec = AnalizadorFTIR.ajustarLineaBase(raw_vec, modelo="rubberband", clip_zero=True)

    return _pack_vector_challenge(
        game_id="espectro_hacker",
        mission_id=mission_id,
        difficulty=difficulty,
        raw_vec=raw_vec,
        clean_vec=clean_vec,
        expected_peaks=[low_hz, high_hz],
        tolerance=25.0,
        candidate_labels=[
            {"name": "Low DTMF Group", "frequency_hz": low_hz},
            {"name": "High DTMF Group", "frequency_hz": high_hz},
        ],
        extra_fields={
            "dtmf_pair_hz": [low_hz, high_hz],
            "expected_key": chosen_key,
            "injected_glitch_hz": glitch_positions_hz,
            "dtmf_keypad": {k: list(v) for k, v in DTMF_FREQUENCIES.items()},
        },
        extra_note="Radiation spikes are only 1 sample wide so d^2y/dx^2 flags them immediately—focus on the real DTMF tone pair!",
    )


def generar_desde_csv_real(
    csv_path: str | Path,
    game_id: str = "bioespectro",
    mission_id: str = "mars_sample_return",
    difficulty: str = "medium",
    crop_range: tuple[float, float] | None = None,
    y_col: int = 1,
    expected_peaks_override: list[float] | None = None,
) -> dict[str, Any]:
    """
    Real-spectrum adapter hook!

    Loads an actual experimental CSV spectrum (e.g. FTIR %T or photoluminescence),
    automatically converts %T -> Absorbance when appropriate, applies Baseline
    removal, optional region crop, and extracts peaks/deconvolution directly via
    ``Vector`` + ``AnalizadorFTIR`` using the exact same frontend visualization schema.
    """
    cfg = _difficulty_cfg(difficulty)
    raw_vec = cargar_espectro_csv(csv_path, y_col=y_col, distance_x=20.0)

    # Convert %T into upward Absorbance peaks for FTIR peak/deconvolution clarity
    work_vec = (
        raw_vec.mutar(nueva_variable="Absorbancia")
        if raw_vec.variable == "Transmitancia"
        else raw_vec
    )
    if crop_range is not None:
        work_vec = AnalizadorFTIR.Recortar(work_vec, crop_range[0], crop_range[1])

    corr_vec = AnalizadorFTIR.ajustarLineaBase(work_vec, modelo="rubberband", clip_zero=True)
    detected_truth = (
        list(expected_peaks_override)
        if expected_peaks_override
        else [float(corr_vec.x[i]) for i in corr_vec.idxPeaks[:6]]
    )
    if not detected_truth:
        detected_truth = [float(corr_vec.x[int(np.argmax(corr_vec.y))])]

    deconv = AnalizadorFTIR.Deconvolucion(
        corr_vec,
        modelo_nombre="psd_voigt1",
        target_centers=detected_truth[:4],
    )
    return _pack_vector_challenge(
        game_id=game_id,
        mission_id=mission_id,
        difficulty=difficulty,
        raw_vec=work_vec,
        clean_vec=corr_vec,
        expected_peaks=detected_truth,
        tolerance=max(15.0, cfg["tolerance"] * 1.5),
        deconv_preview=deconv.to_visualization_dict(max_points=350),
        data_source=f"real_csv:{Path(csv_path).name}",
        extra_note="Loaded directly from real experimental spectral CSV and normalized via Vector + AnalizadorFTIR.",
    )


GAME_GENERATORS = {
    "cazadores_estrellas": generar_cazadores_estrellas,
    "detectives_luz": generar_detectives_luz,
    "ecoespectro": generar_ecoespectro,
    "laboratorio_musical": generar_laboratorio_musical,
    "mision_foton": generar_mision_foton,
    "bioespectro": generar_bioespectro,
    "ladron_colores": generar_ladron_colores,
    "espectro_hacker": generar_espectro_hacker,
}
