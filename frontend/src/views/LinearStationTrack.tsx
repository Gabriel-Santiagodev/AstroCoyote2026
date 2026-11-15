// Owner: Leonardo (Tasks LEO-05, LEO-08, LEO-09) — Linear station track (2D Flash arcade hangar).
// [BASE] ──► [STATION 1: DESIGN] ──► [SYNC 5s] ──► [STATION 2: INTEGRATION] ──► [LAUNCHPAD]
// The ASTRO SPRITES squad walks automatically (no WASD, docs/08-controles.md §1); teammates show a
// green LOCKED check when `jugador_bloqueo_toma` arrives; the 8 minigames mount through MinigameShell.
// Two presentations:
//   • Host Main Stage (desktop / projector): panoramic hangar track with the 4 sprites marching,
//     live LOCKED checks and the full 6-gauge ResourceHUD.
//   • Phone Crew Console (< 768px or a PIN guest): compact track + compact HUD so the minigame
//     controls own the screen inside a `.handheld-console-frame`.
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Flag,
  Home,
  RefreshCw,
  Rocket,
  Smartphone,
  Tv,
  Wrench,
} from "lucide-react";
import {
  MinigameShell,
  MISSION_LABELS,
  resolveSpriteMood,
  STATION_DURATION_SEC,
  TIMER_CRIT_SEC,
} from "../components/MinigameShell";
import { CrewmateAvatar, ROLE_CHARACTER_PROFILE } from "../components/paper/CrewmateAvatar";
import { STATION_BRIEFINGS, type StationBriefing } from "../data/stationBriefings";
import { MissionCutscene, type CutsceneKind } from "../components/paper/MissionCutscene";
import { ART } from "../data/artManifest";
import { ResourceHUD } from "../components/paper/ResourceHUD";
import { soundEngine } from "../components/paper/SoundEngine";
import { t } from "../i18n";
import nasaCatalog from "../data/nasa_catalog.json";
import { Rol1A_BudgetTable } from "../components/minigames/Rol1A_BudgetTable";
import { Rol1B_LauncherAuction } from "../components/minigames/Rol1B_LauncherAuction";
import { Rol2A_TopologicalAssembly } from "../components/minigames/Rol2A_TopologicalAssembly";
import { Rol2B_MassBalanceTask } from "../components/minigames/Rol2B_MassBalanceTask";
import { Rol3A_OrbitalSniper } from "../components/minigames/Rol3A_OrbitalSniper";
import { Rol3B_AstroLogistics3D } from "../components/minigames/Rol3B_AstroLogistics3D";
import { Rol4A_SpectralLabTask } from "../components/minigames/Rol4A_SpectralLabTask";
import { Rol4B_CommsSpectralHacker } from "../components/minigames/Rol4B_CommsSpectralHacker";
import type { ConnectionStatus, GameMode, GateForecast, JugadorBloqueoTomaPayload, RoomPlayer } from "../socket";
import type {
  DifficultyType,
  LiveMetrics,
  MinigameProps,
  MissionIdType,
  RoleType,
} from "../types/game";

// ---------------------------------------------------------------------------
// Timing constants (docs/21-roadmap-leonardo.md §Paso 5 and docs/04-juego.md)
// ---------------------------------------------------------------------------
/** Automatic crewmate walk between two track nodes. */
export const WALK_DURATION_SEC = 2.2;
/** Default synchronized transition between Station 1 and Station 2 (`iniciar_oleada_2.sync_delay_sec`). */
export const SYNC_DELAY_SEC = 3;
/** UI-only: how long the Launchpad -> 60s Flight loading screen stays up after the walk. */
export const LAUNCH_LOADING_MS = 2300;
/**
 * "Get ready" breather when a station opens: the minigame is visible and explorable, but the
 * 30 s take clock (docs/03 A5) only starts once this countdown ends. Keeps the 1-shot take
 * while giving players time to read the task. Covered server-side by `station_grace_sec`.
 */
export const READY_BREATHER_SEC = 3;
/** Paper wipe between station and hangar: off since 2026-11-15 (briefing card + cutscene captions replace it). */
const USE_PAPER_WIPE = false;
/** Phone console breakpoint (STATE.md Fase 5: phones are `< 768px`). */
export const PHONE_BREAKPOINT_PX = 768;
/** UI-only refresh rate for loading-screen progress bars. */
const LOADING_TICK_MS = 100;
/** UI-only: how long a freshly locked sprite keeps the "complete" sparkle + bay flash. */
const LOCK_CELEBRATION_MS = 1800;

// ---------------------------------------------------------------------------
// Critical metric alerts — thresholds come from nasa_catalog.json (same sources as ResourceHUD)
// ---------------------------------------------------------------------------
export type CriticalAlertId = "overweight" | "budget_depleted" | "ufe_below_minimum" | "no_thermal_protection";

type MissionAlertSpec = { min_ufe_event_pct?: number; requires_thermal_protection?: boolean };

/** Launch mass cap used by the HUD mass gauge (Falcon 9 Block 5 to Mars). */
const LAUNCH_MASS_CAP_KG: number | undefined = nasaCatalog.launchers.find(
  (l) => l.id === "falcon9_block5"
)?.max_mass_mars_kg;

/** Missions without their own `min_ufe_event_pct` fall back to the lowest one in the catalog. */
const CATALOG_MIN_UFE_PCT: number | undefined = (() => {
  const values = Object.values(nasaCatalog.missions)
    .map((m) => (m as MissionAlertSpec).min_ufe_event_pct)
    .filter((v): v is number => typeof v === "number");
  return values.length > 0 ? Math.min(...values) : undefined;
})();

export function getCriticalAlerts(metrics: LiveMetrics, missionId: MissionIdType): CriticalAlertId[] {
  const spec = nasaCatalog.missions[missionId] as MissionAlertSpec;
  const minUfe = spec.min_ufe_event_pct ?? CATALOG_MIN_UFE_PCT;
  const alerts: CriticalAlertId[] = [];
  if (LAUNCH_MASS_CAP_KG !== undefined && metrics.estimated_wet_mass_kg > LAUNCH_MASS_CAP_KG) {
    alerts.push("overweight");
  }
  if (metrics.remaining_budget_usd <= 0) alerts.push("budget_depleted");
  if (minUfe !== undefined && metrics.ufe_reserve_pct < minUfe) alerts.push("ufe_below_minimum");
  if (spec.requires_thermal_protection && !metrics.has_thermal_protection) {
    alerts.push("no_thermal_protection");
  }
  return alerts;
}

const CRITICAL_ALERT_LABEL: Record<CriticalAlertId, string> = {
  overweight: "Too heavy for the rocket",
  budget_depleted: "Out of money",
  ufe_below_minimum: "Safety reserve too low",
  no_thermal_protection: "No heat shield",
};

export const ALL_ROLES: RoleType[] = [
  "finance_launch",
  "spacecraft_mass",
  "orbit_power",
  "science_comms",
];

/** Manual presentation override: "auto" decides from viewport + PIN role. */
export type StageViewOverride = "auto" | "host" | "mobile";

// ---------------------------------------------------------------------------
// Host vs phone helpers (exported so App.tsx can reuse them for Flight60sView)
// ---------------------------------------------------------------------------
export function useIsSmallViewport(breakpointPx: number = PHONE_BREAKPOINT_PX): boolean {
  const query = `(max-width: ${breakpointPx - 1}px)`;
  const read = () =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(query).matches;
  const [isSmall, setIsSmall] = useState<boolean>(read);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const mql = window.matchMedia(query);
    const onChange = () => setIsSmall(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return isSmall;
}

/** Phone console when the viewport is small or the player joined by PIN (multi, not host). */
export function resolvePhoneConsole(opts: {
  isSmallViewport: boolean;
  mode?: GameMode;
  isHost?: boolean;
  override?: StageViewOverride;
}): boolean {
  if (opts.override === "host") return false;
  if (opts.override === "mobile") return true;
  return opts.isSmallViewport || (opts.mode === "multi" && opts.isHost === false);
}

// ---------------------------------------------------------------------------
// Minigame registry (Wave 1 = Rol?A, Wave 2 = Rol?B)
// ---------------------------------------------------------------------------
const WAVE1_MAP: Record<RoleType, ComponentType<MinigameProps>> = {
  finance_launch: Rol1A_BudgetTable,
  spacecraft_mass: Rol2A_TopologicalAssembly,
  orbit_power: Rol3A_OrbitalSniper,
  science_comms: Rol4A_SpectralLabTask,
};

const WAVE2_MAP: Record<RoleType, ComponentType<MinigameProps>> = {
  finance_launch: Rol1B_LauncherAuction,
  spacecraft_mass: Rol2B_MassBalanceTask,
  orbit_power: Rol3B_AstroLogistics3D,
  science_comms: Rol4B_CommsSpectralHacker,
};

// ---------------------------------------------------------------------------
// Track nodes
// ---------------------------------------------------------------------------
type TrackNodeId = "base" | "station_1" | "sync" | "station_2" | "launchpad";

const TRACK_NODES: Array<{
  id: TrackNodeId;
  label: string;
  sub: string;
  Icon: ComponentType<{ className?: string }>;
}> = [
  { id: "base", label: "BASE", sub: "Squad ready", Icon: Home },
  { id: "station_1", label: "STATION 1", sub: "DESIGN", Icon: Wrench },
  { id: "sync", label: "SYNC", sub: `${SYNC_DELAY_SEC}s`, Icon: RefreshCw },
  { id: "station_2", label: "STATION 2", sub: "BUILD", Icon: Cpu },
  { id: "launchpad", label: "LAUNCHPAD", sub: "60s flight", Icon: Rocket },
];

/** Horizontal avatar position (% of the rail) for each node. */
const NODE_POSITION_PCT: Record<TrackNodeId, number> = {
  base: 0,
  station_1: 25,
  sync: 50,
  station_2: 75,
  launchpad: 100,
};

/** Host stage: horizontal spread (px) of the 4-sprite squad cluster around a node. */
const SQUAD_SPREAD_PX = 34;

// ---------------------------------------------------------------------------
// Fase 8 · 2D Flash effects (UI-only timings)
// ---------------------------------------------------------------------------
/** Sparks emitted per sprite thruster loop. */
const THRUSTER_SPARK_COUNT = 5;
/** Lifetime of one thruster spark. */
const THRUSTER_SPARK_SEC = 0.55;
/** Full paper wipe sweep (in, hold, out). */
const PAPER_WIPE_SEC = 0.75;

/** Glowing exhaust streak + sparks trailing behind a walking ASTRO SPRITE (walks are left→right). */
function ThrusterTrail({ color, lengthPx, delaySec }: { color: string; lengthPx: number; delaySec: number }) {
  return (
    <span
      className="pointer-events-none absolute bottom-2 right-[64%] h-4"
      style={{ width: lengthPx }}
      aria-hidden="true"
    >
      <motion.span
        className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color})`, filter: "blur(1px)" }}
        animate={{ opacity: [0.35, 0.9, 0.35], scaleX: [0.8, 1.1, 0.8] }}
        transition={{ duration: 0.35, repeat: Infinity, delay: delaySec }}
      />
      {Array.from({ length: THRUSTER_SPARK_COUNT }, (_, k) => (
        <motion.span
          key={k}
          className="absolute right-0 top-1/2 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: k % 2 ? "#FDE68A" : color, boxShadow: `0 0 6px ${color}` }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
          animate={{
            x: [0, -lengthPx],
            y: [0, (k % 2 ? -1 : 1) * (3 + k * 2)],
            opacity: [1, 0],
            scale: [1, 0.3],
          }}
          transition={{
            duration: THRUSTER_SPARK_SEC,
            repeat: Infinity,
            delay: delaySec + (k * THRUSTER_SPARK_SEC) / THRUSTER_SPARK_COUNT,
            ease: "easeOut",
          }}
        />
      ))}
    </span>
  );
}

/** Pulsing glow at the leading edge of the rail progress while the squad walks. */
function RailCometHead({ color, sizePx }: { color: string; sizePx: number }) {
  return (
    <motion.span
      className="pointer-events-none absolute right-0 top-1/2 rounded-full border-2 border-ink-black bg-paper-cream"
      style={{
        width: sizePx,
        height: sizePx,
        marginTop: -sizePx / 2,
        marginRight: -sizePx / 2,
        boxShadow: `0 0 10px 3px ${color}`,
      }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 0.4, repeat: Infinity }}
      aria-hidden="true"
    />
  );
}

/** Zig-zag "torn cardstock" edges for the paper wipe, built once. */
const TORN_EDGE_CLIP: string = (() => {
  const teeth = 14;
  const right: string[] = [];
  const left: string[] = [];
  for (let t = 0; t <= teeth; t += 1) {
    const yPct = (t / teeth) * 100;
    right.push(`${t % 2 ? 97 : 100}% ${yPct}%`);
    left.push(`${t % 2 ? 3 : 0}% ${100 - yPct}%`);
  }
  return `polygon(${[...right, ...left].join(", ")})`;
})();

/** EXT-02 brief 2D Flash cardstock wipe across the screen (skipped under reduced motion). */
function PaperWipe({ label, onDone }: { label: string; onDone: () => void }) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-y-0 -left-[5%] flex w-[110%] flex-col justify-between bg-paper-cream"
        style={{ clipPath: TORN_EDGE_CLIP }}
        initial={{ x: "-115%" }}
        animate={{ x: ["-115%", "0%", "0%", "115%"] }}
        transition={{ duration: PAPER_WIPE_SEC, times: [0, 0.38, 0.62, 1], ease: "easeInOut" }}
        onAnimationComplete={onDone}
      >
        <div className="hazard-stripe-bar h-4 border-b-[3px] border-ink-black" />
        <div className="flex flex-1 items-center justify-center px-8">
          <div className="-rotate-2 rounded-xl border-4 border-ink-black bg-paper-cream px-5 py-3 text-center font-display text-xl font-bold uppercase tracking-wide text-ink-black shadow-paper-lg sm:text-3xl">
            {label}
          </div>
        </div>
        <div className="hazard-stripe-bar h-4 border-t-[3px] border-ink-black" />
      </motion.div>
    </motion.div>
  );
}

/** Total station takes in a match: 4 roles x 2 waves (segmented task bar). */
const TOTAL_TASKS = 8;
/** Destination planet sprites (Python art pipeline output); undefined falls back to an SVG planet. */
const MISSION_PLANET_SRC: Record<MissionIdType, string | undefined> = {
  artemis_moon: ART.planets.planetMoon.src,
  asteroid_hunter: ART.planets.asteroidA.src,
  mars_sample_return: ART.planets.planetMars.src,
};
const PORTHOLE_COUNT = 7;

/** Bottom-left style sweep radar for the ship interior HUD. */
function MiniRadar({ sizePx, alert }: { sizePx: number; alert: boolean }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-[3px] border-ink-black shadow-paper-sm"
      style={{
        width: sizePx,
        height: sizePx,
        background:
          "radial-gradient(circle, rgba(34,197,94,0.25) 0 18%, transparent 19% 38%, rgba(34,197,94,0.18) 39% 40%, transparent 41% 68%, rgba(34,197,94,0.18) 69% 70%, transparent 71%), #0F172A",
      }}
      aria-hidden="true"
    >
      <motion.span
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg, ${alert ? "rgba(239,68,68,0.65)" : "rgba(34,197,94,0.65)"}, transparent 70deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      />
      <span className="absolute left-[62%] top-[30%] h-1.5 w-1.5 rounded-full bg-sky-glow" />
      <span className="absolute left-[30%] top-[64%] h-1.5 w-1.5 rounded-full bg-status-warn" />
    </div>
  );
}

/** Segmented green task bar (8 cells = 4 roles x 2 stations). */
function TaskBar({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={t("Tasks {done} of {total}", { done, total })}>
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">{t("Tasks")}</span>
      <div className="flex flex-1 gap-1 rounded-md border-2 border-ink-black bg-space-ink p-1">
        {Array.from({ length: total }, (_, i) => (
          <motion.span
            key={i}
            className="h-2.5 flex-1 rounded-sm"
            initial={false}
            animate={{ backgroundColor: i < done ? "#22C55E" : "#334155" }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <span className="font-mono text-[11px] font-bold tabular-nums text-status-ok">
        {done}/{total}
      </span>
    </div>
  );
}

/** Sliding bulkhead door drawn behind a station node; slides open once the squad reaches it. */
function BulkheadDoor({ open }: { open: boolean }) {
  return (
    <div className="relative h-[5.6rem] w-14 overflow-hidden rounded-t-lg border-[3px] border-b-0 border-ink-black bg-space-ink" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-2 bg-status-warn/80" />
      {[0, 1].map((side) => (
        <motion.div
          key={side}
          className="absolute top-2 h-full w-1/2 border-ink-black bg-hangar-slate"
          style={{
            left: side === 0 ? 0 : "50%",
            borderRightWidth: side === 0 ? 2 : 0,
            borderLeftWidth: side === 1 ? 2 : 0,
            backgroundImage: "linear-gradient(180deg, rgba(248,250,252,0.12), rgba(248,250,252,0))",
          }}
          initial={false}
          animate={{ x: open ? (side === 0 ? "-85%" : "85%") : "0%" }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** Non-blocking "get ready" banner shown over the station while the take clock is paused. */
function ReadyBreather({ secondsLeft, task, suit }: { secondsLeft: number; task: string; suit: string }) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-16 z-[55] flex justify-center px-3"
      initial={{ opacity: 0, y: -12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl border-4 border-ink-black bg-paper-cream px-4 py-2.5 text-ink-black shadow-paper-lg">
        <div className="text-left">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">{t("Get ready")}</div>
          <div className="font-display text-lg font-bold leading-tight sm:text-2xl">{task}</div>
        </div>
        <motion.span
          key={secondsLeft}
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-12 w-12 items-center justify-center rounded-xl border-3 border-ink-black font-mono text-3xl font-bold tabular-nums sm:h-14 sm:w-14 sm:text-4xl"
          style={{ backgroundColor: suit }}
        >
          {secondsLeft}
        </motion.span>
      </div>
    </motion.div>
  );
}

/** The 4 flight gates in player words (decision tree nodes). */
const FORECAST_GATES: Array<{ id: keyof GateForecast; label: string; owner: RoleType }> = [
  { id: "NODE_1_LAUNCH", label: "Liftoff", owner: "finance_launch" },
  { id: "NODE_2_PROPULSION", label: "Engine burn", owner: "orbit_power" },
  { id: "NODE_3_EVENT", label: "Space hazard", owner: "spacecraft_mass" },
  { id: "NODE_4_DOWNLINK", label: "Call Earth", owner: "science_comms" },
];
const FORECAST_STYLE: Record<string, { chip: string; word: string }> = {
  PASS: { chip: "bg-status-ok", word: "Ready" },
  DEGRADED: { chip: "bg-status-warn", word: "Risky" },
  CRITICAL: { chip: "bg-status-crit", word: "Fails" },
};

/**
 * Live decision-tree forecast: how each flight gate would end if the ship launched right now.
 * Updates on every teammate decision (server `gate_forecast`).
 */
/** Which role (and station) decides each gate: until it acts, the gate shows "Not decided". */
const GATE_OWNER_WAVE: Record<keyof GateForecast, 1 | 2> = {
  NODE_1_LAUNCH: 2,
  NODE_2_PROPULSION: 1,
  NODE_3_EVENT: 1,
  NODE_4_DOWNLINK: 2,
};

function FlightForecast({
  forecast,
  compact,
  decided,
  difficulty,
}: {
  forecast: GateForecast;
  compact: boolean;
  decided: Partial<Record<keyof GateForecast, boolean>>;
  difficulty: string;
}) {
  if (Object.keys(forecast).length === 0) return null;
  return (
    <div className="flash-panel flex shrink-0 items-center gap-2 px-2 py-1.5 sm:gap-3 sm:px-3" aria-label={t("Flight forecast")}>
      {!compact && (
        <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
          If we launched now
        </span>
      )}
      <div className="grid flex-1 grid-cols-4 gap-1.5">
        {FORECAST_GATES.map((g) => {
          const isDecided = Boolean(decided[g.id]);
          const status = forecast[g.id] ?? "PASS";
          const style = isDecided ? FORECAST_STYLE[status] : { chip: "bg-slate-500 text-paper-cream", word: "Not decided" };
          const label = t(g.label);
          const word = t(style.word);
          const owner = ROLE_CHARACTER_PROFILE[g.owner].short;
          return (
            <motion.div
              key={g.id}
              layout
              initial={false}
              animate={{ scale: [1.08, 1] }}
              transition={{ duration: 0.3 }}
              className={`flex items-center justify-center gap-1 rounded-md border-2 border-ink-black px-1 py-1 ${
                isDecided ? "text-ink-black" : ""
              } ${style.chip}`}
              title={isDecided ? `${label}: ${word}` : t("{gate}: waiting on {role}", { gate: label, role: t(owner) })}
            >
              <span className="truncate font-display text-[11px] font-bold sm:text-xs">{label}</span>
              <span className="hidden font-mono text-[10px] font-bold uppercase sm:inline">
                · {isDecided ? word : t("waits {role}", { role: t(owner) })}
              </span>
            </motion.div>
          );
        })}
      </div>
      {!compact && (
        <span
          className="hidden shrink-0 rounded-md border-2 border-ink-black bg-tank-orange px-1.5 py-1 font-mono text-[10px] font-bold uppercase text-ink-black xl:inline"
          title={t("Random space hazards hit after liftoff; harder missions get more and harsher ones.")}
        >
          {t("+ hazards · {level}", { level: t(difficulty) })}
        </span>
      )}
    </div>
  );
}

/** Station briefing: why the job matters, what "good" looks like, how to play. */
function StationBriefingCard({
  roleId,
  wave,
  task,
  briefing,
  onStart,
}: {
  roleId: RoleType;
  wave: 1 | 2;
  task: string;
  briefing: StationBriefing;
  onStart: () => void;
}) {
  const profile = ROLE_CHARACTER_PROFILE[roleId];
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center bg-space-ink/70 p-3 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t("Station {n} briefing", { n: wave })}
        className="paper-card-light max-h-full w-full max-w-lg overflow-y-auto p-0"
        initial={{ scale: 0.9, y: 16, rotate: -1 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <div className="hazard-stripe-bar h-3 border-b-[3px] border-ink-black" />
        <div className="flex items-center gap-3 p-4 pb-2">
          <div className="shrink-0 rounded-xl border-[3px] border-ink-black bg-blueprint-navy p-1">
            <CrewmateAvatar role={roleId} state="cheer" actionEffect="scan" size={64} />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {t("Station {n}", { n: wave })} · {t(profile.short)}
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{t(task)}</h2>
          </div>
        </div>
        <div className="space-y-3 px-4 pb-4">
          <p className="text-sm leading-snug text-slate-700">{t(briefing.why)}</p>
          <ul className="space-y-1.5">
            {briefing.goals.map((g, i) => (
              <li key={g} className="flex items-center gap-2 font-display text-sm font-bold">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-ink-black font-mono text-xs"
                  style={{ backgroundColor: profile.suit }}
                >
                  {i + 1}
                </span>
                {t(g)}
              </li>
            ))}
          </ul>
          <p className="rounded-lg border-2 border-dashed border-slate-400 px-3 py-1.5 font-mono text-[11px] text-slate-600">
            {t(briefing.controls)}
          </p>
          <button
            type="button"
            onClick={onStart}
            autoFocus
            className="plate-gold flex w-full items-center justify-center gap-2 py-3 font-display text-xl font-black uppercase"
          >
            {t("Start")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Big caption shown over the hangar cutscene between stations; liftoff adds a rising rocket. */
function CutsceneCaption({ title, subtitle, liftoff }: { title: string; subtitle: string; liftoff: boolean }) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center px-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.25 }}
      role="status"
    >
      {liftoff && (
        <motion.svg
          viewBox="0 0 60 120"
          className="mb-2 h-28 w-14"
          initial={{ y: 60 }}
          animate={{ y: -220 }}
          transition={{ duration: 1.6, ease: "easeIn" }}
          aria-hidden="true"
        >
          <path d="M18 30 Q30 -6 42 30 Z" fill="#F8FAFC" stroke="#0F172A" strokeWidth="4" />
          <rect x="18" y="30" width="24" height="56" fill="#F97316" stroke="#0F172A" strokeWidth="4" />
          <path d="M18 86 L10 100 L50 100 L42 86 Z" fill="#334155" stroke="#0F172A" strokeWidth="4" />
          <path d="M22 100 Q30 124 38 100 Z" fill="#FACC15" stroke="#0F172A" strokeWidth="3" />
        </motion.svg>
      )}
      <div className="-rotate-2 rounded-2xl border-4 border-ink-black bg-paper-cream px-6 py-3 text-center text-ink-black shadow-paper-lg">
        <div className="font-display text-3xl font-bold uppercase sm:text-5xl">{title}</div>
        <div className="mt-0.5 font-mono text-xs font-bold uppercase tracking-widest text-slate-600 sm:text-sm">
          {subtitle}
        </div>
      </div>
    </motion.div>
  );
}

type TrackPhase =
  | "walk_to_station_1"
  | "station_1"
  | "sync"
  | "station_2"
  | "walk_to_launchpad"
  | "launchpad";

const PHASE_NODE: Record<TrackPhase, TrackNodeId> = {
  walk_to_station_1: "station_1",
  station_1: "station_1",
  sync: "station_2",
  station_2: "station_2",
  walk_to_launchpad: "launchpad",
  launchpad: "launchpad",
};

// ---------------------------------------------------------------------------
// Props — the original fields stay required; every new field is optional so
// App.tsx and /dev-sandbox keep compiling while the other agents integrate.
// ---------------------------------------------------------------------------
export interface LinearStationTrackProps {
  missionId: MissionIdType;
  difficulty: DifficultyType;
  roleId: RoleType;
  wave: 1 | 2;
  timeLeftSec: number;
  liveMetrics: LiveMetrics;
  isLocked: boolean;
  toastAlert?: string | null;
  /** Forwarded untouched to Rol 4A / Rol 4B (`iniciar_oleada_1/2.spectral_challenge`). */
  spectralChallenge?: unknown;
  onLiveMutation: (partialDelta: Record<string, unknown>) => void;
  onSubmitTake: (finalPayload: Record<string, unknown>) => void;
  /** Crew roster from `estado_sala_actualizado` (missing roles are shown as AI Autopilot). */
  players?: RoomPlayer[];
  /** Accumulated `jugador_bloqueo_toma` events for the current match. */
  lockedTakes?: JugadorBloqueoTomaPayload[];
  /** `iniciar_oleada_2.sync_delay_sec` (defaults to 5 s). */
  syncDelaySec?: number;
  /** `iniciar_oleada_*.duration_sec` (defaults to 30 s). */
  stationDurationSec?: number;
  /** True once Wave 2 is locked and the squad heads to the launchpad / 60s flight. */
  awaitingLaunch?: boolean;
  /** Launchpad loading screen duration after the walk (defaults to LAUNCH_LOADING_MS). */
  launchLoadingMs?: number;
  /** Fires when the crewmate reaches a station and its minigame becomes playable. */
  onStationOpened?: (wave: 1 | 2) => void;
  connectionStatus?: ConnectionStatus;
  playerName?: string;
  /** Room host (big screen). PIN guests are `false` and get the phone console. */
  isHost?: boolean;
  mode?: GameMode;
  /** Force the Host Main Stage or Phone Console presentation (default "auto"). */
  stageViewOverride?: StageViewOverride;
  /** Live forecast of the 4 flight gates (empty in offline preview). */
  gateForecast?: GateForecast;
}

export function LinearStationTrack(props: LinearStationTrackProps) {
  const {
    missionId,
    difficulty,
    roleId,
    wave,
    timeLeftSec,
    liveMetrics,
    isLocked,
    toastAlert,
    spectralChallenge,
    onLiveMutation,
    onSubmitTake,
    players = [],
    lockedTakes = [],
    syncDelaySec = SYNC_DELAY_SEC,
    stationDurationSec = STATION_DURATION_SEC,
    awaitingLaunch = false,
    launchLoadingMs = LAUNCH_LOADING_MS,
    onStationOpened,
    connectionStatus,
    playerName,
    isHost,
    mode,
    stageViewOverride = "auto",
    gateForecast = {},
  } = props;

  const isSmallViewport = useIsSmallViewport();
  const isPhoneConsole = resolvePhoneConsole({
    isSmallViewport,
    mode,
    isHost,
    override: stageViewOverride,
  });

  // --- Phase machine --------------------------------------------------------
  const [phase, setPhase] = useState<TrackPhase>("walk_to_station_1");
  const [syncElapsedMs, setSyncElapsedMs] = useState(0);
  const [launchElapsedMs, setLaunchElapsedMs] = useState(0);
  const prevWave = useRef<1 | 2>(wave);
  const openedRef = useRef(onStationOpened);
  openedRef.current = onStationOpened;
  const [readyLeft, setReadyLeft] = useState<number | null>(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const activeWaveRef = useRef<1 | 2>(1);
  const stationRef = useRef<HTMLDivElement | null>(null);
  const readyTimer = useRef<number | null>(null);

  const clearReadyTimer = () => {
    if (readyTimer.current !== null) window.clearInterval(readyTimer.current);
    readyTimer.current = null;
  };

  /** Show the station window with its briefing; the take starts when the player taps Start. */
  const openStation = (n: 1 | 2) => {
    setPhase(n === 1 ? "station_1" : "station_2");
    clearReadyTimer();
    setReadyLeft(null);
    setBriefingOpen(true);
    soundEngine.playSceneJump();
  };

  const startStation = () => {
    setBriefingOpen(false);
    soundEngine.playComplete();
    openedRef.current?.(activeWaveRef.current);
  };

  useEffect(() => clearReadyTimer, []);

  // Mount: walk BASE -> STATION 1, then open the minigame (or jump to Station 2 if mounted mid-match).
  useEffect(() => {
    if (prevWave.current === 2) {
      openStation(2);
      return undefined;
    }
    setPhase("walk_to_station_1");
    const t = window.setTimeout(() => openStation(1), WALK_DURATION_SEC * 1000);
    return () => window.clearTimeout(t);
    // Runs once per mount; App.tsx remounts the track (key) for every new match.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wave 1 -> 2: synchronized transition (wave1_to_wave2 loading screen) while the squad walks.
  useEffect(() => {
    if (wave === 2 && prevWave.current === 1) {
      prevWave.current = 2;
      setPhase("sync");
      setSyncElapsedMs(0);
      const start = performance.now();
      const tick = window.setInterval(() => {
        setSyncElapsedMs(performance.now() - start);
      }, LOADING_TICK_MS);
      // The whole squad cleared Wave 1: celebrate the wave advance.
      soundEngine.playComplete();
      const done = window.setTimeout(() => {
        window.clearInterval(tick);
        openStation(2);
      }, syncDelaySec * 1000);
      return () => {
        window.clearInterval(tick);
        window.clearTimeout(done);
      };
    }
    if (wave === 1) prevWave.current = 1;
    return undefined;
  }, [wave, syncDelaySec]);

  // Both waves locked: walk to the LAUNCHPAD, then show the wave2_to_flight loading screen.
  useEffect(() => {
    if (!awaitingLaunch) return undefined;
    setPhase("walk_to_launchpad");
    let tick: number | undefined;
    const t = window.setTimeout(() => {
      setPhase("launchpad");
      setLaunchElapsedMs(0);
      const start = performance.now();
      tick = window.setInterval(() => {
        setLaunchElapsedMs(performance.now() - start);
      }, LOADING_TICK_MS);
    }, WALK_DURATION_SEC * 1000);
    return () => {
      window.clearTimeout(t);
      if (tick !== undefined) window.clearInterval(tick);
    };
  }, [awaitingLaunch]);

  const isWalking = phase === "walk_to_station_1" || phase === "sync" || phase === "walk_to_launchpad";
  const avatarNode = PHASE_NODE[phase];
  const showMinigame = phase === "station_1" || phase === "station_2";
  const activeWave: 1 | 2 = phase === "station_2" || phase === "sync" ? 2 : wave;
  activeWaveRef.current = activeWave;
  // The local player "touches" their gate as soon as they change something in this station.
  const [touchedWave, setTouchedWave] = useState<1 | 2 | null>(null);
  // Stable identity: minigames (e.g. the 3D rover scene) re-initialise when this callback changes.
  const onLiveRef = useRef(onLiveMutation);
  onLiveRef.current = onLiveMutation;
  const trackedLiveMutation = useCallback((delta: Record<string, unknown>) => {
    setTouchedWave(activeWaveRef.current);
    onLiveRef.current(delta);
  }, []);
  const gateDecided: Partial<Record<keyof GateForecast, boolean>> = {};
  for (const g of FORECAST_GATES) {
    const wave = GATE_OWNER_WAVE[g.id];
    gateDecided[g.id] =
      lockedTakes.some((t) => t.role_id === g.owner && t.wave >= wave) ||
      (roleId === g.owner && activeWave === wave && (touchedWave === wave || isLocked));
  }
  const ActiveMinigame = activeWave === 1 ? WAVE1_MAP[roleId] : WAVE2_MAP[roleId];
  const myProfile = ROLE_CHARACTER_PROFILE[roleId];

  const activeNode: TrackNodeId =
    phase === "sync"
      ? "sync"
      : phase === "launchpad" || phase === "walk_to_launchpad"
      ? "launchpad"
      : phase === "walk_to_station_1"
      ? "base"
      : avatarNode;

  const syncProgressPct = Math.min(100, (syncElapsedMs / Math.max(1, syncDelaySec * 1000)) * 100);
  const launchProgressPct = Math.min(100, (launchElapsedMs / Math.max(1, launchLoadingMs)) * 100);

  const isRoleLocked = (role: RoleType) =>
    lockedTakes.some((t) => t.role_id === role && t.wave === activeWave) || (role === roleId && isLocked);

  const tasksDone =
    phase === "walk_to_launchpad" || phase === "launchpad"
      ? TOTAL_TASKS
      : Math.min(TOTAL_TASKS, (activeWave - 1) * ALL_ROLES.length + ALL_ROLES.filter(isRoleLocked).length);

  // --- Critical metrics: red alert + error buzz when a new alert appears ----
  const criticalAlerts = getCriticalAlerts(liveMetrics, missionId);
  const isCritical = criticalAlerts.length > 0;
  const alertKey = criticalAlerts.join("|");
  const prevAlerts = useRef<CriticalAlertId[]>(criticalAlerts);
  useEffect(() => {
    const before = prevAlerts.current;
    prevAlerts.current = criticalAlerts;
    if (criticalAlerts.some((a) => !before.includes(a))) soundEngine.playError();
    // alertKey captures the alert set; criticalAlerts is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertKey]);

  // --- Lock celebration: brief "complete" sparkle + bay flash per newly locked role
  const lockedKey = ALL_ROLES.filter((r) => isRoleLocked(r)).join("|");
  const prevLocked = useRef<string[]>([]);
  const [celebrating, setCelebrating] = useState<RoleType[]>([]);
  const celebrationTimers = useRef<number[]>([]);
  useEffect(() => () => celebrationTimers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    const now = lockedKey ? (lockedKey.split("|") as RoleType[]) : [];
    const fresh = now.filter((r) => !prevLocked.current.includes(r));
    prevLocked.current = now;
    if (fresh.length === 0) return;
    setCelebrating((prev) => [...prev, ...fresh.filter((r) => !prev.includes(r))]);
    // Each batch ends on its own timer, so overlapping locks never get stuck celebrating.
    celebrationTimers.current.push(
      window.setTimeout(() => {
        setCelebrating((prev) => prev.filter((r) => !fresh.includes(r)));
      }, LOCK_CELEBRATION_MS)
    );
  }, [lockedKey]);

  // My specialist panics on the last 5 s of an open, unlocked station.
  const myClockAlert = showMinigame && !isLocked && timeLeftSec <= TIMER_CRIT_SEC;

  // --- EXT-02 paper wipe: station opens, or a sealed station hands back to the hangar walk
  const reduceMotion = useReducedMotion();
  const [paperWipe, setPaperWipe] = useState<{ key: number; label: string } | null>(null);
  const prevShowMinigame = useRef(showMinigame);
  const wipeSeq = useRef(0);
  useEffect(() => {
    if (prevShowMinigame.current === showMinigame) return;
    prevShowMinigame.current = showMinigame;
    if (reduceMotion || !USE_PAPER_WIPE) return;
    wipeSeq.current += 1;
    setPaperWipe({
      key: wipeSeq.current,
      label: showMinigame
        ? `STATION ${activeWave} · ${activeWave === 1 ? myProfile.wave1Task : myProfile.wave2Task}`
        : "DONE · ROLLING OUT",
    });
    soundEngine.playSceneJump();
    // activeWave/myProfile are read at transition time only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMinigame, reduceMotion]);

  const spriteMood = (role: RoleType) => {
    const locked = isRoleLocked(role);
    return resolveSpriteMood({
      isWalking,
      isLocked: locked,
      celebrating: celebrating.includes(role),
      isAlert: !locked && (isCritical || (role === roleId && myClockAlert)),
    });
  };

  const headline =
    phase === "sync"
      ? t("SYNCING CREW")
      : phase === "launchpad" || phase === "walk_to_launchpad"
      ? t("LAUNCHPAD")
      : `${t("STATION {n}", { n: activeWave })} · ${activeWave === 1 ? t("DESIGN") : t("BUILD")}`;

  const connectionBadge = connectionStatus && (
    <span
      className={`shrink-0 rounded-lg border-2 border-ink-black px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
        connectionStatus === "online"
          ? "bg-status-ok text-ink-black"
          : connectionStatus === "offline"
          ? "bg-status-warn text-ink-black"
          : "bg-blueprint-navy text-slate-200"
      }`}
    >
      {connectionStatus === "online"
        ? isPhoneConsole
          ? t("ONLINE")
          : t("Mission Control: ONLINE")
        : connectionStatus === "offline"
        ? isPhoneConsole
          ? t("PREVIEW")
          : t("Preview mode (offline)")
        : t("Connecting…")}
    </span>
  );

  if (showMinigame) {
    const briefing = STATION_BRIEFINGS[roleId][activeWave];
    const crewLocked = ALL_ROLES.filter(isRoleLocked).length;
    return (
      <main
        className={`fixed inset-0 z-20 flex flex-col ${
          isPhoneConsole ? "gap-2 px-2 pb-2 pt-14" : "gap-3 px-3 pb-3 pt-16 sm:px-5"
        }`}
      >
        {/* Game HUD: shared resources + task bar + crew status */}
        <div className="flex shrink-0 flex-col gap-2 lg:flex-row lg:items-stretch">
          <div className="min-w-0 flex-1">
            <ResourceHUD liveMetrics={liveMetrics} missionId={missionId} compact={isPhoneConsole} activeRole={roleId} />
          </div>
          <div className="flash-panel flex shrink-0 items-center gap-3 px-3 py-2 lg:w-80">
            <MiniRadar sizePx={isPhoneConsole ? 34 : 44} alert={isCritical} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <TaskBar done={tasksDone} total={TOTAL_TASKS} />
              <div className="flex gap-1">
                {ALL_ROLES.map((role) => (
                  <span
                    key={role}
                    title={ROLE_CHARACTER_PROFILE[role].label}
                    className={`flex h-6 flex-1 items-center justify-center rounded border-2 border-ink-black font-mono text-[9px] font-bold ${
                      isRoleLocked(role) ? "bg-status-ok text-ink-black" : "bg-space-ink"
                    }`}
                    style={isRoleLocked(role) ? undefined : { color: ROLE_CHARACTER_PROFILE[role].suit }}
                  >
                    {isRoleLocked(role) ? <CheckCircle2 className="h-3.5 w-3.5" /> : t(ROLE_CHARACTER_PROFILE[role].short)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <FlightForecast forecast={gateForecast} compact={isPhoneConsole} decided={gateDecided} difficulty={difficulty} />

        {isCritical && (
          <div
            className="flex shrink-0 items-center gap-2 rounded-xl border-[3px] border-ink-black bg-status-crit px-3 py-1.5 font-mono text-xs font-bold text-ink-black shadow-paper"
            role="alert"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {criticalAlerts.map((a) => t(CRITICAL_ALERT_LABEL[a])).join(" · ")}
          </div>
        )}

        {/* The game window */}
        <div ref={stationRef} className="relative min-h-0 flex-1">
          <MinigameShell
            roleId={roleId}
            wave={activeWave}
            timeLeftSec={timeLeftSec}
            isLocked={isLocked}
            toastAlert={toastAlert}
            durationSec={stationDurationSec}
            missionId={missionId}
            playerLabel={playerName ? t("Crew: {name}", { name: playerName }) : undefined}
            onFallbackSubmit={() => onSubmitTake({})}
            layout={isPhoneConsole ? "handheld" : "stage"}
            criticalAlert={isCritical}
            fill
          >
            <ActiveMinigame
              key={`${roleId}-${activeWave}`}
              missionId={missionId}
              difficulty={difficulty}
              roleId={roleId}
              wave={activeWave}
              timeLeftSec={timeLeftSec}
              liveMetrics={liveMetrics}
              spectralChallenge={spectralChallenge}
              onLiveMutation={trackedLiveMutation}
              onSubmitTake={onSubmitTake}
              isLocked={isLocked}
            />
          </MinigameShell>

          <AnimatePresence>
            {briefingOpen && (
              <StationBriefingCard
                key="briefing"
                roleId={roleId}
                wave={activeWave}
                task={activeWave === 1 ? myProfile.wave1Task : myProfile.wave2Task}
                briefing={briefing}
                onStart={startStation}
              />
            )}
            {isLocked && crewLocked < ALL_ROLES.length && (
              <motion.div
                key="waiting"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                className="absolute inset-x-3 bottom-3 z-30 flex items-center justify-center gap-3 rounded-xl border-[3px] border-ink-black bg-paper-cream px-4 py-2.5 font-display text-sm font-bold text-ink-black shadow-paper"
                role="status"
              >
                <motion.span
                  className="h-2.5 w-2.5 rounded-full bg-status-ok"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                {t("Locked! Waiting for the crew")} · {crewLocked}/{ALL_ROLES.length}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {paperWipe && (
            <PaperWipe key={paperWipe.key} label={paperWipe.label} onDone={() => setPaperWipe(null)} />
          )}
        </AnimatePresence>
      </main>
    );
  }

  // Between game windows: full-screen cutscenes (no page, no loader).
  const cutKind: CutsceneKind = phase === "launchpad" ? "liftoff" : phase === "sync" ? "sync" : "walk";
  const cutTitle =
    phase === "walk_to_station_1"
      ? t("To station 1")
      : phase === "sync"
      ? t("Sharing your choices")
      : phase === "walk_to_launchpad"
      ? t("Rolling to the pad")
      : t("Liftoff!");
  const cutSubtitle =
    phase === "walk_to_station_1"
      ? t(myProfile.wave1Task)
      : phase === "sync"
      ? t("Next: {task}", { task: t(myProfile.wave2Task) })
      : phase === "walk_to_launchpad"
      ? t("Ship assembled")
      : t("Survival flight begins");
  const cutDurationSec =
    phase === "sync" ? syncDelaySec : phase === "launchpad" ? launchLoadingMs / 1000 : WALK_DURATION_SEC;
  return (
    <AnimatePresence mode="wait">
      <MissionCutscene
        key={phase}
        kind={cutKind}
        missionId={missionId}
        myRole={roleId}
        title={cutTitle}
        subtitle={cutSubtitle}
        durationSec={cutDurationSec}
        planetSrc={MISSION_PLANET_SRC[missionId]}
      />
    </AnimatePresence>
  );
}

export default LinearStationTrack;
