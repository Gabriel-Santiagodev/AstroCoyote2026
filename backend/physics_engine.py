"""
Authoritative orbital physics (WGS84, Tsiolkovsky, FSPL, CG) & live concurrency metrics.
Owner: Schoenstadt (Task SCH-02)
See docs/20-roadmap-schoenstadt.md and docs/06-datos-nasa.md before editing.
"""
from __future__ import annotations

import math
from typing import Any

if __package__:
    from .models.session import LiveMetrics
    from .models.subsystems import get_mission
else:
    from models.session import LiveMetrics
    from models.subsystems import get_mission

# Verified WGS84 / IAU / CODATA constants from docs/06-datos-nasa.md
MU_EARTH_KM3_S2 = 398600.4418
EARTH_RADIUS_KM = 6378.137
J2_EARTH = 1.08262668e-3
SSO_NODAL_PRECESSION_RAD_S = (2.0 * math.pi) / (365.2421897 * 86400.0)
G0_M_S2 = 9.80665


def orbital_velocity_and_period(altitude_km: float) -> tuple[float, float]:
    """Return (circular orbital velocity in km/s, orbital period in minutes)."""
    r_km = EARTH_RADIUS_KM + altitude_km
    velocity_kms = math.sqrt(MU_EARTH_KM3_S2 / r_km)
    period_sec = 2.0 * math.pi * math.sqrt((r_km ** 3) / MU_EARTH_KM3_S2)
    return round(velocity_kms, 3), round(period_sec / 60.0, 2)


def eclipse_duration_min(altitude_km: float) -> float:
    """Return maximum cylindrical shadow eclipse duration in minutes (beta=0)."""
    r_km = EARTH_RADIUS_KM + altitude_km
    _, period_min = orbital_velocity_and_period(altitude_km)
    rho = math.asin(min(1.0, EARTH_RADIUS_KM / r_km))
    eclipse_fraction = rho / math.pi
    return round(eclipse_fraction * period_min, 2)


def sso_inclination_deg(altitude_km: float) -> float | None:
    """Return sun-synchronous inclination in degrees if physically feasible, else None."""
    r_km = EARTH_RADIUS_KM + altitude_km
    n_rad_s = math.sqrt(MU_EARTH_KM3_S2 / (r_km ** 3))
    cos_i = (-2.0 * SSO_NODAL_PRECESSION_RAD_S * (r_km ** 2)) / (
        3.0 * n_rad_s * J2_EARTH * (EARTH_RADIUS_KM ** 2)
    )
    if cos_i < -1.0 or cos_i > 1.0:
        return None
    return round(math.degrees(math.acos(cos_i)), 2)


def slant_range_km(altitude_km: float, min_elev_deg: float = 10.0) -> float:
    """Return Earth-to-satellite slant range in km at minimum elevation angle."""
    r_km = EARTH_RADIUS_KM + altitude_km
    eps = math.radians(min_elev_deg)
    eta = math.asin((EARTH_RADIUS_KM / r_km) * math.cos(eps))
    lambda_cov = (math.pi / 2.0) - eps - eta
    dist = math.sqrt(
        (r_km ** 2)
        + (EARTH_RADIUS_KM ** 2)
        - 2.0 * r_km * EARTH_RADIUS_KM * math.cos(lambda_cov)
    )
    return round(dist, 1)


def compute_fspl_db(distance_km: float, freq_ghz: float = 2.2) -> float:
    """Compute Free-Space Path Loss in dB using d_m and f_Hz."""
    d_m = max(1.0, distance_km * 1000.0)
    f_hz = max(1.0, freq_ghz * 1e9)
    fspl = 20.0 * math.log10(d_m) + 20.0 * math.log10(f_hz) - 147.55
    return round(fspl, 1)


def compute_propellant_fraction(
    required_dv_ms: float, isp_s: float, fuel_burn_multiplier: float = 1.0
) -> float:
    """Compute Tsiolkovsky propellant mass fraction f_prop in [0, 0.95]."""
    isp = max(1.0, isp_s)
    f_prop = 1.0 - math.exp(-(required_dv_ms * fuel_burn_multiplier) / (isp * G0_M_S2))
    return min(0.95, max(0.0, f_prop))


def compute_cg_distance(placements: list[dict[str, float]]) -> tuple[float, float, float]:
    """Compute 2D Center of Gravity (X_CG, Y_CG, radial distance d_CG in meters)."""
    total_mass = sum(max(0.0, p.get("mass_kg", 0.0)) for p in placements)
    if total_mass <= 0.0:
        return 0.0, 0.0, 0.0
    x_cg = sum(p.get("mass_kg", 0.0) * p.get("x_m", 0.0) for p in placements) / total_mass
    y_cg = sum(p.get("mass_kg", 0.0) * p.get("y_m", 0.0) for p in placements) / total_mass
    d_cg = math.hypot(x_cg, y_cg)
    return round(x_cg, 4), round(y_cg, 4), round(d_cg, 4)


def compute_live_metrics(
    partial_state: dict[str, Any], mission_id: str = "artemis_moon"
) -> dict[str, Any]:
    """Pure, sub-millisecond live concurrency calculator called on every accion_parcial_minijuego."""
    mission = get_mission(mission_id)
    base_budget = float(mission.get("budget_limit_usd", 800_000_000))

    dry_mass = float(partial_state.get("dry_mass_kg", partial_state.get("bus_dry_mass_kg", 373.0)))
    inst_mass = float(partial_state.get("instruments_mass_kg", 68.0))
    required_dv = float(partial_state.get("required_dv_ms", mission.get("default_required_dv_ms", 1803.6)))
    isp = float(partial_state.get("isp_seconds", 315.0))
    cg_balanced = bool(partial_state.get("cg_balanced", True))
    burn_mult = float(partial_state.get("fuel_burn_multiplier", 1.0 if cg_balanced else 1.5))

    f_prop = compute_propellant_fraction(required_dv, isp, burn_mult)
    est_wet_mass = round((dry_mass + inst_mass) / max(0.05, 1.0 - f_prop), 1)

    subsystems_cost = float(partial_state.get("subsystems_cost_usd", 250_000_000.0))
    launch_cost = float(partial_state.get("launch_cost_usd", 74_000_000.0))
    remaining_budget = max(0.0, base_budget - subsystems_cost - launch_cost)

    metrics = LiveMetrics(
        estimated_wet_mass_kg=est_wet_mass,
        remaining_budget_usd=remaining_budget,
        ufe_reserve_pct=float(partial_state.get("ufe_reserve_pct", 25.0)),
        funding_factor_F=float(partial_state.get("funding_factor_F", 0.6)),
        fspl_loss_db=float(partial_state.get("fspl_loss_db", 166.0)),
        cg_balanced=cg_balanced,
        fuel_burn_multiplier=burn_mult,
        available_power_w=float(partial_state.get("available_power_w", partial_state.get("power_generation_w", 750.0))),
        instruments_mass_kg=inst_mass,
        selected_instruments=partial_state.get("selected_instruments", []),
        required_dv_ms=required_dv,
        has_thermal_protection=bool(partial_state.get("has_thermal_protection", True)),
    )
    return metrics.model_dump()
