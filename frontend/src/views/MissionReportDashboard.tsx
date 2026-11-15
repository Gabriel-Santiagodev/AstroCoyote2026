// Owner: Leonardo (Task LEO-07) — Always-present NASA causal feedback and score report.
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FlaskConical, Gauge, RefreshCw, Target } from "lucide-react";
import { CrewmateAvatar } from "../components/paper/CrewmateAvatar";
import type { RoleType } from "../types/game";

export interface MissionOutcomeUI {
  outcome: "FAILED" | "PARTIAL_SUCCESS" | "FULL_SUCCESS";
  completion_pct: number;
  total_score: number;
  failed_or_degraded_gate: string | null;
  causal_chain_explanation: string;
  nasa_real_world_fact: string;
}

export interface RoleContributionUI {
  role: RoleType;
  summary: string;
  is_ai?: boolean;
}

export interface ScoreBreakdownUI {
  objective_points?: number;
  science_f1_points?: number;
  efficiency_points?: number;
}

interface MissionReportDashboardProps {
  report: MissionOutcomeUI & { role_contributions?: RoleContributionUI[] };
  onRetry: () => void;
  roleContributions?: RoleContributionUI[];
  scoreBreakdown?: ScoreBreakdownUI;
}

const SCORE_MAX = 1_000;
const SCORE_WEIGHTS = [
  { key: "objective_points", label: "Objective", weight: 50, maximum: 500, color: "bg-role-spacecraft", Icon: Target },
  { key: "science_f1_points", label: "Science F1", weight: 30, maximum: 300, color: "bg-role-science", Icon: FlaskConical },
  { key: "efficiency_points", label: "Efficiency", weight: 20, maximum: 200, color: "bg-role-orbit", Icon: Gauge },
] as const;
const ROLES: Array<{ role: RoleType; label: string; color: string }> = [
  { role: "finance_launch", label: "Finance & Launch", color: "bg-role-finance" },
  { role: "spacecraft_mass", label: "Spacecraft & Mass", color: "bg-role-spacecraft" },
  { role: "orbit_power", label: "Orbit & Power", color: "bg-role-orbit" },
  { role: "science_comms", label: "Science & Comms", color: "bg-role-science" },
];
const VERDICTS = {
  FULL_SUCCESS: { title: "MISSION ACCOMPLISHED", color: "bg-status-ok", note: "The mission reached its objectives." },
  PARTIAL_SUCCESS: { title: "PARTIAL SUCCESS", color: "bg-status-warn", note: "Some mission objectives were degraded." },
  FAILED: { title: "MISSION FAILED", color: "bg-status-crit", note: "Review the engineering chain and redesign." },
} as const;

export function MissionReportDashboard({
  report,
  onRetry,
  roleContributions,
  scoreBreakdown,
}: MissionReportDashboardProps) {
  const reduceMotion = useReducedMotion();
  const [displayScore, setDisplayScore] = useState(0);
  const verdict = VERDICTS[report.outcome];
  const contributions = roleContributions ?? report.role_contributions ?? [];
  const score = Number.isFinite(report.total_score)
    ? Math.max(0, Math.min(SCORE_MAX, Math.round(report.total_score)))
    : 0;
  const completion = Number.isFinite(report.completion_pct)
    ? Math.max(0, Math.min(100, report.completion_pct))
    : 0;

  useEffect(() => {
    if (reduceMotion) {
      setDisplayScore(score);
      return;
    }
    let frame = 0;
    let startTime: number | null = null;
    setDisplayScore(0);
    const animateScore = (time: number) => {
      if (startTime === null) startTime = time;
      const progress = Math.min((time - startTime) / 1_200, 1);
      setDisplayScore(Math.round(score * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = window.requestAnimationFrame(animateScore);
    };
    frame = window.requestAnimationFrame(animateScore);
    return () => window.cancelAnimationFrame(frame);
  }, [score, reduceMotion]);

  useEffect(() => {
    if (report.outcome !== "FULL_SUCCESS" || reduceMotion) return;
    void confetti({
      particleCount: 120,
      spread: 72,
      origin: { y: 0.28 },
      colors: ["#3DDC84", "#F2C94C", "#06B6D4", "#A855F7", "#F8FAFC"],
    });
  }, [report.outcome, reduceMotion]);

  return (
    <main className="relative mx-auto max-w-6xl space-y-6 px-4 py-6 pb-12 text-paper-cream sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-role-spacecraft">
            Mission archive // Final transmission
          </p>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-4xl">Flight Report</h1>
        </div>
        <p className="rounded-full border-2 border-paper-cream/60 px-3 py-1 font-mono text-xs uppercase tracking-wider">
          4 node decision tree
        </p>
      </header>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: -1 }}
        transition={{ type: "spring", stiffness: 190, damping: 17 }}
        className={`paper-card relative overflow-hidden ${verdict.color} p-5 text-ink-black sm:p-8`}
        aria-label={`Mission outcome: ${verdict.title}`}
      >
        <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rotate-12 rounded-full border-[10px] border-ink-black/15 sm:h-44 sm:w-44" />
        <div className="pointer-events-none absolute -bottom-10 left-1/2 h-24 w-24 -rotate-12 rounded-full border-[8px] border-ink-black/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.24em]">Official mission verdict</p>
            <h2 className="mt-1 max-w-2xl font-display text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
              {verdict.title}
            </h2>
            <p className="mt-3 max-w-xl font-sans text-sm font-semibold sm:text-base">{verdict.note}</p>
          </div>
          <div className="rotate-6 rounded-xl border-[3px] border-ink-black bg-paper-cream px-4 py-3 text-center shadow-paper">
            <span className="block font-mono text-[10px] font-bold uppercase tracking-wider">Objectives complete</span>
            <span className="font-mono text-2xl font-black tabular-nums">
              {completion.toFixed(completion % 1 === 0 ? 0 : 1)}%
            </span>
          </div>
        </div>
      </motion.section>

      <section className="paper-card-light grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="flex flex-col justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-blueprint-navy">Mission score</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-6xl font-black tabular-nums sm:text-7xl" aria-label={`${score} points out of ${SCORE_MAX}`}>
                {displayScore.toLocaleString("en-US")}
              </span>
              <span className="font-mono text-sm font-bold text-blueprint-navy">/ 1,000 PTS</span>
            </div>
          </div>
          <div className="mt-5 h-4 overflow-hidden rounded-full border-2 border-ink-black bg-slate-200">
            <motion.div
              className="h-full bg-status-ok"
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${(score / SCORE_MAX) * 100}%` }}
              transition={{ duration: reduceMotion ? 0 : 1.2, ease: "easeOut" }}
            />
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-black uppercase">Score weighting</h2>
            <span className="font-mono text-[10px] font-semibold uppercase text-blueprint-navy">
              Tactical turns can adjust the total
            </span>
          </div>
          <div className="mt-3 flex h-5 overflow-hidden rounded-full border-2 border-ink-black">
            {SCORE_WEIGHTS.map((part) => (
              <div key={part.key} className={`${part.color} h-full border-r-2 border-ink-black last:border-r-0`}
                style={{ width: `${part.weight}%` }} aria-label={`${part.label}: ${part.weight}% weight`} />
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {SCORE_WEIGHTS.map(({ key, label, weight, maximum, color, Icon }) => {
              const earned = scoreBreakdown?.[key];
              return (
                <div key={key} className="rounded-xl border-2 border-ink-black bg-white p-3">
                  <div className="flex items-center gap-2">
                    <span className={`grid h-8 w-8 place-items-center rounded-lg border-2 border-ink-black ${color}`}>
                      <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <span className="font-display text-sm font-black">{label}</span>
                  </div>
                  <div className="mt-2 font-mono text-xs font-bold tabular-nums">
                    {weight}% · {typeof earned === "number" && Number.isFinite(earned)
                      ? `${Math.round(earned)} / ${maximum} pts`
                      : `up to ${maximum} pts`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="paper-card p-5 sm:p-6">
          <div className="mb-3 flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-ink-black bg-status-warn text-ink-black shadow-paper">
              <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-status-warn">Decision → consequence</p>
              <h2 className="font-display text-xl font-black">Causal Engineering Breakdown</h2>
            </div>
          </div>
          {report.failed_or_degraded_gate && (
            <p className="mb-3 inline-block rounded-md border border-status-warn/60 bg-space-ink px-2 py-1 font-mono text-xs font-semibold text-status-warn">
              Gate to revisit: {report.failed_or_degraded_gate}
            </p>
          )}
          <p className="whitespace-pre-line font-sans text-sm leading-relaxed text-slate-100 sm:text-base">
            {report.causal_chain_explanation}
          </p>
        </section>
        <section className="paper-card p-5 sm:p-6">
          <div className="mb-3 flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-ink-black bg-role-spacecraft text-ink-black shadow-paper">
              <FlaskConical size={20} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-role-spacecraft">From mission data to real missions</p>
              <h2 className="font-display text-xl font-black">Real NASA Mission Connection</h2>
            </div>
          </div>
          <p className="whitespace-pre-line font-sans text-sm leading-relaxed text-slate-100 sm:text-base">
            {report.nasa_real_world_fact}
          </p>
        </section>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-xl font-black uppercase sm:text-2xl">Crew Contributions</h2>
          <p className="font-mono text-xs uppercase text-slate-300">Four roles · one mission</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ROLES.map(({ role, label, color }) => {
            const contribution = contributions.find((item) => item.role === role);
            return (
              <article key={role} className="paper-card-light flex min-h-40 flex-col p-4">
                <div className="flex items-center gap-2">
                  <CrewmateAvatar role={role} state="idle" size={48} />
                  <div className="min-w-0">
                    <span className={`inline-block rounded-md border-2 border-ink-black ${color} px-1.5 py-0.5 font-mono text-[10px] font-black uppercase`}>
                      {role.replace(/_/g, " ")}
                    </span>
                    <h3 className="mt-1 font-display text-sm font-black">{label}</h3>
                  </div>
                </div>
                <p className="mt-3 flex-1 font-sans text-sm leading-snug text-blueprint-navy">
                  {contribution?.summary?.trim() || "No contribution data received."}
                </p>
                {contribution?.is_ai && (
                  <span className="mt-3 self-start rounded-md border border-ink-black bg-space-ink px-2 py-1 font-mono text-[10px] font-bold uppercase text-paper-cream">
                    AI Autopilot
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <div className="flex justify-center pt-3">
        <button type="button" onClick={onRetry}
          className="paper-btn flex w-full max-w-xl items-center justify-center gap-3 bg-status-ok px-6 py-4 text-center font-display text-lg font-black uppercase tracking-wide text-ink-black focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-paper-cream sm:text-xl">
          <RefreshCw size={23} strokeWidth={3} aria-hidden="true" />
          REDESIGN & RETRY
        </button>
      </div>
    </main>
  );
}

export default MissionReportDashboard;
