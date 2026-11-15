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

  return (
    <div className="space-y-3 text-slate-100">
      {/* Top Status Banner */}
      <div className="paper-card flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink-black bg-role-spacecraft font-display text-sm font-bold text-ink-black">
            2B
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-white">
              2D Center of Gravity (CG) & Mass Trim ({missionCfg.name})
            </h3>
            <p className="text-xs text-slate-300">
              Select a module on the left, then click one of the <b>8 Mounting Bays</b> so the red
              CG dot stays inside the green tolerance circle (<b>R ≤ {rTolM.toFixed(2)} m</b>).
            </p>
          </div>
        </div>

        {/* Live CG Status Badge */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span
            className={`rounded-xl border-2 border-ink-black px-3 py-1.5 font-extrabold ${
              cgCalc.cgBalanced
                ? "bg-emerald-400 text-ink-black"
                : "bg-rose-500 text-white"
            }`}
          >
            {cgCalc.cgBalanced
              ? `BALANCED! d_CG = ${cgCalc.dCg.toFixed(2)}m (1.0x Burn)`
              : `UNBALANCED! d_CG = ${cgCalc.dCg.toFixed(2)}m > ${rTolM}m (1.5x FUEL!)`}
          </span>
          <span className="rounded-xl border-2 border-ink-black bg-slate-950 px-3 py-1.5 text-cyan-300">
            CML 4 Margin: <b>{cgCalc.massGrowthMarginPct}%</b>
          </span>
        </div>
      </div>

      {/* Main Grid: Left Module Tray + Center 8-Bay CG Grid + Right Radar & Ballast Controls */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Left Column: Hardware Modules from Science (Rol 4A) & Propulsion */}
        <div className="paper-card flex flex-col justify-between bg-slate-900/95 p-3 lg:col-span-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-sm font-bold text-cyan-300">
                1. Select Module to Move
              </span>
              <span className="font-mono text-xs text-slate-400">
                Total: {cgCalc.totalMountedKg} kg
              </span>
            </div>

            <div className="space-y-2">
              {modules.map((mod) => {
                const isSelected = mod.id === selectedModuleId;
                const currentSlot = slotAssignments[mod.id] ?? "—";
                return (
                  <button
                    key={mod.id}
                    type="button"
                    disabled={isLocked}
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={`flex w-full items-center justify-between rounded-xl border-2 p-2.5 text-left transition ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/20 shadow-paper-sm"
                        : "border-ink-black bg-slate-800/90 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-ink-black"
                        style={{ backgroundColor: mod.color }}
                      />
                      <div>
                        <span className="block font-display text-xs font-bold text-white">
                          {mod.name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-300">
                          {mod.mass_kg} kg · Mounted in <b>Bay {currentSlot}</b>
                        </span>
                      </div>
                    </div>
                    <ArrowDownUp className="h-4 w-4 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emergency Jettison Ballast Button */}
          <div className="mt-3 space-y-2 border-t border-slate-700 pt-2.5">
            <div className="rounded-xl border-2 border-rose-500/60 bg-rose-950/30 p-2.5 text-xs">
              <div className="flex items-center justify-between font-bold text-rose-200">
                <span>Emergency Mass Trim</span>
                <span className="font-mono">-{ballastJettisonedKg} kg Jettisoned</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-300">
                If your spacecraft is too heavy for Role 1B&apos;s rocket, jettison structural
                ballast (-40 kg per click, up to -80 kg).
              </p>
              <button
                type="button"
                disabled={isLocked}
                onClick={handleJettisonBallast}
                className="paper-btn mt-2 flex w-full items-center justify-center gap-1.5 bg-rose-500 py-2 text-xs text-white"
              >
                <PackageMinus className="h-4 w-4" />
                {ballastJettisonedKg >= 80
                  ? "RESET BALLAST (0 kg)"
                  : `JETTISON BALLAST (-40 kg) · Net Wet: ${cgCalc.adjustedWetMassKg} kg`}
              </button>
            </div>
          </div>
        </div>

        {/* Center Column: 8-Slot 2D Spacecraft Bus Grid */}
        <div className="paper-card blueprint-grid flex flex-col justify-between bg-[#162038] p-3 lg:col-span-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-display font-bold text-white">
              2. Click Any Bay to Place / Swap Module
            </span>
            <button
              type="button"
              disabled={isLocked}
              onClick={handleAutoBalanceHint}
              className="paper-btn flex items-center gap-1 bg-amber-400 px-2.5 py-1 text-[11px] text-ink-black"
            >
              <Sparkles className="h-3.5 w-3.5" /> Auto-Symmetrize Bays
            </button>
          </div>

          {/* 3x3 Top-View Bus Grid (8 outer bays + Center CG Radar) */}
          <div className="my-2 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((row) =>
              [0, 1, 2].map((col) => {
                // Center cell (1,1) is the live 2D CG Radar Target!
                if (row === 1 && col === 1) {
                  const dotCx = 60 + cgCalc.xCg * 48;
                  const dotCy = 60 - cgCalc.yCg * 48;
                  const rPx = rTolM * 48;
                  return (
                    <div
                      key="CENTER_RADAR"
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-ink-black bg-slate-950 p-1.5"
                    >
                      <svg viewBox="0 0 120 120" className="h-24 w-24">
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="#0B1021"
                          stroke="#334155"
                          strokeWidth="1.5"
                        />
                        <line x1="8" y1="60" x2="112" y2="60" stroke="#334155" strokeDasharray="3 3" />
                        <line x1="60" y1="8" x2="60" y2="112" stroke="#334155" strokeDasharray="3 3" />
                        {/* Green Tolerance Circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r={Math.max(6, rPx)}
                          fill="rgba(34, 197, 94, 0.22)"
                          stroke="#22C55E"
                          strokeWidth="2.2"
                        />
                        {/* Red Live CG Dot */}
                        <circle
                          cx={dotCx}
                          cy={dotCy}
                          r="5.5"
                          fill={cgCalc.cgBalanced ? "#22C55E" : "#EF4444"}
                          stroke="#FFFFFF"
                          strokeWidth="1.8"
                        />
                      </svg>
                      <span className="font-mono text-[10px] font-bold text-slate-300">
                        CG ({cgCalc.xCg >= 0 ? `+${cgCalc.xCg}` : cgCalc.xCg},{" "}
                        {cgCalc.yCg >= 0 ? `+${cgCalc.yCg}` : cgCalc.yCg}) m
                      </span>
                    </div>
                  );
                }

                const slot = MOUNTING_SLOTS.find(
                  (s) => s.gridPos[0] === row && s.gridPos[1] === col
                )!;
                const occupantMod = modules.find((m) => slotAssignments[m.id] === slot.slotId);
                const isSelectedOccupant = occupantMod?.id === selectedModuleId;

                return (
                  <button
                    key={slot.slotId}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleSelectSlot(slot.slotId)}
                    className={`flex min-h-[96px] flex-col justify-between rounded-xl border-2 p-2 text-left transition ${
                      isSelectedOccupant
                        ? "border-cyan-400 bg-cyan-500/25 shadow-paper-sm"
                        : occupantMod
                        ? "border-emerald-400/70 bg-slate-900/90 hover:border-cyan-300"
                        : "border-dashed border-slate-600 bg-slate-900/40 hover:border-amber-400"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between font-mono text-[10px] text-slate-400">
                      <span className="font-bold text-white">BAY {slot.slotId}</span>
                      <span>
                        ({slot.x_m},{slot.y_m})
                      </span>
                    </div>

                    {occupantMod ? (
                      <div className="my-1">
                        <span
                          className="inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-ink-black"
                          style={{ backgroundColor: occupantMod.color }}
                        >
                          {occupantMod.mass_kg} kg
                        </span>
                        <span className="mt-1 block truncate font-display text-xs font-bold text-white">
                          {occupantMod.name}
                        </span>
                      </div>
                    ) : (
                      <span className="my-auto text-center font-mono text-[10px] text-slate-500">
                        Empty Bay (Tap to Place)
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="text-center font-mono text-[11px] text-slate-300">
            Tip: Balance heavy modules on opposite bays (e.g., <b>Bay N</b> vs <b>Bay S</b>, or{" "}
            <b>Bay W</b> vs <b>Bay E</b>).
          </div>
        </div>

        {/* Right Column: Physics Telemetry & Confirm Take */}
        <div className="paper-card flex flex-col justify-between bg-slate-900/95 p-3 lg:col-span-3">
          <div className="space-y-2.5 text-xs">
            <h4 className="flex items-center gap-1.5 font-display text-sm font-bold text-white">
              <Crosshair className="h-4 w-4 text-cyan-400" /> CG & Thrust Telemetry
            </h4>

            <div className="space-y-1.5 rounded-xl border-2 border-ink-black bg-slate-950 p-2.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Radial Offset d_CG:</span>
                <strong className={cgCalc.cgBalanced ? "text-emerald-300" : "text-rose-400"}>
                  {cgCalc.dCg.toFixed(3)} m
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mission Limit R_tol:</span>
                <strong className="text-white">{rTolM.toFixed(2)} m</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fuel Burn Mult:</span>
                <strong className={cgCalc.cgBalanced ? "text-emerald-300" : "text-rose-400"}>
                  {cgCalc.fuelBurnMultiplier.toFixed(1)}x
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DSN Pointing Drift:</span>
                <strong className={cgCalc.cgBalanced ? "text-emerald-300" : "text-amber-300"}>
                  {cgCalc.cgBalanced ? "1.0x Nominal" : "1.5x High Drift"}
                </strong>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-2.5 text-[11px] leading-relaxed text-slate-300">
              <strong className="block text-cyan-300">Why CG Matters (NASA JPL):</strong>
              If the Center of Gravity is offset from the main thruster axis, attitude control
              thrusters must fire continuously during orbital insertion (Node 2), burning{" "}
              <b>1.5× propellant</b> and shaking the High-Gain Antenna in Role 4B.
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <button
              type="button"
              disabled={isLocked}
              onClick={() => onSubmitTake(buildPayload())}
              className="paper-btn flex w-full items-center justify-center gap-2 bg-status-ok py-2.5 text-sm text-ink-black"
            >
              {cgCalc.cgBalanced ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Flame className="h-4 w-4" />
              )}
              {isLocked ? "CG BALANCE LOCKED ✓" : "CONFIRM MASS & CG BALANCE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rol2B_MassBalanceTask;
