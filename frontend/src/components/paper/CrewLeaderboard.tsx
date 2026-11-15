// Owner: Leonardo (Task LEO-07) — End-of-mission crew leaderboard (podium + ranked list).
import { motion, useReducedMotion } from "framer-motion";
import { Bot, Crown, Lock, Radio, ShieldCheck, Users } from "lucide-react";
import { CrewmateAvatar, ROLE_CHARACTER_PROFILE } from "./CrewmateAvatar";
import type { RoleType } from "../../types/game";

/** One crew seat as ranked by the server (`reporte_final_mision.leaderboard`, docs/08). */
export interface LeaderboardEntry {
  role: RoleType;
  player_name: string;
  is_ai: boolean;
  gate: string;
  gate_status: "PASS" | "DEGRADED" | "CRITICAL" | string;
  stations_locked: number;
  flight_calls: number;
  points: number;
  rank: number;
}

export interface CollaborationSummary {
  score: number;
  humans: number;
  own_locks_pct: number;
  answered_pct: number;
  gates_ready_at_liftoff: number;
}

interface CrewLeaderboardProps {
  entries: LeaderboardEntry[];
  collaboration?: CollaborationSummary;
  summaries: Partial<Record<RoleType, string>>;
  myRole?: RoleType;
  missionFailed: boolean;
  compact: boolean;
  /** Checkpoint the final verdict asks to revisit (it may have degraded during the flight). */
  flaggedGate?: string | null;
}

const CHECKPOINT_NAME: Record<string, string> = {
  NODE_1_LAUNCH: "Liftoff",
  NODE_2_PROPULSION: "Engine burn",
  NODE_3_EVENT: "Space hazard",
  NODE_4_DOWNLINK: "Call Earth",
};
const STATUS_WORD: Record<string, { word: string; color: string }> = {
  PASS: { word: "Ready", color: "bg-status-ok" },
  DEGRADED: { word: "Risky", color: "bg-status-warn" },
  CRITICAL: { word: "Failing", color: "bg-status-crit" },
};
/** Seat names for AI-flown roles (so the podium never shows three identical "AI" names). */
const SEAT_NAME: Record<RoleType, string> = {
  finance_launch: "Engineer",
  spacecraft_mass: "Medic",
  orbit_power: "Soldier",
  science_comms: "Defender",
};
const displayName = (e: LeaderboardEntry) => (e.is_ai ? `${SEAT_NAME[e.role]} · AI` : e.player_name);
/** Podium slots left-to-right: 2nd, 1st, 3rd (visual only). */
const PODIUM_SLOTS: Array<{ rank: number; height: string }> = [
  { rank: 2, height: "h-16 sm:h-20" },
  { rank: 1, height: "h-24 sm:h-28" },
  { rank: 3, height: "h-12 sm:h-14" },
];

export function CrewLeaderboard({ entries, collaboration, summaries, myRole, missionFailed, compact, flaggedGate }: CrewLeaderboardProps) {
  const reduceMotion = useReducedMotion();
  const ranked = [...entries].sort((a, b) => a.rank - b.rank);
  const topPoints = Math.max(1, ...ranked.map((e) => e.points));
  const byRank = (rank: number) => ranked.find((e) => e.rank === rank);

  return (
    <section className="flash-panel overflow-hidden" aria-label="Crew leaderboard">
      <div className="hazard-stripe-bar h-2" />
      <div className="p-3 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[11px] font-black uppercase tracking-widest text-sky-glow">Crew leaderboard</p>
            <h2 className="font-display text-xl font-black uppercase sm:text-2xl">Who carried the mission</h2>
          </div>
          {collaboration && (
            <div className="flex items-center gap-2 rounded-xl border-[3px] border-ink-black bg-space-ink px-3 py-1.5" title="Team score: own locks 40%, flight calls answered 30%, checkpoints ready at liftoff 30%">
              <Users className="h-4 w-4 text-sky-glow" aria-hidden="true" />
              <span className="font-mono text-[10px] font-bold uppercase text-slate-300">Teamwork</span>
              <span className="font-display text-lg font-black tabular-nums text-paper-cream">{collaboration.score}/100</span>
            </div>
          )}
        </div>

        {/* Podium: top 3 seats on stepped pedestals */}
        <div className="relative mx-auto mt-3 grid max-w-xl grid-cols-3 items-end gap-2 sm:gap-4">
          <div className="hangar-glow pointer-events-none absolute inset-x-0 -top-4 h-40" aria-hidden="true" />
          {PODIUM_SLOTS.map(({ rank, height }, i) => {
            const entry = byRank(rank);
            if (!entry) return <div key={rank} />;
            const profile = ROLE_CHARACTER_PROFILE[entry.role];
            const down = missionFailed || entry.gate_status === "CRITICAL";
            return (
              <div key={rank} className="relative flex min-w-0 flex-col items-center">
                <motion.div
                  initial={reduceMotion ? false : { y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 240, damping: 18 }}
                  className="relative"
                >
                  {rank === 1 && !missionFailed && (
                    <Crown className="absolute -top-4 left-1/2 h-6 w-6 -translate-x-1/2 text-tank-orange drop-shadow" aria-hidden="true" />
                  )}
                  <CrewmateAvatar
                    role={entry.role}
                    state={down ? "panic" : "cheer"}
                    actionEffect={down ? "error" : "complete"}
                    size={compact ? 52 : rank === 1 ? 84 : 70}
                  />
                </motion.div>
                <p className="mt-1 w-full truncate text-center font-display text-xs font-black text-paper-cream sm:text-sm">
                  {displayName(entry)}
                </p>
                <p className="font-mono text-[10px] font-bold tabular-nums text-amber-300">{entry.points} pts</p>
                <div className={`metal-grate mt-1 flex w-full items-start justify-center rounded-t-lg border-[3px] border-b-0 border-ink-black pt-1 ${height}`}>
                  <span className="rounded border-2 border-ink-black px-1.5 font-mono text-xs font-black text-ink-black"
                    style={{ backgroundColor: profile.suit }}>
                    {rank}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ranked list: every seat with what earned its points */}
        <ol className="mt-0 space-y-2 border-t-[3px] border-ink-black pt-3">
          {ranked.map((entry) => {
            const profile = ROLE_CHARACTER_PROFILE[entry.role];
            const status = STATUS_WORD[entry.gate_status] ?? { word: entry.gate_status, color: "bg-slate-300" };
            const isMe = entry.role === myRole && !entry.is_ai;
            return (
              <li key={entry.role}
                className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border-[3px] border-ink-black p-2 sm:gap-3 sm:p-2.5 ${isMe ? "bg-paper-cream text-ink-black" : "bg-space-ink/80 text-paper-cream"}`}>
                <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-ink-black font-mono text-sm font-black text-ink-black"
                  style={{ backgroundColor: profile.suit }} aria-label={`Rank ${entry.rank}`}>
                  {entry.rank}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="truncate font-display text-sm font-black">{displayName(entry)}</span>
                    {isMe && <span className="rounded border border-ink-black bg-status-ok px-1 font-mono text-[9px] font-black text-ink-black">YOU</span>}
                    {entry.is_ai && (
                      <span className="inline-flex items-center gap-0.5 rounded border border-ink-black bg-status-warn px-1 font-mono text-[9px] font-black text-ink-black">
                        <Bot className="h-3 w-3" aria-hidden="true" /> AI
                      </span>
                    )}
                    <span className={`font-mono text-[10px] font-bold uppercase ${isMe ? "text-blueprint-navy" : "text-slate-400"}`}>{profile.label}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className={`inline-flex items-center gap-1 rounded-md border-2 border-ink-black px-1.5 py-0.5 font-mono text-[10px] font-black text-ink-black ${status.color}`}>
                      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                      {CHECKPOINT_NAME[entry.gate] ?? entry.gate}: {status.word}
                    </span>
                    {flaggedGate && flaggedGate.trim().toUpperCase() === entry.gate && (
                      <span className="inline-flex items-center rounded-md border-2 border-ink-black bg-status-crit px-1.5 py-0.5 font-mono text-[10px] font-black text-ink-black">
                        {entry.gate_status === "PASS" ? "Revisit: hit in flight" : "Revisit"}
                      </span>
                    )}
                    {!entry.is_ai && (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-md border-2 border-ink-black bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-black text-ink-black">
                          <Lock className="h-3 w-3" aria-hidden="true" /> {entry.stations_locked}/2 stations
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border-2 border-ink-black bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-black text-ink-black">
                          <Radio className="h-3 w-3" aria-hidden="true" /> {entry.flight_calls} flight call{entry.flight_calls === 1 ? "" : "s"}
                        </span>
                      </>
                    )}
                  </div>
                  {summaries[entry.role] && (
                    <p className={`mt-1 line-clamp-2 text-xs leading-snug ${isMe ? "text-slate-700" : "text-slate-300"}`}>
                      {summaries[entry.role]}
                    </p>
                  )}
                </div>
                <div className="w-14 text-right sm:w-20">
                  <span className="block font-display text-lg font-black tabular-nums">{entry.points}</span>
                  <span className="block font-mono text-[9px] font-bold uppercase opacity-70">pts</span>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full border border-ink-black bg-slate-700">
                    <div className="h-full bg-tank-orange" style={{ width: `${(entry.points / topPoints) * 100}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-2 font-mono text-[10px] leading-snug text-slate-400">
          Points: your checkpoint as measured at liftoff (Ready 50 · Risky 25 · Failing 0) + 10 per station you locked yourself
          + 5 per flight call you answered. Empty seats are flown by the AI and only earn checkpoint points.
        </p>
      </div>
    </section>
  );
}

export default CrewLeaderboard;
