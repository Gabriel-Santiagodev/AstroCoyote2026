"""
Pydantic v2 session, live metrics, flight node & outcome contracts.
Owner: Schoenstadt (Task SCH-01)
See docs/20-roadmap-schoenstadt.md and docs/10-tecnico.md before editing.
"""
from __future__ import annotations

from typing import Any, Literal, Optional
from pydantic import BaseModel, Field

RoleType = Literal["finance_launch", "spacecraft_mass", "orbit_power", "science_comms"]
DifficultyType = Literal["easy", "medium", "hard"]
MissionIdType = Literal["artemis_moon", "asteroid_hunter", "mars_sample_return"]
GateType = Literal["NODE_1_LAUNCH", "NODE_2_PROPULSION", "NODE_3_EVENT", "NODE_4_DOWNLINK"]
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


class InstrumentItem(BaseModel):
    id: str
    name: str
    mass_kg: float = 0.0


class LiveMetrics(BaseModel):
    """Mirror of frontend/src/types/game.ts LiveMetrics for mutacion_en_vivo."""

    estimated_wet_mass_kg: float = 1500.0
    remaining_budget_usd: float = 800_000_000.0
    ufe_reserve_pct: float = 25.0
    funding_factor_F: float = 0.5
    fspl_loss_db: float = 166.0
    cg_balanced: bool = True
    fuel_burn_multiplier: float = 1.0
    available_power_w: float = 600.0
    instruments_mass_kg: float = 0.0
    selected_instruments: list[InstrumentItem] = Field(default_factory=list)
    required_dv_ms: float = 1803.6
    has_thermal_protection: bool = True


class MissionSessionConfig(BaseModel):
    room_pin: str
    mission_id: MissionIdType
    difficulty: DifficultyType
    player_count: int = Field(ge=1, le=4)
    human_roles: list[RoleType]
    ai_roles: list[RoleType]
    wave1_spectral_game: SpectralGameType = "cazadores_estrellas"
    wave2_spectral_game: SpectralGameType = "espectro_hacker"


class ConsolidatedMissionState(BaseModel):
    # Rol 1: Budgets + Launch Vehicles
    budget_limit_usd: float = 800_000_000.0
    subsystems_cost_usd: float = 250_000_000.0
    ufe_reserve_pct: float = 25.0
    funding_factor_F: float = 0.6
    selected_launcher: str = "falcon9_block5"
    launcher_max_mass_kg: float = 4020.0
    fairing_ok: bool = True
    launch_cost_usd: float = 74_000_000.0

    # Rol 2: Spacecraft Design + Mass
    dry_mass_kg: float = 373.0
    cg_balanced: bool = True
    fuel_burn_multiplier: float = 1.0
    has_thermal_protection: bool = True
    has_deorbit_device: bool = True

    # Rol 3: Orbital Constraints + Power
    trajectory_choice: str = "standard_sso_700"
    required_dv_ms: float = 1803.6
    isp_seconds: float = 315.0
    propellant_mass_kg: float = 750.0
    power_source: Literal["solar_standard", "battery_heavy", "fuel_cell", "rtg_nuclear"] = "fuel_cell"
    power_generation_w: float = 750.0
    battery_reserve_pct: float = 25.0

    # Rol 4: Science + Spectral + Comms
    instruments_mass_kg: float = 68.0
    science_value: float = 85.0
    science_calibration_f1: float = 0.85
    data_generated_gbit: float = 115.0
    downlink_rate_mbps: float = 4.5
    link_margin_db: float = 4.2
    downlink_efficiency: float = 1.0
    has_visual_autonomy: bool = True


class FlightQuestionOption(BaseModel):
    option_id: str
    label: str
    engineering_tradeoff_hint: str
    delta_effects: dict[str, Any] = Field(default_factory=dict)


class FlightQuestionNode(BaseModel):
    question_id: str
    gate: GateType
    assigned_role: RoleType
    title: str
    scenario_context: str
    nasa_concept_badge: str
    options: list[FlightQuestionOption]


class MissionResolutionOutcome(BaseModel):
    outcome: Literal["FAILED", "PARTIAL_SUCCESS", "FULL_SUCCESS"]
    completion_pct: float
    total_score: int
    failed_or_degraded_gate: Optional[GateType] = None
    causal_chain_explanation: str
    nasa_real_world_fact: str
