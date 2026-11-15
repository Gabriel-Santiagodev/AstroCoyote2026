// Owner: Abraham (Task ABR-03) — Wave 1 Orbital Constraints & Propulsion minigame.
// Implements MinigameProps with verified NASA/WGS84 values from nasa_catalog.json.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Compass, Flame, HelpCircle, Radio, ShieldAlert, Sparkles } from "lucide-react";
import nasaCatalog from "../../data/nasa_catalog.json";
import type { MinigameProps } from "../../types/game";
import { AnimatePresence, motion } from "framer-motion";
import { soundEngine } from "../paper/SoundEngine";
import { GameLayout, GoalList, LockButton, PanelCard, PlayBackdrop, Readout, type Goal } from "./kit/GameKit";

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

  // ---------------------------------------------------------------------------
  // Game window UI (2026-11-15): interactive orbit map. Tap a ring to pick the parking orbit,
  // a route chip to pick the transfer, and an engine card. Model above unchanged.
  // ---------------------------------------------------------------------------
  const [touched, setTouched] = useState<{ route: boolean; orbit: boolean; engine: boolean }>({
    route: false,
    orbit: false,
    engine: false,
  });
  const orbitsByAlt = [...ORBITS].sort((a, b) => a.altitude_km - b.altitude_km);
  const ringRadius = (o: OrbitOption) => 46 + orbitsByAlt.findIndex((x) => x.id === o.id) * 20;
  const pick = (kind: "route" | "orbit" | "engine", nextRoute: RouteOption, nextOrbit: OrbitOption, nextEngine: EngineOption) => {
    if (isLocked) return;
    soundEngine.playClick();
    setTouched((t) => ({ ...t, [kind]: true }));
    if (kind === "route") setSelectedRouteId(nextRoute.id);
    if (kind === "orbit") setSelectedOrbitId(nextOrbit.id);
    if (kind === "engine") setSelectedEngineId(nextEngine.id);
    emitMutation(nextRoute, nextOrbit, nextEngine);
  };
  const goals: Goal[] = [
    { label: "Route chosen", done: touched.route },
    { label: "Parking orbit chosen", done: touched.orbit },
    { label: "Engine chosen", done: touched.engine },
    { label: "Engine power OK", done: !calculations.powerOverBudget },
  ];
  const r = ringRadius(orbit);

  return (
    <GameLayout
      play={
        <div className="relative flex h-full flex-col">
          <PlayBackdrop tint="#2563EB" />
          {/* route chips */}
          <div className="relative z-10 flex flex-wrap gap-1.5 p-2">
            {routes.map((rt) => (
              <button
                key={rt.id}
                type="button"
                disabled={isLocked}
                onClick={() => pick("route", rt, orbit, engine)}
                className={`rounded-lg border-[3px] px-2 py-1 text-left text-xs font-bold ${
                  rt.id === route.id ? "border-paper-cream bg-blueprint-navy" : "border-ink-black bg-space-ink"
                }`}
              >
                <span className="block leading-tight">{rt.name}</span>
                <span className="font-mono text-[10px] text-slate-400">{rt.transit_days} days</span>
              </button>
            ))}
          </div>

          {/* orbit map */}
          <div className="relative min-h-0 flex-1">
            <svg viewBox="0 0 400 260" className="absolute inset-0 h-full w-full" role="img" aria-label="Orbit map">
              {orbitsByAlt.map((o) => (
                <g key={o.id} role="button" tabIndex={0} aria-label={o.name} style={{ cursor: "pointer" }}
                  onClick={() => pick("orbit", route, o, engine)}>
                  <circle cx="120" cy="130" r={ringRadius(o)} fill="none" stroke="transparent" strokeWidth="14" />
                  <circle cx="120" cy="130" r={ringRadius(o)} fill="none"
                    stroke={o.id === orbit.id ? "#FACC15" : "#64748B"} strokeWidth={o.id === orbit.id ? 4 : 2}
                    strokeDasharray={o.id === orbit.id ? undefined : "5 6"} />
                  <text x={120 + ringRadius(o) * 0.71 + 4} y={130 - ringRadius(o) * 0.71} fontSize="9"
                    fontFamily="IBM Plex Mono, monospace" fontWeight="700" fill={o.id === orbit.id ? "#FACC15" : "#94A3B8"}>
                    {o.name.split(" ")[0]}
                  </text>
                </g>
              ))}
              <circle cx="120" cy="130" r="30" fill="#2563EB" stroke="#0F172A" strokeWidth="5" />
              <path d="M100 120 q10 -12 22 -4 t18 6" fill="none" stroke="#22C55E" strokeWidth="7" strokeLinecap="round" />
              {/* satellite riding the chosen ring */}
              <motion.g style={{ transformOrigin: "120px 130px", transformBox: "view-box" }} animate={{ rotate: 360 }}
                transition={{ duration: Math.max(4, orbit.period_min / 20), repeat: Infinity, ease: "linear" }}>
                <rect x={120 + r - 6} y="124" width="12" height="12" rx="2" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />
              </motion.g>
              {/* transfer to the target */}
              <path d={`M${120 + r} 130 C ${220} ${40}, ${300} ${50}, 340 110`} fill="none" stroke="#F97316"
                strokeWidth="3.5" strokeDasharray="10 8" />
              <circle cx="345" cy="115" r="20" fill={missionId === "mars_sample_return" ? "#E4572E" : missionId === "asteroid_hunter" ? "#A8825A" : "#CBD5E1"}
                stroke="#0F172A" strokeWidth="4" />
            </svg>
            <div className="absolute bottom-1 left-2 rounded border-2 border-ink-black bg-paper-cream px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink-black">
              Tap a ring
            </div>
          </div>

          {/* engines */}
          <div className="relative grid grid-cols-2 gap-1.5 border-t-[3px] border-ink-black bg-slate-900/80 p-2 sm:grid-cols-4">
            {ENGINES.map((e) => {
              const tooHungry = e.power_demand_w > liveMetrics.available_power_w;
              return (
                <button
                  key={e.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => pick("engine", route, orbit, e)}
                  className={`min-w-0 rounded-lg border-[3px] px-2 py-1 text-left ${
                    e.id === engine.id ? "border-paper-cream bg-blueprint-navy" : "border-ink-black bg-space-ink"
                  }`}
                >
                  <span className="flex items-center gap-1 truncate text-[11px] font-bold">
                    <Flame className="h-3.5 w-3.5 shrink-0 text-orange-400" /> {e.name}
                  </span>
                  <span className={`font-mono text-[10px] ${tooHungry ? "text-status-crit" : "text-slate-400"}`}>
                    Isp {e.isp_seconds}s · {e.power_demand_w} W
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      }
      panel={
        <>
          <GoalList goals={goals} />
          <PanelCard title="Flight plan">
            <div className="space-y-2">
              <Readout label="Fuel needed" value={`${calculations.propellantMassKg} kg`}
                pct={calculations.propFractionPct} tone={calculations.propFractionPct > 60 ? "warn" : "ok"} />
              <Readout label="Signal loss" value={`${orbit.fspl_s_band_db.toFixed(0)} dB`} tone="info" />
              <Readout label="Darkness / orbit" value={`${orbit.max_eclipse_min.toFixed(0)} min`} tone="info" />
              <Readout label="Engine power" value={`${engine.power_demand_w} / ${Math.round(liveMetrics.available_power_w)} W`}
                tone={calculations.powerOverBudget ? "bad" : "ok"} />
            </div>
          </PanelCard>
          {calculations.burnMult > 1 && (
            <div className="flex items-center gap-2 rounded-xl border-[3px] border-ink-black bg-status-warn px-2.5 py-1.5 text-xs font-bold text-ink-black">
              <ShieldAlert className="h-4 w-4 shrink-0" /> Ship is off-balance: {calculations.burnMult.toFixed(1)}× fuel.
            </div>
          )}
          <LockButton isLocked={isLocked} ready={goals.every((g) => g.done)} label="Lock flight plan" onLock={() => onSubmitTake(buildPayload())} />
        </>
      }
    />
  );
}

export default Rol3A_OrbitalSniper;
