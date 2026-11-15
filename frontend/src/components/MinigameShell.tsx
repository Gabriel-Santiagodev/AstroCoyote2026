// Owner: Leonardo (Task LEO-03) — Common 30s minigame wrapper: giant IBM Plex Mono timer,
// role & station badges, 1-shot LOCKED state, animated `mutacion_en_vivo` toast and a safe
// ErrorBoundary fallback so a broken minigame never breaks the 5-minute mission flow.
import {
  Component,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Lock, Radio, TimerReset } from "lucide-react";
import type { MissionIdType, RoleType } from "../types/game";

// ---------------------------------------------------------------------------
// UI constants (gameplay durations come from docs/04-juego.md: 30 s per station, 1 take)
// ---------------------------------------------------------------------------
/** Default station duration (docs/04-juego.md §"Los 8 Minijuegos (30 segundos · Modalidad 1 Toma)"). */
export const STATION_DURATION_SEC = 30;
/** Timer turns amber at or below this many seconds (UI-only threshold). */
const TIMER_WARN_SEC = 10;
/** Timer turns red and pulses at or below this many seconds (UI-only threshold). */
const TIMER_CRIT_SEC = 5;
/** How long a live-mutation toast stays on screen (UI-only). */
const TOAST_LIFETIME_MS = 3500;
/** Maximum stacked toasts before the oldest is dropped (UI-only). */
const TOAST_MAX_STACK = 3;

export const ROLE_META: Record<
  RoleType,
  { shortLabel: string; label: string; bgClass: string; textClass: string }
> = {
  finance_launch: {
    shortLabel: "ROLE 1",
    label: "Finance & Launch",
    bgClass: "bg-role-finance",
    textClass: "text-role-finance",
  },
  spacecraft_mass: {
    shortLabel: "ROLE 2",
    label: "Spacecraft & Mass",
    bgClass: "bg-role-spacecraft",
    textClass: "text-role-spacecraft",
  },
  orbit_power: {
    shortLabel: "ROLE 3",
    label: "Orbit & Power",
    bgClass: "bg-role-orbit",
    textClass: "text-role-orbit",
  },
  science_comms: {
    shortLabel: "ROLE 4",
    label: "Science & Comms",
    bgClass: "bg-role-science",
    textClass: "text-role-science",
  },
};

export const STATION_META: Record<1 | 2, { title: string; subtitle: string }> = {
  1: { title: "STATION 1", subtitle: "DESIGN" },
  2: { title: "STATION 2", subtitle: "INTEGRATION" },
};

export const MISSION_LABELS: Record<MissionIdType, string> = {
  artemis_moon: "Artemis Moon",
  asteroid_hunter: "Asteroid Hunter",
  mars_sample_return: "Mars Sample Return",
};

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
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,22rem)] flex-col gap-2">
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
  children,
}: MinigameShellProps) {
  const role = ROLE_META[roleId];
  const station = STATION_META[wave];
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
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_LIFETIME_MS);
    return () => window.clearTimeout(timer);
  }, [toastAlert]);

  const timerColorClass = isLocked
    ? "bg-blueprint-navy text-slate-300"
    : isCrit
    ? "bg-status-crit text-ink-black"
    : isWarn
    ? "bg-status-warn text-ink-black"
    : "bg-space-ink text-paper-cream";

  return (
    <section className="paper-card relative space-y-4 p-4 sm:p-5" aria-live="polite">
      <LiveMutationToasts toasts={toasts} />

      {/* Header: role + station badges and the giant timer */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink-black pb-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className={`rounded-lg border-[3px] border-ink-black ${role.bgClass} px-2.5 py-1 font-mono text-xs font-bold uppercase text-ink-black shadow-paper`}
          >
            {role.shortLabel} · {role.label}
          </span>
          <span className="rounded-lg border-[3px] border-ink-black bg-paper-cream px-2.5 py-1 font-mono text-xs font-bold uppercase text-ink-black shadow-paper">
            {station.title} · {station.subtitle}
          </span>
          {missionId && (
            <span className="rounded-lg border-2 border-ink-black bg-blueprint-navy px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-200">
              {MISSION_LABELS[missionId]}
            </span>
          )}
          {playerLabel && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {playerLabel}
            </span>
          )}
          <AnimatePresence>
            {isLocked && (
              <motion.span
                initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
                animate={{ scale: 1, rotate: -3, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="inline-flex items-center gap-1 rounded-lg border-[3px] border-ink-black bg-status-ok px-2.5 py-1 font-mono text-xs font-bold text-ink-black shadow-paper"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" /> LOCKED
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          key={isCrit ? "crit" : "calm"}
          animate={isCrit ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={isCrit ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
          className={`flex items-baseline gap-1 rounded-2xl border-[3px] border-ink-black px-4 py-1.5 shadow-paper ${timerColorClass}`}
          aria-label={`${secondsLeft} seconds left`}
        >
          <span className="font-mono text-5xl font-bold leading-none tabular-nums sm:text-6xl">
            {String(secondsLeft).padStart(2, "0")}
          </span>
          <span className="font-mono text-base font-bold">s</span>
        </motion.div>
      </header>

      {/* Time progress bar */}
      <div
        className="h-3 w-full overflow-hidden rounded-full border-2 border-ink-black bg-space-ink"
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

      {/* Minigame body — pointer-events disabled once the single take is locked */}
      <div className="relative">
        <div
          className={isLocked ? "pointer-events-none select-none opacity-60 transition-opacity" : ""}
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
            <motion.div
              initial={{ opacity: 0, scale: 1.6, rotate: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 16 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="flex items-center gap-2 rounded-2xl border-4 border-ink-black bg-status-ok px-5 py-3 font-display text-2xl font-bold text-ink-black shadow-paper-lg sm:text-3xl">
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                TAKE LOCKED
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLocked && isTimeUp && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <div className="flex items-center gap-2 rounded-xl border-[3px] border-ink-black bg-status-crit px-3 py-1.5 font-mono text-xs font-bold text-ink-black shadow-paper">
              <TimerReset className="h-4 w-4" aria-hidden="true" />
              TIME&apos;S UP — auto-submitting your take
            </div>
          </div>
        )}
      </div>
    </section>
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
  const role = ROLE_META[roleId];
  return (
    <div className="paper-card-light space-y-3 p-4" role="alert">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-status-crit" aria-hidden="true" />
        <h3 className="font-display text-lg font-bold">Minigame offline — safe fallback</h3>
      </div>
      <p className="text-sm text-slate-700">
        The {role.label} minigame for Station {wave} hit an error and was isolated so your mission
        can continue. Lock a fallback take to keep the crew on schedule.
      </p>
      <pre className="max-h-24 overflow-auto rounded-lg border-2 border-ink-black bg-space-ink p-2 font-mono text-[11px] text-status-warn">
        {error.message || String(error)}
      </pre>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onRetry} className="paper-btn bg-role-spacecraft px-3 py-1.5 text-sm text-ink-black">
          Retry minigame
        </button>
        {onFallbackSubmit && !isLocked && (
          <button
            type="button"
            onClick={onFallbackSubmit}
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
