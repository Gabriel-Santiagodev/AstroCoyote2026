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
    from .models.subsystems import get_instruments, get_launcher, get_mission, get_orbit
else:
    from models.session import LiveMetrics
    from models.subsystems import get_instruments, get_launcher, get_mission, get_orbit

# Verified WGS84 / IAU / CODATA constants from docs/06-datos-nasa.md §1
MU_EARTH_KM3_S2 = 398600.4418
EARTH_RADIUS_KM = 6378.137
J2_EARTH = 1.08262668e-3
SSO_NODAL_PRECESSION_RAD_S = (2.0 * math.pi) / (365.2421897 * 86400.0)
G0_M_S2 = 9.80665

_ORBIT_ALTITUDE_BY_ID: dict[str, float] = {
    "leo_350": 350.0,
    "iss_420": 420.0,
    "sso_500": 500.0,
    "leo_550": 550.0,
    "sso_700": 700.0,
    "standard_sso_700": 700.0,
    "free_return_sso_700": 700.0,
    "sso_800": 800.0,
    "leo_2000": 2000.0,
    "meo_20200": 20200.0,
    "geo_35786": 35786.0,
}


def orbital_velocity_and_period(altitude_km: float) -> tuple[float, float]:
    """Return (circular orbital velocity in km/s, orbital period in minutes)."""
    r_km = EARTH_RADIUS_KM + max(0.0, float(altitude_km))
    velocity_kms = math.sqrt(MU_EARTH_KM3_S2 / r_km)
    period_sec = 2.0 * math.pi * math.sqrt((r_km ** 3) / MU_EARTH_KM3_S2)
    return round(velocity_kms, 3), round(period_sec / 60.0, 2)


def eclipse_fraction_pct(altitude_km: float) -> float:
    """Return cylindrical shadow eclipse fraction as percentage (0-100)."""
    r_km = EARTH_RADIUS_KM + max(0.0, float(altitude_km))
    rho = math.asin(min(1.0, EARTH_RADIUS_KM / r_km))
    return round((rho / math.pi) * 100.0, 1)


def eclipse_duration_min(altitude_km: float) -> float:
    """Return maximum cylindrical shadow eclipse duration in minutes (beta=0)."""
    r_km = EARTH_RADIUS_KM + max(0.0, float(altitude_km))
    period_min_exact = (2.0 * math.pi * math.sqrt((r_km ** 3) / MU_EARTH_KM3_S2)) / 60.0
    rho = math.asin(min(1.0, EARTH_RADIUS_KM / r_km))
    eclipse_fraction = rho / math.pi
    return round(eclipse_fraction * period_min_exact, 2)


def sso_inclination_deg(altitude_km: float) -> float | None:
    """Return sun-synchronous inclination in degrees if physically feasible, else None."""
    r_km = EARTH_RADIUS_KM + max(0.0, float(altitude_km))
    n_rad_s = math.sqrt(MU_EARTH_KM3_S2 / (r_km ** 3))
    cos_i = (-2.0 * SSO_NODAL_PRECESSION_RAD_S * (r_km ** 2)) / (
        3.0 * n_rad_s * J2_EARTH * (EARTH_RADIUS_KM ** 2)
    )
    if cos_i < -1.0 or cos_i > 1.0:
        return None
    return round(math.degrees(math.acos(cos_i)), 2)


def coverage_half_angle_deg(altitude_km: float, min_elev_deg: float = 10.0) -> float:
    """Return Earth central coverage half-angle lambda_cov in degrees at minimum elevation."""
    r_km = EARTH_RADIUS_KM + max(0.0, float(altitude_km))
    eps = math.radians(min_elev_deg)
    eta = math.asin(min(1.0, (EARTH_RADIUS_KM / r_km) * math.cos(eps)))
    lambda_cov = (math.pi / 2.0) - eps - eta
    return round(math.degrees(lambda_cov), 2)


def slant_range_km(altitude_km: float, min_elev_deg: float = 10.0) -> float:
    """Return Earth-to-satellite slant range in km at minimum elevation angle."""
    r_km = EARTH_RADIUS_KM + max(0.0, float(altitude_km))
    eps = math.radians(min_elev_deg)
    eta = math.asin(min(1.0, (EARTH_RADIUS_KM / r_km) * math.cos(eps)))
    lambda_cov = (math.pi / 2.0) - eps - eta
    dist = math.sqrt(
        (r_km ** 2)
        + (EARTH_RADIUS_KM ** 2)
        - 2.0 * r_km * EARTH_RADIUS_KM * math.cos(lambda_cov)
    )
    return round(dist, 1)


def compute_fspl_db(distance_km: float, freq_ghz: float = 2.2) -> float:
    """Compute Free-Space Path Loss in dB using d_m and f_Hz."""
    d_m = max(1.0, float(distance_km) * 1000.0)
    f_hz = max(1.0, float(freq_ghz) * 1e9)
    fspl = 20.0 * math.log10(d_m) + 20.0 * math.log10(f_hz) - 147.55
    return round(fspl, 1)


def compute_propellant_fraction(
    required_dv_ms: float, isp_s: float, fuel_burn_multiplier: float = 1.0
) -> float:
    """Compute Tsiolkovsky propellant mass fraction f_prop in [0, 0.95]."""
    isp = max(1.0, float(isp_s))
    dv = max(0.0, float(required_dv_ms))
    mult = max(0.1, float(fuel_burn_multiplier))
    f_prop = 1.0 - math.exp(-(dv * mult) / (isp * G0_M_S2))
    return min(0.95, max(0.0, f_prop))


def compute_wet_mass_kg(
    dry_mass_kg: float,
    required_dv_ms: float,
    isp_s: float,
    fuel_burn_multiplier: float = 1.0,
) -> float:
    """Compute total wet mass m_wet = m_dry / (1 - f_prop) in kg."""
    f_prop = compute_propellant_fraction(required_dv_ms, isp_s, fuel_burn_multiplier)
    return round(max(0.0, float(dry_mass_kg)) / max(0.05, 1.0 - f_prop), 1)


def compute_cg_distance(placements: list[dict[str, float]]) -> tuple[float, float, float]:
    """Compute 2D Center of Gravity (X_CG, Y_CG, radial distance d_CG in meters)."""
    total_mass = sum(max(0.0, float(p.get("mass_kg", 0.0))) for p in placements)
    if total_mass <= 0.0:
        return 0.0, 0.0, 0.0
    x_cg = sum(float(p.get("mass_kg", 0.0)) * float(p.get("x_m", 0.0)) for p in placements) / total_mass
    y_cg = sum(float(p.get("mass_kg", 0.0)) * float(p.get("y_m", 0.0)) for p in placements) / total_mass
    d_cg = math.hypot(x_cg, y_cg)
    return round(x_cg, 4), round(y_cg, 4), round(d_cg, 4)


def compute_rover_effective_speed_factor(pack_speed_deltas_pct: list[float]) -> float:
    """
    Compute normalized rover speed multiplier in [0.55, 1.30] for up to 3 stacked energy crates.
    Formula: V_eff / V_base = clamp(1.0 + sum(delta_v_i), 0.55, 1.30).
    """
    active_deltas = [float(d) / 100.0 for d in pack_speed_deltas_pct[:3]]
    raw_factor = 1.0 + sum(active_deltas)
    return round(min(1.30, max(0.55, raw_factor)), 4)


def compute_power_spawn_probabilities(funding_factor_F: float) -> dict[str, float]:
    """
    Interpolate energy crate spawn rates in Rol 3B from Rol 1A R&D funding factor F in [0, 1].
    F=0.0 -> (0.70, 0.25, 0.05), F=0.5 -> (0.40, 0.40, 0.20), F=1.0 -> (0.15, 0.35, 0.50).
    """
    f = min(1.0, max(0.0, float(funding_factor_F)))
    if f <= 0.5:
        t = f / 0.5
        p_chem = 0.70 + t * (0.40 - 0.70)
        p_batt = 0.25 + t * (0.40 - 0.25)
        p_h2 = 0.05 + t * (0.20 - 0.05)
    else:
        t = (f - 0.5) / 0.5
        p_chem = 0.40 + t * (0.15 - 0.40)
        p_batt = 0.40 + t * (0.35 - 0.40)
        p_h2 = 0.20 + t * (0.50 - 0.20)
    return {
        "chemical_pack": round(p_chem, 4),
        "battery_pack": round(p_batt, 4),
        "h2_fuel_cell": round(p_h2, 4),
    }


def _resolve_fspl_loss_db(partial_state: dict[str, Any]) -> float:
    if "fspl_loss_db" in partial_state and partial_state["fspl_loss_db"] is not None:
        return float(partial_state["fspl_loss_db"])
    if "altitude_km" in partial_state and partial_state["altitude_km"] is not None:
        alt = float(partial_state["altitude_km"])
        freq = float(partial_state.get("freq_ghz", 2.2))
        return compute_fspl_db(slant_range_km(alt, 10.0), freq)
    traj = str(
        partial_state.get("trajectory_choice")
        or partial_state.get("orbit_or_route_id")
        or partial_state.get("orbit_id")
        or ""
    )
    if traj in _ORBIT_ALTITUDE_BY_ID:
        alt = _ORBIT_ALTITUDE_BY_ID[traj]
        return compute_fspl_db(slant_range_km(alt, 10.0), 2.2)
    if traj:
        orbit_entry = get_orbit(traj)
        if orbit_entry and "fspl_s_band_db" in orbit_entry and orbit_entry.get("id") == traj:
            return float(orbit_entry["fspl_s_band_db"])
    return 166.0


def compute_live_metrics(
    partial_state: dict[str, Any], mission_id: str = "artemis_moon"
) -> dict[str, Any]:
    """Pure, sub-millisecond live concurrency calculator called on every accion_parcial_minijuego."""
    active_mission_id = str(partial_state.get("mission_id") or mission_id or "artemis_moon")
    mission = get_mission(active_mission_id)
    base_budget = float(
        partial_state.get("budget_limit_usd", mission.get("budget_limit_usd", 800_000_000.0))
    )

    default_dry = 461.0 if active_mission_id == "mars_sample_return" else 373.0
    dry_mass = float(
        partial_state.get("dry_mass_kg", partial_state.get("bus_dry_mass_kg", default_dry))
    )
    ballast_jettisoned = max(0.0, float(partial_state.get("ballast_jettisoned_kg", 0.0)))
    if ballast_jettisoned > 0.0 and "dry_mass_kg" not in partial_state:
        dry_mass = max(50.0, dry_mass - ballast_jettisoned)

    raw_instruments = partial_state.get("selected_instruments", [])
    if "instruments_mass_kg" in partial_state and partial_state["instruments_mass_kg"] is not None:
        inst_mass = float(partial_state["instruments_mass_kg"])
    elif isinstance(raw_instruments, list) and len(raw_instruments) > 0:
        catalog_by_id = {item["id"]: item for item in get_instruments() if "id" in item}
        computed_inst_mass = 0.0
        for item in raw_instruments:
            if isinstance(item, dict):
                if "mass_kg" in item and item["mass_kg"] is not None:
                    computed_inst_mass += float(item["mass_kg"])
                elif item.get("id") in catalog_by_id:
                    computed_inst_mass += float(catalog_by_id[item["id"]].get("mass_kg", 0.0))
            elif isinstance(item, str) and item in catalog_by_id:
                computed_inst_mass += float(catalog_by_id[item].get("mass_kg", 0.0))
        inst_mass = round(computed_inst_mass, 2)
    else:
        inst_mass = 68.0

    required_dv = float(
        partial_state.get("required_dv_ms", mission.get("default_required_dv_ms", 1803.6))
    )
    isp = float(partial_state.get("isp_seconds", 315.0))

    if "cg_balanced" in partial_state and partial_state["cg_balanced"] is not None:
        cg_balanced = bool(partial_state["cg_balanced"])
    elif isinstance(partial_state.get("placements"), list) and partial_state["placements"]:
        _, _, d_cg = compute_cg_distance(partial_state["placements"])
        tol_m = float(mission.get("cg_tolerance_m", 0.15))
        cg_balanced = d_cg <= tol_m
    else:
        cg_balanced = True

    if "fuel_burn_multiplier" in partial_state and partial_state["fuel_burn_multiplier"] is not None:
        burn_mult = float(partial_state["fuel_burn_multiplier"])
        if not cg_balanced and burn_mult < 1.5:
            burn_mult = 1.5
    else:
        burn_mult = 1.0 if cg_balanced else 1.5

    est_wet_mass = compute_wet_mass_kg(dry_mass + inst_mass, required_dv, isp, burn_mult)

    if "subsystems_cost_usd" in partial_state and partial_state["subsystems_cost_usd"] is not None:
        subsystems_cost = float(partial_state["subsystems_cost_usd"])
    elif "budget_engineering_usd" in partial_state or "budget_science_usd" in partial_state:
        subsystems_cost = float(partial_state.get("budget_engineering_usd", 0.0)) + float(
            partial_state.get("budget_science_usd", 0.0)
        )
    else:
        subsystems_cost = 250_000_000.0

    if "launch_cost_usd" in partial_state and partial_state["launch_cost_usd"] is not None:
        launch_cost = float(partial_state["launch_cost_usd"])
    elif "total_launch_cost_usd" in partial_state and partial_state["total_launch_cost_usd"] is not None:
        launch_cost = float(partial_state["total_launch_cost_usd"])
    elif "selected_launcher" in partial_state and partial_state["selected_launcher"]:
        launcher = get_launcher(str(partial_state["selected_launcher"]))
        launch_cost = float(launcher.get("cost_usd", 74_000_000.0))
    elif "selected_launcher_id" in partial_state and partial_state["selected_launcher_id"]:
        launcher = get_launcher(str(partial_state["selected_launcher_id"]))
        launch_cost = float(launcher.get("cost_usd", 74_000_000.0))
    else:
        launch_cost = 74_000_000.0

    remaining_budget = max(0.0, base_budget - subsystems_cost - launch_cost)

    if "available_power_w" in partial_state and partial_state["available_power_w"] is not None:
        available_power_w = float(partial_state["available_power_w"])
    elif "power_generation_w" in partial_state and partial_state["power_generation_w"] is not None:
        available_power_w = float(partial_state["power_generation_w"])
    elif "total_energy_mj" in partial_state and partial_state["total_energy_mj"] is not None:
        available_power_w = round(300.0 + float(partial_state["total_energy_mj"]) * 2.2, 1)
    else:
        available_power_w = 750.0

    funding_f = min(1.0, max(0.0, float(partial_state.get("funding_factor_F", 0.6))))
    ufe_pct = float(
        partial_state.get("ufe_reserve_pct", mission.get("recommended_ufe_pct", 25.0))
    )

    data_day, rate_mbps, hours_needed = data_downlink_budget(partial_state)
    duration_days = mission_duration_days(partial_state, active_mission_id)

    metrics = LiveMetrics(
        estimated_wet_mass_kg=est_wet_mass,
        remaining_budget_usd=remaining_budget,
        ufe_reserve_pct=ufe_pct,
        funding_factor_F=funding_f,
        fspl_loss_db=_resolve_fspl_loss_db(partial_state),
        cg_balanced=cg_balanced,
        fuel_burn_multiplier=burn_mult,
        available_power_w=available_power_w,
        instruments_mass_kg=inst_mass,
        dry_mass_kg=round(dry_mass, 1),
        selected_instruments=raw_instruments if isinstance(raw_instruments, list) else [],
        required_dv_ms=required_dv,
        has_thermal_protection=bool(partial_state.get("has_thermal_protection", True)),
        data_generated_gbit_day=data_day,
        downlink_rate_mbps=rate_mbps,
        downlink_hours_needed=hours_needed,
        mission_duration_days=duration_days,
    )
    return metrics.model_dump()


HOURS_PER_DAY = 24.0
MEGABIT_PER_GIGABIT = 1000.0
SECONDS_PER_HOUR = 3600.0


def data_downlink_budget(partial_state: dict[str, Any]) -> tuple[float, float, float]:
    """Challenge resource "Data": science data per day vs the link that must send it home.

    data/day = Rol 4A `data_generated_gbit` (sum of instrument `data_gbit_day` from the catalog),
    or the catalog sum for `selected_instruments`; rate = Rol 4B `downlink_rate_mbps`.
    hours_needed = data / (rate x 3600 s / 1000) — pure unit conversion, no game constant.
    Returns (data_gbit_day, rate_mbps, hours_needed); hours_needed is 0 while the rate is unknown.
    """
    data_day = partial_state.get("data_generated_gbit")
    if not isinstance(data_day, (int, float)):
        catalog_by_id = {item["id"]: item for item in get_instruments() if "id" in item}
        data_day = 0.0
        for item in partial_state.get("selected_instruments") or []:
            item_id = item.get("id") if isinstance(item, dict) else item
            if item_id in catalog_by_id:
                data_day += float(catalog_by_id[item_id].get("data_gbit_day", 0.0))
    rate = partial_state.get("downlink_rate_mbps")
    rate_mbps = float(rate) if isinstance(rate, (int, float)) and rate > 0 else 0.0
    gbit_per_hour = rate_mbps * SECONDS_PER_HOUR / MEGABIT_PER_GIGABIT
    hours_needed = round(float(data_day) / gbit_per_hour, 2) if gbit_per_hour > 0 else 0.0
    return round(float(data_day), 2), rate_mbps, hours_needed


def mission_duration_days(partial_state: dict[str, Any], mission_id: str) -> float:
    """Challenge resource "Time": transit time of the chosen route (catalog `transit_days`)."""
    choice = str(partial_state.get("trajectory_choice") or "")
    route_id = choice.split("__")[0] if choice else ""
    if not route_id:
        return 0.0
    routes = _mission_routes().get(mission_id) or []
    for route in routes:
        if route.get("id") == route_id:
            return float(route.get("transit_days", 0.0))
    return 0.0


def _mission_routes() -> dict[str, list[dict[str, Any]]]:
    if __package__:
        from .models.subsystems import get_catalog
    else:
        from models.subsystems import get_catalog
    routes = get_catalog().get("mission_routes", {})
    return routes if isinstance(routes, dict) else {}

