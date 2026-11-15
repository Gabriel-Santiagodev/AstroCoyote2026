// Owner: Ismael (Task ISM-03) — Wave 2 VAB Rocket Blueprint & Launcher Auction Minigame
// Integrates Ismael's "construccion-de-cohete-vab-blueprint (1).html" VAB stack & PNG assets
// with the verified NASA launcher catalog from frontend/src/data/nasa_catalog.json (docs/18-roadmap-ismael.md).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  Eye,
  Flame,
  PackageCheck,
  Rocket,
  RotateCw,
  Scale,
  ShieldCheck,
} from "lucide-react";
import nasaCatalog from "../../data/nasa_catalog.json";
import type { MinigameProps } from "../../types/game";

interface CatalogLauncher {
  id: string;
  name: string;
  is_rideshare: boolean;
  min_mass_kg?: number;
  max_mass_leo_kg: number;
  max_mass_sso_kg?: number;
  max_mass_gto_kg?: number;
  max_mass_mars_kg?: number;
  max_mass_kg: number;
  cost_usd: number;
  rate_per_kg_usd?: number;
  fairing_m: string;
  fuente: string;
}

interface VabVisualPreset {
  cofia: "ojiva_puntiaguda" | "ojiva_redondeada" | "capsula_dragon";
  avionica: "avionica_nueva" | "avionica_rm4";
  interetapa: "interetapa_nueva" | "interetapa_falcon";
  tanque1: "tanque_nuevo" | "tanque_falcon";
  motor1: "motor_principal_nuevo" | "base_motores_falcon";
  boosters: null | "boosters_nuevos" | "booster_grande_blanco" | "booster_grande_gris";
  paracaidas: boolean;
  cgFrac: number;
  thrustKn: number;
  stagesLabel: string;
}

const VAB_PRESETS: Record<string, VabVisualPreset> = {
  electron: {
    cofia: "ojiva_puntiaguda",
    avionica: "avionica_nueva",
    interetapa: "interetapa_falcon",
    tanque1: "tanque_falcon",
    motor1: "motor_principal_nuevo",
    boosters: null,
    paracaidas: true,
    cgFrac: 0.48,
    thrustKn: 224,
    stagesLabel: "2 Stages + Kick Stage · Carbon Composite",
  },
  rideshare_quarter: {
    cofia: "ojiva_redondeada",
    avionica: "avionica_nueva",
    interetapa: "interetapa_falcon",
    tanque1: "tanque_falcon",
    motor1: "base_motores_falcon",
    boosters: null,
    paracaidas: false,
    cgFrac: 0.51,
    thrustKn: 7607,
    stagesLabel: "Transporter Quarter Plate (50–300 kg)",
  },
  rideshare_half: {
    cofia: "ojiva_redondeada",
    avionica: "avionica_nueva",
    interetapa: "interetapa_falcon",
    tanque1: "tanque_falcon",
    motor1: "base_motores_falcon",
    boosters: null,
    paracaidas: false,
    cgFrac: 0.5,
    thrustKn: 7607,
    stagesLabel: "Transporter Half Plate (100–452 kg)",
  },
  rideshare_full: {
    cofia: "ojiva_puntiaguda",
    avionica: "avionica_rm4",
    interetapa: "interetapa_falcon",
    tanque1: "tanque_falcon",
    motor1: "base_motores_falcon",
    boosters: null,
    paracaidas: true,
    cgFrac: 0.49,
    thrustKn: 7607,
    stagesLabel: "Transporter Full Plate (200–831 kg)",
  },
  rideshare_xl: {
    cofia: "ojiva_puntiaguda",
    avionica: "avionica_rm4",
    interetapa: "interetapa_falcon",
    tanque1: "tanque_falcon",
    motor1: "base_motores_falcon",
    boosters: null,
    paracaidas: true,
    cgFrac: 0.49,
    thrustKn: 7607,
    stagesLabel: "Transporter XL Plate (up to 831 kg SSO)",
  },
  falcon9_block5: {
    cofia: "capsula_dragon",
    avionica: "avionica_rm4",
    interetapa: "interetapa_falcon",
    tanque1: "tanque_falcon",
    motor1: "base_motores_falcon",
    boosters: null,
    paracaidas: true,
    cgFrac: 0.46,
    thrustKn: 7607,
    stagesLabel: "Falcon 9 Block 5 · 9× Merlin 1D + MVac",
  },
  vulcan_vc6: {
    cofia: "ojiva_puntiaguda",
    avionica: "avionica_rm4",
    interetapa: "interetapa_nueva",
    tanque1: "tanque_nuevo",
    motor1: "motor_principal_nuevo",
    boosters: "booster_grande_blanco",
    paracaidas: false,
    cgFrac: 0.44,
    thrustKn: 10800,
    stagesLabel: "ULA Vulcan VC6 · 2× BE-4 + 6× GEM 63XL SRBs",
  },
  falcon_heavy: {
    cofia: "capsula_dragon",
    avionica: "avionica_rm4",
    interetapa: "interetapa_falcon",
    tanque1: "tanque_nuevo",
    motor1: "base_motores_falcon",
    boosters: "booster_grande_gris",
    paracaidas: true,
    cgFrac: 0.43,
    thrustKn: 22819,
    stagesLabel: "Falcon Heavy · 27× Merlin 1D (3 Cores)",
  },
};

const LAUNCHERS = nasaCatalog.launchers as CatalogLauncher[];
const FEATURED_IDS = new Set([
  "electron",
  "rideshare_xl",
  "falcon9_block5",
  "vulcan_vc6",
  "falcon_heavy",
]);

export function Rol1B_LauncherAuction({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const wetMassKg = Math.max(80, Math.round(liveMetrics.estimated_wet_mass_kg || 1450));
  const remainingBudgetUsd = Math.max(0, Math.round(liveMetrics.remaining_budget_usd || 420_000_000));

  // Auto-pick best initial launcher that fits wetMassKg
  const initialLauncherId = useMemo(() => {
    const fitting = LAUNCHERS.filter((l) => FEATURED_IDS.has(l.id) && l.max_mass_kg >= wetMassKg);
    return fitting[0]?.id ?? "falcon9_block5";
  }, [wetMassKg]);

  const [selectedId, setSelectedId] = useState<string>(initialLauncherId);
  const [fairingOk, setFairingOk] = useState<boolean>(true);
  const [showAllRideshare, setShowAllRideshare] = useState<boolean>(false);

  // VAB Blueprint interactive inspection controls from Ismael's VAB HTML
  const [showCgMarker, setShowCgMarker] = useState<boolean>(true);
  const [yawDeg, setYawDeg] = useState<number>(0);
  const [customCofia, setCustomCofia] = useState<
    "preset" | "ojiva_puntiaguda" | "ojiva_redondeada" | "capsula_dragon"
  >("preset");
  const [isLaunchingPreview, setIsLaunchingPreview] = useState<boolean>(false);

  const autoSubmitted = useRef(false);

  const visibleLaunchers = useMemo(
    () => (showAllRideshare ? LAUNCHERS : LAUNCHERS.filter((l) => FEATURED_IDS.has(l.id))),
    [showAllRideshare]
  );

  const selectedLauncher = useMemo(
    () => LAUNCHERS.find((l) => l.id === selectedId) ?? LAUNCHERS[5],
    [selectedId]
  );

  const vabPreset = VAB_PRESETS[selectedLauncher.id] ?? VAB_PRESETS.falcon9_block5;
  const activeCofia = customCofia === "preset" ? vabPreset.cofia : customCofia;

  // Read rover payload mass if Rol 2A saved it to window.VAB_STATE (Ismael's VAB bridge)
  const roverPayloadTons = useMemo(() => {
    try {
      const w = window as unknown as {
        VAB_STATE?: { roverPayload?: { mass: number; role: string } };
      };
      if (w.VAB_STATE?.roverPayload?.mass) return w.VAB_STATE.roverPayload.mass;
    } catch {
      /* ignore */
    }
    return Number((wetMassKg / 1000).toFixed(2));
  }, [wetMassKg]);

  const emitSelection = useCallback(
    (launcher: CatalogLauncher, nextFairingOk: boolean) => {
      if (isLocked) return;
      onLiveMutation({
        selected_launcher: launcher.id,
        launcher_max_mass_kg: launcher.max_mass_kg,
        fairing_ok: nextFairingOk,
        launch_cost_usd: launcher.cost_usd,
      });
    },
    [isLocked, onLiveMutation]
  );

  const handleSelectLauncher = useCallback(
    (launcher: CatalogLauncher) => {
      if (isLocked) return;
      setSelectedId(launcher.id);
      setFairingOk(true);
      emitSelection(launcher, true);
    },
    [isLocked, emitSelection]
  );

  const handleToggleFairing = useCallback(() => {
    if (isLocked) return;
    setFairingOk((prev) => {
      const next = !prev;
      emitSelection(selectedLauncher, next);
      return next;
    });
  }, [isLocked, emitSelection, selectedLauncher]);

  const buildPayload = useCallback(
    () => ({
      selected_launcher: selectedLauncher.id,
      launcher_max_mass_kg: selectedLauncher.max_mass_kg,
      fairing_ok: fairingOk,
      launch_cost_usd: selectedLauncher.cost_usd,
    }),
    [selectedLauncher, fairingOk]
  );

  useEffect(() => {
    if (timeLeftSec <= 0 && !isLocked && !autoSubmitted.current) {
      autoSubmitted.current = true;
      onSubmitTake(buildPayload());
    }
  }, [timeLeftSec, isLocked, onSubmitTake, buildPayload]);

  const selectedFits = wetMassKg <= selectedLauncher.max_mass_kg;
  const selectedAffordable = selectedLauncher.cost_usd <= remainingBudgetUsd;
  const massMarginKg = selectedLauncher.max_mass_kg - wetMassKg;

  return (
    <div className="space-y-3 text-slate-100">
      {/* Top Status Banner: Live Wet Mass & Remaining Budget */}
      <div className="paper-card flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink-black bg-role-finance font-display text-sm font-bold text-ink-black">
            1B
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-white">
              VAB Launcher Auction & Fairing Integration ({missionId})
            </h3>
            <p className="text-xs text-slate-300">
              Pick a NASA-verified launch vehicle that fits your team&apos;s total wet mass and
              remaining budget, then seal the payload fairing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-ink-black bg-slate-950 px-3 py-1.5">
            <Scale className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-400">Team Wet Mass:</span>
            <strong className="text-sm text-cyan-300">{wetMassKg.toLocaleString()} kg</strong>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-ink-black bg-slate-950 px-3 py-1.5">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-slate-400">Available Budget:</span>
            <strong className="text-sm text-emerald-300">
              ${(remainingBudgetUsd / 1e6).toFixed(1)}M
            </strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Left VAB Blueprint Visualizer (Ismael's VAB HTML) + Right Launcher Cards */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Left Column: Ismael's VAB Blueprint Rocket Stack with real extracted PNGs */}
        <div className="paper-card blueprint-grid relative flex flex-col justify-between overflow-hidden bg-[#161c28] p-3 lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
            <span className="font-display font-bold text-amber-300">
              VAB BLUEPRINT HANGAR · {selectedLauncher.name}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowCgMarker((v) => !v)}
                className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold ${
                  showCgMarker
                    ? "border-amber-400 bg-amber-400/20 text-amber-200"
                    : "border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                <Eye className="mr-1 inline h-3 w-3" />
                CG Marker
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLaunchingPreview(true);
                  window.setTimeout(() => setIsLaunchingPreview(false), 1800);
                }}
                className="rounded border border-cyan-400 bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-200"
              >
                <Flame className="mr-1 inline h-3 w-3" />
                Test Ignition
              </button>
            </div>
          </div>

          {/* Fairing Nosecone Style Selector (Ismael's 3 VAB fairings) */}
          <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px]">
            <span className=" font-mono text-slate-400">Fairing Nose:</span>
            {(
              [
                ["preset", "Default"],
                ["ojiva_puntiaguda", "Pointed Ogive"],
                ["ojiva_redondeada", "Rounded Fairing"],
                ["capsula_dragon", "Dragon Capsule"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                disabled={isLocked}
                onClick={() => setCustomCofia(id)}
                className={`rounded border px-1.5 py-0.5 font-bold ${
                  customCofia === id
                    ? "border-amber-400 bg-amber-400 text-ink-black"
                    : "border-slate-700 bg-slate-900 text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* VAB Vertical Rocket Stack using Ismael's extracted PNGs */}
          <div className="relative my-2 flex min-h-[300px] flex-col items-center justify-end overflow-hidden rounded-xl border-2 border-slate-700/80 bg-gradient-to-b from-[#131924] via-[#1c2536] to-[#263147] p-3">
            {/* Hangar gantry lines */}
            <div className="pointer-events-none absolute inset-x-6 top-3 flex justify-between text-[10px] font-mono text-slate-500">
              <span>GANTRY TOWER A</span>
              <span>PAYLOAD: {roverPayloadTons} t</span>
            </div>

            {/* Rocket Assembly Stack */}
            <div
              className={`relative flex flex-col items-center transition-transform duration-500 ${
                isLaunchingPreview ? "-translate-y-12 scale-105" : ""
              }`}
              style={{ transform: `rotateY(${yawDeg}deg)` }}
            >
              {/* Nosecone / Fairing */}
              <div className="relative flex flex-col items-center">
                <img
                  src={`/assets/vab/${activeCofia}.png`}
                  alt="Rocket Fairing"
                  className={`h-20 w-14 object-contain transition ${
                    fairingOk ? "opacity-100" : "translate-x-2 -rotate-12 opacity-60"
                  }`}
                />
                {vabPreset.paracaidas && (
                  <img
                    src="/assets/vab/paracaidas_modulo.png"
                    alt="Recovery Parachute"
                    title="Radial Recovery Parachute Pack"
                    className="absolute -right-4 top-10 h-6 w-6 object-contain"
                  />
                )}
              </div>

              {/* Avionics Ring */}
              <img
                src={`/assets/vab/${vabPreset.avionica}.png`}
                alt="Avionics Module"
                className="-mt-1 h-12 w-12 object-contain"
              />

              {/* Interstage */}
              <img
                src={`/assets/vab/${vabPreset.interetapa}.png`}
                alt="Interstage"
                className="-mt-1 h-10 w-12 object-contain"
              />

              {/* Core Stage Tank + Optional Symmetric Side Boosters */}
              <div className="relative flex items-end justify-center">
                {vabPreset.boosters && (
                  <img
                    src={`/assets/vab/${vabPreset.boosters}.png`}
                    alt="Left Booster"
                    className="-mr-2 h-28 w-8 object-contain"
                  />
                )}
                <img
                  src={`/assets/vab/${vabPreset.tanque1}.png`}
                  alt="Main Propellant Tank"
                  className="-mt-1 h-32 w-12 object-fill"
                />
                {vabPreset.boosters && (
                  <img
                    src={`/assets/vab/${vabPreset.boosters}.png`}
                    alt="Right Booster"
                    className="-ml-2 h-28 w-8 scale-x-[-1] object-contain"
                  />
                )}

                {/* Center of Gravity (CG) 3D Marker from Ismael's VAB */}
                {showCgMarker && (
                  <div
                    className="pointer-events-none absolute -left-16 flex items-center gap-1 rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-ink-black shadow"
                    style={{ bottom: `${Math.round(vabPreset.cgFrac * 100)}%` }}
                  >
                    <span>CG {(vabPreset.cgFrac * 100).toFixed(0)}%</span>
                    <span className="h-2 w-2 rounded-full bg-ink-black" />
                  </div>
                )}
              </div>

              {/* First Stage Main Engine */}
              <img
                src={`/assets/vab/${vabPreset.motor1}.png`}
                alt="Main Engine"
                className="-mt-1 h-12 w-14 object-contain"
              />

              {/* Ignition exhaust flame */}
              {isLaunchingPreview && (
                <div className="h-10 w-8 animate-pulse rounded-b-full bg-gradient-to-b from-amber-300 via-orange-500 to-transparent blur-[1px]" />
              )}
            </div>

            {/* VAB Launch Mount */}
            <div className="mt-1 flex w-44 items-center justify-between rounded bg-slate-950 px-3 py-1 font-mono text-[9px] font-bold text-slate-400">
              <span className="h-2 w-3 bg-amber-400" />
              <span>PAD 39A HOLD-DOWN CLAMPS</span>
              <span className="h-2 w-3 bg-amber-400" />
            </div>
          </div>

          {/* 360 Rotation Slider + VAB Telemetry */}
          <div className="space-y-1.5 rounded-xl border-2 border-ink-black bg-slate-950/90 p-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                <RotateCw className="h-3.5 w-3.5 text-cyan-400" /> Inspect Yaw: {yawDeg}°
              </span>
              <input
                type="range"
                min={-45}
                max={45}
                value={yawDeg}
                onChange={(e) => setYawDeg(Number(e.target.value))}
                className="h-1.5 w-32 accent-amber-400"
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-300">
              <span>{vabPreset.stagesLabel}</span>
              <span className="text-amber-300">{vabPreset.thrustKn.toLocaleString()} kN</span>
            </div>
          </div>
        </div>

        {/* Right Column: NASA Launcher Auction Cards + Fairing Seal */}
        <div className="paper-card flex flex-col justify-between bg-slate-900/95 p-3 lg:col-span-7">
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-sm font-bold text-white">
                Select Launch Vehicle ({visibleLaunchers.length} Options)
              </span>
              <button
                type="button"
                onClick={() => setShowAllRideshare((v) => !v)}
                className="rounded-lg border-2 border-ink-black bg-slate-800 px-2.5 py-1 font-mono text-xs font-bold text-amber-300 hover:bg-slate-700"
              >
                {showAllRideshare ? "Show 5 Main Vehicles" : "Show All Rideshare Plates (8)"}
              </button>
            </div>

            <div className="grid max-h-[310px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {visibleLaunchers.map((launcher) => {
                const fitsMass = wetMassKg <= launcher.max_mass_kg;
                const excessKg = wetMassKg - launcher.max_mass_kg;
                const fitsBudget = launcher.cost_usd <= remainingBudgetUsd;
                const isSelected = launcher.id === selectedLauncher.id;

                return (
                  <button
                    key={launcher.id}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleSelectLauncher(launcher)}
                    className={`flex flex-col justify-between rounded-xl border-2 p-2.5 text-left transition ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/15 shadow-paper-sm"
                        : "border-ink-black bg-slate-800/90 hover:border-slate-500"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-display text-sm font-bold text-white">
                          {launcher.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-300" />
                        )}
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-300">
                        Max Capacity: <b>{launcher.max_mass_kg.toLocaleString()} kg</b> · Fairing:{" "}
                        {launcher.fairing_m}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] font-extrabold ${
                          fitsMass
                            ? "bg-emerald-500/25 text-emerald-300"
                            : "bg-rose-500/30 text-rose-200"
                        }`}
                      >
                        {fitsMass
                          ? `PAYLOAD FITS! (-${(launcher.max_mass_kg - wetMassKg).toLocaleString()} kg)`
                          : `TOO HEAVY (+${excessKg.toLocaleString()} kg)`}
                      </span>

                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] font-extrabold ${
                          fitsBudget
                            ? "bg-cyan-500/20 text-cyan-200"
                            : "bg-rose-500/30 text-rose-200"
                        }`}
                      >
                        ${(launcher.cost_usd / 1e6).toFixed(1)}M{" "}
                        {fitsBudget ? "OK" : "OVER CAP"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fairing Confirmation Toggle & Final Submit */}
          <div className="mt-3 space-y-2.5 border-t border-slate-700 pt-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-ink-black bg-slate-950/90 p-2.5">
              <div className="flex items-center gap-2">
                <PackageCheck
                  className={`h-5 w-5 ${fairingOk ? "text-emerald-400" : "text-rose-400"}`}
                />
                <div>
                  <span className="block font-display text-xs font-bold text-white">
                    Confirm Payload Fairing Encapsulation ({selectedLauncher.fairing_m})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {selectedFits
                      ? `Margin: +${massMarginKg.toLocaleString()} kg spare capacity`
                      : `WARNING: Wet mass exceeds ${selectedLauncher.name} by ${Math.abs(
                          massMarginKg
                        ).toLocaleString()} kg (Node 1 failure risk!)`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isLocked}
                onClick={handleToggleFairing}
                className={`paper-btn px-3 py-1.5 text-xs ${
                  fairingOk
                    ? "bg-emerald-400 text-ink-black"
                    : "bg-rose-500 text-white"
                }`}
              >
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                {fairingOk ? "Fairing Sealed ✓" : "Fairing UNSEALED!"}
              </button>
            </div>

            {!selectedFits || !selectedAffordable ? (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-200">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>
                  {!selectedFits
                    ? `${selectedLauncher.name} cannot lift ${wetMassKg} kg! Pick a heavier launcher or ask Role 2B to Jettison Ballast (-40 kg).`
                    : `${selectedLauncher.name} exceeds your remaining budget!`}
                </span>
              </div>
            ) : null}

            <button
              type="button"
              disabled={isLocked}
              onClick={() => onSubmitTake(buildPayload())}
              className="paper-btn flex w-full items-center justify-center gap-2 bg-status-ok py-2.5 text-sm text-ink-black"
            >
              <Rocket className="h-4 w-4" />
              {isLocked
                ? "LAUNCHER CONTRACT LOCKED ✓"
                : `CONFIRM ${selectedLauncher.name.toUpperCase()} ($${(
                    selectedLauncher.cost_usd / 1e6
                  ).toFixed(1)}M)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rol1B_LauncherAuction;
