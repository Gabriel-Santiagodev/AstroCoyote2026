// Owner: Leonardo (Task LEO-02 / LEO-09) — Shared 2D Flash-Game Loading & Role Deploy Screen
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Radio, ShieldCheck, Smartphone, Tv } from "lucide-react";
import nasaCatalog from "../../data/nasa_catalog.json";
import {
  CrewmateAvatar,
  ROLE_CHARACTER_PROFILE,
} from "./CrewmateAvatar";
import type { MissionIdType, RoleType } from "../../types/game";

export type LoadingPhaseVariant =
  | "boot"
  | "lobby_to_wave1"
  | "wave1_to_wave2"
  | "wave2_to_flight"
  | "flight_to_report";

export interface MissionLoadingScreenProps {
  variant?: LoadingPhaseVariant;
  missionId?: MissionIdType;
  roleId?: RoleType;
  title?: string;
  subtitle?: string;
  /** Optional externally driven progress (0..100). If omitted, animates across `durationMs`. */
  progressPct?: number;
  /** Auto-completion timer in milliseconds when `onComplete` is supplied. */
  durationMs?: number;
  onComplete?: () => void;
  /** Switches copy/badge between Host Big-Screen Main Stage and Phone Handheld Controller. */
  isMobileClient?: boolean;
  /** Optional Skip / Ready action when user wants to jump immediately in preview mode. */
  allowSkip?: boolean;
}

const VARIANT_DEFAULTS: Record<
  LoadingPhaseVariant,
  { title: string; subtitle: string; badge: string; steps: string[] }
> = {
  boot: {
    badge: "STAGE 01 · HANGAR LINK",
    title: "INITIALIZING MISSION CONTROL",
    subtitle: "Synchronizing Astro Squad loadouts, physics catalog, and room telemetry...",
    steps: [
      "Checking NIMA WGS84 constants & NASA mission tolerances",
      "Loading 2D Astro Squad consoles & handheld PIN router",
      "Preparing AI Autopilot contingency controllers",
    ],
  },
  lobby_to_wave1: {
    badge: "WAVE 1 · DESIGN STATIONS",
    title: "DEPLOYING ASTRO SQUAD TO STATION 1",
    subtitle: "Opening individual subsystem consoles on each player's handheld screen...",
    steps: [
      "Locking room PIN & crew role assignments",
      "Mounting Station 1 instruments & budget constraints",
      "Activating live mutacion_en_vivo telemetry bus",
    ],
  },
  wave1_to_wave2: {
    badge: "TELEMETRY SYNC · 5S GATE",
    title: "CROSS-LINKING WAVE 1 CONSTRAINTS",
    subtitle: "Propagating launcher mass, UFE factor F, CG drift, and FSPL to Station 2...",
    steps: [
      "Collecting locked Wave 1 payloads from squad terminals",
      "Recomputing delta-v envelope & Center-of-Gravity offset",
      "Streaming Station 2 spectral & structural challenges",
    ],
  },
  wave2_to_flight: {
    badge: "LAUNCHPAD · 60S FLIGHT",
    title: "ROLLOUT TO LAUNCHPAD & TRAJECTORY LOCK",
    subtitle: "Assembling consolidated spacecraft configuration for the 4-node flight crisis...",
    steps: [
      "Verifying wet mass vs fairing capacity & thermal shield",
      "Arming 4 turn-based flight engineering gates (15s/round)",
      "Syncing Host Main Stage flight monitor + crew mobile pads",
    ],
  },
  flight_to_report: {
    badge: "DEBRIEF · NASA CAUSAL ENGINE",
    title: "DECODING DEEP SPACE TELEMETRY",
    subtitle: "Evaluating deterministic 4-node decision tree & computing science F1 return...",
    steps: [
      "Auditing NODE_1_LAUNCH through NODE_4_DOWNLINK gates",
      "Calculating Objective 50% + Science F1 30% + Efficiency 20%",
      "Preparing Mission Control causal engineering breakdown",
    ],
  },
};

const ALL_ROLES: RoleType[] = [
  "finance_launch",
  "spacecraft_mass",
  "orbit_power",
  "science_comms",
];

export function MissionLoadingScreen({
  variant = "boot",
  missionId = "artemis_moon",
  roleId = "finance_launch",
  title,
  subtitle,
  progressPct,
  durationMs = 1500,
  onComplete,
  isMobileClient = false,
  allowSkip = false,
}: MissionLoadingScreenProps) {
  const [autoPct, setAutoPct] = useState(8);
  const cfg = VARIANT_DEFAULTS[variant];
  const mission = nasaCatalog.missions[missionId];
  const roleProfile = ROLE_CHARACTER_PROFILE[roleId];

  useEffect(() => {
    if (typeof progressPct === "number") return;
    setAutoPct(8);
    const start = performance.now();
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, Math.round((elapsed / Math.max(300, durationMs)) * 100));
      setAutoPct(pct);
      if (pct >= 100) {
        window.clearInterval(interval);
      }
    }, 45);

    const doneTimer = onComplete
      ? window.setTimeout(() => {
          onComplete();
        }, durationMs)
      : undefined;

    return () => {
      window.clearInterval(interval);
      if (doneTimer) window.clearTimeout(doneTimer);
    };
  }, [progressPct, durationMs, onComplete, variant]);

  const effectivePct = Math.max(0, Math.min(100, progressPct ?? autoPct));
  const activeStepIdx = effectivePct < 38 ? 0 : effectivePct < 78 ? 1 : 2;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-space-ink/95 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-6"
    >
      {/* Blueprint Grid & Arcade Hangar Frame */}
      <div className="blueprint-grid pointer-events-none fixed inset-0 opacity-60" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flash-panel relative my-auto w-full max-w-3xl overflow-hidden p-4 sm:p-6"
      >
        {/* Top Hazard Stripe Arcade Banner */}
        <div className="hazard-stripe-bar -mx-4 -mt-4 mb-4 h-3 border-b-3 border-ink-black sm:-mx-6 sm:-mt-6" />

        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink-black pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="paper-badge bg-role-finance px-2.5 py-1 text-[10px] uppercase tracking-wider text-ink-black">
              <Cpu className="h-3.5 w-3.5" />
              {cfg.badge}
            </span>
            <span className="paper-badge bg-space-ink px-2.5 py-1 text-[10px] uppercase text-paper-cream">
              {isMobileClient ? (
                <>
                  <Smartphone className="h-3.5 w-3.5 text-role-spacecraft" />
                  MOBILE CREW PAD
                </>
              ) : (
                <>
                  <Tv className="h-3.5 w-3.5 text-status-ok" />
                  HOST MAIN STAGE
                </>
              )}
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-role-spacecraft">
            {mission.name}
          </span>
        </div>

        {/* Squad Bay Marching Row */}
        <div className="my-4 rounded-xl border-3 border-ink-black bg-space-ink/90 p-3 shadow-paper-sm">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-slate-400">
            <span>ASTRO SQUAD · DEPLOY BAY</span>
            <span className="text-status-ok">ONLINE LINK VERIFIED</span>
          </div>
          <div className="grid grid-cols-4 items-end gap-2 sm:gap-4">
            {ALL_ROLES.map((r) => {
              const info = ROLE_CHARACTER_PROFILE[r];
              const isMine = r === roleId;
              return (
                <div
                  key={r}
                  className={`flex flex-col items-center rounded-xl border-2 p-2 text-center transition-all ${
                    isMine
                      ? "border-paper-cream bg-blueprint-navy shadow-paper-sm"
                      : "border-ink-black bg-space-ink/60 opacity-80"
                  }`}
                >
                  <CrewmateAvatar
                    role={r}
                    state={isMine ? "walk" : "work"}
                    size={isMobileClient ? 56 : 74}
                  />
                  <span
                    className="mt-1 truncate font-mono text-[9px] font-bold uppercase sm:text-[10px]"
                    style={{ color: info.suit }}
                  >
                    {info.codename}
                  </span>
                  {isMine && (
                    <span className="mt-0.5 rounded bg-status-ok px-1.5 py-0.5 font-mono text-[8px] font-bold text-ink-black">
                      YOUR UNIT
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Title + Assigned Unit Loadout */}
        <div className="grid gap-3 sm:grid-cols-5">
          <div className="space-y-2 sm:col-span-3">
            <h2 className="font-display text-xl font-bold tracking-tight text-paper-cream sm:text-2xl">
              {title ?? cfg.title}
            </h2>
            <p className="text-xs text-slate-300 sm:text-sm">
              {subtitle ?? cfg.subtitle}
            </p>

            {/* Boot Steps Terminal */}
            <ul className="space-y-1.5 rounded-xl border-2 border-ink-black bg-space-ink p-3 font-mono text-[11px]">
              {cfg.steps.map((step, idx) => {
                const done = idx < activeStepIdx || effectivePct >= 99;
                const active = idx === activeStepIdx && effectivePct < 99;
                return (
                  <li
                    key={step}
                    className={`flex items-center gap-2 ${
                      done
                        ? "text-status-ok"
                        : active
                        ? "font-bold text-paper-cream"
                        : "text-slate-500"
                    }`}
                  >
                    <span className="inline-block w-4 text-center">
                      {done ? "[OK]" : active ? ">>" : ".."}
                    </span>
                    <span>{step}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Highlighted Role Briefing Card */}
          <div className="flex flex-col justify-between rounded-xl border-3 border-ink-black bg-space-ink p-3 sm:col-span-2">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span
                  className="paper-badge px-2 py-0.5 text-[10px] text-ink-black"
                  style={{ backgroundColor: roleProfile.suit }}
                >
                  {roleProfile.codename}
                </span>
                <ShieldCheck className="h-4 w-4 text-status-ok" />
              </div>
              <div className="mt-2 font-display text-sm font-bold text-paper-cream">
                {roleProfile.label}
              </div>
              <div className="mt-1 font-mono text-[10px] text-role-spacecraft">
                GEAR: {roleProfile.gearLabel}
              </div>
              <p className="mt-1 text-[11px] leading-snug text-slate-300">
                {roleProfile.briefing}
              </p>
            </div>
            <div className="mt-2 space-y-0.5 border-t border-slate-700 pt-2 font-mono text-[10px] text-slate-300">
              <div>• {roleProfile.wave1Task}</div>
              <div>• {roleProfile.wave2Task}</div>
              <div className="text-role-finance">• {roleProfile.flightGate}</div>
            </div>
          </div>
        </div>

        {/* Arcade Segmented Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <Radio className="h-3.5 w-3.5 animate-pulse text-role-spacecraft" />
              LOADING TELEMETRY CONSOLE...
            </span>
            <span className="tabular-nums text-status-ok">{effectivePct}%</span>
          </div>
          <div className="relative h-5 w-full overflow-hidden rounded-lg border-3 border-ink-black bg-space-ink">
            <div
              className="h-full bg-status-ok transition-all duration-75"
              style={{ width: `${effectivePct}%` }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 14px, #0F172A 14px, #0F172A 17px)",
              }}
            />
          </div>
        </div>

        {/* NASA Verified Fact Footer + Optional Skip */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-ink-black bg-space-ink/80 px-3 py-2 font-mono text-[11px] text-slate-300">
          <p className="flex-1">
            <span className="font-bold text-role-finance">NASA BRIEFING: </span>
            {mission.nasa_real_world_fact}
          </p>
          {allowSkip && onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="paper-btn bg-paper-cream px-3 py-1 text-[11px] text-ink-black"
            >
              CONTINUE &gt;&gt;
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default MissionLoadingScreen;
