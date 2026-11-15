"""
Typed NASA subsystem catalog loader synchronized with frontend/src/data/nasa_catalog.json.
Owner: Abraham (Task ABR-01)
See docs/19-roadmap-abraham.md and docs/06-datos-nasa.md before editing.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

from pydantic import BaseModel, Field


_CATALOG_PATH = (
    Path(__file__).resolve().parents[2]
    / "frontend"
    / "src"
    / "data"
    / "nasa_catalog.json"
)


class ConstantsCatalog(BaseModel):
    mu_earth_km3_s2: float
    earth_radius_km: float
    j2_earth: float
    sso_nodal_precession_deg_day: float
    g0_m_s2: float
    solar_irradiance_mars_w_m2: float = 590.0
    mro_hga_diameter_m: float = 3.0
    mro_recorder_capacity_gbit: float = 160.0
    min_dsn_link_margin_db: float = 3.0
    fuente: str = Field(min_length=1)
    estado: str = Field(min_length=1)


class MissionCatalogItem(BaseModel):
    id: str
    name: str
    difficulty_default: str
    budget_limit_usd: float
    recommended_ufe_pct: float
    cg_tolerance_m: float
    requires_thermal_protection: bool
    min_battery_event_pct: Optional[float] = None
    min_ufe_event_pct: Optional[float] = None
    default_required_dv_ms: float
    science_goal: str = ""
    nasa_real_world_fact: str
    fuente: str = Field(min_length=1)
    estado: str = Field(min_length=1)


class MissionRouteOption(BaseModel):
    id: str
    name: str
    required_dv_ms: float
    propellant_delta_kg: float
    transit_days: float
    summary: str
    fuente: str = Field(min_length=1)
    estado: str = Field(min_length=1)


class LauncherCatalogItem(BaseModel):
    id: str
    name: str
    is_rideshare: bool = False
    min_mass_kg: Optional[float] = None
    max_mass_leo_kg: Optional[float] = None
    max_mass_sso_kg: Optional[float] = None
    max_mass_reusable_leo_kg: Optional[float] = None
    max_mass_gto_kg: Optional[float] = None
    max_mass_mars_kg: Optional[float] = None
    max_mass_kg: float
    cost_usd: float
    rate_per_kg_usd: Optional[float] = None
    fairing_m: str
    fuente: str = Field(min_length=1)
    estado: str = Field(min_length=1)


class OrbitCatalogItem(BaseModel):
    id: str
    name: str
    altitude_km: float
    velocity_kms: float
    period_min: float
    max_eclipse_min: float
    sso_inclination_deg: Optional[float] = None
    slant_range_km: float
    fspl_s_band_db: float
    fspl_x_band_db: float
    fuente: str = Field(min_length=1)
    estado: str = Field(min_length=1)


class EngineCatalogItem(BaseModel):
    id: str
    name: str
    isp_seconds: float
    power_demand_w: float
    fuente: str = Field(min_length=1)
    estado: str = Field(min_length=1)


class PowerPackCatalogItem(BaseModel):
    id: str
    name: str
    energy_mj: float
    rover_speed_delta_pct: float
    fuente: str = Field(min_length=1)
    estado: str = Field(min_length=1)


class InstrumentCatalogItem(BaseModel):
    id: str
    name: str
    missions: list[str] = Field(default_factory=list)
    mass_kg: float
    power_w: float
    data_gbit_day: float
    cost_musd: float
    science_value: float
    fuente: str = Field(min_length=1)
    estado: str = Field(min_length=1)


class NasaCatalog(BaseModel):
    constants: ConstantsCatalog
    missions: dict[str, MissionCatalogItem]
    mission_routes: dict[str, list[MissionRouteOption]] = Field(default_factory=dict)
    launchers: list[LauncherCatalogItem]
    orbits: list[OrbitCatalogItem]
    engines: list[EngineCatalogItem]
    power_packs: list[PowerPackCatalogItem]
    instruments: list[InstrumentCatalogItem]


@lru_cache(maxsize=1)
def get_catalog() -> dict[str, Any]:
    """Load and cache the Single Source of Truth NASA catalog JSON."""
    with _CATALOG_PATH.open("r", encoding="utf-8") as fh:
        raw = json.load(fh)
    NasaCatalog.model_validate(raw)
    return raw


@lru_cache(maxsize=1)
def get_typed_catalog() -> NasaCatalog:
    """Return the Pydantic-validated NASA catalog model."""
    return NasaCatalog.model_validate(get_catalog())


def get_mission(mission_id: str) -> dict[str, Any]:
    """Return mission parameters by ID, defaulting safely to artemis_moon."""
    catalog = get_catalog()
    missions = catalog.get("missions", {})
    return missions.get(mission_id) or missions.get("artemis_moon", {})


def get_mission_routes(mission_id: str) -> list[dict[str, Any]]:
    """Return selectable route dilemma options for a mission."""
    routes = get_catalog().get("mission_routes", {})
    return list(routes.get(mission_id) or routes.get("artemis_moon", []))


def get_launcher(launcher_id: str) -> dict[str, Any]:
    """Return launcher entry matching id or name."""
    for item in get_catalog().get("launchers", []):
        if item.get("id") == launcher_id or item.get("name") == launcher_id:
            return item
    launchers = get_catalog().get("launchers", [])
    return launchers[0] if launchers else {}


def get_orbit(orbit_id: str) -> dict[str, Any]:
    """Return orbit entry matching id or name."""
    for item in get_catalog().get("orbits", []):
        if item.get("id") == orbit_id or item.get("name") == orbit_id:
            return item
    orbits = get_catalog().get("orbits", [])
    return orbits[0] if orbits else {}


def get_engine(engine_id: str) -> dict[str, Any]:
    """Return onboard propulsion engine entry matching id or name."""
    for item in get_catalog().get("engines", []):
        if item.get("id") == engine_id or item.get("name") == engine_id:
            return item
    engines = get_catalog().get("engines", [])
    return engines[0] if engines else {}


def get_power_pack(pack_id: str) -> dict[str, Any]:
    """Return 3D power pack entry matching id or name."""
    for item in get_catalog().get("power_packs", []):
        if item.get("id") == pack_id or item.get("name") == pack_id:
            return item
    packs = get_catalog().get("power_packs", [])
    return packs[0] if packs else {}


def get_instruments() -> list[dict[str, Any]]:
    """Return the verified/tagged scientific instrument catalog list."""
    return list(get_catalog().get("instruments", []))


def get_instruments_for_mission(mission_id: str) -> list[dict[str, Any]]:
    """Return scientific instruments tagged for a given mission (or all if untagged)."""
    items = get_instruments()
    filtered = [
        item
        for item in items
        if not item.get("missions") or mission_id in item.get("missions", [])
    ]
    return filtered or items
