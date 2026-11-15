"""
Verified physical constants, NASA reference spectral bands, DTMF pairs,
and educational concept guides for all 8 spectral minigames.

Sources follow docs/06-datos-nasa.md and NIST / ITU-T Q.23 standards.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

# Physical constants (CODATA 2018 / NIST, matching docs/06-datos-nasa.md)
WIEN_DISPLACEMENT_NM_K: float = 2_897_771.955  # nm * K
PLANCK_H_J_S: float = 6.62607015e-34
BOLTZMANN_K_J_K: float = 1.380649e-23
SPEED_OF_LIGHT_M_S: float = 299_792_458.0

# NIST Atomic Emission / Absorption lines (nm)
STELLAR_LINES_NM: dict[str, dict[str, Any]] = {
    "H-alpha": {"wavelength_nm": 656.28, "element": "Hydrogen (Balmer)", "source": "NIST ASD"},
    "H-beta": {"wavelength_nm": 486.13, "element": "Hydrogen (Balmer)", "source": "NIST ASD"},
    "H-gamma": {"wavelength_nm": 434.05, "element": "Hydrogen (Balmer)", "source": "NIST ASD"},
    "Na-D1": {"wavelength_nm": 589.59, "element": "Sodium", "source": "NIST ASD"},
    "Na-D2": {"wavelength_nm": 588.99, "element": "Sodium", "source": "NIST ASD"},
    "Ca-II-K": {"wavelength_nm": 393.37, "element": "Ionized Calcium", "source": "NIST ASD"},
    "He-I": {"wavelength_nm": 587.56, "element": "Helium", "source": "NIST ASD"},
    "O-III": {"wavelength_nm": 500.68, "element": "Doubly Ionized Oxygen", "source": "NIST ASD"},
}

# FTIR Mineral & Astrobiology reference wavenumbers (cm^-1)
FTIR_BANDS_CM1: dict[str, dict[str, Any]] = {
    "Amide-I-BetaSheet": {"center_cm1": 1632.0, "width": 14.0, "molecule": "Protein Beta-Sheet"},
    "Amide-I-AlphaHelix": {"center_cm1": 1654.0, "width": 13.0, "molecule": "Protein Alpha-Helix"},
    "Amide-I-BetaTurn": {"center_cm1": 1676.0, "width": 12.0, "molecule": "Protein Beta-Turn"},
    "Hydrated-Clay-OH": {"center_cm1": 3620.0, "width": 28.0, "molecule": "Phyllosilicate O-H Stretch (CRISM/OVIRS)"},
    "Bound-Water-H2O": {"center_cm1": 1630.0, "width": 24.0, "molecule": "Molecular H2O Bending"},
    "Carbonate-CO3": {"center_cm1": 1435.0, "width": 32.0, "molecule": "Carbonate Matrix (Bennu/Mars)"},
    "Silicate-SiO": {"center_cm1": 1045.0, "width": 38.0, "molecule": "Silicate Si-O-Si Framework"},
    "Carbonyl-C=O": {"center_cm1": 1720.0, "width": 18.0, "molecule": "Organic Carbonyl"},
}

# Mission-calibrated target chemical/spectral presets
MISSION_ARCHETYPE_PRESETS: dict[str, dict[str, Any]] = {
    "artemis_moon": {
        "mission_name": "Artemis Lunar South Pole (LRO / Diviner / LAMP)",
        "primary_game": "detectives_luz",
        "wave1_games": ["detectives_luz", "cazadores_estrellas", "mision_foton"],
        "ftir_targets": ["Hydrated-Clay-OH", "Silicate-SiO", "Bound-Water-H2O"],
        "blackbody_targets_k": [110.0, 260.0, 390.0],  # Polar PSR vs illuminated regolith
        "telemetry_pin": "1409",
    },
    "asteroid_hunter": {
        "mission_name": "Asteroid Sample Return (OSIRIS-REx / OVIRS / OTES)",
        "primary_game": "bioespectro",
        "wave1_games": ["bioespectro", "ladron_colores", "ecoespectro"],
        "ftir_targets": ["Hydrated-Clay-OH", "Carbonate-CO3", "Carbonyl-C=O", "Silicate-SiO"],
        "blackbody_targets_k": [240.0, 310.0, 355.0],
        "telemetry_pin": "7382",
    },
    "mars_sample_return": {
        "mission_name": "Mars Sample Return & Reconnaissance (MRO / CRISM / MCS)",
        "primary_game": "bioespectro",
        "wave1_games": ["bioespectro", "cazadores_estrellas", "ecoespectro"],
        "ftir_targets": ["Amide-I-BetaSheet", "Amide-I-AlphaHelix", "Carbonate-CO3", "Hydrated-Clay-OH"],
        "blackbody_targets_k": [185.0, 225.0, 290.0],
        "telemetry_pin": "9042",
    },
}

# ITU-T Q.23 DTMF Tone Matrix (Hz)
DTMF_FREQUENCIES: dict[str, tuple[float, float]] = {
    "1": (697.0, 1209.0),
    "2": (697.0, 1336.0),
    "3": (697.0, 1477.0),
    "A": (697.0, 1633.0),
    "4": (770.0, 1209.0),
    "5": (770.0, 1336.0),
    "6": (770.0, 1477.0),
    "B": (770.0, 1633.0),
    "7": (852.0, 1209.0),
    "8": (852.0, 1336.0),
    "9": (852.0, 1477.0),
    "C": (852.0, 1633.0),
    "*": (941.0, 1209.0),
    "0": (941.0, 1336.0),
    "#": (941.0, 1477.0),
    "D": (941.0, 1633.0),
}

# Optical Cauchy dispersion constants for Mission Photon (wavelength in micrometers)
OPTICAL_MEDIA_CAUCHY: dict[str, dict[str, float]] = {
    "Fused Silica (Space Window)": {"A": 1.458, "B": 0.00354},
    "Crown Glass (BK7)": {"A": 1.5046, "B": 0.00420},
    "Sapphire Lens (Al2O3)": {"A": 1.754, "B": 0.00610},
}

# Educational Metadata for all 8 games so players never feel lost
EDUCATIONAL_GUIDES: dict[str, dict[str, Any]] = {
    "cazadores_estrellas": {
        "title": "Star Hunters: Atomic Spectral Fingerprints",
        "concept_summary": (
            "Hot atoms in stars and plumes emit or absorb exact photon wavelengths "
            "(like Hydrogen H-alpha at 656.3 nm). Finding peak centers identifies the elements!"
        ),
        "how_to_read_chart": (
            "X-axis shows wavelength in nanometers (nm). Y-axis shows light intensity. "
            "Sharp upward spikes are real atomic emission lines; smooth humps are continuum background."
        ),
        "component_guide": {
            "Baseline Clean": "Strips away glowing continuum haze so atomic lines stand tall.",
            "Peak Marker": "Click directly on the sharp peak tips to match NIST element lines.",
            "GaussAmp Fit": "Measures exact center wavelength even when two lines overlap.",
        },
        "step_by_step_hint": [
            "1. Notice the gently sloped thermal background under the narrow spikes.",
            "2. Mark the sharpest peak maxima along the X-axis (nm).",
            "3. Compare your peaks against Hydrogen, Sodium, and Calcium reference markers.",
        ],
    },
    "detectives_luz": {
        "title": "Light Detectives: Wien's Law & Surface Temperature",
        "concept_summary": (
            "Every planetary surface glows with infrared/optical heat following Planck's Law. "
            "Hotter surfaces peak at shorter wavelengths: lambda_max * T = 2,897,772 nm*K."
        ),
        "how_to_read_chart": (
            "X-axis is wavelength (nm) and Y-axis is radiant intensity. The single broad dome peak "
            "pinpoints the surface temperature using Wien's Displacement Law."
        ),
        "component_guide": {
            "Dome Peak Marker": "Click the highest crest of the Planck thermal curve.",
            "Temperature Gauge": "Converts peak wavelength directly into Kelvin surface temperature.",
        },
        "step_by_step_hint": [
            "1. Locate the single smooth crest of the thermal radiance curve.",
            "2. Mark that peak wavelength in nanometers (nm).",
            "3. Verify whether the target crater is cryogenic (< 120 K) or sunlit.",
        ],
    },
    "ecoespectro": {
        "title": "EcoSpectrum: Planetary Surface Spectral Indices",
        "concept_summary": (
            "Spacecraft like MRO CRISM and Landsat combine reflectance at Red, NIR, and SWIR bands "
            "(such as NDVI and hydrated mineral ratios) to map water, clay, and organics from orbit."
        ),
        "how_to_read_chart": (
            "X-axis shows wavelength (nm) across visible & near-infrared; Y-axis shows Reflectance (0 to 1). "
            "Dips reveal absorbed molecules; high NIR shelves indicate reflective structure."
        ),
        "component_guide": {
            "Diagnostic Dip/Peak Selector": "Mark the key absorption bands (e.g. 670 nm Red, 860 nm NIR, 1900 nm H2O).",
            "Index Readout": "Computes normalized difference (B2 - B1) / (B2 + B1) in real time.",
        },
        "step_by_step_hint": [
            "1. Scan the reflectance spectrum for diagnostic troughs and bright reflectance shoulders.",
            "2. Mark the required wavelength bands highlighted in the target mineral brief.",
            "3. Confirm the mineral or moisture signature above threshold.",
        ],
    },
    "laboratorio_musical": {
        "title": "Harmonic Lab: Spacecraft Acoustic Telemetry",
        "concept_summary": (
            "A vibrating rocket nozzle or reaction wheel produces a fundamental frequency f0 plus integer "
            "overtones (2*f0, 3*f0...). Separating true harmonics from thruster rumble prevents resonance failure."
        ),
        "how_to_read_chart": (
            "X-axis is Frequency in Hertz (Hz); Y-axis is vibration Intensity. Spaced peaks at "
            "1x, 2x, and 3x multiples reveal the harmonic signature."
        ),
        "component_guide": {
            "Harmonic Finder": "Click the tall regularly spaced harmonic peaks above the noise floor.",
            "Baseline Filter": "Subtracts low-frequency structural hum before peak picking.",
        },
        "step_by_step_hint": [
            "1. Identify the leftmost tall fundamental peak (f0) in Hz.",
            "2. Locate its integer overtone harmonics (2*f0, 3*f0) to the right.",
            "3. Mark each harmonic crest while ignoring low jitter noise.",
        ],
    },
    "mision_foton": {
        "title": "Photon Mission: Snell Dispersion & Optical Filters",
        "concept_summary": (
            "Glass and sapphire bend shorter blue wavelengths more strongly than red (Cauchy dispersion). "
            "Tuning spectrometer optics requires aligning transmitted peak bands accurately."
        ),
        "how_to_read_chart": (
            "X-axis is Wavelength (nm); Y-axis is Transmittance (%T). Passbands rise close to 100%T, "
            "letting science light reach the detector."
        ),
        "component_guide": {
            "Passband Marker": "Select the peaks where optical transmission reaches maximum.",
            "Variable Switch": "Toggle between %T and Absorbance without losing peak position.",
        },
        "step_by_step_hint": [
            "1. Check that Y-axis shows %T (Transmittance peaks go upward).",
            "2. Mark the center wavelength of each transmitted calibration filter band.",
            "3. Avoid the narrow background absorption notch between bands.",
        ],
    },
    "bioespectro": {
        "title": "BioSpectrum: FTIR Deconvolution Lab",
        "concept_summary": (
            "Real spacecraft FTIR spectra mix water vapor, carbonates, and organics into overlapping domes "
            "resting on a tilted baseline. Chemists run Baseline -> Crop -> Voigt Deconvolution to isolate molecules!"
        ),
        "how_to_read_chart": (
            "X-axis is Wavenumber (cm^-1). Y-axis is Absorbance (A). Broad domes often hide 2-3 overlapping "
            "sub-bands revealed by mathematical Voigt fitting."
        ),
        "component_guide": {
            "1. Baseline (Rubberband)": "Removes instrument slope first (required before Crop/Model!).",
            "2. Region Crop": "Zooms cleanly around the molecular window of interest.",
            "3. Voigt Fit & Peak Marks": "Splits blended peaks into true molecular band centers.",
        },
        "step_by_step_hint": [
            "1. Follow the scientific order: Baseline -> Crop -> Peak/Voigt Deconvolution.",
            "2. Look at the deconvolved sub-band markers on the corrected absorbance curve.",
            "3. Mark the hidden band centers matching OH, Carbonate, or Amide-I signatures.",
        ],
    },
    "ladron_colores": {
        "title": "Color Thief: Chromatic Filter Reconstruction",
        "concept_summary": (
            "When one camera color filter fails in deep space, astronauts reconstruct lost RGB channels "
            "using transmittance windows across Blue (~450 nm), Green (~535 nm), and Red (~640 nm)."
        ),
        "how_to_read_chart": (
            "X-axis is Wavelength (nm); Y-axis is Filter Transmittance (%T). Broad RGB Gaussian lobes show "
            "which color wavelengths pass through the damaged optical wheel."
        ),
        "component_guide": {
            "Channel Peak Selector": "Mark the center wavelengths of the intact optical channels.",
            "Filter Diagnostic": "Identifies which missing RGB notch needs digital compensation.",
        },
        "step_by_step_hint": [
            "1. Spot the wide color filter passbands across the 400-700 nm visible range.",
            "2. Mark each clear passband crest along the X-axis.",
            "3. Notice which RGB wavelength region fell silent.",
        ],
    },
    "espectro_hacker": {
        "title": "Spectrum Hacker: Telemetry Anomaly & DTMF Decoder",
        "concept_summary": (
            "Each Deep Space Network keypad symbol transmits a Dual-Tone Multi-Frequency (DTMF) pair of one "
            "low frequency (697-941 Hz) and one high frequency (1209-1633 Hz). Solar drift and pixel glitches try to fool you!"
        ),
        "how_to_read_chart": (
            "X-axis is Frequency (Hz); Y-axis is Signal Intensity. Two broad-base DTMF tones sit atop a slow solar "
            "drift, while cosmic-ray glitches appear as razor-thin 1-sample vertical spikes."
        ),
        "component_guide": {
            "Baseline Removal": "Flattens solar-wind signal drift so the two true tones emerge.",
            "Glitch Tracker (d2y/dx2)": "Flags sharp single-point spikes so you don't mistake radiation noise for DTMF.",
            "DTMF Pair Lookup": "Matches [Low Hz, High Hz] directly to the keypad character.",
        },
        "step_by_step_hint": [
            "1. Ignore narrow 1-point cosmic-ray spikes flagged by the d^2y/dx^2 glitch tracker.",
            "2. Read the two genuine DTMF tone peaks in Hz (one below 1000 Hz, one above 1200 Hz).",
            "3. Match the pair on the ITU-T Q.23 keypad grid to unlock telemetry!",
        ],
    },
}


@dataclass(frozen=True)
class SpectralGameSpec:
    """Catalog descriptor pairing each minigame ID with physics axes and roles."""

    game_id: str
    default_unit: str
    default_variable: str
    default_tolerance: float
    minigame_slot_hint: str
