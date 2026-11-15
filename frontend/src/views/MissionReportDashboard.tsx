// Owner: Leonardo (Task LEO-07) — Always-present NASA causal feedback and score report.
import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, FlaskConical, Gauge, RefreshCw, Target } from "lucide-react";
import { CrewmateAvatar, ROLE_CHARACTER_PROFILE } from "../components/paper/CrewmateAvatar";
import { soundEngine } from "../components/paper/SoundEngine";
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
const SCORE_COUNT_MS = 1_200;
const SCORE_WEIGHTS = [
  { key: "objective_points", label: "Objective", weight: 50, maximum: 500, color: "bg-role-spacecraft", Icon: Target },
  { key: "science_f1_points", label: "Science F1", weight: 30, maximum: 300, color: "bg-role-science", Icon: FlaskConical },
  { key: "efficiency_points", label: "Efficiency", weight: 20, maximum: 200, color: "bg-role-orbit", Icon: Gauge },
] as const;
const ROLES: RoleType[] = ["finance_launch", "spacecraft_mass", "orbit_power", "science_comms"];
const GATE_ROLE: Record<string, RoleType> = {
  NODE_1_LAUNCH: "finance_launch",
  NODE_2_PROPULSION: "orbit_power",
  NODE_3_EVENT: "spacecraft_mass",
  NODE_4_DOWNLINK: "science_comms",
};
const GATE_DETAILS = [
  { id: "NODE_1_LAUNCH", title: "Launch manifest", focus: "Launcher mass, fairing fit, and UFE budget" },
  { id: "NODE_2_PROPULSION", title: "Orbital propulsion", focus: "Delta-v margin, propellant, and center of gravity" },
  { id: "NODE_3_EVENT", title: "Space event", focus: "Thermal shielding, power reserve, and hazard response" },
  { id: "NODE_4_DOWNLINK", title: "DSN downlink", focus: "Spectral quality, link margin, and science data return" },
] as const;
const ATTEMPTS_STORAGE_KEY = "astro-squad.report-attempts.v1";

interface StoredAttempt {
  score: number;
  completionPct: number;
  outcome: MissionOutcomeUI["outcome"];
  missionId?: MissionIdType;
}

function readGateHistory(report: MissionOutcomeUI, gate: (typeof GATE_DETAILS)[number]["id"]) {
  if (!("decision_history" in report) || !Array.isArray(report.decision_history)) return null;
  const entry: unknown = report.decision_history.find((item: unknown) =>
    typeof item === "object" && item !== null && "gate" in item && item.gate === gate,
  );
  if (typeof entry !== "object" || entry === null) return null;
  const feedback = "immediate_feedback" in entry && typeof entry.immediate_feedback === "string"
    ? entry.immediate_feedback.trim() : "";
  const status = "gate_status" in entry &&
    (entry.gate_status === "PASS" || entry.gate_status === "DEGRADED" || entry.gate_status === "CRITICAL")
    ? entry.gate_status : null;
  return feedback || status ? { feedback, status } : null;
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

/** Podium layout: stepped pedestal heights (visual only), highest in the middle. */
const PODIUM_ORDER: Array<{ role: RoleType; heightClass: string; place: string }> = [
  { role: "spacecraft_mass", heightClass: "h-14 sm:h-20", place: "2" },
  { role: "finance_launch", heightClass: "h-20 sm:h-28", place: "1" },
  { role: "orbit_power", heightClass: "h-11 sm:h-16", place: "3" },
  { role: "science_comms", heightClass: "h-8 sm:h-12", place: "4" },
];

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
  const fanfaredReport = useRef<MissionOutcomeUI | null>(null);
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
  const finishDecoding = useCallback(() => {
    if (fanfaredReport.current !== report) {
      fanfaredReport.current = report;
      soundEngine.playVerdictFanfare(report.outcome);
    }
    setRevealedReport(report);
  }, [report]);
  // No decoding loader any more: reveal the report (and play the fanfare) as soon as it arrives.
  useEffect(() => {
    if (isDecoding) finishDecoding();
  }, [isDecoding, finishDecoding]);

  useEffect(() => setPriorAttempts(readStoredAttempts()), [report]);

  const handleRetry = useCallback(() => {
    soundEngine.playClick();
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
      const progress = Math.min((time - startTime) / SCORE_COUNT_MS, 1);
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


  return (
    <main className="handheld-console-frame relative mx-3 max-w-6xl space-y-5 overflow-hidden px-3 pb-10 pt-12 text-paper-cream sm:space-y-6 sm:px-6 sm:pb-8 sm:pt-14 md:mx-auto">
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

      {/* Final podium: the 4 Astro Sprites on stepped pedestals under a soft hangar light */}
      <section className="flash-panel relative overflow-hidden px-3 pb-0 pt-4" aria-label="Crew podium">
        <div className="hangar-glow pointer-events-none absolute inset-x-0 top-0 h-48" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-3xl grid-cols-4 items-end gap-2 sm:gap-4">
          {PODIUM_ORDER.map(({ role, heightClass, place }, i) => {
            const failedRole = report.failed_or_degraded_gate
              ? GATE_ROLE[report.failed_or_degraded_gate.trim().toUpperCase()]
              : undefined;
            const down = report.outcome === "FAILED" || failedRole === role;
            return (
              <div key={role} className="flex flex-col items-center">
                <motion.div
                  initial={reduceMotion ? false : { y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 240, damping: 18 }}
                >
                  <CrewmateAvatar
                    role={role}
                    state={down ? "panic" : "cheer"}
                    actionEffect={down ? "error" : "complete"}
                    size={isMobileClient ? 52 : 78}
                  />
                </motion.div>
                <div
                  className={`metal-grate mt-1 flex w-full items-start justify-center rounded-t-lg border-[3px] border-b-0 border-ink-black pt-1 ${heightClass}`}
                >
                  <span
                    className="rounded border-2 border-ink-black px-1.5 font-mono text-xs font-black text-ink-black"
                    style={{ backgroundColor: ROLE_CHARACTER_PROFILE[role].suit }}
                  >
                    {place}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flash-panel p-2 sm:p-3">
        <div className="paper-card-light grid gap-6 p-4 sm:p-7 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="flex flex-col justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-blueprint-navy">Mission score</p>
            <div className="mt-2 flex max-w-full flex-wrap items-baseline gap-2 rounded-xl border-[3px] border-ink-black bg-space-ink px-3 py-2 text-status-ok shadow-paper sm:px-4">
              <span className="font-mono text-5xl font-black tabular-nums sm:text-7xl" aria-label={`${score} points out of ${SCORE_MAX}`} aria-live="off">
                {displayScore.toLocaleString("en-US")}
              </span>
              <span className="font-mono text-sm font-bold text-paper-cream">/ 1,000 PTS</span>
            </div>
            <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-blueprint-navy">
              {displayScore < score ? "Arcade tally // counting" : "Arcade tally // final score"}
            </p>
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

      <section className="flash-panel min-w-0 p-3 sm:p-5" aria-label="Flight node inspector">
        <div className="mb-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-role-spacecraft">Captain's flight archive</p>
          <h2 className="font-display text-xl font-black uppercase sm:text-2xl">Inspect the four gates</h2>
          <p className="mt-1 text-xs text-slate-300">Open a chapter to review its engineering focus and any node telemetry returned by Mission Control.</p>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {GATE_DETAILS.map((gate, index) => {
            const isFlagged = report.failed_or_degraded_gate?.trim().toUpperCase() === gate.id;
            const history = readGateHistory(report, gate.id);
            const status = history?.status ?? (isFlagged ? "REVISIT" : report.outcome === "FULL_SUCCESS" ? "NO FLAG" : "NO NODE DATA");
            const statusColor = status === "CRITICAL" || status === "REVISIT" ? "bg-status-crit" :
              status === "DEGRADED" ? "bg-status-warn" : status === "PASS" || status === "NO FLAG" ? "bg-status-ok" : "bg-slate-200";
            return (
              <details key={gate.id} className="group min-w-0 overflow-hidden rounded-xl border-[3px] border-ink-black bg-paper-cream text-ink-black shadow-paper-sm">
                <summary className="flex min-w-0 cursor-pointer list-none items-center gap-2 p-3 marker:hidden">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-ink-black bg-blueprint-navy font-mono text-sm font-black tabular-nums text-paper-cream">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-all font-mono text-[9px] font-bold text-blueprint-navy">{gate.id}</span>
                    <span className="block font-display text-sm font-black">{gate.title}</span>
                  </span>
                  <ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-3 border-t-2 border-ink-black px-3 py-3 text-sm">
                  <span className={"inline-block rounded-md border-2 border-ink-black px-2 py-0.5 font-mono text-[10px] font-black " + statusColor}>{status}</span>
                  <p className="font-mono text-[10px] font-bold uppercase text-blueprint-navy">Engineering focus</p>
                  <p className="-mt-2 text-slate-700">{gate.focus}</p>
                  <p className="font-mono text-[10px] font-bold uppercase text-blueprint-navy">Mission telemetry</p>
                  <p className="-mt-2 whitespace-pre-line break-words text-slate-700">
                    {history?.feedback || (isFlagged ? report.causal_chain_explanation :
                      "The final report did not include a separate finding for this gate.")}
                  </p>
                </div>
              </details>
            );
          })}
        </div>
      </section>

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
            const failedRole = report.failed_or_degraded_gate
              ? GATE_ROLE[report.failed_or_degraded_gate.trim().toUpperCase()]
              : undefined;
            const isFailure = report.outcome === "FAILED" || failedRole === role;
            const isComplete = !isFailure &&
              (report.outcome === "FULL_SUCCESS" || (report.outcome === "PARTIAL_SUCCESS" && role === myRole));
            return (
              <article key={role} className="flash-panel flex min-h-44 flex-col overflow-hidden">
                <div className="h-2 border-b-2 border-ink-black" style={{ backgroundColor: profile.suit }} />
                <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-3">
                  <CrewmateAvatar role={role}
                    state={isFailure ? "panic" : isComplete ? "cheer" : "work"}
                    actionEffect={isFailure ? "error" : isComplete ? "complete" : "scan"}
                    statusBadgeText={isFailure ? "FAIL" : isComplete ? "OK" : "CHECK"}
                    size={66} />
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
