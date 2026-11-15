// Owner: Leonardo (Task LEO-03) — Common 30s minigame wrapper (2D Flash arcade + NASA blueprint HUD):
// giant IBM Plex Mono timer, ASTRO SPRITES identity (ROLE_CHARACTER_PROFILE), 1-shot LOCKED state,
// animated `mutacion_en_vivo` toast and a safe ErrorBoundary fallback so a broken minigame never
// breaks the 5-minute mission flow. Two layouts: "stage" (Host / desktop) and "handheld" (phone pad).
import {
  Component,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Lock, Radio, TimerReset, Wrench } from "lucide-react";
import {
  CrewmateAvatar,
  ROLE_CHARACTER_PROFILE,
  type ActionEffect,
  type AvatarState,
} from "./paper/CrewmateAvatar";
import { StationScenery } from "./paper/StationScenery";
import { soundEngine } from "./paper/SoundEngine";
import type { MissionIdType, RoleType } from "../types/game";

// ---------------------------------------------------------------------------
// UI constants (gameplay durations come from docs/04-juego.md: 30 s per station, 1 take)
// ---------------------------------------------------------------------------
/** Default station duration (docs/04-juego.md §"Los 8 Minijuegos (30 segundos · Modalidad 1 Toma)"). */
export const STATION_DURATION_SEC = 30;
/** Timer turns amber at or below this many seconds (UI-only threshold). */
const TIMER_WARN_SEC = 10;
/** Timer turns red and pulses at or below this many seconds (UI-only threshold). */
export const TIMER_CRIT_SEC = 5;
/** How long a live-mutation toast stays on screen (UI-only). */
const TOAST_LIFETIME_MS = 3500;
/** Maximum stacked toasts before the oldest is dropped (UI-only). */
const TOAST_MAX_STACK = 3;
/** EXT-02 stamp timing (UI-only): body stamp slams first, header mini-stamp and shake follow. */
const STAMP_IMPACT_DELAY_SEC = 0.18;
const STAMP_HEADER_DELAY_SEC = 0.32;
/** Countdown ticks play on the last N seconds (STATE.md Fase 7: `1..5`). */
const COUNTDOWN_TICK_FROM_SEC = TIMER_CRIT_SEC;
/** Ticks at or below this many seconds use the urgent (higher) tone. */
const COUNTDOWN_URGENT_SEC = 2;

/** Sprite mood for a station specialist (STATE.md Fase 7 animation rules). */
export interface SpriteMood {
  state: AvatarState;
  actionEffect: ActionEffect;
  statusBadgeText?: string;
}

/**
 * Shared mood rules used by MinigameShell and LinearStationTrack:
 * walking -> thruster; locked -> cheer + complete + "LOCKED";
 * alert (<= 5 s unlocked or critical metrics) -> panic + error + "ALERT"; otherwise work + scan.
 */
export function resolveSpriteMood(opts: {
  isWalking?: boolean;
  isLocked: boolean;
  isAlert: boolean;
  /** Keep the "complete" sparkle only during the brief post-lock celebration. */
  celebrating?: boolean;
}): SpriteMood {
  if (opts.isWalking) return { state: "walk", actionEffect: "thruster" };
  if (opts.isLocked) {
    return {
      state: "cheer",
      actionEffect: opts.celebrating === false ? "none" : "complete",
      statusBadgeText: "LOCKED",
    };
  }
  if (opts.isAlert) return { state: "panic", actionEffect: "error", statusBadgeText: "ALERT" };
  return { state: "work", actionEffect: "scan" };
}

/**
 * Role labels used across the station UI. Identity (codename, label, suit colour) comes from
 * ROLE_CHARACTER_PROFILE so every screen shows the same ASTRO SPRITES squad.
 */
export const ROLE_META: Record<
  RoleType,
  { shortLabel: string; label: string; codename: string; bgClass: string; textClass: string }
> = {
  finance_launch: {
    shortLabel: "ROLE 1",
    label: ROLE_CHARACTER_PROFILE.finance_launch.label,
    codename: ROLE_CHARACTER_PROFILE.finance_launch.codename,
    bgClass: "bg-role-finance",
    textClass: "text-role-finance",
  },
  spacecraft_mass: {
    shortLabel: "ROLE 2",
    label: ROLE_CHARACTER_PROFILE.spacecraft_mass.label,
    codename: ROLE_CHARACTER_PROFILE.spacecraft_mass.codename,
    bgClass: "bg-role-spacecraft",
    textClass: "text-role-spacecraft",
  },
  orbit_power: {
    shortLabel: "ROLE 3",
    label: ROLE_CHARACTER_PROFILE.orbit_power.label,
    codename: ROLE_CHARACTER_PROFILE.orbit_power.codename,
    bgClass: "bg-role-orbit",
    textClass: "text-role-orbit",
  },
  science_comms: {
    shortLabel: "ROLE 4",
    label: ROLE_CHARACTER_PROFILE.science_comms.label,
    codename: ROLE_CHARACTER_PROFILE.science_comms.codename,
    bgClass: "bg-role-science",
    textClass: "text-role-science",
  },
};

export const STATION_META: Record<1 | 2, { title: string; subtitle: string }> = {
  1: { title: "STATION 1", subtitle: "DESIGN" },
  2: { title: "STATION 2", subtitle: "BUILD" },
};

export const MISSION_LABELS: Record<MissionIdType, string> = {
  artemis_moon: "Artemis Moon",
  asteroid_hunter: "Asteroid Hunter",
  mars_sample_return: "Mars Sample Return",
};

export type MinigameShellLayout = "stage" | "handheld";

// ---------------------------------------------------------------------------
// ErrorBoundary — keeps the station flow alive if a teammate's minigame throws
// ---------------------------------------------------------------------------
interface BoundaryProps {
  resetKey: string;
  fallback: (error: Error, reset: () => void) => ReactNode;
  children: ReactNode;
}
interface BoundaryState {
  error: Error | null;
}

export class MinigameErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the stack in the console for the minigame owner; the UI shows a clean fallback.
    console.error("[MinigameShell] Minigame crashed:", error, info.componentStack);
  }

  componentDidUpdate(prevProps: BoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  reset = () => this.setState({ error: null });

  render(): ReactNode {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset);
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Toast stack (animated banner for `mutacion_en_vivo.toast_alert`)
// ---------------------------------------------------------------------------
interface ToastItem {
  id: number;
  text: string;
}

function LiveMutationToasts({ toasts }: { toasts: ToastItem[] }) {
  return (
    // Sits below the fixed <SoundControlPill /> (top-right) so toasts never cover the audio controls.
    <div className="pointer-events-none fixed right-3 top-[8.5rem] z-50 flex w-[min(92vw,20rem)] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, x: 80, rotate: 4, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, rotate: -1.5, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="pointer-events-auto flex items-start gap-2 rounded-xl border-[3px] border-ink-black bg-status-warn px-3 py-2 text-ink-black shadow-paper"
          >
            <Radio className="mt-0.5 h-4 w-4 shrink-0 animate-pulse" aria-hidden="true" />
            <div className="min-w-0">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest">
                Live mutation
              </div>
              <div className="font-display text-sm font-bold leading-snug">{toast.text}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------
export interface MinigameShellProps {
  roleId: RoleType;
  wave: 1 | 2;
  timeLeftSec: number;
  isLocked: boolean;
  /** Latest `toast_alert` from `mutacion_en_vivo`; each new non-empty value spawns a toast. */
  toastAlert?: string | null;
  /** Station duration used to draw the progress bar (default 30 s). */
  durationSec?: number;
  missionId?: MissionIdType;
  /** Optional player label shown next to the role badge (e.g. "YOU" or a crewmate name). */
  playerLabel?: string;
  /**
   * Called from the ErrorBoundary fallback so the host can still lock a (degraded) take and
   * keep the mission moving when a minigame crashes.
   */
  onFallbackSubmit?: () => void;
  /** "stage" = Host / desktop flash panel (default); "handheld" = compact phone console frame. */
  layout?: MinigameShellLayout;
  /** Shared metrics are in red alert (overweight, no budget, UFE below minimum, missing TPS). */
  criticalAlert?: boolean;
  /**
   * Full-screen game window: the shell fills its parent's height and the minigame area takes
   * the rest (internal scroll only as a fallback), so the page itself never scrolls.
   */
  fill?: boolean;
  children: ReactNode;
}

export function MinigameShell({
  roleId,
  wave,
  timeLeftSec,
  isLocked,
  toastAlert,
  durationSec = STATION_DURATION_SEC,
  missionId,
  playerLabel,
  onFallbackSubmit,
  layout = "stage",
  criticalAlert = false,
  fill = false,
  children,
}: MinigameShellProps) {
  const profile = ROLE_CHARACTER_PROFILE[roleId];
  const station = STATION_META[wave];
  const stationTask = wave === 1 ? profile.wave1Task : profile.wave2Task;
  const isHandheld = layout === "handheld";
  /** durationSec <= 0 = untimed station (docs/03, 2026-11-15): no clock, lock when ready. */
  const untimed = durationSec <= 0;
  const secondsLeft = Math.max(0, Math.ceil(timeLeftSec));
  const progress = durationSec > 0 ? Math.min(1, Math.max(0, timeLeftSec / durationSec)) : 0;
  const isTimeUp = secondsLeft <= 0;
  const isCrit = !isLocked && !isTimeUp && secondsLeft <= TIMER_CRIT_SEC;
  const isWarn = !isLocked && !isTimeUp && !isCrit && secondsLeft <= TIMER_WARN_SEC;

  // --- Toast queue -------------------------------------------------------
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastSeq = useRef(0);
  const isFirstToastRender = useRef(true);
  useEffect(() => {
    // Skip the value already present on mount: a fresh Station 2 shell must not replay
    // the last Station 1 toast still held by App.tsx.
    if (isFirstToastRender.current) {
      isFirstToastRender.current = false;
      return;
    }
    if (!toastAlert) return;
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev, { id, text: toastAlert }].slice(-TOAST_MAX_STACK));
    soundEngine.playMutationToast();
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_LIFETIME_MS);
    return () => window.clearTimeout(timer);
  }, [toastAlert]);

  // --- Reactive audio (soundEngine) ------------------------------------------
  // The clock is only trusted once it has shown a positive value since mount, so a
  // shell that mounts before App restarts the 30 s timer never fires a bogus time-up.
  const clockStarted = useRef(secondsLeft > 0);
  if (secondsLeft > 0) clockStarted.current = true;

  // Countdown ticks on the last 5 s (urgent tone on the last 2 s).
  const lastTickSec = useRef<number | null>(null);
  useEffect(() => {
    if (isLocked || !clockStarted.current || secondsLeft < 1 || secondsLeft > COUNTDOWN_TICK_FROM_SEC) return;
    if (lastTickSec.current === secondsLeft) return;
    lastTickSec.current = secondsLeft;
    soundEngine.playCountdownTick(secondsLeft <= COUNTDOWN_URGENT_SEC);
  }, [secondsLeft, isLocked]);

  // Completion arpeggio when the single take locks.
  const wasLocked = useRef(isLocked);
  useEffect(() => {
    if (isLocked && !wasLocked.current) soundEngine.playComplete();
    wasLocked.current = isLocked;
  }, [isLocked]);

  // Error buzz when the clock expires without a lock (emergency auto-submit / fallback take).
  const timeUpPlayed = useRef(false);
  useEffect(() => {
    if (!isTimeUp || isLocked || !clockStarted.current || timeUpPlayed.current) return;
    timeUpPlayed.current = true;
    soundEngine.playError();
  }, [isTimeUp, isLocked]);

  const mood = resolveSpriteMood({
    isLocked,
    isAlert: !isLocked && (isCrit || (isTimeUp && clockStarted.current) || criticalAlert),
  });

  const timerColorClass = isLocked
    ? "bg-blueprint-navy text-slate-300"
    : isCrit
    ? "bg-status-crit text-ink-black"
    : isWarn
    ? "bg-status-warn text-ink-black"
    : "bg-space-ink text-paper-cream";

  const timer = (
    <motion.div
      key={isCrit ? "crit" : "calm"}
      animate={isCrit ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={isCrit ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
      className={`flex shrink-0 items-baseline gap-1 rounded-2xl border-[3px] border-ink-black shadow-paper ${
        isHandheld ? "px-3 py-1" : "px-4 py-1.5"
      } ${timerColorClass}`}
      aria-label={`${secondsLeft} seconds left`}
    >
      <span
        className={`font-mono font-bold leading-none tabular-nums ${
          isHandheld ? "text-4xl" : "text-5xl sm:text-6xl"
        }`}
      >
        {String(secondsLeft).padStart(2, "0")}
      </span>
      <span className="font-mono text-base font-bold">s</span>
    </motion.div>
  );

  // Mini ink stamp in the header (EXT-02 "STATION LOCKED STAMP").
  const lockedBadge = (
    <AnimatePresence>
      {isLocked && (
        <motion.span
          initial={{ scale: 2.4, rotate: -24, opacity: 0 }}
          animate={{ scale: 1, rotate: -6, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 17, delay: STAMP_HEADER_DELAY_SEC }}
          className="inline-flex items-center gap-1 rounded-md border-[3px] border-double border-status-ok bg-space-ink/80 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-status-ok"
        >
          <Lock className="h-3 w-3" aria-hidden="true" /> {isHandheld ? "LOCKED" : "STATION LOCKED"}
        </motion.span>
      )}
    </AnimatePresence>
  );

  return (
    <motion.section
      className={`relative min-w-0 overflow-hidden ${
        isHandheld ? "handheld-console-frame p-3" : "flash-panel p-3 sm:p-4"
      } ${fill ? "flex h-full flex-col gap-2 sm:gap-3" : isHandheld ? "space-y-3" : "space-y-4"}`}
      // Mechanical "thunk" when the stamp lands.
      animate={isLocked ? { x: [0, -5, 5, -3, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.38, delay: isLocked ? STAMP_IMPACT_DELAY_SEC : 0 }}
      aria-live="polite"
    >
      <LiveMutationToasts toasts={toasts} />

      {!isHandheld && !fill && (
        <div
          className="hazard-stripe-bar -mx-4 -mt-4 h-2.5 border-b-[3px] border-ink-black sm:-mx-5 sm:-mt-5"
          aria-hidden="true"
        />
      )}

      {/* Header: ASTRO SPRITE identity + station task + giant timer */}
      <header
        className={`flex shrink-0 items-center justify-between gap-3 border-b-[3px] border-ink-black ${
          isHandheld || fill ? "pb-2" : "flex-wrap pb-3"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div
            className={`visor-glow flex shrink-0 flex-col items-center rounded-xl border-[3px] p-1 transition-colors ${
              mood.actionEffect === "error"
                ? "border-status-crit bg-status-crit/15"
                : isLocked
                ? "border-status-ok bg-status-ok/15"
                : "border-ink-black bg-space-ink"
            }`}
          >
            <CrewmateAvatar
              role={roleId}
              state={mood.state}
              actionEffect={mood.actionEffect}
              statusBadgeText={isHandheld ? undefined : mood.statusBadgeText}
              size={isHandheld ? 36 : 52}
            />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span
                className="truncate rounded-md border-2 border-ink-black px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-ink-black shadow-paper"
                style={{ backgroundColor: profile.suit }}
              >
                {profile.codename}
              </span>
              {!isHandheld && (
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {profile.squadClass}
                </span>
              )}
              {lockedBadge}
            </div>
            <div
              className={`truncate font-display font-bold text-paper-cream ${
                isHandheld ? "text-sm" : "text-base sm:text-lg"
              }`}
            >
              {station.title} · {stationTask}
            </div>
            {!isHandheld && !fill && (
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Wrench className="h-3 w-3" aria-hidden="true" /> {profile.gearLabel}
                </span>
                {missionId && <span>· {MISSION_LABELS[missionId]}</span>}
                {playerLabel && <span>· {playerLabel}</span>}
              </div>
            )}
          </div>
        </div>
        {untimed ? (
          <span className="shrink-0 rounded-xl border-[3px] border-ink-black bg-space-ink px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-sky-glow shadow-paper">
            {isLocked ? "Locked" : isHandheld ? "No timer" : "No timer · lock when ready"}
          </span>
        ) : (
          timer
        )}
      </header>

      {/* Time progress bar */}
      {!untimed && (
      <div
        className={`w-full overflow-hidden rounded-full border-2 border-ink-black bg-space-ink ${
          isHandheld ? "h-2.5" : "h-3"
        }`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={durationSec}
        aria-valuenow={secondsLeft}
      >
        <motion.div
          className={`h-full ${
            isLocked
              ? "bg-slate-500"
              : isCrit
              ? "bg-status-crit"
              : isWarn
              ? "bg-status-warn"
              : "bg-status-ok"
          }`}
          animate={{ width: `${progress * 100}%` }}
          transition={{ ease: "linear", duration: 0.9 }}
        />
      </div>
      )}

      {/* Phase scenery (VAB hangar / ascent / orbital base / rover) — art only, no logic */}
      {!fill && (
        <StationScenery roleId={roleId} wave={wave} missionId={missionId ?? "artemis_moon"} compact={isHandheld} />
      )}

      {/* Minigame body — pointer-events disabled once the single take is locked */}
      <div className={`relative min-w-0 ${fill ? "min-h-0 flex-1" : ""}`}>
        <div
          className={`min-w-0 overflow-x-hidden ${fill ? "h-full overflow-y-auto overscroll-contain" : ""} ${
            isLocked ? "pointer-events-none select-none opacity-60 transition-opacity" : ""
          }`}
          aria-disabled={isLocked}
        >
          <MinigameErrorBoundary
            resetKey={`${roleId}-${wave}`}
            fallback={(error, reset) => (
              <MinigameFallback
                error={error}
                roleId={roleId}
                wave={wave}
                isLocked={isLocked}
                onRetry={reset}
                onFallbackSubmit={onFallbackSubmit}
              />
            )}
          >
            {children}
          </MinigameErrorBoundary>
        </div>

        <AnimatePresence>
          {isLocked && (
            <StationLockedStamp
              compact={isHandheld}
              stationLabel={`${station.title} · ${stationTask}`}
              codename={profile.codename}
            />
          )}
        </AnimatePresence>

        {!isLocked && isTimeUp && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center px-2">
            <div className="flex items-center gap-2 rounded-xl border-[3px] border-ink-black bg-status-crit px-3 py-1.5 font-mono text-xs font-bold text-ink-black shadow-paper">
              <TimerReset className="h-4 w-4" aria-hidden="true" />
              TIME&apos;S UP — auto-submitting your take
            </div>
          </div>
        )}
      </div>

      {isHandheld && (
        <footer className="flex items-center justify-between gap-2 border-t-2 border-ink-black pt-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            <Wrench className="h-3 w-3 shrink-0" aria-hidden="true" /> {profile.gearLabel}
          </span>
          {missionId && <span className="shrink-0">{MISSION_LABELS[missionId]}</span>}
        </footer>
      )}
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// EXT-02 · STATION LOCKED STAMP — cardstock ink stamp that slams onto the console
// ---------------------------------------------------------------------------
function StationLockedStamp({
  compact,
  stationLabel,
  codename,
}: {
  compact: boolean;
  stationLabel: string;
  codename: string;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ink splash ring on impact */}
      <motion.span
        className="absolute rounded-full border-[6px] border-status-ok"
        style={{ width: compact ? 120 : 180, height: compact ? 120 : 180 }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.5], opacity: [0, 0.55, 0] }}
        transition={{ duration: 0.6, delay: STAMP_IMPACT_DELAY_SEC, ease: "easeOut" }}
        aria-hidden="true"
      />
      <motion.div
        role="img"
        aria-label={`Station locked: ${stationLabel}`}
        initial={{ scale: 3, rotate: -28, opacity: 0, y: -30 }}
        animate={{ scale: 1, rotate: -8, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 430, damping: 15, mass: 0.9 }}
        className={`relative rounded-xl border-[5px] border-double border-status-ok bg-space-ink/85 text-center text-status-ok shadow-paper-lg ${
          compact ? "px-4 py-2" : "px-6 py-3"
        }`}
        style={{ textShadow: "1px 1px 0 #0F172A" }}
      >
        <div className="pointer-events-none absolute inset-1 rounded-lg border-2 border-dashed border-status-ok/60" aria-hidden="true" />
        <div className={`flex items-center justify-center gap-2 font-display font-bold tracking-wider ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
          <CheckCircle2 className={compact ? "h-5 w-5" : "h-7 w-7"} aria-hidden="true" />
          STATION LOCKED
        </div>
        <div className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-status-ok/90">
          {stationLabel}
        </div>
        {!compact && (
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-status-ok/70">
            {codename} · one take · sealed
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Fallback card rendered by the ErrorBoundary
// ---------------------------------------------------------------------------
function MinigameFallback({
  error,
  roleId,
  wave,
  isLocked,
  onRetry,
  onFallbackSubmit,
}: {
  error: Error;
  roleId: RoleType;
  wave: 1 | 2;
  isLocked: boolean;
  onRetry: () => void;
  onFallbackSubmit?: () => void;
}) {
  const profile = ROLE_CHARACTER_PROFILE[roleId];
  // Emergency fallback is an error state: buzz once when the fallback card appears.
  useEffect(() => {
    soundEngine.playError();
  }, []);
  return (
    <div className="paper-card-light space-y-3 p-4" role="alert">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-status-crit" aria-hidden="true" />
        <h3 className="font-display text-lg font-bold">Console glitch</h3>
      </div>
      <p className="text-sm text-slate-700">
        Station {wave} hit an error. Lock a safe take and keep going.
      </p>
      <pre className="max-h-24 overflow-auto rounded-lg border-2 border-ink-black bg-space-ink p-2 font-mono text-[11px] text-status-warn">
        {error.message || String(error)}
      </pre>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onRetry();
          }}
          className="paper-btn bg-role-spacecraft px-3 py-1.5 text-sm text-ink-black"
        >
          Retry minigame
        </button>
        {onFallbackSubmit && !isLocked && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onFallbackSubmit();
            }}
            className="paper-btn bg-status-ok px-3 py-1.5 text-sm text-ink-black"
          >
            Lock fallback take
          </button>
        )}
      </div>
    </div>
  );
}

export default MinigameShell;
