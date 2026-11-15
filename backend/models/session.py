"""
Pydantic v2 session, live metrics, flight node & outcome contracts.
Owner: Schoenstadt (Task SCH-01)
See docs/20-roadmap-schoenstadt.md and docs/10-tecnico.md before editing.
"""
from __future__ import annotations

from typing import Any, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator

RoleType = Literal["finance_launch", "spacecraft_mass", "orbit_power", "science_comms"]
DifficultyType = Literal["easy", "medium", "hard"]
MissionIdType = Literal["artemis_moon", "asteroid_hunter", "mars_sample_return"]
GateType = Literal["NODE_1_LAUNCH", "NODE_2_PROPULSION", "NODE_3_EVENT", "NODE_4_DOWNLINK"]
PowerSourceType = Literal["solar_standard", "battery_heavy", "fuel_cell", "rtg_nuclear"]
SpectralGameType = Literal[
    "cazadores_estrellas",
    "detectives_luz",
    "ecoespectro",
    "laboratorio_musical",
    "mision_foton",
    "bioespectro",
    "ladron_colores",
    "espectro_hacker",
]

MISSION_BUDGET_DEFAULTS_USD: dict[str, float] = {
    "artemis_moon": 800_000_000.0,
    "asteroid_hunter": 1_200_000_000.0,
    "mars_sample_return": 2_500_000_000.0,
}


class InstrumentItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str = ""
    mass_kg: float = 0.0

    @model_validator(mode="before")
    @classmethod
    def _coerce_instrument(cls, data: Any) -> Any:
        if isinstance(data, str):
            return {"id": data, "name": data, "mass_kg": 0.0}
        if isinstance(data, dict) and "name" not in data and "id" in data:
            return {**data, "name": str(data["id"])}
        return data


class LiveMetrics(BaseModel):
    """Mirror of frontend/src/types/game.ts LiveMetrics for mutacion_en_vivo."""

    model_config = ConfigDict(extra="ignore")

    estimated_wet_mass_kg: float = 1500.0
    remaining_budget_usd: float = 800_000_000.0
    ufe_reserve_pct: float = 25.0
    funding_factor_F: float = Field(default=0.5, ge=0.0, le=1.0)
    fspl_loss_db: float = 166.0
    cg_balanced: bool = True
    fuel_burn_multiplier: float = 1.0
    available_power_w: float = 600.0
    instruments_mass_kg: float = 0.0
    selected_instruments: list[InstrumentItem] = Field(default_factory=list)
    required_dv_ms: float = 1803.6
    has_thermal_protection: bool = True
    # Challenge resources "Data" and "Time" (2026-11-15), derived in physics_engine.compute_live_metrics.
    data_generated_gbit_day: float = 0.0
    downlink_rate_mbps: float = 0.0
    downlink_hours_needed: float = 0.0
    mission_duration_days: float = 0.0


class MissionSessionConfig(BaseModel):
    """Session & lobby configuration contract for 1-4 players."""

    model_config = ConfigDict(extra="ignore")

    room_pin: str = Field(min_length=4, max_length=12)
    mission_id: MissionIdType = "artemis_moon"
    difficulty: DifficultyType = "easy"
    player_count: int = Field(default=1, ge=1, le=4)
    human_roles: list[RoleType] = Field(default_factory=list)
    ai_roles: list[RoleType] = Field(default_factory=list)
    wave1_spectral_game: SpectralGameType = "cazadores_estrellas"
    wave2_spectral_game: SpectralGameType = "espectro_hacker"


class ConsolidatedMissionState(BaseModel):
    """
    Consolidated state across all 8 minigames (Wave 1 + Wave 2) and 60s flight turns.
    Accepts both canonical fields and individual minigame payload aliases (docs/10-tecnico.md §2).
    """

    model_config = ConfigDict(extra="allow")

    # Mission context (optional helper when validating mission-specific payloads)
    mission_id: Optional[MissionIdType] = None

    # Rol 1: Budgets (Rol1A) + Launch Vehicles (Rol1B)
    budget_limit_usd: float = 800_000_000.0
    budget_engineering_usd: float = 350_000_000.0
    budget_science_usd: float = 200_000_000.0
    subsystems_cost_usd: float = 250_000_000.0
    ufe_reserve_pct: float = 25.0
    funding_factor_F: float = 0.6
    selected_launcher: str = "falcon9_block5"
    launcher_max_mass_kg: float = 4020.0
    fairing_ok: bool = True
    launch_cost_usd: float = 74_000_000.0

    # Rol 2: Spacecraft Design (Rol2A) + Mass & CG (Rol2B)
    dry_mass_kg: float = 373.0
    bus_dry_mass_kg: Optional[float] = None
    assembly_integrity_pct: float = 100.0
    cg_balanced: bool = True
    fuel_burn_multiplier: float = 1.0
    mass_growth_margin_pct: float = 35.0
    ballast_jettisoned_kg: float = 0.0
    has_thermal_protection: bool = True
    has_deorbit_device: bool = True

    # Rol 3: Orbital Constraints (Rol3A) + Power 3D (Rol3B)
    trajectory_choice: str = "standard_sso_700"
    required_dv_ms: float = 1803.6
    isp_seconds: float = 315.0
    propellant_mass_kg: float = 750.0
    max_eclipse_min: float = 35.29
    fspl_loss_db: float = 166.0
    power_source: PowerSourceType = "fuel_cell"
    total_energy_mj: float = 200.0
    power_generation_w: float = 750.0
    battery_reserve_pct: float = 25.0

    # Rol 4: Science + Spectral (Rol4A) + Comms DSN (Rol4B)
    instruments_mass_kg: float = 68.0
    instruments_power_w: float = 67.0
    science_value: float = 85.0
    science_calibration_f1: float = 0.85
    data_generated_gbit: float = 115.0
    downlink_rate_mbps: float = 4.5
    link_margin_db: float = 4.2
    downlink_efficiency: float = 1.0
    has_visual_autonomy: bool = True
    dtmf_code_ok: bool = True
    solar_conjunction_warning: bool = False
    selected_instruments: list[InstrumentItem] = Field(default_factory=list)
    spectral_marks: list[float] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def _normalize_minigame_aliases(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        normalized = dict(data)

        # Map mission_id default budget if budget_limit_usd was not explicitly set
        mission_id = normalized.get("mission_id")
        if "budget_limit_usd" not in normalized and mission_id in MISSION_BUDGET_DEFAULTS_USD:
            normalized["budget_limit_usd"] = MISSION_BUDGET_DEFAULTS_USD[str(mission_id)]

        # Map launcher & orbit aliases from arquitectura doc §3 and docs/10-tecnico.md §2
        if "selected_launcher" not in normalized and "selected_launcher_id" in normalized:
            normalized["selected_launcher"] = str(normalized["selected_launcher_id"])
        if "launch_cost_usd" not in normalized and "total_launch_cost_usd" in normalized:
            normalized["launch_cost_usd"] = float(normalized["total_launch_cost_usd"])
        if "trajectory_choice" not in normalized and "orbit_or_route_id" in normalized:
            normalized["trajectory_choice"] = str(normalized["orbit_or_route_id"])

        # Rol3B power source ids -> schema ids (an unknown id used to crash the flight; 2026-11-15)
        power_aliases = {"solar_arrays": "solar_standard", "solar": "solar_standard", "battery": "battery_heavy"}
        if normalized.get("power_source") in power_aliases:
            normalized["power_source"] = power_aliases[str(normalized["power_source"])]
        if normalized.get("power_source") not in (None, "solar_standard", "battery_heavy", "fuel_cell", "rtg_nuclear"):
            normalized["power_source"] = "fuel_cell"

        # Map Rol2A bus_dry_mass_kg -> dry_mass_kg when dry_mass_kg is omitted
        if "dry_mass_kg" not in normalized and "bus_dry_mass_kg" in normalized and normalized["bus_dry_mass_kg"] is not None:
            normalized["dry_mass_kg"] = float(normalized["bus_dry_mass_kg"])

        # Apply Rol2B ballast jettison to dry_mass_kg if provided and dry_mass_kg > 50 kg
        if "ballast_jettisoned_kg" in normalized and normalized.get("ballast_jettisoned_kg"):
            try:
                ballast = max(0.0, float(normalized["ballast_jettisoned_kg"]))
                base_dry = float(normalized.get("dry_mass_kg", 373.0))
                if ballast > 0.0 and "dry_mass_kg" not in data:
                    normalized["dry_mass_kg"] = max(50.0, base_dry - ballast)
            except (TypeError, ValueError):
                pass

        # Ensure fuel_burn_multiplier reflects cg_balanced when fuel_burn_multiplier is omitted
        if "cg_balanced" in normalized and "fuel_burn_multiplier" not in normalized:
            normalized["fuel_burn_multiplier"] = 1.0 if bool(normalized["cg_balanced"]) else 1.5

        return normalized


class FlightQuestionOption(BaseModel):
    model_config = ConfigDict(extra="ignore")

    option_id: str
    label: str
    engineering_tradeoff_hint: str
    delta_effects: dict[str, Any] = Field(default_factory=dict)


class FlightQuestionNode(BaseModel):
    model_config = ConfigDict(extra="allow")

    question_id: str
    gate: GateType
    assigned_role: RoleType
    title: str
    scenario_context: str
    nasa_concept_badge: str
    options: list[FlightQuestionOption]
    mission_id: Optional[MissionIdType] = None


class MissionResolutionOutcome(BaseModel):
    model_config = ConfigDict(extra="ignore")

    outcome: Literal["FAILED", "PARTIAL_SUCCESS", "FULL_SUCCESS"]
    completion_pct: float = Field(ge=0.0, le=100.0)
    total_score: int = Field(ge=0, le=1000)
    failed_or_degraded_gate: Optional[GateType] = None
    causal_chain_explanation: str
    nasa_real_world_fact: str

