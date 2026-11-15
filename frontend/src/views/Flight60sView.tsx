// Owner: Leonardo (Task LEO-06) — Server-driven, four-round mission flight.
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { MissionIdType, RoleType } from "../types/game";

export interface FlightQuestionOptionUI {
  option_id: string;
  label: string;
  engineering_tradeoff_hint: string;
}

export interface FlightQuestionUI {
  question_id: string;
  gate: "NODE_1_LAUNCH" | "NODE_2_PROPULSION" | "NODE_3_EVENT" | "NODE_4_DOWNLINK";
  assigned_role: RoleType;
  title: string;
  scenario_context: string;
  nasa_concept_badge: string;
  options: FlightQuestionOptionUI[];
}

export interface FlightTurnResultUI {
  round: number;
  immediate_feedback: string;
  rocket_health_pct: number;
  gate_status: "PASS" | "DEGRADED" | "CRITICAL";
  chosen_option?: string;
}

interface Flight60sViewProps {
  round: number;
  timeLeftSec: number;
  myRole: RoleType;
  question: FlightQuestionUI | null;
  onAnswerOption: (questionId: string, optionId: string) => void;
  activePlayerName?: string;
  globalTimeLeftSec?: number;
  rocketHealthPct?: number;
  lastTurnResult?: FlightTurnResultUI | null;
  missionId?: MissionIdType;
}

const ROUND_DURATION_SEC = 15;
const FLIGHT_DURATION_SEC = 60;
const RESULT_DISPLAY_MS = 2000;
const GATES: Array<{ id: FlightQuestionUI["gate"]; label: string }> = [
  { id: "NODE_1_LAUNCH", label: "LAUNCH" },
  { id: "NODE_2_PROPULSION", label: "PROPULSION" },
  { id: "NODE_3_EVENT", label: "SPACE EVENT" },
  { id: "NODE_4_DOWNLINK", label: "DSN DOWNLINK" },
];
const ROLE_NAMES: Record<RoleType, string> = {
  finance_launch: "FINANCE & LAUNCH",
  spacecraft_mass: "SPACECRAFT & MASS",
  orbit_power: "ORBIT & POWER",
  science_comms: "SCIENCE & COMMS",
};
const TARGET_NAMES: Record<MissionIdType, string> = {
  artemis_moon: "THE MOON",
  asteroid_hunter: "THE ASTEROID",
  mars_sample_return: "MARS",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function MissionTarget({ missionId }: { missionId: MissionIdType }) {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true" className="h-full w-full drop-shadow-[5px_5px_0px_#0F172A]">
      {missionId === "asteroid_hunter" ? (
        <>
          <path d="M27 63 49 29 91 19 126 34 158 67 151 112 116 151 74 157 32 130 17 94Z" fill="#A77A64" stroke="#F8FAFC" strokeWidth="10" strokeLinejoin="round" />
          <path d="M27 63 49 29 91 19 126 34 158 67 151 112 116 151 74 157 32 130 17 94Z" fill="none" stroke="#0F172A" strokeWidth="5" strokeLinejoin="round" />
          <ellipse cx="66" cy="65" rx="18" ry="12" fill="#805647" stroke="#0F172A" strokeWidth="4" />
          <ellipse cx="114" cy="105" rx="24" ry="15" fill="#805647" stroke="#0F172A" strokeWidth="4" />
        </>
      ) : (
        <>
          <circle cx="90" cy="90" r="73" fill="#F8FAFC" stroke="#0F172A" strokeWidth="8" />
          <circle cx="90" cy="90" r="68" fill={missionId === "mars_sample_return" ? "#EA785D" : "#D9E2EB"} stroke="#F8FAFC" strokeWidth="4" />
          {missionId === "mars_sample_return" ? (
            <>
              <path d="M37 115c25-20 43-10 63-21 23-13 34-13 56-7M30 83c23 5 39-9 53-18 25-15 39-9 59-7" fill="none" stroke="#AD4C45" strokeWidth="9" strokeLinecap="round" />
              <path d="M65 34c25-11 52-8 75 11" fill="none" stroke="#FFD3B0" strokeWidth="9" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="65" cy="55" r="17" fill="#B7C5D2" stroke="#8395A8" strokeWidth="3" />
              <circle cx="117" cy="104" r="26" fill="#B7C5D2" stroke="#8395A8" strokeWidth="3" />
              <circle cx="54" cy="119" r="10" fill="#B7C5D2" />
            </>
          )}
        </>
      )}
    </svg>
  );
}

type Reaction = "thruster" | "shield" | "sparks" | "downlink" | null;

function PaperShip({ reaction }: { reaction: Reaction }) {
  return (
    <svg viewBox="0 0 190 130" role="img" aria-label="Paper spacecraft traveling through space" className="h-full w-full overflow-visible drop-shadow-[5px_5px_0px_#0F172A]">
      <motion.path d="M35 57 5 65 35 74 23 65Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="5"
        animate={{ scaleX: reaction === "thruster" ? [1, 1.8, 1] : [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: reaction === "thruster" ? 0.28 : 1.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "35px 65px" }} />
      <path d="M47 48 31 27 49 29 75 49ZM47 82 31 103 49 101 75 81Z" fill="#06B6D4" stroke="#F8FAFC" strokeWidth="8" strokeLinejoin="round" />
      <path d="M47 48 31 27 49 29 75 49ZM47 82 31 103 49 101 75 81Z" fill="#06B6D4" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M31 53 125 42 169 65 125 88 31 77Z" fill="#F8FAFC" stroke="#0F172A" strokeWidth="7" strokeLinejoin="round" />
      <path d="M102 45 139 48 168 65 139 82 102 85Z" fill="#F2C94C" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M47 58 98 51M47 72 98 79" stroke="#91A3B9" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="91" cy="65" rx="14" ry="11" fill="#06B6D4" stroke="#0F172A" strokeWidth="4" />
      <ellipse cx="87" cy="62" rx="5" ry="3" fill="#FFFFFF" />
      {reaction === "shield" && (
        <motion.ellipse cx="98" cy="65" rx="87" ry="56" fill="none" stroke="#3DDC84" strokeWidth="6" strokeDasharray="11 7"
          initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: [0.2, 1, 0.4], scale: [0.8, 1.1, 1] }}
          transition={{ duration: 0.7, repeat: Infinity }} />
      )}
      {reaction === "sparks" && (
        <motion.g stroke="#FF5A4E" strokeWidth="6" strokeLinecap="round"
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: [0, 1, 0], scale: [0.7, 1.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}>
          <path d="m123 19 11-16M153 31l18-11M158 99l20 12M112 109l8 17" />
        </motion.g>
      )}
      {reaction === "downlink" && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.35] }} transition={{ duration: 0.6, repeat: Infinity }}>
          <path d="M91 42V13m-11 7q11-11 22 0m-30-9q19-18 38 0" fill="none" stroke="#A855F7" strokeWidth="5" strokeLinecap="round" />
        </motion.g>
      )}
    </svg>
  );
}

export function Flight60sView({
  round, timeLeftSec, myRole, question, onAnswerOption,
  activePlayerName, globalTimeLeftSec, rocketHealthPct, lastTurnResult,
  missionId = "artemis_moon",
}: Flight60sViewProps) {
  const [submittedAnswer, setSubmittedAnswer] = useState<{ questionId: string; optionId: string } | null>(null);
  const [visibleResult, setVisibleResult] = useState<FlightTurnResultUI | null>(null);

  useEffect(() => {
    if (!lastTurnResult) return;
    setVisibleResult(lastTurnResult);
    const timeout = window.setTimeout(() => setVisibleResult(null), RESULT_DISPLAY_MS);
    return () => window.clearTimeout(timeout);
  }, [lastTurnResult]);

  const activeGateIndex = question
    ? Math.max(0, GATES.findIndex((gate) => gate.id === question.gate))
    : clamp(Math.floor(round) - 1, 0, GATES.length - 1);
  const roundLeft = clamp(timeLeftSec, 0, ROUND_DURATION_SEC);
  const globalLeft = clamp(
    globalTimeLeftSec ?? (GATES.length - activeGateIndex - 1) * ROUND_DURATION_SEC + roundLeft,
    0, FLIGHT_DURATION_SEC,
  );
  const flightProgress = ((FLIGHT_DURATION_SEC - globalLeft) / FLIGHT_DURATION_SEC) * 100;
  const shipLeft = 8 + flightProgress * 0.68;
  const isMyTurn = question?.assigned_role === myRole;
  const hasSubmitted = submittedAnswer?.questionId === question?.question_id;
  const canAnswer = Boolean(question && isMyTurn && roundLeft > 0 && !hasSubmitted && !visibleResult);
  const health = visibleResult?.rocket_health_pct ?? rocketHealthPct;
  const reaction: Reaction = visibleResult
    ? visibleResult.gate_status !== "PASS" ? "sparks"
      : visibleResult.round === 4 ? "downlink"
        : visibleResult.round === 3 ? "shield" : "thruster"
    : null;

  const answer = useCallback((optionId: string) => {
    if (!question || !canAnswer || !question.options.some((option) => option.option_id === optionId)) return;
    setSubmittedAnswer({ questionId: question.question_id, optionId });
    onAnswerOption(question.question_id, optionId);
  }, [canAnswer, onAnswerOption, question]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || !/^[1-4]$/.test(event.key)) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
      const option = question?.options[Number(event.key) - 1];
      if (!option || !canAnswer) return;
      event.preventDefault();
      answer(option.option_id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [answer, canAnswer, question]);

  return (
    <main className="relative mx-auto max-w-6xl space-y-5 px-4 py-6 text-paper-cream sm:px-6">
      <header className="paper-card space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-role-spacecraft">DEEP SPACE FLIGHT // LIVE TELEMETRY</p>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Flight to {TARGET_NAMES[missionId]}</h1>
          </div>
          <div className="flex gap-2 font-mono tabular-nums">
            <div className="rounded-xl border-2 border-ink-black bg-paper-cream px-3 py-2 text-center text-ink-black">
              <div className="text-[10px] font-bold tracking-widest">FLIGHT</div>
              <div className="text-xl font-bold sm:text-2xl">{Math.ceil(globalLeft)}s</div>
            </div>
            <div className={"rounded-xl border-2 border-ink-black px-3 py-2 text-center text-ink-black " + (roundLeft <= 5 ? "bg-status-crit" : "bg-status-warn")}>
              <div className="text-[10px] font-bold tracking-widest">ROUND</div>
              <div className="text-xl font-bold sm:text-2xl">{Math.ceil(roundLeft)}s</div>
            </div>
          </div>
        </div>
        <div aria-label="Flight progress" className="h-3 overflow-hidden rounded-full border-2 border-ink-black bg-space-ink">
          <motion.div className="h-full bg-role-spacecraft" animate={{ width: flightProgress + "%" }} transition={{ duration: 0.5 }} />
        </div>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Decision nodes">
          {GATES.map((gate, index) => {
            const isComplete = index < activeGateIndex || Boolean(lastTurnResult && lastTurnResult.round >= index + 1);
            const isActive = index === activeGateIndex && !isComplete;
            const latestStatus = lastTurnResult?.round === index + 1 ? lastTurnResult.gate_status : null;
            const nodeColor = latestStatus === "CRITICAL" ? "bg-status-crit text-ink-black"
              : latestStatus === "DEGRADED" ? "bg-status-warn text-ink-black"
                : latestStatus === "PASS" ? "bg-status-ok text-ink-black"
                  : isComplete ? "bg-paper-cream text-ink-black"
                    : isActive ? "bg-status-warn text-ink-black" : "bg-space-ink text-slate-300";
            return (
              <li key={gate.id} aria-current={isActive ? "step" : undefined}
                className={"rounded-xl border-2 border-ink-black p-2 font-mono text-[11px] font-bold sm:p-3 " +
                  nodeColor}>
                <span className="mr-2 inline-block rounded border border-current px-1 tabular-nums">{"0" + (index + 1)}</span>
                {gate.label}
              </li>
            );
          })}
        </ol>
      </header>

      <section aria-label="Spacecraft flight scene" className="paper-card relative min-h-[270px] overflow-hidden bg-space-ink sm:min-h-[330px]">
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: "radial-gradient(#F8FAFC 1px, transparent 1px)", backgroundSize: "43px 51px" }}
          animate={{ backgroundPositionX: [0, -43] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        <div className="absolute left-[8%] right-[13%] top-1/2 border-t-[3px] border-dashed border-slate-500/70" />
        <div className="absolute right-[2%] top-[15%] h-32 w-32 sm:h-44 sm:w-44"><MissionTarget missionId={missionId} /></div>
        <div className="absolute right-3 top-3 rounded-lg border-2 border-ink-black bg-paper-cream px-2 py-1 font-mono text-[10px] font-bold text-ink-black sm:right-5 sm:top-5">TARGET // {TARGET_NAMES[missionId]}</div>
        {reaction === "downlink" && (
          <motion.div aria-hidden="true" className="absolute top-1/2 z-10 border-t-4 border-dashed border-role-science drop-shadow-[0_0_8px_#A855F7]"
            style={{ left: (shipLeft + 8) + "%", right: "12%" }}
            initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.3] }} transition={{ duration: 0.6, repeat: Infinity }} />
        )}
        <motion.div className="absolute top-[39%] z-20 h-24 w-32 sm:h-32 sm:w-44"
          animate={{ left: shipLeft + "%" }} transition={{ duration: 0.8, ease: "easeOut" }}>
          <motion.div animate={{ y: [-4, 5, -4], rotate: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <PaperShip reaction={reaction} />
          </motion.div>
        </motion.div>
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-2 font-mono text-[11px] font-bold sm:bottom-5 sm:left-5 sm:right-5">
          <span className="rounded-lg border-2 border-ink-black bg-blueprint-navy px-2 py-1">NODE {activeGateIndex + 1} / {GATES.length}</span>
          {health !== undefined && (
            <span className="rounded-lg border-2 border-ink-black bg-paper-cream px-2 py-1 tabular-nums text-ink-black">HULL {Math.round(clamp(health, 0, 100))}%</span>
          )}
        </div>
        <AnimatePresence>
          {visibleResult && (
            <motion.div key={visibleResult.round + "-" + visibleResult.immediate_feedback} role="status" aria-live="polite"
              className={"absolute bottom-14 left-4 right-4 z-30 rounded-xl border-[3px] border-ink-black p-3 text-ink-black shadow-paper sm:left-1/4 sm:right-1/4 " +
                (visibleResult.gate_status === "PASS" ? "bg-status-ok" : visibleResult.gate_status === "DEGRADED" ? "bg-status-warn" : "bg-status-crit")}
              initial={{ opacity: 0, y: 20, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -12 }}>
              <p className="font-mono text-xs font-bold tracking-widest">{visibleResult.gate_status} // NODE {visibleResult.round}</p>
              <p className="mt-1 text-sm font-semibold">{visibleResult.immediate_feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="paper-card space-y-4 p-4 sm:p-6" aria-label="Engineering decision">
        {question ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-lg border-2 border-ink-black bg-role-spacecraft px-2.5 py-1 font-mono text-xs font-bold text-ink-black">{question.nasa_concept_badge}</span>
              <span role="status" className={"rounded-xl border-2 border-ink-black px-3 py-1 font-display text-base font-black tracking-wide text-ink-black sm:text-lg " + (isMyTurn ? "bg-status-ok" : "bg-status-warn")}>
                {isMyTurn ? "YOUR TURN!" : "WAITING FOR " + (activePlayerName || ROLE_NAMES[question.assigned_role]).toUpperCase() + "..."}
              </span>
            </div>
            <div>
              <p className="font-mono text-xs font-bold tracking-widest text-role-finance">ROUND {Math.max(1, Math.floor(round))} / {GATES.length} // {question.gate}</p>
              <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl">{question.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">{question.scenario_context}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-ink-black bg-space-ink" aria-label={Math.ceil(roundLeft) + " seconds left in round"}>
              <motion.div className={"h-full " + (roundLeft <= 5 ? "bg-status-crit" : "bg-status-warn")}
                animate={{ width: (roundLeft / ROUND_DURATION_SEC) * 100 + "%" }} transition={{ duration: 0.4 }} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {question.options.slice(0, 4).map((option, index) => (
                <button key={option.option_id} type="button" disabled={!canAnswer}
                  onClick={() => answer(option.option_id)}
                  className={"paper-btn min-h-[88px] p-3 text-left text-ink-black " +
                    (hasSubmitted && submittedAnswer?.optionId === option.option_id ? "bg-status-ok" : "bg-paper-cream")}
                  aria-label={"Option " + (index + 1) + ": " + option.label + ". " + option.engineering_tradeoff_hint}>
                  <span className="flex items-start gap-3">
                    <span className="rounded-md border-2 border-ink-black bg-role-finance px-2 py-0.5 font-mono text-sm font-bold tabular-nums">{index + 1}</span>
                    <span>
                      <span className="block font-display text-base font-bold">{option.label}</span>
                      <span className="mt-1 block font-mono text-xs font-normal leading-snug text-slate-700">{option.engineering_tradeoff_hint}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <p className="font-mono text-[11px] text-slate-300">
              {hasSubmitted ? "Decision sent to Mission Control." : isMyTurn ? "Tap an option or press 1-4." : "Crew decision in progress."}
            </p>
          </>
        ) : (
          <div className="space-y-2 py-6 text-center">
            <h2 className="font-display text-xl font-bold">Awaiting flight telemetry</h2>
            <p className="font-mono text-sm text-slate-300">Mission Control is preparing the next engineering decision.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default Flight60sView;
