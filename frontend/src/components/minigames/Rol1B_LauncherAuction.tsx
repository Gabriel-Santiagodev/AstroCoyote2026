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
import { AnimatePresence, motion } from "framer-motion";
import { soundEngine } from "../paper/SoundEngine";
import { GameLayout, GoalList, LockButton, PanelCard, PlayBackdrop, Readout, type Goal } from "./kit/GameKit";

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
  // Starts open: sealing the nose cone is a player action (hold-to-seal).
  const [fairingOk, setFairingOk] = useState<boolean>(false);
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
      setFairingOk(false);
      emitSelection(launcher, false);
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

  // ---------------------------------------------------------------------------
  // Game window UI (2026-11-15): VAB hangar with the stacked rocket, a rocket lineup,
  // test ignition and a hold-to-seal nose cone. Model above unchanged except that the
  // nose cone starts open (sealing it is now a player action).
  // ---------------------------------------------------------------------------
  const [holdPct, setHoldPct] = useState(0);
  const holdTimer = useRef<number | null>(null);
  const stopHold = () => {
    if (holdTimer.current !== null) window.clearInterval(holdTimer.current);
    holdTimer.current = null;
  };
  useEffect(() => stopHold, []);
  const startHold = () => {
    if (isLocked || fairingOk) return;
    stopHold();
    let pct = 0;
    holdTimer.current = window.setInterval(() => {
      pct += 10;
      setHoldPct(pct);
      if (pct >= 100) {
        stopHold();
        soundEngine.playComplete();
        setFairingOk(true);
        emitSelection(selectedLauncher, true);
      }
    }, 70);
  };
  const cancelHold = () => {
    stopHold();
    if (!fairingOk) setHoldPct(0);
  };
  const testIgnition = () => {
    if (isLaunchingPreview) return;
    soundEngine.playSceneJump();
    setIsLaunchingPreview(true);
    window.setTimeout(() => setIsLaunchingPreview(false), 1400);
  };

  const goals: Goal[] = [
    { label: "Rocket strong enough", done: selectedFits },
    { label: "Inside the budget", done: selectedAffordable },
    { label: "Nose cone sealed", done: fairingOk },
  ];
  const liftPct = (wetMassKg / Math.max(1, selectedLauncher.max_mass_kg)) * 100;
  const costPct = (selectedLauncher.cost_usd / Math.max(1, remainingBudgetUsd)) * 100;

  return (
    <GameLayout
      play={
        <div className="relative flex h-full flex-col">
          <PlayBackdrop tint="#F97316" />
          {/* yellow gantry crane */}
          <div className="pointer-events-none absolute inset-x-6 top-2 h-4 rounded border-[3px] border-ink-black bg-status-warn" aria-hidden="true" />
          <div className="pointer-events-none absolute left-8 top-2 h-[70%] w-5 border-[3px] border-ink-black bg-status-warn" aria-hidden="true"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0 8px, rgba(15,23,42,0.6) 8px 11px)" }} />

          <div className="relative flex min-h-0 flex-1 items-end justify-center gap-6 px-3 pt-8">
            {/* the stacked rocket (VAB assets) */}
            <motion.div
              className="relative flex flex-col items-center"
              animate={isLaunchingPreview ? { y: [0, -6, 4, -10, 0] } : { y: 0 }}
              transition={{ duration: 1.2 }}
            >
              <motion.img
                src={`/assets/vab/${activeCofia}.png`}
                alt="Nose cone"
                className="h-16 w-12 object-contain sm:h-20 sm:w-14"
                animate={fairingOk ? { y: 0, rotate: 0, opacity: 1 } : { y: -10, rotate: -14, x: 10, opacity: 0.75 }}
              />
              <img src={`/assets/vab/${vabPreset.avionica}.png`} alt="Avionics" className="-mt-1 h-10 w-10 object-contain sm:h-12 sm:w-12" />
              <img src={`/assets/vab/${vabPreset.interetapa}.png`} alt="Interstage" className="-mt-1 h-8 w-10 object-contain sm:h-10 sm:w-12" />
              <div className="relative flex items-end justify-center">
                {vabPreset.boosters && (
                  <img src={`/assets/vab/${vabPreset.boosters}.png`} alt="" className="-mr-2 h-24 w-7 object-contain sm:h-28 sm:w-8" />
                )}
                <img src={`/assets/vab/${vabPreset.tanque1}.png`} alt="Core tank" className="-mt-1 h-28 w-10 object-fill sm:h-32 sm:w-12" />
                {vabPreset.boosters && (
                  <img src={`/assets/vab/${vabPreset.boosters}.png`} alt="" className="-ml-2 h-24 w-7 scale-x-[-1] object-contain sm:h-28 sm:w-8" />
                )}
              </div>
              <img src={`/assets/vab/${vabPreset.motor1}.png`} alt="Engines" className="-mt-1 h-10 w-12 object-contain sm:h-12 sm:w-14" />
              <AnimatePresence>
                {isLaunchingPreview && (
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: [0.6, 1.2, 0.9, 1.1], opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, repeat: 2 }}
                    style={{ transformOrigin: "top" }}
                    className="h-12 w-8 rounded-b-full border-2 border-ink-black bg-gradient-to-b from-yellow-300 via-orange-500 to-transparent"
                  />
                )}
              </AnimatePresence>
              <div className="mt-1 h-3 w-40 rounded border-2 border-ink-black bg-slate-700" />
            </motion.div>

            {/* lift gauge next to the rocket */}
            <div className="mb-4 flex h-48 w-8 flex-col-reverse overflow-hidden rounded-full border-[3px] border-ink-black bg-space-ink" title="Ship weight vs. rocket lift">
              <motion.div
                className={selectedFits ? "bg-status-ok" : "bg-status-crit"}
                initial={false}
                animate={{ height: `${Math.min(100, liftPct)}%` }}
              />
            </div>
          </div>

          <div className="relative flex flex-wrap items-center justify-center gap-2 px-3 pb-2">
            <button type="button" onClick={testIgnition} disabled={isLocked}
              className="paper-btn inline-flex items-center gap-1.5 bg-space-ink px-3 py-1.5 text-xs text-paper-cream">
              <Flame className="h-4 w-4 text-orange-400" /> Test ignition
            </button>
            <button
              type="button"
              disabled={isLocked || fairingOk}
              onPointerDown={startHold}
              onPointerUp={cancelHold}
              onPointerLeave={cancelHold}
              onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") startHold(); }}
              onKeyUp={cancelHold}
              className={`paper-btn relative inline-flex items-center gap-1.5 overflow-hidden px-3 py-1.5 text-xs text-ink-black ${fairingOk ? "bg-status-ok" : "bg-paper-cream"}`}
            >
              <span className="absolute inset-y-0 left-0 bg-status-ok/60" style={{ width: `${fairingOk ? 100 : holdPct}%` }} />
              <PackageCheck className="relative h-4 w-4" />
              <span className="relative">{fairingOk ? "Nose sealed" : "Hold to seal nose"}</span>
            </button>
          </div>

          {/* rocket lineup */}
          <div className="relative grid grid-cols-5 gap-1.5 border-t-[3px] border-ink-black bg-slate-900/80 p-2">
            {visibleLaunchers.slice(0, 5).map((launcher) => {
              const fits = wetMassKg <= launcher.max_mass_kg;
              const affordable = launcher.cost_usd <= remainingBudgetUsd;
              const active = launcher.id === selectedLauncher.id;
              return (
                <button
                  key={launcher.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    soundEngine.playClick();
                    handleSelectLauncher(launcher);
                    setHoldPct(0);
                  }}
                  className={`min-w-0 rounded-lg border-[3px] px-1 py-1.5 text-center transition ${
                    active ? "border-paper-cream bg-blueprint-navy shadow-paper-sm" : "border-ink-black bg-space-ink hover:bg-blueprint-navy"
                  }`}
                >
                  <Rocket className={`mx-auto h-5 w-5 ${fits ? "text-status-ok" : "text-status-crit"}`} />
                  <div className="truncate font-display text-[11px] font-bold leading-tight">{launcher.name.replace("SpaceX ", "")}</div>
                  <div className={`font-mono text-[10px] font-bold ${affordable ? "text-amber-300" : "text-status-crit"}`}>
                    ${(launcher.cost_usd / 1e6).toFixed(0)}M
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      }
      panel={
        <>
          <GoalList goals={goals} />
          <PanelCard title={selectedLauncher.name}>
            <div className="space-y-2">
              <Readout
                label="Ship weight / lift"
                value={`${wetMassKg.toLocaleString()} / ${selectedLauncher.max_mass_kg.toLocaleString()} kg`}
                pct={liftPct}
                tone={selectedFits ? (liftPct > 90 ? "warn" : "ok") : "bad"}
              />
              <Readout
                label="Cost / money left"
                value={`$${(selectedLauncher.cost_usd / 1e6).toFixed(1)}M / $${Math.round(remainingBudgetUsd / 1e6)}M`}
                pct={costPct}
                tone={selectedAffordable ? "ok" : "bad"}
              />
              <Readout
                label="Spare lift"
                value={`${massMarginKg >= 0 ? "+" : ""}${massMarginKg.toLocaleString()} kg`}
                tone={massMarginKg >= 0 ? "ok" : "bad"}
              />
            </div>
          </PanelCard>
          {!selectedFits && (
            <div className="flex items-center gap-2 rounded-xl border-[3px] border-ink-black bg-status-crit px-2.5 py-1.5 text-xs font-bold text-ink-black">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Too heavy: liftoff will fail.
            </div>
          )}
          <LockButton isLocked={isLocked} ready={goals.every((g) => g.done)} label="Lock rocket" onLock={() => onSubmitTake(buildPayload())} />
        </>
      }
    />
  );
}

export default Rol1B_LauncherAuction;
