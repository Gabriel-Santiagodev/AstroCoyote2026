// Owner: Leonardo (Tasks LEO-05, LEO-08, LEO-09) — Linear station track (2D Flash arcade hangar).
// [BASE] ──► [STATION 1: DESIGN] ──► [SYNC 5s] ──► [STATION 2: INTEGRATION] ──► [LAUNCHPAD]
// The ASTRO SPRITES squad walks automatically (no WASD, docs/08-controles.md §1); teammates show a
// green LOCKED check when `jugador_bloqueo_toma` arrives; the 8 minigames mount through MinigameShell.
// Two presentations:
//   • Host Main Stage (desktop / projector): panoramic hangar track with the 4 sprites marching,
//     live LOCKED checks and the full 6-gauge ResourceHUD.
//   • Phone Crew Console (< 768px or a PIN guest): compact track + compact HUD so the minigame
//     controls own the screen inside a `.handheld-console-frame`.
import { useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { MissionLoadingScreen } from "../components/paper/LoadingScreen";
import { ResourceHUD } from "../components/paper/ResourceHUD";
import { soundEngine } from "../components/paper/SoundEngine";
import nasaCatalog from "../data/nasa_catalog.json";
import { Rol1A_BudgetTable } from "../components/minigames/Rol1A_BudgetTable";
import { Rol1B_LauncherAuction } from "../components/minigames/Rol1B_LauncherAuction";
import { Rol2A_TopologicalAssembly } from "../components/minigames/Rol2A_TopologicalAssembly";
import { Rol2B_MassBalanceTask } from "../components/minigames/Rol2B_MassBalanceTask";
import { Rol3A_OrbitalSniper } from "../components/minigames/Rol3A_OrbitalSniper";
import { Rol3B_AstroLogistics3D } from "../components/minigames/Rol3B_AstroLogistics3D";
import { Rol4A_SpectralLabTask } from "../components/minigames/Rol4A_SpectralLabTask";
import { Rol4B_CommsSpectralHacker } from "../components/minigames/Rol4B_CommsSpectralHacker";
import type { ConnectionStatus, GameMode, JugadorBloqueoTomaPayload, RoomPlayer } from "../socket";
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
export const WALK_DURATION_SEC = 1.5;
/** Default synchronized transition between Station 1 and Station 2 (`iniciar_oleada_2.sync_delay_sec`). */
export const SYNC_DELAY_SEC = 5;
/** UI-only: how long the Launchpad -> 60s Flight loading screen stays up after the walk. */
export const LAUNCH_LOADING_MS = 2500;
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
  overweight: "Wet mass over launcher capacity",
  budget_depleted: "Budget depleted",
  ufe_below_minimum: "UFE reserve below mission minimum",
  no_thermal_protection: "Thermal protection missing",
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
  { id: "station_2", label: "STATION 2", sub: "INTEGRATION", Icon: Cpu },
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

  // Mount: walk BASE -> STATION 1, then open the minigame (or jump to Station 2 if mounted mid-match).
  useEffect(() => {
    if (prevWave.current === 2) {
      setPhase("station_2");
      openedRef.current?.(2);
      return undefined;
    }
    setPhase("walk_to_station_1");
    const t = window.setTimeout(() => {
      setPhase("station_1");
      openedRef.current?.(1);
    }, WALK_DURATION_SEC * 1000);
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
        setPhase("station_2");
        openedRef.current?.(2);
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
      ? "SYNCHRONIZING SUBSYSTEMS"
      : phase === "launchpad" || phase === "walk_to_launchpad"
      ? "LAUNCHPAD · AWAITING CLEARANCE"
      : `STATION ${activeWave} · ${activeWave === 1 ? "DESIGN" : "INTEGRATION"}`;

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
          ? "ONLINE"
          : "Mission Control: ONLINE"
        : connectionStatus === "offline"
        ? isPhoneConsole
          ? "PREVIEW"
          : "Preview mode (offline)"
        : "Connecting…"}
    </span>
  );

  return (
    <main
      className={`mx-auto overflow-x-hidden ${
        // Top padding leaves room for the fixed <SoundControlPill /> in the top-right corner.
        isPhoneConsole ? "max-w-xl space-y-3 px-2 pb-3 pt-14" : "max-w-6xl space-y-5 px-4 pb-6 pt-16"
      }`}
    >
      {isPhoneConsole ? (
        <ResourceHUD liveMetrics={liveMetrics} missionId={missionId} compact activeRole={roleId} />
      ) : (
        <ResourceHUD liveMetrics={liveMetrics} missionId={missionId} activeRole={roleId} />
      )}

      {isPhoneConsole ? (
        // -------------------------------------------------------------------
        // PHONE CREW CONSOLE — compact track, the minigame owns the screen
        // -------------------------------------------------------------------
        <section className="handheld-console-frame space-y-2 p-3" aria-label="Station track">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <CrewmateAvatar
                role={roleId}
                state={spriteMood(roleId).state}
                actionEffect={spriteMood(roleId).actionEffect}
                size={30}
              />
              <div className="min-w-0">
                <div
                  className="truncate font-mono text-[10px] font-bold uppercase"
                  style={{ color: myProfile.suit }}
                >
                  {myProfile.codename} · {playerName || "You"}
                </div>
                <div className="truncate font-display text-sm font-bold">{headline}</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Smartphone className="h-3.5 w-3.5 text-role-spacecraft" aria-hidden="true" />
              {connectionBadge}
            </div>
          </div>

          {/* slim 5-dot progress rail */}
          <div className="relative px-3">
            <div className="absolute left-3 right-3 top-1/2 h-1.5 -translate-y-1/2 rounded-full border border-ink-black bg-space-ink">
              <motion.div
                className="h-full rounded-full bg-status-ok"
                animate={{ width: `${NODE_POSITION_PCT[avatarNode]}%` }}
                transition={{ duration: WALK_DURATION_SEC, ease: "easeInOut" }}
              />
            </div>
            <ol className="relative flex items-center justify-between">
              {TRACK_NODES.map((node) => {
                const reached = NODE_POSITION_PCT[node.id] <= NODE_POSITION_PCT[avatarNode];
                const isActive = node.id === activeNode;
                return (
                  <li
                    key={node.id}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink-black ${
                      isActive
                        ? "bg-status-ok text-ink-black"
                        : reached
                        ? "bg-paper-cream text-ink-black"
                        : "bg-blueprint-navy text-slate-400"
                    }`}
                    aria-label={`${node.label}${isActive ? " (current)" : ""}`}
                  >
                    <node.Icon className="h-3 w-3" />
                  </li>
                );
              })}
            </ol>
          </div>

          {isCritical && (
            <div
              className="flex min-w-0 items-center gap-1.5 rounded-lg border-2 border-ink-black bg-status-crit px-2 py-1 font-mono text-[10px] font-bold uppercase text-ink-black"
              role="alert"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">
                Red alert · {criticalAlerts.map((a) => CRITICAL_ALERT_LABEL[a]).join(" · ")}
              </span>
            </div>
          )}

          {/* squad lock status (4 mini chips) */}
          <ul className="grid grid-cols-4 gap-1.5" aria-label="Squad status">
            {ALL_ROLES.map((role) => {
              const profile = ROLE_CHARACTER_PROFILE[role];
              const locked = isRoleLocked(role);
              const mood = spriteMood(role);
              return (
                <li
                  key={role}
                  className={`flex min-w-0 items-center justify-center gap-1 rounded-lg border-2 px-1 py-0.5 transition-colors ${
                    celebrating.includes(role)
                      ? "border-status-ok bg-status-ok/20"
                      : mood.actionEffect === "error"
                      ? "border-status-crit bg-status-crit/15"
                      : role === roleId
                      ? "border-ink-black bg-blueprint-navy"
                      : "border-ink-black bg-space-ink"
                  }`}
                  title={`${profile.codename}${locked ? " · LOCKED" : mood.statusBadgeText ? ` · ${mood.statusBadgeText}` : ""}`}
                >
                  <CrewmateAvatar role={role} state={mood.state} actionEffect={mood.actionEffect} size={20} />
                  {locked ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-status-ok" aria-label="locked" />
                  ) : (
                    <span className="truncate font-mono text-[9px] font-bold" style={{ color: profile.suit }}>
                      {profile.short}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        // -------------------------------------------------------------------
        // HOST MAIN STAGE — panoramic hangar track with the 4-sprite squad
        // -------------------------------------------------------------------
        <section className="flash-panel relative space-y-4 overflow-hidden p-4 sm:p-5" aria-label="Station track">
          <div
            className="hazard-stripe-bar -mx-4 -mt-4 h-3 border-b-[3px] border-ink-black sm:-mx-5 sm:-mt-5"
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-role-spacecraft">
                <Tv className="h-3.5 w-3.5" aria-hidden="true" />
                Host main stage · Astro squad hangar · {MISSION_LABELS[missionId]} · {difficulty.toUpperCase()}
              </p>
              <h2 className="font-display text-xl font-bold sm:text-2xl">{headline}</h2>
            </div>
            {connectionBadge}
          </div>

          {/* Hangar rail: node columns are w-28, so the rail is inset by half (3.5rem) to line up */}
          <div className="relative rounded-xl border-[3px] border-ink-black bg-space-ink/80 pb-3 pt-[6.75rem]">
            <div className="blueprint-grid pointer-events-none absolute inset-0 rounded-xl opacity-40" aria-hidden="true" />

            <div className="absolute left-14 right-14 top-[7.85rem] h-2.5 rounded-full border-2 border-ink-black bg-blueprint-navy">
              <motion.div
                className="h-full rounded-full bg-status-ok"
                animate={{ width: `${NODE_POSITION_PCT[avatarNode]}%` }}
                transition={{ duration: WALK_DURATION_SEC, ease: "easeInOut" }}
              />
            </div>

            {/* marching squad: all 4 ASTRO SPRITES advance node to node together */}
            <div className="pointer-events-none absolute left-14 right-14 top-2 h-24">
              {ALL_ROLES.map((role, i) => {
                const profile = ROLE_CHARACTER_PROFILE[role];
                const locked = isRoleLocked(role);
                const mood = spriteMood(role);
                const isMe = role === roleId;
                const offsetPx = (i - (ALL_ROLES.length - 1) / 2) * SQUAD_SPREAD_PX;
                return (
                  <motion.div
                    key={role}
                    className="absolute top-0 flex flex-col items-center"
                    style={{ zIndex: isMe ? 20 : 10 }}
                    initial={false}
                    animate={{
                      left: `${NODE_POSITION_PCT[avatarNode]}%`,
                      x: `calc(-50% + ${offsetPx}px)`,
                      y: isWalking ? [0, -5, 0, -5, 0] : 0,
                    }}
                    transition={{
                      left: { duration: WALK_DURATION_SEC, ease: "easeInOut", delay: i * 0.08 },
                      x: { duration: 0.3 },
                      y: { duration: 0.5, repeat: isWalking ? Infinity : 0, delay: i * 0.1 },
                    }}
                    aria-label={`${profile.codename} ${
                      isWalking ? "walking" : locked ? "locked" : mood.statusBadgeText === "ALERT" ? "alert" : "working"
                    }`}
                  >
                    <div className="flex h-4 items-end">
                      {isMe && (
                        <span className="rounded border border-ink-black bg-paper-cream px-1 font-mono text-[8px] font-bold leading-tight text-ink-black">
                          YOU
                        </span>
                      )}
                    </div>
                    <CrewmateAvatar
                      role={role}
                      state={mood.state}
                      actionEffect={mood.actionEffect}
                      statusBadgeText={mood.statusBadgeText}
                      size={isMe ? 50 : 42}
                    />
                  </motion.div>
                );
              })}
            </div>

            <ol className="relative flex items-start justify-between" aria-label="Station nodes">
              {TRACK_NODES.map((node) => {
                const reached = NODE_POSITION_PCT[node.id] <= NODE_POSITION_PCT[avatarNode];
                const isActive = node.id === activeNode;
                return (
                  <li key={node.id} className="flex w-28 flex-col items-center gap-1 text-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink-black shadow-paper ${
                        isActive
                          ? "bg-status-ok text-ink-black"
                          : reached
                          ? "bg-paper-cream text-ink-black"
                          : "bg-blueprint-navy text-slate-400"
                      }`}
                    >
                      <node.Icon
                        className={`h-4 w-4 ${node.id === "sync" && phase === "sync" ? "animate-spin" : ""}`}
                      />
                    </div>
                    <div
                      className={`font-mono text-xs font-bold leading-tight ${
                        isActive ? "text-status-ok" : reached ? "text-paper-cream" : "text-slate-500"
                      }`}
                    >
                      {node.label}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">{node.sub}</div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Squad roster cards with live LOCKED checks */}
          <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Squad status">
            {ALL_ROLES.map((role) => {
              const profile = ROLE_CHARACTER_PROFILE[role];
              const human = players.find((p) => p.role_id === role);
              const isMe = role === roleId;
              const locked = isRoleLocked(role);
              const mood = spriteMood(role);
              const isFlashing = celebrating.includes(role);
              return (
                <motion.li
                  key={role}
                  animate={isFlashing ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ duration: 0.45 }}
                  className={`flex items-center gap-2 rounded-xl border-[3px] px-2 py-1.5 shadow-paper transition-colors ${
                    isFlashing
                      ? "border-status-ok bg-status-ok/20"
                      : mood.actionEffect === "error"
                      ? "border-status-crit bg-status-crit/15"
                      : isMe
                      ? "border-ink-black bg-blueprint-navy"
                      : "border-ink-black bg-space-ink"
                  }`}
                >
                  <CrewmateAvatar role={role} state={mood.state} actionEffect={mood.actionEffect} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-[10px] font-bold uppercase" style={{ color: profile.suit }}>
                      {profile.codename}
                      {isMe ? " · YOU" : ""}
                    </div>
                    <div className="truncate text-xs font-semibold text-paper-cream">
                      {isMe ? playerName || "You" : human ? human.player_name : "AI Autopilot"}
                    </div>
                    <div className="truncate font-mono text-[9px] uppercase text-slate-400">
                      {activeWave === 1 ? profile.wave1Task : profile.wave2Task}
                    </div>
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    {locked ? (
                      <motion.span
                        key="locked"
                        initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                        className="flex items-center gap-1 rounded-md border-2 border-ink-black bg-status-ok px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink-black"
                        aria-label={`${profile.codename} locked`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> LOCKED
                      </motion.span>
                    ) : (
                      <motion.span
                        key="working"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-mono text-[10px] font-bold text-slate-400"
                      >
                        {mood.statusBadgeText === "ALERT" ? "ALERT" : !human && !isMe ? "AUTO" : "…"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>

          {isCritical && (
            <div
              className="flex flex-wrap items-center gap-2 rounded-xl border-[3px] border-ink-black bg-status-crit px-3 py-2 font-mono text-xs font-bold uppercase text-ink-black shadow-paper"
              role="alert"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Red alert:</span>
              <span className="font-semibold normal-case">
                {criticalAlerts.map((a) => CRITICAL_ALERT_LABEL[a]).join(" · ")}
              </span>
            </div>
          )}
        </section>
      )}

      {/* Split loading screens owned by Claude Code (STATE.md Fase 5) */}
      {phase === "sync" && (
        <MissionLoadingScreen
          variant="wave1_to_wave2"
          missionId={missionId}
          roleId={roleId}
          title="Synchronizing Subsystem Constraints..."
          progressPct={Math.round(syncProgressPct)}
          isMobileClient={isPhoneConsole}
        />
      )}
      {phase === "launchpad" && (
        <MissionLoadingScreen
          variant="wave2_to_flight"
          missionId={missionId}
          roleId={roleId}
          progressPct={Math.round(launchProgressPct)}
          isMobileClient={isPhoneConsole}
        />
      )}

      {/* Station content */}
      <AnimatePresence mode="wait">
        {phase === "walk_to_station_1" && (
          <motion.section
            key="walk1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex items-center justify-center gap-3 font-mono text-sm text-slate-300 ${
              isPhoneConsole ? "handheld-console-frame p-4" : "flash-panel p-6"
            }`}
            role="status"
          >
            <Flag className="h-5 w-5 text-status-ok" aria-hidden="true" />
            {myProfile.codename} walking to Station 1 · {myProfile.wave1Task}…
          </motion.section>
        )}

        {phase === "walk_to_launchpad" && (
          <motion.section
            key="walk-launchpad"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`flex items-center justify-center gap-3 font-mono text-sm text-slate-300 ${
              isPhoneConsole ? "handheld-console-frame p-4" : "flash-panel p-6"
            }`}
            role="status"
          >
            <Rocket className="h-5 w-5 text-status-crit" aria-hidden="true" />
            All subsystems locked · squad rolling out to the launchpad…
          </motion.section>
        )}

        {showMinigame && (
          <motion.div
            key={`station-${activeWave}`}
            className="min-w-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <MinigameShell
              roleId={roleId}
              wave={activeWave}
              timeLeftSec={timeLeftSec}
              isLocked={isLocked}
              toastAlert={toastAlert}
              durationSec={stationDurationSec}
              missionId={missionId}
              playerLabel={playerName ? `Crew: ${playerName}` : undefined}
              onFallbackSubmit={() => onSubmitTake({})}
              layout={isPhoneConsole ? "handheld" : "stage"}
              criticalAlert={isCritical}
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
                onLiveMutation={onLiveMutation}
                onSubmitTake={onSubmitTake}
                isLocked={isLocked}
              />
            </MinigameShell>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default LinearStationTrack;
