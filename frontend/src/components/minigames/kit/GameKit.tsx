// Owner: Leonardo (2026-11-15) — Shared minigame kit: every station is a game window with a play
// area (left) and a side panel with goals, live readouts and the lock button (right). Fits the
// window height (no page scroll); on phones the panel stacks under the play area.
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, TriangleAlert } from "lucide-react";
import { soundEngine } from "../../paper/SoundEngine";

export interface Goal {
  label: string;
  done: boolean;
}

export type Tone = "ok" | "warn" | "bad" | "info";

const TONE_BAR: Record<Tone, string> = {
  ok: "bg-status-ok",
  warn: "bg-status-warn",
  bad: "bg-status-crit",
  info: "bg-sky-glow",
};
const TONE_TEXT: Record<Tone, string> = {
  ok: "text-status-ok",
  warn: "text-status-warn",
  bad: "text-status-crit",
  info: "text-sky-glow",
};

export function GameLayout({ play, panel }: { play: ReactNode; panel: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 text-paper-cream lg:flex-row">
      <div className="relative min-h-[260px] min-w-0 flex-1 overflow-hidden rounded-2xl border-[3px] border-ink-black bg-space-ink shadow-paper">
        {play}
      </div>
      <aside className="flex min-h-0 shrink-0 flex-col gap-2.5 lg:w-72">{panel}</aside>
    </div>
  );
}

export function PanelCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border-[3px] border-ink-black bg-blueprint-navy p-2.5 shadow-paper-sm">
      {title && (
        <div className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</div>
      )}
      {children}
    </div>
  );
}

export function GoalList({ goals }: { goals: Goal[] }) {
  const done = goals.filter((g) => g.done).length;
  return (
    <PanelCard title={`Goals · ${done}/${goals.length}`}>
      <ul className="space-y-1.5">
        {goals.map((g) => (
          <li key={g.label} className="flex items-center gap-2 text-sm font-bold leading-tight">
            <motion.span
              initial={false}
              animate={{ scale: g.done ? [1.4, 1] : 1, backgroundColor: g.done ? "#22C55E" : "#0F172A" }}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-ink-black"
            >
              {g.done && <Check className="h-3.5 w-3.5 text-ink-black" strokeWidth={3} />}
            </motion.span>
            <span className={g.done ? "text-status-ok" : "text-paper-cream"}>{g.label}</span>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

/** One live number with an optional fill bar (0–100 %). */
export function Readout({
  label,
  value,
  pct,
  tone = "info",
}: {
  label: string;
  value: string;
  pct?: number;
  tone?: Tone;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 font-mono text-[11px] font-bold uppercase">
        <span className="text-slate-400">{label}</span>
        <span className={`tabular-nums ${TONE_TEXT[tone]}`}>{value}</span>
      </div>
      {pct !== undefined && (
        <div className="h-2.5 overflow-hidden rounded-full border-2 border-ink-black bg-space-ink">
          <motion.div
            className={`h-full ${TONE_BAR[tone]}`}
            initial={false}
            animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Big lock button. Locking with goals still open is allowed (the flight log will show the
 * consequence), but the button says so, so nobody locks by accident.
 */
export function LockButton({
  isLocked,
  ready,
  label,
  onLock,
}: {
  isLocked: boolean;
  ready: boolean;
  label: string;
  onLock: () => void;
}) {
  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={() => {
        soundEngine.playClick();
        onLock();
      }}
      className={`paper-btn sticky bottom-0 z-10 mt-auto flex w-full items-center justify-center gap-2 py-3 text-base text-ink-black lg:static ${
        isLocked ? "bg-slate-400" : ready ? "bg-status-ok" : "bg-status-warn"
      }`}
    >
      {isLocked ? <Lock className="h-5 w-5" /> : !ready && <TriangleAlert className="h-5 w-5" />}
      {isLocked ? "Locked" : ready ? label : `${label} anyway`}
    </button>
  );
}

/** Floating feedback text ("+1", "Wrong order!") over the play area. */
export function FloatText({ id, text, tone }: { id: number; text: string | null; tone: Tone }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16 }}
          className={`pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-lg border-[3px] border-ink-black bg-paper-cream px-3 py-1 font-display text-sm font-bold shadow-paper ${
            tone === "bad" ? "text-status-crit" : tone === "warn" ? "text-amber-600" : "text-green-700"
          }`}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Blueprint-grid backdrop for play areas. */
export function PlayBackdrop({ tint = "#38BDF8" }: { tint?: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${tint}22, transparent 70%), linear-gradient(180deg, #1E293B, #0F172A)`,
      }}
    >
      <div className="blueprint-grid absolute inset-0 opacity-60" />
    </div>
  );
}
