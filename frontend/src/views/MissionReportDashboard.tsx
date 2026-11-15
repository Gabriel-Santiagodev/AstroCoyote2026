// Owner: Leonardo (Task LEO-07) — Always-present NASA causal feedback and score report.
import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FlaskConical, Gauge, RefreshCw, Target } from "lucide-react";
import { CrewmateAvatar, ROLE_CHARACTER_PROFILE } from "../components/paper/CrewmateAvatar";
import { MissionLoadingScreen } from "../components/paper/LoadingScreen";
import type { MissionIdType, RoleType } from "../types/game";

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
  missionId?: MissionIdType;
  myRole?: RoleType;
}

const SCORE_MAX = 1_000;
const SCORE_WEIGHTS = [
  { key: "objective_points", label: "Objective", weight: 50, maximum: 500, color: "bg-role-spacecraft", Icon: Target },
  { key: "science_f1_points", label: "Science F1", weight: 30, maximum: 300, color: "bg-role-science", Icon: FlaskConical },
  { key: "efficiency_points", label: "Efficiency", weight: 20, maximum: 200, color: "bg-role-orbit", Icon: Gauge },
] as const;
const ROLES: RoleType[] = ["finance_launch", "spacecraft_mass", "orbit_power", "science_comms"];
const ATTEMPTS_STORAGE_KEY = "astro-squad.report-attempts.v1";

interface StoredAttempt {
  score: number;
  completionPct: number;
  outcome: MissionOutcomeUI["outcome"];
  missionId?: MissionIdType;
}

function readStoredAttempts(): StoredAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(ATTEMPTS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((attempt): attempt is StoredAttempt =>
      typeof attempt === "object" && attempt !== null &&
      "score" in attempt && typeof attempt.score === "number" && Number.isFinite(attempt.score) && attempt.score >= 0 && attempt.score <= SCORE_MAX &&
      "completionPct" in attempt && typeof attempt.completionPct === "number" && Number.isFinite(attempt.completionPct) && attempt.completionPct >= 0 && attempt.completionPct <= 100 &&
      "outcome" in attempt &&
      (attempt.outcome === "FULL_SUCCESS" || attempt.outcome === "PARTIAL_SUCCESS" || attempt.outcome === "FAILED")
    );
  } catch {
    return [];
  }
}
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
  missionId,
  myRole,
}: MissionReportDashboardProps) {
  const reduceMotion = useReducedMotion();
  const [displayScore, setDisplayScore] = useState(0);
  const [revealedReport, setRevealedReport] = useState<MissionOutcomeUI | null>(null);
  const [priorAttempts, setPriorAttempts] = useState<StoredAttempt[]>(readStoredAttempts);
  const celebratedReport = useRef<MissionOutcomeUI | null>(null);
  const savedRetryReport = useRef<MissionOutcomeUI | null>(null);
  const verdict = VERDICTS[report.outcome];
  const contributions = roleContributions ?? report.role_contributions ?? [];
  const score = Number.isFinite(report.total_score)
    ? Math.max(0, Math.min(SCORE_MAX, Math.round(report.total_score)))
    : 0;
  const completion = Number.isFinite(report.completion_pct)
    ? Math.max(0, Math.min(100, report.completion_pct))
    : 0;
  const isDecoding = revealedReport !== report;
  const previousAttempt = priorAttempts[priorAttempts.length - 1];
  const attemptNumber = priorAttempts.length + 1;
  const scoreDelta = previousAttempt ? score - previousAttempt.score : null;
  const isMobileClient = typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(max-width: 767px)").matches;
  const finishDecoding = useCallback(() => setRevealedReport(report), [report]);

  useEffect(() => setPriorAttempts(readStoredAttempts()), [report]);

  const handleRetry = useCallback(() => {
    if (savedRetryReport.current !== report) {
      savedRetryReport.current = report;
      const attempt: StoredAttempt = { score, completionPct: completion, outcome: report.outcome, missionId };
      try {
        window.sessionStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify([...readStoredAttempts(), attempt]));
      } catch {
        // Retry still works when session storage is unavailable.
      }
    }
    onRetry();
  }, [completion, missionId, onRetry, report, score]);

  useEffect(() => {
    if (isDecoding) {
      setDisplayScore(0);
      return;
    }
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
  }, [score, reduceMotion, isDecoding]);

  useEffect(() => {
    if (isDecoding || report.outcome !== "FULL_SUCCESS" || reduceMotion || celebratedReport.current === report) return;
    celebratedReport.current = report;
    void confetti({
      particleCount: 120,
      spread: 72,
      origin: { y: 0.28 },
      colors: ["#3DDC84", "#F2C94C", "#06B6D4", "#A855F7", "#F8FAFC"],
    });
  }, [isDecoding, report, reduceMotion]);

  if (isDecoding) {
    return (
      <MissionLoadingScreen
        variant="flight_to_report"
        durationMs={1100}
        allowSkip
        missionId={missionId}
        roleId={myRole}
        isMobileClient={isMobileClient}
        onComplete={finishDecoding}
      />
    );
  }

  return (
    <main className="handheld-console-frame relative mx-3 max-w-6xl space-y-5 overflow-hidden px-3 py-4 pb-10 text-paper-cream sm:space-y-6 sm:px-6 sm:py-8 md:mx-auto">
      <header className="flash-panel overflow-hidden">
        <div className="hazard-stripe-bar h-3" />
        <div className="flex flex-wrap items-end justify-between gap-3 p-4 sm:p-5">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-role-spacecraft">
            Mission archive // Astro Squad debrief
          </p>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-4xl">Flight Report</h1>
        </div>
        <p className="rounded-full border-2 border-paper-cream/60 px-3 py-1 font-mono text-xs uppercase tracking-wider">
          Attempt #{attemptNumber} · 4 node decision tree
        </p>
        </div>
      </header>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: -1 }}
        transition={{ type: "spring", stiffness: 190, damping: 17 }}
        className={`paper-card relative overflow-hidden ${verdict.color} p-5 text-ink-black sm:p-8`}
        aria-label={`Mission outcome: ${verdict.title}`}
      >
        <div className="hazard-stripe-bar -mx-5 -mt-5 mb-5 h-3 border-b-2 border-ink-black sm:-mx-8 sm:-mt-8" />
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

      <section className="flash-panel p-2 sm:p-3">
        <div className="paper-card-light grid gap-6 p-4 sm:p-7 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
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
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="flash-panel p-5 sm:p-6">
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
        <section className="flash-panel p-5 sm:p-6">
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

      {previousAttempt && scoreDelta !== null && (
        <section className="flash-panel overflow-hidden" aria-label="Attempt comparison">
          <div className="hazard-stripe-bar h-2" />
          <div className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-role-spacecraft">Redesign history · this browser session</p>
                <h2 className="font-display text-xl font-black sm:text-2xl">Attempt #{attemptNumber - 1} → Attempt #{attemptNumber}</h2>
              </div>
              <span className={"rounded-lg border-2 border-ink-black px-3 py-1 font-mono text-lg font-black tabular-nums text-ink-black " + (scoreDelta > 0 ? "bg-status-ok" : scoreDelta < 0 ? "bg-status-crit" : "bg-status-warn")}>
                {scoreDelta > 0 ? "+" : ""}{scoreDelta.toLocaleString("en-US")} pts
              </span>
            </div>
            <div className="grid gap-2 text-center font-mono text-xs sm:grid-cols-3">
              <div className="rounded-lg border-2 border-ink-black bg-space-ink p-3">
                <span className="block text-slate-400">PREVIOUS SCORE</span>
                <strong className="text-xl tabular-nums text-paper-cream">{previousAttempt.score.toLocaleString("en-US")}</strong>
              </div>
              <div className="hidden items-center justify-center text-2xl text-role-finance sm:flex" aria-hidden="true">→</div>
              <div className="rounded-lg border-2 border-ink-black bg-space-ink p-3">
                <span className="block text-slate-400">CURRENT SCORE</span>
                <strong className="text-xl tabular-nums text-paper-cream">{score.toLocaleString("en-US")}</strong>
              </div>
            </div>
            <p className="font-mono text-xs text-slate-300">Previous outcome: {VERDICTS[previousAttempt.outcome].title} · Current outcome: {verdict.title}</p>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-xl font-black uppercase sm:text-2xl">Crew Contributions</h2>
          <p className="font-mono text-xs uppercase text-slate-300">Four roles · one mission</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ROLES.map((role) => {
            const profile = ROLE_CHARACTER_PROFILE[role];
            const contribution = contributions.find((item) => item.role === role);
            return (
              <article key={role} className="flash-panel flex min-h-44 flex-col overflow-hidden">
                <div className="h-2 border-b-2 border-ink-black" style={{ backgroundColor: profile.suit }} />
                <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-3">
                  <CrewmateAvatar role={role} state={report.outcome === "FULL_SUCCESS" ? "cheer" : "idle"} size={66} />
                  <div className="min-w-0">
                    <span className="inline-block rounded-md border-2 border-ink-black bg-space-ink px-1.5 py-0.5 font-mono text-[10px] font-black uppercase" style={{ color: profile.suit }}>{profile.codename}</span>
                    <h3 className="mt-1 font-display text-sm font-black text-paper-cream">{profile.label}</h3>
                    <p className="font-mono text-[10px] uppercase text-slate-300">{profile.squadClass}</p>
                  </div>
                </div>
                <p className="mt-3 rounded-lg border border-slate-500/50 bg-space-ink/70 px-2 py-1 font-mono text-[10px] leading-snug text-role-spacecraft">GEAR // {profile.gearLabel}</p>
                <p className="mt-3 flex-1 font-sans text-sm leading-snug text-slate-100">
                  {contribution?.summary?.trim() || "No contribution data received."}
                </p>
                {contribution?.is_ai && (
                  <span className="mt-3 self-start rounded-md border border-ink-black bg-status-warn px-2 py-1 font-mono text-[10px] font-bold uppercase text-ink-black">
                    AI Autopilot
                  </span>
                )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="flex justify-center pt-3">
        <button type="button" onClick={handleRetry}
          className="paper-btn flex w-full max-w-xl items-center justify-center gap-3 bg-status-ok px-6 py-4 text-center font-display text-lg font-black uppercase tracking-wide text-ink-black focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-paper-cream sm:text-xl">
          <RefreshCw size={23} strokeWidth={3} aria-hidden="true" />
          REDESIGN & RETRY
        </button>
      </div>
    </main>
  );
}

export default MissionReportDashboard;
