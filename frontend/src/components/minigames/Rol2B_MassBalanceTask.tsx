// Owner: Ismael (Task ISM-04) — Wave 2 2D Center of Gravity (CG) & Mass Balance Minigame
// Implements 8-slot 2D CG grid, JPL CML 4 mass growth margin (>=35%), real Rol 4A instruments,
// and emergency Jettison Ballast (-40 kg) per docs/18-roadmap-ismael.md & docs/06-datos-nasa.md.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDownUp,
  CheckCircle2,
  Crosshair,
  Flame,
  PackageMinus,
  RotateCcw,
  Scale,
  Sparkles,
} from "lucide-react";
import nasaCatalog from "../../data/nasa_catalog.json";
import type { MinigameProps } from "../../types/game";
import { AnimatePresence, motion } from "framer-motion";
import { soundEngine } from "../paper/SoundEngine";
import { GameLayout, GoalList, LockButton, PanelCard, PlayBackdrop, Readout, type Goal } from "./kit/GameKit";

interface MassModule {
  id: string;
  name: string;
  mass_kg: number;
  category: "propulsion" | "science" | "avionics";
  color: string;
}

interface MountingSlot {
  slotId: string;
  label: string;
  x_m: number;
  y_m: number;
  gridPos: [number, number]; // row 0..2, col 0..2 (center 1,1 is CG bullseye)
}

// 8 symmetric mounting bays around the spacecraft centerline (coords in [-0.75 m, +0.75 m])
const MOUNTING_SLOTS: MountingSlot[] = [
  { slotId: "NW", label: "Bay NW (-0.6, +0.6)", x_m: -0.6, y_m: 0.6, gridPos: [0, 0] },
  { slotId: "N", label: "Bay N (0.0, +0.75)", x_m: 0.0, y_m: 0.75, gridPos: [0, 1] },
  { slotId: "NE", label: "Bay NE (+0.6, +0.6)", x_m: 0.6, y_m: 0.6, gridPos: [0, 2] },
  { slotId: "W", label: "Bay W (-0.75, 0.0)", x_m: -0.75, y_m: 0.0, gridPos: [1, 0] },
  { slotId: "E", label: "Bay E (+0.75, 0.0)", x_m: 0.75, y_m: 0.0, gridPos: [1, 2] },
  { slotId: "SW", label: "Bay SW (-0.6, -0.6)", x_m: -0.6, y_m: -0.6, gridPos: [2, 0] },
  { slotId: "S", label: "Bay S (0.0, -0.75)", x_m: 0.0, y_m: -0.75, gridPos: [2, 1] },
  { slotId: "SE", label: "Bay SE (+0.6, -0.6)", x_m: 0.6, y_m: -0.6, gridPos: [2, 2] },
];

const TOLERANCE_BY_DIFFICULTY: Record<string, number> = {
  easy: 0.25,
  medium: 0.15,
  hard: 0.08,
};

export function Rol2B_MassBalanceTask({
  missionId,
  difficulty,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const missionCfg = nasaCatalog.missions[missionId] ?? nasaCatalog.missions.artemis_moon;
  const rTolM = useMemo(() => {
    const byDiff = TOLERANCE_BY_DIFFICULTY[difficulty];
    const byMission = Number(missionCfg.cg_tolerance_m || 0.15);
    return byDiff ?? byMission;
  }, [difficulty, missionCfg.cg_tolerance_m]);

  // Build list of modules to mount: Science instruments from Rol 4A + Fuel Tank (80 kg) + Avionics Counterweight (30 kg)
  const modules = useMemo<MassModule[]>(() => {
    const incoming = Array.isArray(liveMetrics.selected_instruments)
      ? liveMetrics.selected_instruments
      : [];

    const sciModules: MassModule[] =
      incoming.length > 0
        ? incoming.slice(0, 4).map((inst, idx) => ({
            id: `inst_${inst.id || idx}`,
            name: inst.name || `Payload #${idx + 1}`,
            mass_kg: Math.max(5, Number(inst.mass_kg) || 35),
            category: "science" as const,
            color: "#A855F7",
          }))
        : [
            {
              id: "inst_main_cam",
              name: "Main Optical Camera",
              mass_kg: 45,
              category: "science",
              color: "#A855F7",
            },
            {
              id: "inst_avionics",
              name: "Avionics & Guidance Box",
              mass_kg: 25,
              category: "avionics",
              color: "#38BDF8",
            },
          ];

    return [
      {
        id: "fuel_tank_main",
        name: "Bipropellant Fuel Tank",
        mass_kg: 80,
        category: "propulsion",
        color: "#F59E0B",
      },
      {
        id: "trim_battery_bus",
        name: "Trim Battery Counterweight",
        mass_kg: 70,
        category: "avionics",
        color: "#10B981",
      },
      ...sciModules,
    ];
  }, [liveMetrics.selected_instruments]);

  // Map: moduleId -> slotId (starts intentionally off-center on NW/N/W so the player balances it!)
  const [slotAssignments, setSlotAssignments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    const startSlots = ["NW", "N", "W", "SW", "NE", "SE"];
    modules.forEach((m, idx) => {
      initial[m.id] = startSlots[idx % startSlots.length];
    });
    return initial;
  });

  // Sync if `modules` changes (e.g. live update from Rol 4A)
  useEffect(() => {
    setSlotAssignments((prev) => {
      const next: Record<string, string> = {};
      const used = new Set<string>();
      const fallbackOrder = ["NW", "N", "W", "E", "S", "SE", "NE", "SW"];
      for (const m of modules) {
        const existing = prev[m.id];
        if (existing && !used.has(existing)) {
          next[m.id] = existing;
          used.add(existing);
        } else {
          const free = fallbackOrder.find((s) => !used.has(s)) ?? "N";
          next[m.id] = free;
          used.add(free);
        }
      }
      return next;
    });
  }, [modules]);

  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id ?? "fuel_tank_main");
  const [ballastJettisonedKg, setBallastJettisonedKg] = useState<number>(0);

  const autoSubmitted = useRef(false);

  // Compute 2D Center of Gravity (matches backend/physics_engine.py compute_cg_distance)
  const cgCalc = useMemo(() => {
    const placements: Array<{ id: string; mass_kg: number; x_m: number; y_m: number }> = [];
    let totalMass = 0;
    let sumMx = 0;
    let sumMy = 0;

    for (const mod of modules) {
      const assignedSlotId = slotAssignments[mod.id];
      const slot = MOUNTING_SLOTS.find((s) => s.slotId === assignedSlotId);
      if (!slot) continue;
      placements.push({
        id: mod.id,
        mass_kg: mod.mass_kg,
        x_m: slot.x_m,
        y_m: slot.y_m,
      });
      totalMass += mod.mass_kg;
      sumMx += mod.mass_kg * slot.x_m;
      sumMy += mod.mass_kg * slot.y_m;
    }

    const xCg = totalMass > 0 ? Number((sumMx / totalMass).toFixed(3)) : 0;
    const yCg = totalMass > 0 ? Number((sumMy / totalMass).toFixed(3)) : 0;
    const dCg = Number(Math.hypot(xCg, yCg).toFixed(3));
    const cgBalanced = placements.length === modules.length && dCg <= rTolM;
    const fuelBurnMultiplier = cgBalanced ? 1.0 : 1.5;

    // JPL CML 4 mass growth margin (>= 35% nominal when balanced; boosted by jettisoning ballast)
    const wetEst = Math.max(300, liveMetrics.estimated_wet_mass_kg - ballastJettisonedKg);
    const baseMargin = cgBalanced ? 36 : 24;
    const ballastBonus = Math.round((ballastJettisonedKg / Math.max(400, wetEst)) * 100);
    const massGrowthMarginPct = Math.min(50, baseMargin + ballastBonus);

    return {
      placements,
      totalMountedKg: totalMass,
      xCg,
      yCg,
      dCg,
      cgBalanced,
      fuelBurnMultiplier,
      massGrowthMarginPct,
      adjustedWetMassKg: Math.round(wetEst),
    };
  }, [modules, slotAssignments, rTolM, liveMetrics.estimated_wet_mass_kg, ballastJettisonedKg]);

  const emitLive = useCallback(
    (
      nextAssignments: Record<string, string>,
      nextBallastKg: number
    ) => {
      if (isLocked) return;
      const placements: Array<{ mass_kg: number; x_m: number; y_m: number }> = [];
      let totalM = 0;
      let sx = 0;
      let sy = 0;
      for (const mod of modules) {
        const slot = MOUNTING_SLOTS.find((s) => s.slotId === nextAssignments[mod.id]);
        if (!slot) continue;
        placements.push({ mass_kg: mod.mass_kg, x_m: slot.x_m, y_m: slot.y_m });
        totalM += mod.mass_kg;
        sx += mod.mass_kg * slot.x_m;
        sy += mod.mass_kg * slot.y_m;
      }
      const x = totalM > 0 ? sx / totalM : 0;
      const y = totalM > 0 ? sy / totalM : 0;
      const d = Math.hypot(x, y);
      const balanced = placements.length === modules.length && d <= rTolM;
      const mult = balanced ? 1.0 : 1.5;

      onLiveMutation({
        cg_balanced: balanced,
        fuel_burn_multiplier: mult,
        ballast_jettisoned_kg: nextBallastKg,
        placements,
      });
    },
    [isLocked, modules, rTolM, onLiveMutation]
  );

  // Move selected module to `targetSlotId` (swapping if occupied)
  const handleSelectSlot = useCallback(
    (targetSlotId: string) => {
      if (isLocked || !selectedModuleId) return;
      setSlotAssignments((prev) => {
        const next = { ...prev };
        const prevSlotOfSelected = next[selectedModuleId];
        const occupantId = Object.keys(next).find((mId) => next[mId] === targetSlotId);

        if (occupantId && occupantId !== selectedModuleId) {
          next[occupantId] = prevSlotOfSelected;
        }
        next[selectedModuleId] = targetSlotId;
        emitLive(next, ballastJettisonedKg);
        return next;
      });
    },
    [isLocked, selectedModuleId, emitLive, ballastJettisonedKg]
  );

  // Quick helper to place heaviest parts on opposite symmetric bays
  const handleAutoBalanceHint = useCallback(() => {
    if (isLocked) return;
    const sorted = [...modules].sort((a, b) => b.mass_kg - a.mass_kg);
    const symmetricPairs = ["N", "S", "W", "E", "NW", "SE", "NE", "SW"];
    const next: Record<string, string> = {};
    sorted.forEach((m, i) => {
      next[m.id] = symmetricPairs[i % symmetricPairs.length];
    });
    setSlotAssignments(next);
    emitLive(next, ballastJettisonedKg);
  }, [isLocked, modules, emitLive, ballastJettisonedKg]);

  const handleJettisonBallast = useCallback(() => {
    if (isLocked) return;
    setBallastJettisonedKg((prev) => {
      const next = prev >= 80 ? 0 : prev + 40;
      emitLive(slotAssignments, next);
      return next;
    });
  }, [isLocked, slotAssignments, emitLive]);

  const buildPayload = useCallback(
    () => ({
      cg_balanced: cgCalc.cgBalanced,
      fuel_burn_multiplier: cgCalc.fuelBurnMultiplier,
      mass_growth_margin_pct: cgCalc.massGrowthMarginPct,
      ballast_jettisoned_kg: ballastJettisonedKg,
      placements: cgCalc.placements,
    }),
    [cgCalc, ballastJettisonedKg]
  );

  useEffect(() => {
    if (timeLeftSec <= 0 && !isLocked && !autoSubmitted.current) {
      autoSubmitted.current = true;
      onSubmitTake(buildPayload());
    }
  }, [timeLeftSec, isLocked, onSubmitTake, buildPayload]);

  // ---------------------------------------------------------------------------
  // Game window UI (2026-11-15): top-down ship disc with 8 bays, live red CG dot and the green
  // tolerance circle; tap a module, then a bay. Model above (CG math, payload) unchanged.
  // ---------------------------------------------------------------------------
  const DISC_R = 100; // SVG units for the ship disc radius
  const BAY_SPAN_M = 0.75; // farthest bay distance in metres (MOUNTING_SLOTS)
  const toSvg = (m: number) => (m / BAY_SPAN_M) * DISC_R * 0.72;
  const moduleById = (id: string) => modules.find((m) => m.id === id);
  const occupantOf = (slotId: string) => Object.keys(slotAssignments).find((mId) => slotAssignments[mId] === slotId);
  const allPlaced = cgCalc.placements.length === modules.length;
  const goals: Goal[] = [
    { label: "Every module in a bay", done: allPlaced },
    { label: "Red dot in the green circle", done: cgCalc.cgBalanced },
  ];
  const offPct = Math.min(100, (cgCalc.dCg / Math.max(0.01, rTolM * 2)) * 100);

  return (
    <GameLayout
      play={
        <div className="relative flex h-full flex-col sm:flex-row">
          <PlayBackdrop tint="#22D3EE" />
          {/* module tray */}
          <div className="relative z-10 flex shrink-0 gap-1.5 overflow-x-auto p-2 sm:w-40 sm:flex-col sm:overflow-y-auto">
            {modules.map((m) => {
              const sel = m.id === selectedModuleId;
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedModuleId(m.id);
                  }}
                  className={`flex min-w-[7rem] items-center gap-2 rounded-lg border-[3px] px-2 py-1.5 text-left ${
                    sel ? "border-paper-cream bg-blueprint-navy shadow-paper-sm" : "border-ink-black bg-space-ink"
                  }`}
                >
                  <span className="h-4 w-4 shrink-0 rounded-full border-2 border-ink-black" style={{ backgroundColor: m.color }} />
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-bold leading-tight">{m.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{m.mass_kg} kg</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* ship disc */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-2">
            <svg viewBox="-130 -130 260 260" className="h-full max-h-[420px] w-full max-w-[420px]" role="img" aria-label="Ship balance view">
              <circle r={DISC_R + 14} fill="#334155" stroke="#0F172A" strokeWidth="6" />
              <circle r={DISC_R} fill="#1E293B" stroke="#475569" strokeWidth="3" strokeDasharray="6 6" />
              <line x1={-DISC_R} x2={DISC_R} y1="0" y2="0" stroke="#475569" strokeWidth="2" />
              <line y1={-DISC_R} y2={DISC_R} x1="0" x2="0" stroke="#475569" strokeWidth="2" />
              {/* tolerance circle */}
              <circle r={Math.max(6, toSvg(rTolM))} fill="#22C55E33" stroke="#22C55E" strokeWidth="3" />
              {/* bays */}
              {MOUNTING_SLOTS.map((slot) => {
                const occ = occupantOf(slot.slotId);
                const mod = occ ? moduleById(occ) : undefined;
                const cx = toSvg(slot.x_m);
                const cy = -toSvg(slot.y_m);
                return (
                  <g
                    key={slot.slotId}
                    role="button"
                    tabIndex={0}
                    aria-label={`Bay ${slot.slotId}${mod ? `: ${mod.name}` : " empty"}`}
                    onClick={() => {
                      if (isLocked) return;
                      soundEngine.playClick();
                      if (occ && occ !== selectedModuleId && !selectedModuleId) setSelectedModuleId(occ);
                      else handleSelectSlot(slot.slotId);
                    }}
                    style={{ cursor: isLocked ? "default" : "pointer" }}
                  >
                    <circle cx={cx} cy={cy} r="22" fill={mod ? mod.color : "#0F172A"} stroke="#0F172A" strokeWidth="5"
                      opacity={mod ? 1 : 0.85} />
                    {!mod && <circle cx={cx} cy={cy} r="16" fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="4 4" />}
                    {mod && (
                      <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill="#0F172A">
                        {mod.mass_kg}
                      </text>
                    )}
                    {mod?.id === selectedModuleId && (
                      <circle cx={cx} cy={cy} r="27" fill="none" stroke="#F8FAFC" strokeWidth="3" />
                    )}
                  </g>
                );
              })}
              {/* live CG dot */}
              <motion.g initial={false} animate={{ x: toSvg(cgCalc.xCg), y: -toSvg(cgCalc.yCg) }} transition={{ type: "spring", stiffness: 160, damping: 16 }}>
                <circle r="9" fill={cgCalc.cgBalanced ? "#22C55E" : "#EF4444"} stroke="#0F172A" strokeWidth="4" />
                <circle r="3" fill="#F8FAFC" />
              </motion.g>
            </svg>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
              <button type="button" onClick={handleAutoBalanceHint} disabled={isLocked}
                className="paper-btn inline-flex items-center gap-1 bg-space-ink px-2.5 py-1 text-xs text-paper-cream">
                <Sparkles className="h-3.5 w-3.5 text-sky-glow" /> Hint
              </button>
              <button type="button" onClick={() => { soundEngine.playClick(); handleJettisonBallast(); }} disabled={isLocked}
                className="paper-btn inline-flex items-center gap-1 bg-paper-cream px-2.5 py-1 text-xs text-ink-black">
                <PackageMinus className="h-3.5 w-3.5" /> Ballast {ballastJettisonedKg > 0 ? `-${ballastJettisonedKg} kg` : ""}
              </button>
            </div>
          </div>
        </div>
      }
      panel={
        <>
          <GoalList goals={goals} />
          <PanelCard title="Balance">
            <div className="space-y-2">
              <Readout label="Off-center" value={`${cgCalc.dCg.toFixed(2)} m`} pct={offPct}
                tone={cgCalc.cgBalanced ? "ok" : offPct < 75 ? "warn" : "bad"} />
              <Readout label="Allowed" value={`${rTolM.toFixed(2)} m`} tone="info" />
              <Readout label="Fuel burn" value={`${cgCalc.fuelBurnMultiplier.toFixed(1)}×`} tone={cgCalc.cgBalanced ? "ok" : "bad"} />
              <Readout label="Ship weight" value={`${cgCalc.adjustedWetMassKg.toLocaleString()} kg`} tone="info" />
            </div>
          </PanelCard>
          {!cgCalc.cgBalanced && allPlaced && (
            <div className="flex items-center gap-2 rounded-xl border-[3px] border-ink-black bg-status-warn px-2.5 py-1.5 text-xs font-bold text-ink-black">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Put heavy parts on opposite sides.
            </div>
          )}
          <LockButton isLocked={isLocked} ready={goals.every((g) => g.done)} label="Lock balance" onLock={() => onSubmitTake(buildPayload())} />
        </>
      }
    />
  );
}

export default Rol2B_MassBalanceTask;
