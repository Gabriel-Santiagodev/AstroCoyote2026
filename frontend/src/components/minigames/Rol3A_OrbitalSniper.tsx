// Owner: Abraham (Task ABR-03) — Wave 1 Orbital Constraints & Propulsion minigame.
// Implements MinigameProps with verified NASA/WGS84 values from nasa_catalog.json.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Compass, Flame, HelpCircle, Radio, ShieldAlert, Sparkles } from "lucide-react";
import nasaCatalog from "../../data/nasa_catalog.json";
import type { MinigameProps } from "../../types/game";

interface RouteOption {
  id: string;
  name: string;
  required_dv_ms: number;
  propellant_delta_kg: number;
  transit_days: number;
  summary: string;
}

interface OrbitOption {
  id: string;
  name: string;
  altitude_km: number;
  velocity_kms: number;
  period_min: number;
  max_eclipse_min: number;
  sso_inclination_deg: number | null;
  slant_range_km: number;
  fspl_s_band_db: number;
  fspl_x_band_db: number;
}

interface EngineOption {
  id: string;
  name: string;
  isp_seconds: number;
  power_demand_w: number;
}

const G0_M_S2 = nasaCatalog.constants.g0_m_s2;
const ORBITS = nasaCatalog.orbits as OrbitOption[];
const ENGINES = nasaCatalog.engines as EngineOption[];
const ROUTES_BY_MISSION = nasaCatalog.mission_routes as Record<string, RouteOption[]>;

const BASE_DRY_MASS_ESTIMATE_KG = 620;

export function Rol3A_OrbitalSniper({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const routes = useMemo(
    () => ROUTES_BY_MISSION[missionId] ?? ROUTES_BY_MISSION.artemis_moon,
    [missionId]
  );

  const [selectedRouteId, setSelectedRouteId] = useState<string>(() => routes[1]?.id ?? routes[0].id);
  const [selectedOrbitId, setSelectedOrbitId] = useState<string>("sso_700");
  const [selectedEngineId, setSelectedEngineId] = useState<string>("biprop_mmh_nto");
  const [activeTab, setActiveTab] = useState<"orbit" | "engine">("orbit");
  const [showConceptGuide, setShowConceptGuide] = useState<boolean>(false);

  const autoSubmitted = useRef(false);
  const hasAutoSwitchedTab = useRef(false);

  // Sync route choice if mission switches in /dev-sandbox
  useEffect(() => {
    const valid = routes.some((r) => r.id === selectedRouteId);
    if (!valid && routes.length > 0) {
      setSelectedRouteId(routes[1]?.id ?? routes[0].id);
    }
  }, [routes, selectedRouteId]);

  // Guide player once into Phase 2 (Engine) at 15s remaining without blocking tab switching
  useEffect(() => {
    if (timeLeftSec <= 15 && timeLeftSec > 0 && !hasAutoSwitchedTab.current) {
      hasAutoSwitchedTab.current = true;
      setActiveTab("engine");
    }
    if (timeLeftSec > 15) {
      hasAutoSwitchedTab.current = false;
    }
  }, [timeLeftSec]);

  const route = routes.find((r) => r.id === selectedRouteId) ?? routes[0];
  const orbit = ORBITS.find((o) => o.id === selectedOrbitId) ?? ORBITS[1];
  const engine = ENGINES.find((e) => e.id === selectedEngineId) ?? ENGINES[1];

  const calculations = useMemo(() => {
    const burnMult = liveMetrics.fuel_burn_multiplier || 1.0;
    const effectiveDv = route.required_dv_ms * burnMult;
    const exponent = -(effectiveDv / (engine.isp_seconds * G0_M_S2));
    const propFraction = Math.max(0.02, Math.min(0.88, 1 - Math.exp(exponent)));

    const dryEstimate = Math.max(
      BASE_DRY_MASS_ESTIMATE_KG,
      BASE_DRY_MASS_ESTIMATE_KG + liveMetrics.instruments_mass_kg
    );
    const rawPropMass = dryEstimate * (propFraction / (1 - propFraction));
    const propellantMassKg = Math.max(85, Math.round(rawPropMass + route.propellant_delta_kg));
    const powerOverBudget = engine.power_demand_w > liveMetrics.available_power_w;

    return {
      propFractionPct: propFraction * 100,
      propellantMassKg,
      powerOverBudget,
      burnMult,
    };
  }, [route, engine, liveMetrics.fuel_burn_multiplier, liveMetrics.instruments_mass_kg, liveMetrics.available_power_w]);

  const buildPayload = useCallback(
    () => ({
      trajectory_choice: `${route.id}__${orbit.id}`,
      required_dv_ms: Number(route.required_dv_ms.toFixed(1)),
      isp_seconds: Number(engine.isp_seconds.toFixed(1)),
      propellant_mass_kg: Number(calculations.propellantMassKg.toFixed(1)),
      max_eclipse_min: Number(orbit.max_eclipse_min.toFixed(2)),
      fspl_loss_db: Number(orbit.fspl_s_band_db.toFixed(1)),
    }),
    [route, orbit, engine, calculations.propellantMassKg]
  );

  // Push live telemetry whenever route, orbit, or engine changes
  const emitMutation = useCallback(
    (nextRoute: RouteOption, nextOrbit: OrbitOption, nextEngine: EngineOption) => {
      if (isLocked) return;
      const burnMult = liveMetrics.fuel_burn_multiplier || 1.0;
      const propFrac = Math.max(
        0.02,
        Math.min(0.88, 1 - Math.exp(-(nextRoute.required_dv_ms * burnMult) / (nextEngine.isp_seconds * G0_M_S2)))
      );
      const dryEst = Math.max(BASE_DRY_MASS_ESTIMATE_KG, BASE_DRY_MASS_ESTIMATE_KG + liveMetrics.instruments_mass_kg);
      const propMass = Math.max(85, Math.round(dryEst * (propFrac / (1 - propFrac)) + nextRoute.propellant_delta_kg));

      onLiveMutation({
        trajectory_choice: `${nextRoute.id}__${nextOrbit.id}`,
        required_dv_ms: Number(nextRoute.required_dv_ms.toFixed(1)),
        isp_seconds: Number(nextEngine.isp_seconds.toFixed(1)),
        propellant_mass_kg: propMass,
        max_eclipse_min: Number(nextOrbit.max_eclipse_min.toFixed(2)),
        fspl_loss_db: Number(nextOrbit.fspl_s_band_db.toFixed(1)),
      });
    },
    [isLocked, liveMetrics.fuel_burn_multiplier, liveMetrics.instruments_mass_kg, onLiveMutation]
  );

  // Auto-submit safely at timer expiration
  useEffect(() => {
    if (timeLeftSec <= 0 && !isLocked && !autoSubmitted.current) {
      autoSubmitted.current = true;
      onSubmitTake(buildPayload());
    }
  }, [timeLeftSec, isLocked, onSubmitTake, buildPayload]);

  // SVG Orbit visual radius scale across LEO (350) -> GEO (35786)
  const orbitVisualRadius =
    orbit.id === "leo_350" ? 42 : orbit.id === "sso_700" ? 56 : orbit.id === "meo_20200" ? 74 : 92;

  return (
    <div className="space-y-4">
      {/* Header + Concept Helper Toggle */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-black bg-role-orbit px-2.5 py-0.5 font-mono text-xs font-bold text-ink-black">
            <Compass className="h-3.5 w-3.5" />
            STATION 1 · ORBITAL SNIPER
          </span>
          <h3 className="mt-1 font-display text-xl font-bold text-paper-cream">
            Lock Trajectory, Orbit &amp; Propulsion
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowConceptGuide((v) => !v)}
          className="paper-btn flex items-center gap-1.5 bg-blueprint-navy px-3 py-1.5 text-xs text-paper-cream"
        >
          <HelpCircle className="h-4 w-4 text-role-orbit" />
          {showConceptGuide ? "Hide NASA Brief" : "How Physics Works"}
        </button>
      </div>

      {showConceptGuide && (
        <div className="rounded-xl border-2 border-role-orbit bg-space-ink/90 p-3 text-xs leading-relaxed text-slate-200">
          <p className="font-bold text-role-orbit">Mission Engineering Tradeoff:</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            <li>
              <strong>Tsiolkovsky Rocket Equation:</strong> Higher <em>Delta-v</em> demands exponential propellant
              unless you choose a higher specific impulse (<em>Isp</em>) engine.
            </li>
            <li>
              <strong>Free-Space Path Loss (FSPL):</strong> Higher orbits (MEO/GEO) shorten eclipse darkness, but hurt
              comms signal strength in dB for Rol 4B!
            </li>
          </ul>
        </div>
      )}

      {/* Concurrency Warning from Rol 2B / Power Bus */}
      {(!liveMetrics.cg_balanced || calculations.powerOverBudget) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-ink-black bg-status-warn/20 px-3 py-2 text-xs font-semibold text-status-warn">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {!liveMetrics.cg_balanced && (
            <span>Unbalanced CG detected: attitude thrusters burn 1.5x propellant!</span>
          )}
          {calculations.powerOverBudget && (
            <span>
              Hall Thruster needs {engine.power_demand_w} W (bus currently provides{" "}
              {liveMetrics.available_power_w.toFixed(0)} W).
            </span>
          )}
        </div>
      )}

      {/* Phase Tabs + Live SVG Orbit & Telemetry Preview */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Interactive Selector Panels */}
        <div className="space-y-3 lg:col-span-7">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("orbit")}
              className={`paper-btn flex-1 px-3 py-2 text-xs sm:text-sm ${
                activeTab === "orbit"
                  ? "bg-role-orbit text-ink-black"
                  : "bg-space-ink text-slate-300"
              }`}
            >
              1. Route &amp; Orbit (0–15 s)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("engine")}
              className={`paper-btn flex-1 px-3 py-2 text-xs sm:text-sm ${
                activeTab === "engine"
                  ? "bg-role-orbit text-ink-black"
                  : "bg-space-ink text-slate-300"
              }`}
            >
              2. Engine Isp (15–30 s)
            </button>
          </div>

          {activeTab === "orbit" ? (
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 font-mono text-xs font-bold uppercase text-slate-300">
                  Mission Trajectory Dilemma
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {routes.map((r) => {
                    const active = r.id === route.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={isLocked}
                        onClick={() => {
                          setSelectedRouteId(r.id);
                          emitMutation(r, orbit, engine);
                        }}
                        className={`rounded-xl border-2 p-3 text-left transition ${
                          active
                            ? "border-role-orbit bg-role-orbit/20 shadow-paper"
                            : "border-ink-black bg-space-ink/70 hover:border-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-sm font-bold text-paper-cream">
                            {r.name}
                          </span>
                          <span className="rounded bg-ink-black px-1.5 py-0.5 font-mono text-[11px] text-role-orbit">
                            {r.required_dv_ms} m/s
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300">{r.summary}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-1.5 font-mono text-xs font-bold uppercase text-slate-300">
                  Parking Orbit Altitude (Affects Eclipse &amp; FSPL Signal Loss)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ORBITS.map((o) => {
                    const active = o.id === orbit.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        disabled={isLocked}
                        onClick={() => {
                          setSelectedOrbitId(o.id);
                          emitMutation(route, o, engine);
                        }}
                        className={`rounded-xl border-2 p-2.5 text-left transition ${
                          active
                            ? "border-role-orbit bg-role-orbit/20 shadow-paper"
                            : "border-ink-black bg-space-ink/70 hover:border-slate-400"
                        }`}
                      >
                        <div className="font-display text-sm font-bold text-paper-cream">
                          {o.name}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 font-mono text-[11px] text-slate-300">
                          <span>FSPL: {o.fspl_s_band_db} dB</span>
                          <span>Eclipse: {o.max_eclipse_min.toFixed(1)}m</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="font-mono text-xs font-bold uppercase text-slate-300">
                Select Thruster (Specific Impulse Isp vs. Electrical Power)
              </p>
              {ENGINES.map((e) => {
                const active = e.id === engine.id;
                const burnMult = liveMetrics.fuel_burn_multiplier || 1.0;
                const fracPct = (1 - Math.exp(-(route.required_dv_ms * burnMult) / (e.isp_seconds * G0_M_S2))) * 100;
                return (
                  <button
                    key={e.id}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      setSelectedEngineId(e.id);
                      emitMutation(route, orbit, e);
                    }}
                    className={`w-full rounded-xl border-2 p-3 text-left transition ${
                      active
                        ? "border-role-orbit bg-role-orbit/20 shadow-paper"
                        : "border-ink-black bg-space-ink/70 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-display text-sm font-bold text-paper-cream">
                        <Flame className="h-4 w-4 text-role-finance" />
                        {e.name}
                      </span>
                      <span className="rounded bg-ink-black px-2 py-0.5 font-mono text-xs font-bold text-role-orbit">
                        Isp {e.isp_seconds} s | {e.power_demand_w} W
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-ink-black bg-space-ink">
                      <div
                        className="h-full bg-role-orbit transition-all"
                        style={{ width: `${Math.min(100, fracPct).toFixed(1)}%` }}
                      />
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-slate-300">
                      Propellant Mass Fraction: {fracPct.toFixed(1)}% of spacecraft launch mass
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Paper-Cut Orbital Diagram + Live Inherited Telemetry */}
        <div className="paper-card flex flex-col justify-between gap-3 bg-space-ink/80 p-3 lg:col-span-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-role-orbit">LIVE ORBITAL TELEMETRY</span>
            <span className="font-mono text-xs text-slate-300 tabular-nums">
              {orbit.velocity_kms.toFixed(2)} km/s
            </span>
          </div>

          <svg viewBox="0 0 220 200" className="mx-auto h-44 w-full max-w-[230px]" aria-label="Orbit diagram">
            {/* Eclipse Shadow Cone */}
            <polygon points="110,74 220,56 220,144 110,126" fill="#090D1A" opacity="0.72" />
            {/* Orbit Ring */}
            <circle
              cx="110"
              cy="100"
              r={orbitVisualRadius}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            {/* Earth */}
            <circle cx="110" cy="100" r="24" fill="#06B6D4" stroke="#0F172A" strokeWidth="3" />
            <path d="M98,94 Q112,86 122,96 Q114,108 100,104 Z" fill="#10B981" opacity="0.85" />
            {/* Spacecraft Marker */}
            <g transform={`translate(${110 - orbitVisualRadius * 0.72}, ${100 - orbitVisualRadius * 0.69})`}>
              <circle r="7" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.5" />
              <line x1="0" y1="0" x2={orbitVisualRadius * 0.55} y2={orbitVisualRadius * 0.52} stroke="#A855F7" strokeWidth="1.5" strokeDasharray="3 3" />
            </g>
            {/* Labels */}
            <text x="110" y="192" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">
              {orbit.name} · Slant {orbit.slant_range_km.toLocaleString()} km
            </text>
          </svg>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="rounded-lg border-2 border-ink-black bg-blueprint-navy p-2">
              <span className="block text-[10px] text-slate-400">PROPELLANT EST.</span>
              <span className="text-sm font-bold text-paper-cream tabular-nums">
                {calculations.propellantMassKg} kg
              </span>
            </div>
            <div className="rounded-lg border-2 border-ink-black bg-blueprint-navy p-2">
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <Radio className="h-3 w-3 text-role-science" /> INHERITED FSPL
              </span>
              <span className="text-sm font-bold text-role-science tabular-nums">
                {orbit.fspl_s_band_db.toFixed(1)} dB
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isLocked}
            onClick={() => onSubmitTake(buildPayload())}
            className="paper-btn flex w-full items-center justify-center gap-2 bg-status-ok px-4 py-2.5 text-sm text-ink-black"
          >
            <Sparkles className="h-4 w-4" />
            {isLocked ? "Orbit Locked" : "Confirm Orbit & Propulsion"}
          </button>
        </div>
      </div>
    </div>
  );
}
