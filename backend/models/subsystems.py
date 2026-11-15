"""
Typed NASA subsystem catalog loader synchronized with frontend/src/data/nasa_catalog.json.
Owner: Abraham (Task ABR-01)
See docs/19-roadmap-abraham.md and docs/06-datos-nasa.md before editing.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any


_CATALOG_PATH = (
    Path(__file__).resolve().parents[2]
    / "frontend"
    / "src"
    / "data"
    / "nasa_catalog.json"
)


@lru_cache(maxsize=1)
def get_catalog() -> dict[str, Any]:
    """Load and cache the Single Source of Truth NASA catalog JSON."""
    with _CATALOG_PATH.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def get_mission(mission_id: str) -> dict[str, Any]:
    """Return mission parameters by ID, defaulting safely to artemis_moon."""
    catalog = get_catalog()
    missions = catalog.get("missions", {})
    return missions.get(mission_id) or missions.get("artemis_moon", {})


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


def get_instruments() -> list[dict[str, Any]]:
    """Return the verified/tagged scientific instrument catalog list."""
    return list(get_catalog().get("instruments", []))
