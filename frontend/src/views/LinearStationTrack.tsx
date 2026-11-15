// Owner: Leonardo (Tasks LEO-05, LEO-08, LEO-09) — Linear station track.
// [BASE] ──► [STATION 1: DESIGN] ──► [SYNC 5s] ──► [STATION 2: INTEGRATION] ──► [LAUNCHPAD]
// The crewmate walks automatically (no WASD, docs/08-controles.md §1); teammates show a green
// LOCKED check when `jugador_bloqueo_toma` arrives; the 8 minigames mount through MinigameShell.
import { useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Cpu, Flag, Home, RefreshCw, Rocket, Wrench } from "lucide-react";
import {
  MinigameShell,
  MISSION_LABELS,
  ROLE_META,
  STATION_DURATION_SEC,
} from "../components/MinigameShell";
import { CrewmateAvatar } from "../components/paper/CrewmateAvatar";
import { ResourceHUD } from "../components/paper/ResourceHUD";
import { Rol1A_BudgetTable } from "../components/minigames/Rol1A_BudgetTable";
import { Rol1B_LauncherAuction } from "../components/minigames/Rol1B_LauncherAuction";
import { Rol2A_TopologicalAssembly } from "../components/minigames/Rol2A_TopologicalAssembly";
import { Rol2B_MassBalanceTask } from "../components/minigames/Rol2B_MassBalanceTask";
import { Rol3A_OrbitalSniper } from "../components/minigames/Rol3A_OrbitalSniper";
import { Rol3B_AstroLogistics3D } from "../components/minigames/Rol3B_AstroLogistics3D";
import { Rol4A_SpectralLabTask } from "../components/minigames/Rol4A_SpectralLabTask";
import { Rol4B_CommsSpectralHacker } from "../components/minigames/Rol4B_CommsSpectralHacker";
import type { ConnectionStatus, JugadorBloqueoTomaPayload, RoomPlayer } from "../socket";
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

export const ALL_ROLES: RoleType[] = [
  "finance_launch",
  "spacecraft_mass",
  "orbit_power",
  "science_comms",
];

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

const TRACK_NODES: Array<{ id: TrackNodeId; label: string; sub: string; Icon: ComponentType<{ className?: string }> }> = [
  { id: "base", label: "BASE", sub: "Crew ready", Icon: Home },
  { id: "station_1", label: "STATION 1", sub: "DESIGN", Icon: Wrench },
  { id: "sync", label: "SYNC", sub: `${SYNC_DELAY_SEC}s`, Icon: RefreshCw },
  { id: "station_2", label: "STATION 2", sub: "INTEGRATION", Icon: Cpu },
  { id: "launchpad", label: "LAUNCHPAD", sub: "60s flight", Icon: Rocket },
];

/** Horizontal avatar position (% of the track width) for each node. */
const NODE_POSITION_PCT: Record<TrackNodeId, number> = {
  base: 0,
  station_1: 25,
  sync: 50,
  station_2: 75,
  launchpad: 100,
};

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
  /** True once Wave 2 is locked and we wait for `iniciar_vuelo_60s`. */
  awaitingLaunch?: boolean;
  /** Fires when the crewmate reaches a station and its minigame becomes playable. */
  onStationOpened?: (wave: 1 | 2) => void;
  connectionStatus?: ConnectionStatus;
  playerName?: string;
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
    onStationOpened,
    connectionStatus,
    playerName,
  } = props;

  // --- Phase machine --------------------------------------------------------
  const [phase, setPhase] = useState<TrackPhase>("walk_to_station_1");
  const [syncLeft, setSyncLeft] = useState<number>(syncDelaySec);
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

  // Wave 1 -> 2: synchronized 5 s transition while the crewmate walks to STATION 2.
  useEffect(() => {
    if (wave === 2 && prevWave.current === 1) {
      prevWave.current = 2;
      setPhase("sync");
      setSyncLeft(syncDelaySec);
      const tick = window.setInterval(() => {
        setSyncLeft((s) => Math.max(0, s - 1));
      }, 1000);
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

  // Both waves locked: walk to the LAUNCHPAD and wait for Mission Control.
  useEffect(() => {
    if (!awaitingLaunch) return;
    setPhase("walk_to_launchpad");
    const t = window.setTimeout(() => setPhase("launchpad"), WALK_DURATION_SEC * 1000);
    return () => window.clearTimeout(t);
  }, [awaitingLaunch]);

  const isWalking = phase === "walk_to_station_1" || phase === "sync" || phase === "walk_to_launchpad";
  const avatarNode = PHASE_NODE[phase];
  const showMinigame = phase === "station_1" || phase === "station_2";
  const activeWave: 1 | 2 = phase === "station_2" || phase === "sync" ? 2 : wave;
  const ActiveMinigame = activeWave === 1 ? WAVE1_MAP[roleId] : WAVE2_MAP[roleId];

  const activeNode: TrackNodeId =
    phase === "sync"
      ? "sync"
      : phase === "launchpad" || phase === "walk_to_launchpad"
      ? "launchpad"
      : phase === "walk_to_station_1"
      ? "base"
      : avatarNode;

  const avatarState = isWalking ? "walk" : isLocked ? "cheer" : "work";

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
      <ResourceHUD liveMetrics={liveMetrics} missionId={missionId} />

      {/* Track header */}
      <section className="paper-card space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-role-spacecraft">
              Linear station track · {MISSION_LABELS[missionId]} · {difficulty.toUpperCase()}
            </p>
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              {phase === "sync"
                ? "SYNCHRONIZING SUBSYSTEMS"
                : phase === "launchpad" || phase === "walk_to_launchpad"
                ? "LAUNCHPAD · AWAITING CLEARANCE"
                : `STATION ${activeWave} · ${activeWave === 1 ? "DESIGN" : "INTEGRATION"}`}
            </h2>
          </div>
          {connectionStatus && (
            <span
              className={`rounded-lg border-2 border-ink-black px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                connectionStatus === "online"
                  ? "bg-status-ok text-ink-black"
                  : connectionStatus === "offline"
                  ? "bg-status-warn text-ink-black"
                  : "bg-blueprint-navy text-slate-200"
              }`}
            >
              {connectionStatus === "online"
                ? "Mission Control: ONLINE"
                : connectionStatus === "offline"
                ? "Preview mode (offline)"
                : "Connecting…"}
            </span>
          )}
        </div>

        {/* Nodes + animated crewmate */}
        <div className="relative px-6 pb-2 pt-14 sm:px-8">
          {/* rail */}
          <div className="absolute left-6 right-6 top-[4.6rem] h-2 rounded-full border-2 border-ink-black bg-space-ink sm:left-8 sm:right-8">
            <motion.div
              className="h-full rounded-full bg-status-ok"
              animate={{ width: `${NODE_POSITION_PCT[avatarNode]}%` }}
              transition={{ duration: WALK_DURATION_SEC, ease: "easeInOut" }}
            />
          </div>

          {/* walking crewmate — wrapper shares the rail insets so `left: %` maps onto the nodes */}
          <div className="pointer-events-none absolute left-6 right-6 top-0 h-16 sm:left-8 sm:right-8">
            <motion.div
              className="absolute top-0 z-10"
              initial={false}
              animate={{
                left: `${NODE_POSITION_PCT[avatarNode]}%`,
                x: "-50%",
                y: isWalking ? [0, -6, 0, -6, 0] : 0,
                rotate: isWalking ? [-4, 4, -4] : 0,
              }}
              transition={{
                left: { duration: WALK_DURATION_SEC, ease: "easeInOut" },
                y: { duration: 0.5, repeat: isWalking ? Infinity : 0 },
                rotate: { duration: 0.5, repeat: isWalking ? Infinity : 0 },
              }}
              aria-label={isWalking ? "Crewmate walking to the next station" : "Crewmate at station"}
            >
              <CrewmateAvatar role={roleId} state={avatarState} size={56} />
            </motion.div>
          </div>

          {/* node labels */}
          <ol className="relative flex items-start justify-between" aria-label="Station track">
            {TRACK_NODES.map((node) => {
              const reached = NODE_POSITION_PCT[node.id] <= NODE_POSITION_PCT[avatarNode];
              const isActive = node.id === activeNode;
              return (
                <li key={node.id} className="flex w-16 flex-col items-center gap-1 text-center sm:w-24">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-ink-black shadow-paper ${
                      isActive
                        ? "bg-status-ok text-ink-black"
                        : reached
                        ? "bg-paper-cream text-ink-black"
                        : "bg-blueprint-navy text-slate-400"
                    }`}
                  >
                    <node.Icon className={`h-4 w-4 ${node.id === "sync" && phase === "sync" ? "animate-spin" : ""}`} />
                  </div>
                  <div
                    className={`font-mono text-[10px] font-bold leading-tight sm:text-xs ${
                      isActive ? "text-status-ok" : reached ? "text-paper-cream" : "text-slate-500"
                    }`}
                  >
                    {node.label}
                  </div>
                  <div className="hidden font-mono text-[10px] text-slate-400 sm:block">{node.sub}</div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Crew indicators with LOCKED checks */}
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Crew status">
          {ALL_ROLES.map((role) => {
            const human = players.find((p) => p.role_id === role);
            const isMe = role === roleId;
            const lockedHere = lockedTakes.some((t) => t.role_id === role && t.wave === activeWave) || (isMe && isLocked);
            const meta = ROLE_META[role];
            return (
              <li
                key={role}
                className={`flex items-center gap-2 rounded-xl border-[3px] border-ink-black px-2 py-1.5 shadow-paper ${
                  isMe ? "bg-paper-cream text-ink-black" : "bg-space-ink text-paper-cream"
                }`}
              >
                <CrewmateAvatar role={role} state={lockedHere ? "cheer" : "work"} size={30} />
                <div className="min-w-0 flex-1">
                  <div className={`truncate font-mono text-[10px] font-bold uppercase ${isMe ? "text-ink-black" : meta.textClass}`}>
                    {meta.shortLabel} {isMe ? "· YOU" : ""}
                  </div>
                  <div className="truncate text-xs font-semibold">
                    {isMe ? playerName || "You" : human ? human.player_name : "AI Autopilot"}
                  </div>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  {lockedHere ? (
                    <motion.span
                      key="locked"
                      initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      className="flex items-center gap-1 rounded-md border-2 border-ink-black bg-status-ok px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink-black"
                      aria-label={`${meta.label} locked`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> LOCKED
                    </motion.span>
                  ) : (
                    <motion.span
                      key="working"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`font-mono text-[10px] font-bold ${isMe ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {!human && !isMe ? "AUTO" : "…"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Station content: minigame / sync overlay / launchpad */}
      <AnimatePresence mode="wait">
        {phase === "sync" && (
          <motion.section
            key="sync"
            initial={{ opacity: 0, y: 24, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="paper-card-light flex flex-col items-center gap-3 p-8 text-center"
            role="status"
            aria-live="assertive"
          >
            <RefreshCw className="h-10 w-10 animate-spin text-blueprint-navy" aria-hidden="true" />
            <h3 className="font-display text-2xl font-bold sm:text-3xl">
              Synchronizing Subsystem Constraints...
            </h3>
            <p className="max-w-md text-sm text-slate-700">
              Consolidating Station 1 decisions from all 4 roles. Station 2 will open with the exact
              mass, budget, power and link constraints your crew just produced.
            </p>
            <div className="font-mono text-5xl font-bold tabular-nums text-ink-black">
              {String(syncLeft).padStart(2, "0")}s
            </div>
          </motion.section>
        )}

        {(phase === "walk_to_station_1") && (
          <motion.section
            key="walk1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="paper-card flex items-center justify-center gap-3 p-6 font-mono text-sm text-slate-300"
            role="status"
          >
            <Flag className="h-5 w-5 text-status-ok" aria-hidden="true" />
            Walking to Station 1 · Design…
          </motion.section>
        )}

        {(phase === "walk_to_launchpad" || phase === "launchpad") && (
          <motion.section
            key="launchpad"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="paper-card-light flex flex-col items-center gap-3 p-8 text-center"
            role="status"
          >
            <Rocket className="h-10 w-10 text-status-crit" aria-hidden="true" />
            <h3 className="font-display text-2xl font-bold sm:text-3xl">All subsystems locked</h3>
            <p className="max-w-md text-sm text-slate-700">
              {phase === "launchpad"
                ? "Mission Control is evaluating your design against the 4 decision gates. Stand by for liftoff."
                : "Walking to the launchpad…"}
            </p>
          </motion.section>
        )}

        {showMinigame && (
          <motion.div
            key={`station-${activeWave}`}
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
              playerLabel={playerName ? `Crewmate: ${playerName}` : undefined}
              onFallbackSubmit={() => onSubmitTake({})}
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
