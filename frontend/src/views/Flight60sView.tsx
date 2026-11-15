// Owner: Leonardo (Task LEO-06) — Server-driven, four-chapter cabin survival flight.
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BatteryCharging, Gauge, Radio, Shield, Wallet } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CrewmateAvatar,
  ROLE_CHARACTER_PROFILE,
  type ActionEffect,
  type AvatarState,
} from "../components/paper/CrewmateAvatar";
import { soundEngine } from "../components/paper/SoundEngine";
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
  stationLoadout?: Partial<Record<RoleType, { wave1?: Record<string, unknown>; wave2?: Record<string, unknown> }>>;
}

const ROUND_DURATION_SEC = 15;
const FLIGHT_DURATION_SEC = 60;
const FEEDBACK_DISPLAY_MS = 1750;
const SCENE_JUMP_MS = 850;
const HULL_ALARM_THRESHOLD_PCT = 75;
const VIEWPORT_QUERY = "(max-width: 767px)";

const GATES: Array<{
  id: FlightQuestionUI["gate"];
  label: string;
  chapter: string;
}> = [
  { id: "NODE_1_LAUNCH", label: "LAUNCH", chapter: "LAUNCH PAD" },
  { id: "NODE_2_PROPULSION", label: "PROPULSION", chapter: "ORBITAL PROPULSION" },
  { id: "NODE_3_EVENT", label: "SPACE EVENT", chapter: "DEEP SPACE HAZARD" },
  { id: "NODE_4_DOWNLINK", label: "DSN DOWNLINK", chapter: "DSN DOWNLINK" },
];

const CREW_ROLES: RoleType[] = [
  "finance_launch",
  "spacecraft_mass",
  "orbit_power",
  "science_comms",
];

const TARGET_NAMES: Record<MissionIdType, string> = {
  artemis_moon: "THE MOON",
  asteroid_hunter: "THE ASTEROID",
  mars_sample_return: "MARS",
};

const RACK_ITEMS: Array<{
  id: string;
  label: string;
  shortLabel: string;
  gateIndex: number;
  icon: LucideIcon;
  packedFrom: Array<{ role: RoleType; wave: "wave1" | "wave2" }>;
}> = [
  { id: "ufe", label: "UFE Vault", shortLabel: "UFE", gateIndex: 0, icon: Wallet,
    packedFrom: [{ role: "finance_launch", wave: "wave1" }] },
  { id: "tps", label: "Thermal Shield TPS", shortLabel: "TPS", gateIndex: 2, icon: Shield,
    packedFrom: [{ role: "spacecraft_mass", wave: "wave1" }] },
  { id: "cg", label: "CG & Propulsion Tank", shortLabel: "CG/TANK", gateIndex: 1, icon: Gauge,
    packedFrom: [{ role: "spacecraft_mass", wave: "wave2" }, { role: "orbit_power", wave: "wave1" }] },
  { id: "power", label: "Power Cells", shortLabel: "POWER", gateIndex: 2, icon: BatteryCharging,
    packedFrom: [{ role: "orbit_power", wave: "wave2" }] },
  { id: "dsn", label: "DSN Spectral Array", shortLabel: "DSN", gateIndex: 3, icon: Radio,
    packedFrom: [{ role: "science_comms", wave: "wave2" }] },
];

interface SceneJump {
  fromRound: number;
  toGateIndex: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function wasPackedByCrew(
  loadout: NonNullable<Flight60sViewProps["stationLoadout"]>,
  sources: (typeof RACK_ITEMS)[number]["packedFrom"],
) {
  return sources.some(({ role, wave }) => {
    const take = loadout[role]?.[wave];
    if (!take) return false;
    if (take.packed_by === "crew") return true;
    if (take.packed_by === "ai_autopilot") return false;
    if (typeof take.__crewPacked === "boolean") return take.__crewPacked;
    return Object.keys(take).length > 0;
  });
}

function MissionTarget({ missionId }: { missionId: MissionIdType }) {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true" className="h-full w-full drop-shadow-[4px_4px_0px_#0F172A]">
      {missionId === "asteroid_hunter" ? (
        <>
          <path d="M27 63 49 29 91 19 126 34 158 67 151 112 116 151 74 157 32 130 17 94Z"
            fill="#A77A64" stroke="#0F172A" strokeWidth="7" strokeLinejoin="round" />
          <ellipse cx="66" cy="65" rx="18" ry="12" fill="#805647" stroke="#0F172A" strokeWidth="4" />
          <ellipse cx="114" cy="105" rx="24" ry="15" fill="#805647" stroke="#0F172A" strokeWidth="4" />
        </>
      ) : (
        <>
          <circle cx="90" cy="90" r="73" fill={missionId === "mars_sample_return" ? "#EA785D" : "#D9E2EB"}
            stroke="#0F172A" strokeWidth="8" />
          {missionId === "mars_sample_return" ? (
            <>
              <path d="M37 115c25-20 43-10 63-21 23-13 34-13 56-7M30 83c23 5 39-9 53-18 25-15 39-9 59-7"
                fill="none" stroke="#AD4C45" strokeWidth="9" strokeLinecap="round" />
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

function CabinBackdrop() {
  return (
    <svg viewBox="0 0 1200 560" preserveAspectRatio="none" aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="cabin-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#42577B" />
          <stop offset="0.55" stopColor="#26395D" />
          <stop offset="1" stopColor="#172644" />
        </linearGradient>
        <linearGradient id="cabin-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#475569" />
          <stop offset="1" stopColor="#172033" />
        </linearGradient>
      </defs>
      <rect width="1200" height="560" fill="url(#cabin-wall)" />
      <path d="M0 0H1200V40H0ZM0 0h84l78 392H0Zm1200 0h-84l-78 392h162Z"
        fill="#64748B" stroke="#0F172A" strokeWidth="10" />
      <path d="M0 50h1200M110 0l91 405M1090 0l-91 405M0 347h1200"
        fill="none" stroke="#0F172A" strokeWidth="11" />
      <path d="M0 364 600 312l600 52v196H0Z" fill="url(#cabin-floor)" stroke="#0F172A" strokeWidth="10" />
      <path d="M0 406h1200M0 474h1200M600 312 350 560M600 312 850 560M600 312 80 560M600 312l520 248"
        fill="none" stroke="#94A3B8" strokeOpacity=".32" strokeWidth="4" />
      <path d="M440 352h320l55 152H385Z" fill="#17243F" stroke="#0F172A" strokeWidth="10" />
      <path d="M465 361h270l28 95H437Z" fill="#075985" stroke="#0F172A" strokeWidth="8" />
      <path d="M520 400h160M555 420h90" fill="none" stroke="#67E8F9" strokeWidth="9" strokeLinecap="round" />
      <path d="M395 505h410l22 55H373Z" fill="#334155" stroke="#0F172A" strokeWidth="8" />
      <path d="M70 210h75v110H70ZM1055 210h75v110h-75Z" fill="#1E293B" stroke="#0F172A" strokeWidth="8" />
      <path d="M81 233h53M81 259h53M81 285h53M1066 233h53M1066 259h53M1066 285h53"
        stroke="#38BDF8" strokeWidth="7" />
      {[80, 230, 380, 530, 680, 830, 980, 1120].map((x) => (
        <g key={x}>
          <circle cx={x} cy="20" r="6" fill="#CBD5E1" stroke="#0F172A" strokeWidth="3" />
          <circle cx={x} cy="346" r="5" fill="#CBD5E1" stroke="#0F172A" strokeWidth="3" />
        </g>
      ))}
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

function CabinScene({
  isPhoneConsole,
  missionId,
  activeGateIndex,
  flightProgress,
  healthValue,
  alarm,
  visibleResult,
  reactionRole,
  activeRole,
  stationLoadout,
  sceneJump,
  onSkipJump,
}: {
  isPhoneConsole: boolean;
  missionId: MissionIdType;
  activeGateIndex: number;
  flightProgress: number;
  healthValue: number | undefined;
  alarm: boolean;
  visibleResult: FlightTurnResultUI | null;
  reactionRole: RoleType | null;
  activeRole: RoleType;
  stationLoadout?: Flight60sViewProps["stationLoadout"];
  sceneJump: SceneJump | null;
  onSkipJump: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const starDriftSec = Math.max(1.8, 6.5 - flightProgress * 0.045);
  const crewPresentation = (role: RoleType): {
    state: AvatarState;
    actionEffect: ActionEffect;
    statusBadgeText?: string;
  } => {
    if ((healthValue !== undefined && healthValue < HULL_ALARM_THRESHOLD_PCT) ||
      visibleResult?.gate_status === "CRITICAL") {
      return { state: "panic", actionEffect: "error", statusBadgeText: "ALERT" };
    }
    if (visibleResult && role === reactionRole) {
      return visibleResult.gate_status === "PASS"
        ? { state: "cheer", actionEffect: "complete", statusBadgeText: "PASS" }
        : { state: "panic", actionEffect: "error", statusBadgeText: "ALERT" };
    }
    return role === activeRole
      ? { state: "work", actionEffect: "scan" }
      : { state: "idle", actionEffect: "none" };
  };

  return (
    <section aria-label="Spacecraft cabin and station loadout" className="flash-panel min-w-0 overflow-hidden">
      <motion.div className={"relative overflow-hidden " + (isPhoneConsole ? "h-[84px]" : "h-[430px] 2xl:h-[490px]")}
        animate={visibleResult && visibleResult.gate_status !== "PASS"
          ? { x: [0, -7, 6, -3, 0], y: [0, 2, -2, 1, 0] }
          : { x: 0, y: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}>
        <CabinBackdrop />
        <div className={"absolute z-10 overflow-hidden rounded-[35%] border-[5px] border-ink-black bg-space-ink shadow-[inset_0_0_0_5px_#94A3B8] " +
          (isPhoneConsole ? "left-[26%] right-[5%] top-[10%] h-[55%]" : "left-[19%] right-[19%] top-[8%] h-[47%]")}>
          <motion.div className="absolute inset-0 opacity-65"
            style={{ backgroundImage: "radial-gradient(#F8FAFC 1px, transparent 2px)", backgroundSize: "43px 47px" }}
            animate={reduceMotion ? undefined : { backgroundPositionX: [0, -43] }}
            transition={{ duration: starDriftSec * 1.6, repeat: Infinity, ease: "linear" }} />
          <motion.div className="absolute inset-0 opacity-75"
            style={{ backgroundImage: "radial-gradient(#67E8F9 1.8px, transparent 3px)", backgroundSize: "91px 79px", backgroundPositionY: "19px" }}
            animate={reduceMotion ? undefined : { backgroundPositionX: [0, -91] }}
            transition={{ duration: starDriftSec, repeat: Infinity, ease: "linear" }} />
          <motion.div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(ellipse 20px 1.5px at center, #CFFAFE 0%, transparent 100%)",
              backgroundSize: "151px 61px", backgroundPositionY: "35px", opacity: 0.16 + flightProgress * 0.0028 }}
            animate={reduceMotion ? undefined : { backgroundPositionX: [0, -151] }}
            transition={{ duration: starDriftSec * 0.55, repeat: Infinity, ease: "linear" }} />
          <motion.div className={"absolute right-[9%] top-[4%] " + (isPhoneConsole ? "h-12 w-12" : "h-28 w-28")}
            animate={reduceMotion ? undefined : { scale: 0.9 + flightProgress * 0.003, x: -flightProgress * 0.08 }}
            transition={{ duration: 0.6, ease: "easeOut" }}>
            <MissionTarget missionId={missionId} />
          </motion.div>
          <div className={"absolute left-[6%] top-[8%] font-mono font-bold text-role-spacecraft " +
            (isPhoneConsole ? "text-[8px]" : "text-[11px] tracking-widest")}>
            DESTINATION // {TARGET_NAMES[missionId]}
          </div>
          <div className="absolute bottom-[10%] left-[6%] right-[6%] h-2 overflow-hidden rounded-full border border-slate-300 bg-blueprint-navy">
            <motion.div className="h-full bg-role-spacecraft" animate={{ width: flightProgress + "%" }}
              transition={{ duration: 0.45 }} />
          </div>
        </div>
        <div className={"absolute left-2 top-2 z-20 rounded-md border-2 border-ink-black bg-paper-cream px-1.5 py-0.5 font-mono font-black text-ink-black " +
          (isPhoneConsole ? "text-[8px]" : "text-[10px]")}>
          CABIN // CH {String(activeGateIndex + 1).padStart(2, "0")}
        </div>
        <div className={"absolute right-2 top-2 z-20 rounded-md border-2 border-ink-black px-1.5 py-0.5 font-mono font-black tabular-nums text-ink-black " +
          (alarm ? "bg-status-crit" : "bg-status-ok") + (isPhoneConsole ? " text-[8px]" : " text-[10px]")}>
          HULL {healthValue === undefined ? "--" : Math.round(healthValue) + "%"}
        </div>
        {alarm && (
          <motion.div className="absolute left-2 top-9 z-20 rounded-md border-2 border-ink-black bg-status-crit px-2 py-0.5 font-mono text-[9px] font-black text-ink-black"
            animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
            HULL ALERT
          </motion.div>
        )}
        <div className={"absolute bottom-1 left-1 right-1 z-20 grid grid-cols-4 gap-1 " +
          (isPhoneConsole ? "" : "bottom-5 left-5 right-5 gap-3")}>
          {CREW_ROLES.map((role) => {
            const profile = ROLE_CHARACTER_PROFILE[role];
            const isActive = role === activeRole;
            const presentation = crewPresentation(role);
            return (
              <div key={role} className={"relative flex min-w-0 flex-col items-center rounded-lg border-2 border-ink-black bg-space-ink/85 text-center " +
                (isPhoneConsole ? "px-0.5 pb-0.5 pt-0" : "pb-2 pt-1")}
                style={{ boxShadow: isActive ? "inset 0 0 0 2px " + profile.glow : undefined }}
                aria-label={profile.codename + " at cabin station, " + presentation.state}>
                <div className={"absolute inset-x-2 top-0 h-1 rounded-b " + (isActive ? "bg-status-ok" : "bg-slate-600")} />
                <CrewmateAvatar role={role} state={presentation.state}
                  actionEffect={presentation.actionEffect} statusBadgeText={presentation.statusBadgeText}
                  size={isPhoneConsole ? 28 : 88} />
                <span className={"block max-w-full truncate font-mono font-bold " +
                  (isPhoneConsole ? "text-[8px]" : "text-[10px]")}>
                  {isPhoneConsole ? profile.short : profile.codename}
                </span>
                {!isPhoneConsole && <span className="max-w-full truncate font-mono text-[9px] text-slate-300">
                  {profile.squadClass}
                </span>}
              </div>
            );
          })}
        </div>
        <AnimatePresence>
          {visibleResult && (
            <motion.div key={visibleResult.round + "-" + visibleResult.gate_status} role="status"
              className={"absolute left-[18%] right-[18%] top-[45%] z-30 rounded-xl border-[3px] border-ink-black p-2 text-center font-mono font-black text-ink-black shadow-paper " +
                (visibleResult.gate_status === "PASS" ? "bg-status-ok" :
                  visibleResult.gate_status === "DEGRADED" ? "bg-status-warn" : "bg-status-crit") +
                (isPhoneConsole ? " text-[10px]" : " text-sm")}
              initial={{ opacity: 0, y: 15, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -10 }}>
              {visibleResult.gate_status} // CHAPTER {String(visibleResult.round).padStart(2, "0")}
            </motion.div>
          )}
        </AnimatePresence>
        {visibleResult?.gate_status === "PASS" && (
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-[12%] z-20 rounded-[45%] border-[5px] border-status-ok"
            animate={{ opacity: [0, 0.75, 0], scale: [0.92, 1.05, 1.13] }}
            transition={{ duration: 0.75, repeat: Infinity }} />
        )}
        {visibleResult?.gate_status !== undefined && visibleResult.gate_status !== "PASS" && (
          <motion.svg aria-hidden="true" viewBox="0 0 120 70"
            className="pointer-events-none absolute right-[8%] top-[39%] z-20 h-16 w-28"
            animate={{ opacity: [0, 1, 0.2], rotate: [-6, 5, -3] }}
            transition={{ duration: 0.4, repeat: Infinity }}>
            <path d="m7 55 27-23-10-8 30-17-6 25 20 2-24 29M65 63l16-22-5-11 34-16-9 24 15 5-23 19"
              fill="none" stroke="#FF5A4E" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
        <AnimatePresence>
          {sceneJump && (
            <motion.div key={sceneJump.toGateIndex} role="status" aria-live="polite"
              className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center bg-space-ink/95 px-3 text-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}>
              <button type="button" onClick={onSkipJump} aria-label="Skip chapter jump"
                className="paper-btn pointer-events-auto absolute right-2 top-2 bg-paper-cream px-2 py-1 font-mono text-[10px] text-ink-black">
                SKIP &gt;&gt;
              </button>
              <div className="mb-2 h-10 w-10 rounded-full border-[5px] border-role-spacecraft border-t-transparent"
                aria-hidden="true" />
              <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-role-spacecraft">
                STAGE JUMP // DAY {String(sceneJump.toGateIndex + 1).padStart(2, "0")}
              </p>
              <h3 className={"mt-1 font-display font-black " + (isPhoneConsole ? "text-base" : "text-2xl sm:text-3xl")}>
                ENTERING {GATES[sceneJump.toGateIndex].chapter}
              </h3>
              {!isPhoneConsole && <p className="mt-1 font-mono text-xs text-slate-300">
                Cabin systems are moving to the next decision gate.
              </p>}
              <div className="mt-3 h-2 w-3/4 max-w-xs overflow-hidden rounded-full border border-paper-cream bg-blueprint-navy">
                <motion.div className="h-full bg-status-ok" initial={{ width: "0%" }}
                  animate={{ width: "100%" }} transition={{ duration: SCENE_JUMP_MS / 1000, ease: "linear" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className={"border-t-[3px] border-ink-black bg-blueprint-navy " + (isPhoneConsole ? "p-1" : "p-3")}>
        <div className={"flex items-center justify-between gap-2 font-mono font-bold tracking-widest text-slate-300 " +
          (isPhoneConsole ? "mb-0.5 text-[7px]" : "mb-1.5 text-[9px]")}>
          <span>STATION LOADOUT // CABIN SYSTEMS</span>
          {!isPhoneConsole && <span>GATE-LINKED TELEMETRY</span>}
        </div>
        <ul className="grid grid-cols-5 gap-1 sm:gap-2" aria-label="Cabin subsystem rack">
          {RACK_ITEMS.map((item) => {
            const Icon = item.icon;
            const isRelevant = item.gateIndex === activeGateIndex;
            const isAlert = alarm || Boolean(
              visibleResult && visibleResult.round === item.gateIndex + 1 &&
              visibleResult.gate_status !== "PASS",
            );
            const status = isAlert ? "ALERT" : isRelevant ? "ARMED" : "NOMINAL";
            const provenance = stationLoadout
              ? wasPackedByCrew(stationLoadout, item.packedFrom) ? "CREW PACKED" : "AI AUTOPILOT"
              : null;
            return (
              <li key={item.id} aria-label={item.label + ": " + status + (provenance ? ", " + provenance : "")}
                className={"min-w-0 rounded-md border-2 border-ink-black px-0.5 text-center " +
                  (isPhoneConsole ? "py-0 " : "py-1 ") +
                  (isAlert ? "bg-status-crit text-ink-black" :
                    isRelevant ? "bg-status-warn text-ink-black" : "bg-blueprint-navy text-paper-cream")}>
                <Icon size={isPhoneConsole ? 12 : 20} strokeWidth={2.5} aria-hidden="true" className="mx-auto" />
                <span className={"mt-0.5 block truncate font-mono font-bold " +
                  (isPhoneConsole ? "text-[7px]" : "text-[10px]")}>
                  {isPhoneConsole ? item.shortLabel : item.label}
                </span>
                <span className={"block font-mono font-black " + (isPhoneConsole ? "text-[6px]" : "text-[9px]")}>
                  {status}
                </span>
                {provenance && <span className={"block break-words font-mono font-black leading-tight " +
                  (isPhoneConsole ? "text-[7px]" : "mt-0.5 text-[8px]")}>{provenance}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function Flight60sView({
  round, timeLeftSec, myRole, question, onAnswerOption,
  activePlayerName, globalTimeLeftSec, rocketHealthPct, lastTurnResult,
  missionId = "artemis_moon", isHostStage, stationLoadout,
}: Flight60sViewProps) {
  const isNarrow = useNarrowViewport();
  const isPhoneConsole = isNarrow || isHostStage === false;
  const reduceMotion = useReducedMotion();
  const [submittedAnswer, setSubmittedAnswer] = useState<{ key: string; optionId: string } | null>(null);
  const submittedKeyRef = useRef<string | null>(null);
  const [visibleResult, setVisibleResult] = useState<FlightTurnResultUI | null>(null);
  const [reactionRole, setReactionRole] = useState<RoleType | null>(null);
  const [sceneJump, setSceneJump] = useState<SceneJump | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const jumpTimerRef = useRef<number | null>(null);
  const lastTickKeyRef = useRef<string | null>(null);

  // App may deliver the next question before the cabin transition finishes.
  // Only the cabin artwork is covered, so the new logbook page remains actionable.
  useEffect(() => {
    if (!lastTurnResult) return;
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    if (jumpTimerRef.current !== null) window.clearTimeout(jumpTimerRef.current);
    setVisibleResult(lastTurnResult);
    setReactionRole(question?.assigned_role ?? null);
    setSceneJump(null);
    if (lastTurnResult.gate_status === "PASS") soundEngine.playComplete();
    else soundEngine.playError();
    feedbackTimerRef.current = window.setTimeout(() => {
      feedbackTimerRef.current = null;
      setVisibleResult(null);
      if (lastTurnResult.round >= GATES.length) return;
      setSceneJump({ fromRound: lastTurnResult.round, toGateIndex: lastTurnResult.round });
      soundEngine.playSceneJump();
      jumpTimerRef.current = window.setTimeout(() => {
        jumpTimerRef.current = null;
        setSceneJump(null);
      }, SCENE_JUMP_MS);
    }, FEEDBACK_DISPLAY_MS);
  }, [lastTurnResult]);

  useEffect(() => () => {
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    if (jumpTimerRef.current !== null) window.clearTimeout(jumpTimerRef.current);
  }, []);

  const activeGateIndex = question
    ? Math.max(0, GATES.findIndex((gate) => gate.id === question.gate))
    : clamp(Math.floor(round) - 1, 0, GATES.length - 1);
  const roundLeft = clamp(timeLeftSec, 0, ROUND_DURATION_SEC);
  const globalLeft = clamp(
    globalTimeLeftSec ?? (GATES.length - activeGateIndex - 1) * ROUND_DURATION_SEC + roundLeft,
    0, FLIGHT_DURATION_SEC,
  );
  const flightProgress = ((FLIGHT_DURATION_SEC - globalLeft) / FLIGHT_DURATION_SEC) * 100;
  const activeRole = question?.assigned_role ?? myRole;
  const activeProfile = ROLE_CHARACTER_PROFILE[activeRole];
  const playerLabel = activePlayerName?.trim() || activeProfile.codename;
  const isMyTurn = question?.assigned_role === myRole;
  const questionKey = question ? round + ":" + question.question_id : "";
  const activeQuestionKeyRef = useRef(questionKey);
  activeQuestionKeyRef.current = questionKey;
  const countdownSecond = Math.ceil(roundLeft);
  const hasSubmitted = submittedAnswer?.key === questionKey || submittedKeyRef.current === questionKey;
  const resultIsCurrent = visibleResult?.round === round;
  const canAnswer = Boolean(question && isMyTurn && roundLeft > 0 && !hasSubmitted && !resultIsCurrent);
  const health = visibleResult?.rocket_health_pct ?? rocketHealthPct;
  const healthValue = health === undefined ? undefined : clamp(health, 0, 100);
  const alarm = (healthValue !== undefined && healthValue < HULL_ALARM_THRESHOLD_PCT) ||
    Boolean(visibleResult && visibleResult.gate_status !== "PASS");
  const logbookError = (healthValue !== undefined && healthValue < HULL_ALARM_THRESHOLD_PCT) ||
    Boolean(resultIsCurrent && visibleResult?.gate_status !== "PASS");
  const logbookPass = !logbookError && resultIsCurrent && visibleResult?.gate_status === "PASS";
  const logbookActionEffect: ActionEffect = logbookError ? "error" : logbookPass ? "complete" : "scan";

  useEffect(() => {
    if (!question || countdownSecond < 1 || countdownSecond > 5) return;
    const tickKey = questionKey + ":" + countdownSecond;
    if (lastTickKeyRef.current === tickKey) return;
    lastTickKeyRef.current = tickKey;
    soundEngine.playCountdownTick(countdownSecond <= 2);
  }, [countdownSecond, question, questionKey]);

  const answer = useCallback((optionId: string) => {
    if (!question || !canAnswer || activeQuestionKeyRef.current !== questionKey ||
      submittedKeyRef.current === questionKey ||
      !question.options.some((option) => option.option_id === optionId)) return;
    submittedKeyRef.current = questionKey;
    setSubmittedAnswer({ key: questionKey, optionId });
    soundEngine.playClick();
    onAnswerOption(question.question_id, optionId);
  }, [canAnswer, onAnswerOption, question, questionKey]);

  const skipJump = useCallback(() => {
    soundEngine.playClick();
    if (jumpTimerRef.current !== null) window.clearTimeout(jumpTimerRef.current);
    jumpTimerRef.current = null;
    setSceneJump(null);
  }, []);

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
    <main className={"relative mx-auto flex min-w-0 flex-col text-paper-cream " +
      (isPhoneConsole
        ? "handheld-console-frame my-2 w-[calc(100%-1rem)] max-w-md gap-3 px-2 pb-2 pt-12 sm:pt-14"
        : "max-w-7xl gap-5 px-4 pb-6 pt-12 sm:px-6 sm:pt-14")}>
      <header className={"flash-panel min-w-0 overflow-hidden " + (isPhoneConsole ? "p-2" : "p-5")}>
        <div className={"hazard-stripe-bar rounded-full " + (isPhoneConsole ? "h-1.5" : "h-2")} aria-hidden="true" />
        <div className="mt-2 flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-role-spacecraft">
              {isPhoneConsole ? "CREW PAD // CABIN" : "HOST MAIN STAGE // SURVIVAL FLIGHT"}
            </p>
            <h1 className={"font-display font-black leading-tight " +
              (isPhoneConsole ? "text-base" : "text-2xl sm:text-4xl")}>
              {isPhoneConsole ? "Flight to " + TARGET_NAMES[missionId] : "Cabin Flight to " + TARGET_NAMES[missionId]}
            </h1>
          </div>
          <div className="shrink-0 rounded-lg border-2 border-ink-black bg-paper-cream px-2 py-1 text-center font-mono font-black tabular-nums text-ink-black">
            <span className="block text-[9px]">FLIGHT</span>
            <span className={isPhoneConsole ? "text-lg" : "text-2xl"}>{Math.ceil(globalLeft)}s</span>
          </div>
        </div>
        <ol className={(isPhoneConsole ? "mt-1" : "mt-2") + " grid grid-cols-4 gap-1 " + (isPhoneConsole ? "" : "sm:gap-2")}
          aria-label="Four flight chapters">
          {GATES.map((gate, index) => {
            const latestStatus = lastTurnResult?.round === index + 1 ? lastTurnResult.gate_status : null;
            const complete = index < activeGateIndex || Boolean(latestStatus);
            const active = index === activeGateIndex && !complete;
            const color = latestStatus === "CRITICAL" ? "bg-status-crit text-ink-black" :
              latestStatus === "DEGRADED" ? "bg-status-warn text-ink-black" :
                latestStatus === "PASS" ? "bg-status-ok text-ink-black" :
                  complete ? "bg-paper-cream text-ink-black" :
                    active ? "bg-role-spacecraft text-ink-black" : "bg-space-ink text-slate-300";
            return (
              <li key={gate.id} aria-current={active ? "step" : undefined}
                aria-label={gate.id + (active ? " active" : complete ? " completed" : " pending")}
                className={"min-w-0 rounded-md border-2 border-ink-black p-1 text-center font-mono font-black " +
                  (isPhoneConsole ? "text-[9px]" : "text-[11px]") + " " + color}>
                <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                {!isPhoneConsole && <span className="ml-2">{gate.label}</span>}
              </li>
            );
          })}
        </ol>
      </header>

      <div className={"min-w-0 gap-5 " +
        (isPhoneConsole ? "flex flex-col gap-3" : "grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_minmax(350px,1fr)]")}>
        <CabinScene isPhoneConsole={isPhoneConsole} missionId={missionId}
          activeGateIndex={activeGateIndex} flightProgress={flightProgress}
          healthValue={healthValue} alarm={alarm} visibleResult={visibleResult}
          reactionRole={reactionRole} activeRole={activeRole}
          stationLoadout={stationLoadout}
          sceneJump={sceneJump} onSkipJump={skipJump} />

        <section aria-label="Captain's survival log" className="flash-panel relative min-w-0 p-2 sm:p-3"
          style={{ perspective: 1100 }}>
          <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={activeGateIndex} className="paper-card-light relative min-w-0 overflow-hidden p-3 sm:p-5"
            initial={reduceMotion ? false : { opacity: 0, rotateY: 65, x: 20 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={reduceMotion ? { opacity: 0, pointerEvents: "none" } :
              { opacity: 0, rotateY: -65, x: -20, pointerEvents: "none" }}
            transition={{ duration: reduceMotion ? 0.1 : 0.32, ease: "easeInOut" }}
            style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}>
            <div className="absolute left-1/2 top-0 h-4 w-24 -translate-x-1/2 rounded-b-lg border-x-[3px] border-b-[3px] border-ink-black bg-slate-300"
              aria-hidden="true" />
            <div className="flex min-w-0 items-start justify-between gap-2 pt-2">
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-blueprint-navy">
                  SURVIVAL LOG // DAY {String(clamp(Math.floor(round), 1, GATES.length)).padStart(2, "0")}
                </p>
                <h2 className="font-display text-xl font-black leading-tight sm:text-2xl">
                  Captain's Logbook
                </h2>
              </div>
              <div role="timer" aria-label={Math.ceil(roundLeft) + " seconds left in decision round"}
                className={"shrink-0 rounded-lg border-[3px] border-ink-black px-2 py-1 text-center font-mono font-black tabular-nums " +
                  (roundLeft <= 5 ? "bg-status-crit" : "bg-status-warn")}>
                <span className="block text-[9px]">DECIDE</span>
                <span className="text-2xl">{Math.ceil(roundLeft)}s</span>
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full border border-ink-black bg-slate-300"
              aria-label="Decision time remaining">
              <motion.div className={"h-full " + (roundLeft <= 5 ? "bg-status-crit" : "bg-role-finance")}
                animate={{ width: (roundLeft / ROUND_DURATION_SEC) * 100 + "%" }}
                transition={{ duration: 0.35 }} />
            </div>

            {question ? (
              <>
                <div className="mt-3 flex min-w-0 items-center gap-2 rounded-lg border-2 border-ink-black bg-[#E2E8F0] p-1.5">
                  <div className="shrink-0 rounded-md border-2 border-ink-black bg-blueprint-navy">
                    <CrewmateAvatar role={activeRole}
                      state={logbookError ? "panic" : logbookPass ? "cheer" : "work"}
                      actionEffect={logbookActionEffect}
                      statusBadgeText={logbookError ? "ALERT" : logbookPass ? "PASS" : undefined}
                      size={isPhoneConsole ? 34 : 55} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[9px] font-bold text-blueprint-navy">
                      {isPhoneConsole ? "LOGBOOK KEEPER" : "LOGBOOK KEEPER // " + activeProfile.squadClass}
                    </p>
                    <p className="break-words font-display text-sm font-black leading-tight sm:text-base">
                      {activeProfile.codename}
                    </p>
                    <p className="truncate font-mono text-[10px] text-slate-600">
                      {activePlayerName ? activePlayerName + " · " : ""}{activeProfile.gearLabel}
                    </p>
                  </div>
                </div>
                <div role="status" className={"mt-2 rounded-lg border-2 border-ink-black px-2 py-1 text-center font-display text-sm font-black " +
                  (isMyTurn ? "bg-status-ok" : "bg-status-warn")}>
                  {isMyTurn ? "YOUR TURN" :
                    isPhoneConsole ? "LOGBOOK WITH " + playerLabel.toUpperCase() :
                      playerLabel.toUpperCase() + "'S TURN"}
                </div>

                {isPhoneConsole && !isMyTurn ? (
                  <div className="mt-3 rounded-xl border-[3px] border-ink-black bg-blueprint-navy p-4 text-center text-paper-cream">
                    <p className="font-mono text-xs font-bold text-status-warn">CREW DECISION IN PROGRESS</p>
                    <p className="mt-2 break-words font-display text-lg font-black">{question.title}</p>
                    <p className="mt-2 text-sm text-slate-200">
                      Waiting for {playerLabel}…
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-3">
                      <span className="inline-block max-w-full break-words rounded-md border-2 border-ink-black bg-role-spacecraft px-2 py-0.5 font-mono text-[10px] font-black">
                        {question.nasa_concept_badge}
                      </span>
                      <p className="mt-2 font-mono text-[10px] font-bold tracking-wider text-blueprint-navy">
                        ENTRY {String(activeGateIndex + 1).padStart(2, "0")} // {GATES[activeGateIndex].label}
                      </p>
                      <h3 className="mt-1 break-words font-display text-lg font-black leading-tight sm:text-xl">
                        {question.title}
                      </h3>
                      <p className="mt-1 break-words text-sm leading-snug text-slate-700">
                        {question.scenario_context}
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {question.options.slice(0, 4).map((option, index) => (
                        <button key={option.option_id} type="button" disabled={!canAnswer}
                          onClick={() => answer(option.option_id)}
                          aria-label={"Option " + (index + 1) + ": " + option.label + ". " + option.engineering_tradeoff_hint}
                          className={"paper-btn min-w-0 p-2.5 text-left text-ink-black " +
                            (isPhoneConsole ? "min-h-[78px] " : "min-h-[70px] ") +
                            (hasSubmitted && submittedAnswer?.optionId === option.option_id
                              ? "bg-status-ok" : "bg-paper-cream")}>
                          <span className="flex min-w-0 items-start gap-2">
                            <span className="shrink-0 rounded-md border-2 border-ink-black bg-role-finance px-2 py-0.5 font-mono text-sm font-black tabular-nums">
                              {index + 1}
                            </span>
                            <span className="min-w-0 break-words">
                              <span className="block font-display text-base font-black leading-tight">
                                {option.label}
                              </span>
                              <span className="mt-0.5 block font-mono text-[11px] font-normal leading-snug text-slate-700">
                                {option.engineering_tradeoff_hint}
                              </span>
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 font-mono text-[10px] font-bold text-slate-600">
                      {hasSubmitted ? "Decision sent to Mission Control." :
                        isMyTurn ? "Tap an entry or press 1-4." : "Crew decision in progress."}
                    </p>
                  </>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <h3 className="font-display text-xl font-black">Awaiting flight telemetry</h3>
                <p className="mt-2 font-mono text-xs text-slate-600">
                  Mission Control is preparing the next log entry.
                </p>
              </div>
            )}
            <AnimatePresence>
              {visibleResult && (
                <motion.div key={visibleResult.round + "-feedback"} role="status" aria-live="polite"
                  className={"mt-3 rounded-xl border-[3px] border-ink-black p-3 shadow-paper " +
                    (visibleResult.gate_status === "PASS" ? "bg-status-ok" :
                      visibleResult.gate_status === "DEGRADED" ? "bg-status-warn" : "bg-status-crit")}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}>
                  <p className="font-mono text-xs font-black">
                    {visibleResult.gate_status} // CHAPTER {String(visibleResult.round).padStart(2, "0")}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold">{visibleResult.immediate_feedback}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

export default Flight60sView;
