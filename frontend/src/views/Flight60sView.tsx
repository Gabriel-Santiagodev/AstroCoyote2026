// Owner: Leonardo (Task LEO-06) — Server-driven, four-round mission flight.
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { CrewmateAvatar, ROLE_CHARACTER_PROFILE } from "../components/paper/CrewmateAvatar";
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
  isHostStage?: boolean;
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
const TARGET_NAMES: Record<MissionIdType, string> = {
  artemis_moon: "THE MOON",
  asteroid_hunter: "THE ASTEROID",
  mars_sample_return: "MARS",
};
const VIEWPORT_QUERY = "(max-width: 767px)";
const STATION_POSITIONS = ["12%", "36%", "60%", "84%"] as const;

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

function PaperShip({ reaction, healthPct }: { reaction: Reaction; healthPct: number }) {
  const damage = (100 - clamp(healthPct, 0, 100)) / 100;
  const flameScale = reaction === "thruster" ? 1.8 : 0.8 + clamp(healthPct, 0, 100) / 170;
  return (
    <svg viewBox="0 0 320 170" role="img" aria-label="Multistage paper rocket traveling through space"
      className="h-full w-full overflow-visible drop-shadow-[6px_6px_0px_#0F172A]">
      <motion.g animate={{ opacity: [0.25, 0.8, 0.25], x: [-3, -18, -3] }}
        transition={{ duration: 0.65, repeat: Infinity, ease: "easeInOut" }} strokeLinecap="round">
        <path d="M52 66H11M48 84H2M52 103H11" stroke="#38BDF8" strokeWidth="6" />
        <path d="M40 75H16M40 93H16" stroke="#F2C94C" strokeWidth="3" />
      </motion.g>
      {[67, 85, 103].map((cy, index) => (
        <motion.g key={cy} style={{ transformOrigin: "64px " + cy + "px" }}
          animate={{ scaleX: [flameScale * 0.75, flameScale, flameScale * 0.82], opacity: [0.75, 1, 0.8] }}
          transition={{ duration: 0.28 + index * 0.05, repeat: Infinity, ease: "easeInOut" }}>
          <path d={"M62 " + (cy - 8) + " 13 " + cy + " 62 " + (cy + 8) + " 50 " + cy + "Z"}
            fill="#F59E0B" stroke="#0F172A" strokeWidth="3" />
          <path d={"M61 " + (cy - 4) + " 30 " + cy + " 61 " + (cy + 4) + "Z"} fill="#FEF3C7" />
        </motion.g>
      ))}
      <path d="M67 48 45 23 90 38 109 53ZM67 122 45 147 90 132 109 117Z"
        fill="#06B6D4" stroke="#F8FAFC" strokeWidth="10" strokeLinejoin="round" />
      <path d="M67 48 45 23 90 38 109 53ZM67 122 45 147 90 132 109 117Z"
        fill="none" stroke="#0F172A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M66 51 233 40 305 85 233 130 66 119Z"
        fill="#F8FAFC" stroke="#F8FAFC" strokeWidth="14" strokeLinejoin="round" />
      <path d="M66 51 233 40 305 85 233 130 66 119Z"
        fill="#E2E8F0" stroke="#0F172A" strokeWidth="6" strokeLinejoin="round" />
      <path d="M66 52 119 49 119 121 66 118Z" fill="#CBD5E1" stroke="#0F172A" strokeWidth="4" />
      <path d="M123 49 222 42 222 128 123 121Z" fill="#F8FAFC" stroke="#0F172A" strokeWidth="4" />
      <path d="M231 41 305 85 231 129Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M121 51 121 120M130 51 130 121M220 45 220 125M228 43 228 127"
        stroke="#0F172A" strokeWidth="3" />
      <path d="M139 57 208 52M139 113 208 118" stroke="#06B6D4" strokeWidth="6" strokeLinecap="round" />
      <path d="M79 64 111 61M79 106 111 109" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
      <circle cx="169" cy="85" r="21" fill="#06B6D4" stroke="#0F172A" strokeWidth="5" />
      <circle cx="163" cy="79" r="7" fill="#E0F2FE" />
      <path d="M247 74 279 85 247 96" fill="none" stroke="#F8FAFC" strokeWidth="5" strokeLinecap="round" />
      {[80, 97, 145, 197].map((cx) => <circle key={cx} cx={cx} cy="85" r="3" fill="#334155" />)}
      {reaction === "shield" && (
        <motion.ellipse cx="177" cy="85" rx="139" ry="69" fill="none" stroke="#3DDC84" strokeWidth="6"
          strokeDasharray="13 8" animate={{ opacity: [0.15, 1, 0.3], scale: [0.94, 1.04, 1] }}
          transition={{ duration: 0.7, repeat: Infinity }} />
      )}
      {(damage > 0 || reaction === "sparks") && (
        <motion.g stroke="#FF5A4E" strokeWidth="5" strokeLinecap="round"
          animate={{ opacity: [0, Math.max(damage, reaction === "sparks" ? 0.9 : 0), 0], scale: [0.85, 1.2, 1] }}
          transition={{ duration: reaction === "sparks" ? 0.32 : 0.8, repeat: Infinity }}>
          <path d="m132 23 12-18M194 22l9-17M241 28l13-13M135 139l-8 19M218 144l13 17" />
        </motion.g>
      )}
      {reaction === "downlink" && (
        <motion.g animate={{ opacity: [0.1, 1, 0.2] }} transition={{ duration: 0.55, repeat: Infinity }}>
          <path d="M170 61V16m-12 10q12-13 24 0m-34-12q22-23 44 0" fill="none" stroke="#A855F7"
            strokeWidth="5" strokeLinecap="round" />
        </motion.g>
      )}
    </svg>
  );
}

function useNarrowViewport() {
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(VIEWPORT_QUERY).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(VIEWPORT_QUERY);
    const update = () => setIsNarrow(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return isNarrow;
}

export function Flight60sView({
  round, timeLeftSec, myRole, question, onAnswerOption,
  activePlayerName, globalTimeLeftSec, rocketHealthPct, lastTurnResult,
  missionId = "artemis_moon", isHostStage,
}: Flight60sViewProps) {
  const isNarrow = useNarrowViewport();
  const isPhoneConsole = isNarrow || isHostStage === false;
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
  const shipLeft = isPhoneConsole ? 2 + flightProgress * 0.48 : 5 + flightProgress * 0.58;
  const isMyTurn = question?.assigned_role === myRole;
  const hasSubmitted = submittedAnswer?.questionId === question?.question_id;
  const canAnswer = Boolean(question && isMyTurn && roundLeft > 0 && !hasSubmitted && !visibleResult);
  const health = visibleResult?.rocket_health_pct ?? rocketHealthPct;
  const healthValue = health === undefined ? undefined : clamp(health, 0, 100);
  const activeRole = question?.assigned_role ?? myRole;
  const activeProfile = ROLE_CHARACTER_PROFILE[activeRole];
  const playerLabel = activePlayerName?.trim() || activeProfile.codename;
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
    <main className={
      "relative mx-auto flex flex-col text-paper-cream " + (isPhoneConsole ? "gap-3 " : "gap-5 ") +
      (isPhoneConsole
        ? "handheld-console-frame my-2 w-[calc(100%-1rem)] max-w-md p-2.5"
        : "max-w-7xl px-4 py-6 sm:px-6")
    }>
      <header className={"flash-panel order-1 overflow-hidden " +
        (isPhoneConsole ? "space-y-2 p-2.5" : "space-y-4 p-5")}>
        <div className={"hazard-stripe-bar rounded-full " + (isPhoneConsole ? "h-1.5" : "h-2")} aria-hidden="true" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-role-spacecraft">
              {isPhoneConsole ? "CREW HANDHELD // FLIGHT" : "HOST MAIN STAGE // LIVE TELEMETRY"}
            </p>
            <h1 className={"font-display font-black " + (isPhoneConsole ? "text-xl" : "text-2xl sm:text-4xl")}>
              {isPhoneConsole ? TARGET_NAMES[missionId] + " FLIGHT" : "Flight to " + TARGET_NAMES[missionId]}
            </h1>
          </div>
          <div className="flex gap-2 font-mono tabular-nums">
            <div className={"rounded-xl border-2 border-ink-black bg-paper-cream px-3 py-2 text-center text-ink-black " + (isPhoneConsole ? "order-2" : "")}>
              <div className="text-[10px] font-bold tracking-widest">FLIGHT</div>
              <div className={isPhoneConsole ? "text-lg font-bold" : "text-xl font-bold sm:text-2xl"}>{Math.ceil(globalLeft)}s</div>
            </div>
            <div className={"rounded-xl border-2 border-ink-black px-3 py-2 text-center text-ink-black " +
              (isPhoneConsole ? "hidden " : "") + (roundLeft <= 5 ? "bg-status-crit" : "bg-status-warn")}>
              <div className="text-[10px] font-bold tracking-widest">ROUND</div>
              <div className={isPhoneConsole ? "text-3xl font-black" : "text-xl font-bold sm:text-2xl"}>{Math.ceil(roundLeft)}s</div>
            </div>
          </div>
        </div>
        <div aria-label="Flight progress" className="h-3 overflow-hidden rounded-full border-2 border-ink-black bg-space-ink">
          <motion.div className="h-full bg-role-spacecraft" animate={{ width: flightProgress + "%" }} transition={{ duration: 0.5 }} />
        </div>
        <ol className="grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="Decision nodes">
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
                aria-label={gate.id + (isActive ? " active" : isComplete ? " completed" : " pending")}
                className={"min-w-0 rounded-xl border-2 border-ink-black p-1.5 text-center font-mono text-[10px] font-bold sm:p-3 sm:text-[11px] " + nodeColor}>
                <span className="block tabular-nums">{"0" + (index + 1)}</span>
                <span className={isPhoneConsole ? "sr-only" : "block"}>{gate.label}</span>
              </li>
            );
          })}
        </ol>
      </header>

      <section aria-label="Spacecraft flight scene" className={
        "flash-panel relative overflow-hidden bg-space-ink " +
        (isPhoneConsole ? "order-3 min-h-[205px]" : "order-2 min-h-[430px]")
      }>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_38%,#253F78_0%,#101B39_33%,#090F25_78%)]" />
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50"
          style={{ backgroundImage: "radial-gradient(#F8FAFC 1px, transparent 1px)", backgroundSize: "29px 37px" }}
          animate={{ backgroundPositionX: [0, -29] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: "radial-gradient(#38BDF8 2px, transparent 2px)", backgroundSize: "97px 91px" }}
          animate={{ backgroundPositionX: [0, -97] }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full border-[30px] border-role-spacecraft/10" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[10%] top-[18%] h-32 w-32 rounded-full bg-role-science/10 blur-2xl" />
        <div className="absolute left-[8%] right-[12%] top-[53%] border-t-[3px] border-dashed border-slate-300/35" />
        {GATES.map((gate, index) => (
          <div key={gate.id} className={"absolute z-10 -translate-x-1/2 text-center " +
            (isPhoneConsole ? "bottom-12" : "bottom-20")}
            style={{ left: STATION_POSITIONS[index] }} aria-hidden="true">
            <span className={"mx-auto block rounded-full border-[3px] border-ink-black shadow-paper " +
              (isPhoneConsole ? "h-5 w-5" : "h-10 w-10") + " " +
              (index < activeGateIndex ? "bg-status-ok" : index === activeGateIndex ? "bg-status-warn" : "bg-blueprint-navy")} />
            {!isPhoneConsole && <span className="mt-1 block whitespace-nowrap rounded border border-slate-500/50 bg-space-ink/80 px-1.5 py-0.5 font-mono text-[9px] font-bold">{gate.label}</span>}
          </div>
        ))}
        <div className={"absolute right-[1%] top-[14%] " + (isPhoneConsole ? "h-24 w-24" : "h-52 w-52")}>
          <MissionTarget missionId={missionId} />
        </div>
        <div className="absolute right-2 top-2 rounded-lg border-2 border-ink-black bg-paper-cream px-2 py-1 font-mono text-[9px] font-bold text-ink-black sm:right-5 sm:top-5">
          TARGET // {TARGET_NAMES[missionId]}
        </div>
        {reaction === "downlink" && (
          <motion.div aria-hidden="true" className="absolute top-1/2 z-10 border-t-4 border-dashed border-role-science drop-shadow-[0_0_8px_#A855F7]"
            style={{ left: (shipLeft + 8) + "%", right: "12%" }}
            initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.3] }} transition={{ duration: 0.6, repeat: Infinity }} />
        )}
        <motion.div className={"absolute z-20 " + (isPhoneConsole ? "top-[36%] h-20 w-40" : "top-[32%] h-40 w-[300px]")}
          animate={{ left: shipLeft + "%" }} transition={{ duration: 0.8, ease: "easeOut" }}>
          <motion.div animate={{ y: [-4, 5, -4], rotate: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <PaperShip reaction={reaction} healthPct={healthValue ?? 100} />
          </motion.div>
        </motion.div>
        <div className="absolute bottom-2 left-3 right-3 z-20 flex flex-wrap items-end justify-between gap-2 font-mono text-[10px] font-bold sm:bottom-4 sm:left-5 sm:right-5">
          <span className="rounded-lg border-2 border-ink-black bg-blueprint-navy px-2 py-1">
            NODE {activeGateIndex + 1} / {GATES.length}
          </span>
          <div className="rounded-lg border-2 border-ink-black bg-paper-cream px-2 py-1 text-ink-black">
            <div className="flex items-center justify-between gap-3 tabular-nums">
              <span>HULL</span><span>{healthValue === undefined ? "--" : Math.round(healthValue) + "%"}</span>
            </div>
            <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-slate-300 sm:w-28">
              {healthValue !== undefined && (
                <motion.div className={"h-full " + (healthValue < 50 ? "bg-status-crit" : healthValue < 80 ? "bg-status-warn" : "bg-status-ok")}
                  animate={{ width: healthValue + "%" }} transition={{ duration: 0.4 }} />
              )}
            </div>
          </div>
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

      <section className={"flash-panel " + (isPhoneConsole ? "order-2 space-y-2 p-2.5" : "order-3 space-y-4 p-6")}
        aria-label="Engineering decision">
        <div className={"hazard-stripe-bar rounded-full " + (isPhoneConsole ? "h-1.5" : "h-2")} aria-hidden="true" />
        {question ? (
          <>
            <div className={
              "rounded-xl border-2 border-slate-500/50 bg-space-ink/70 " +
              (isPhoneConsole ? "grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-2 gap-y-1 p-1.5" : "flex flex-wrap items-center gap-3 p-3")
            }>
              <CrewmateAvatar role={activeRole} state={isMyTurn ? "work" : "idle"}
                size={isPhoneConsole ? 46 : 78} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-role-spacecraft">
                  {isPhoneConsole ? "ACTIVE CREW" : "ACTIVE CREW // " + activeProfile.squadClass}
                </p>
                <h2 className="font-display text-base font-black leading-tight sm:text-xl">{activeProfile.codename}</h2>
                <p className="font-mono text-[10px] leading-tight text-slate-300">
                  {activePlayerName ? activePlayerName + " · " : ""}{activeProfile.gearLabel}
                </p>
              </div>
              <span role="status" className={(isPhoneConsole ? "col-span-2 w-full " : "max-w-full ") +
                "rounded-xl border-2 border-ink-black px-2 py-1 text-center font-display text-sm font-black text-ink-black sm:px-3 sm:text-base " +
                (isMyTurn ? "bg-status-ok" : "bg-status-warn")}>
                {isMyTurn ? "YOUR TURN!" : (isPhoneConsole ? "WAIT FOR " : "ON PHONE: ") + playerLabel.toUpperCase()}
              </span>
            </div>
            {isPhoneConsole && !isMyTurn ? (
              <div className="rounded-xl border-2 border-ink-black bg-blueprint-navy p-4 text-center">
                <p className="font-mono text-xs font-bold text-status-warn">CREW TURN IN PROGRESS</p>
                <h3 className="mt-2 font-display text-lg font-black">{question.title}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  {playerLabel} is resolving this node on their handheld console.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <span className={"rounded-lg border-2 border-ink-black bg-role-spacecraft px-2.5 py-1 font-mono text-xs font-bold text-ink-black " +
                    (isPhoneConsole ? "sr-only" : "inline-block")}>
                    {question.nasa_concept_badge}
                  </span>
                  <p className={"font-mono text-xs font-bold tracking-widest text-role-finance " + (isPhoneConsole ? "" : "mt-3")}>
                    ROUND {Math.max(1, Math.floor(round))} / {GATES.length} // {question.gate}
                  </p>
                  <h3 className={"font-display font-bold " + (isPhoneConsole ? "mt-0.5 text-lg leading-tight" : "mt-1 text-xl sm:text-2xl")}>
                    {question.title}
                  </h3>
                  <p className={"text-slate-200 " + (isPhoneConsole ? "mt-1 text-xs leading-snug" : "mt-2 text-sm leading-relaxed")}>
                    {question.scenario_context}
                  </p>
                </div>
                {isPhoneConsole && (
                  <div className={"rounded-xl border-2 border-ink-black px-2 py-1 text-center font-mono font-black tabular-nums text-ink-black " +
                    (roundLeft <= 5 ? "bg-status-crit" : "bg-status-warn")}>
                    <span className="mr-2 text-xs">DECISION TIMER</span>
                    <span className="text-3xl">{Math.ceil(roundLeft)}s</span>
                  </div>
                )}
                <div className="h-2 overflow-hidden rounded-full border border-ink-black bg-space-ink"
                  aria-label={Math.ceil(roundLeft) + " seconds left in round"}>
                  <motion.div className={"h-full " + (roundLeft <= 5 ? "bg-status-crit" : "bg-status-warn")}
                    animate={{ width: (roundLeft / ROUND_DURATION_SEC) * 100 + "%" }} transition={{ duration: 0.4 }} />
                </div>
                <div className={"grid gap-3 " + (isPhoneConsole ? "grid-cols-1" : "sm:grid-cols-2")}>
                  {question.options.slice(0, 4).map((option, index) => (
                    <button key={option.option_id} type="button" disabled={!canAnswer}
                      onClick={() => answer(option.option_id)}
                      className={"paper-btn p-3 text-left text-ink-black " +
                        (isPhoneConsole ? "min-h-[96px] " : "min-h-[88px] ") +
                        (hasSubmitted && submittedAnswer?.optionId === option.option_id ? "bg-status-ok" : "bg-paper-cream")}
                      aria-label={"Option " + (index + 1) + ": " + option.label + ". " + option.engineering_tradeoff_hint}>
                      <span className="flex items-start gap-3">
                        <span className="rounded-md border-2 border-ink-black bg-role-finance px-2 py-0.5 font-mono text-sm font-bold tabular-nums">
                          {index + 1}
                        </span>
                        <span>
                          <span className={"block font-display font-bold " + (isPhoneConsole ? "text-lg" : "text-base")}>
                            {option.label}
                          </span>
                          <span className="mt-1 block font-mono text-xs font-normal leading-snug text-slate-700">
                            {option.engineering_tradeoff_hint}
                          </span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <p className="font-mono text-[11px] text-slate-300">
                  {hasSubmitted ? "Decision sent to Mission Control." : isMyTurn ? "Tap an option or press 1-4." : "Crew decision in progress."}
                </p>
              </>
            )}
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
