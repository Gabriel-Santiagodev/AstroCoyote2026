// Owner: Leonardo (2026-11-15) — Full-screen cutscenes between game windows:
//   walk  → the squad marches through the ship to the next station door (door slides open)
//   sync  → same corridor, "sharing your choices" while the crew regroups
//   liftoff → per-mission launch: gantry, smoke, rocket climbing toward the mission's target
// Background: AI-art nebula (falls back to the CSS hangar backdrop if the file is missing).
import { useState } from "react";
import { t } from "../../i18n";
import { motion, useReducedMotion } from "framer-motion";
import { CrewmateAvatar } from "./CrewmateAvatar";
import { Flame, Gantry, Rocket, Smoke } from "./KeyArt";
import type { MissionIdType, RoleType } from "../../types/game";

export type CutsceneKind = "walk" | "sync" | "liftoff";

const SQUAD: RoleType[] = ["finance_launch", "spacecraft_mass", "orbit_power", "science_comms"];

/** Visual-only destination styling per mission (colors match the lobby planets). */
const DESTINATION: Record<MissionIdType, { label: string; color: string; spots: string; scale: number }> = {
  artemis_moon: { label: "To the Moon", color: "#CBD5E1", spots: "#94A3B8", scale: 0.9 },
  asteroid_hunter: { label: "To the asteroid", color: "#A8825A", spots: "#6B4F35", scale: 1 },
  mars_sample_return: { label: "To Mars", color: "#E4572E", spots: "#9A3412", scale: 1.1 },
};

function Backdrop({ src }: { src: string }) {
  const [ok, setOk] = useState(true);
  return (
    <div className="absolute inset-0">
      <div className="hangar-backdrop absolute inset-0" />
      {ok && <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" onError={() => setOk(false)} />}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0),rgba(15,23,42,0.7))]" />
    </div>
  );
}

export function MissionCutscene({
  kind,
  missionId,
  myRole,
  title,
  subtitle,
  durationSec,
  planetSrc,
  backgroundSrc = "/assets/art/bg/nebula.webp",
}: {
  kind: CutsceneKind;
  missionId: MissionIdType;
  myRole: RoleType;
  title: string;
  subtitle: string;
  durationSec: number;
  planetSrc?: string;
  backgroundSrc?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const dest = DESTINATION[missionId];

  return (
    <motion.div
      className="fixed inset-0 z-30 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="status"
      aria-label={`${title}. ${subtitle}`}
    >
      <Backdrop src={backgroundSrc} />

      {kind === "liftoff" ? (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* destination target */}
          <motion.g initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: dest.scale, opacity: 1 }}
            transition={{ duration: durationSec }} style={{ transformOrigin: "1320px 170px", transformBox: "view-box" }}>
            {planetSrc ? (
              <image href={planetSrc} x="1220" y="70" width="200" height="200" />
            ) : (
              <>
                <circle cx="1320" cy="170" r="90" fill={dest.color} stroke="#0F172A" strokeWidth="8" />
                <circle cx="1290" cy="140" r="22" fill={dest.spots} />
                <circle cx="1350" cy="200" r="15" fill={dest.spots} />
              </>
            )}
          </motion.g>
          {/* ground */}
          <rect x="0" y="820" width="1600" height="80" fill="#334155" stroke="#0F172A" strokeWidth="6" />
          <Gantry />
          <motion.g
            initial={{ y: 0 }}
            animate={reduce ? { y: -60 } : { y: [0, 10, -40, -1100] }}
            transition={{ duration: durationSec, times: [0, 0.2, 0.45, 1], ease: "easeIn" }}
          >
            <Flame reduce={reduce} />
            <g transform="translate(800 510)">
              <Rocket />
            </g>
          </motion.g>
          <motion.g initial={{ opacity: 0.4, scale: 0.8 }} animate={{ opacity: 1, scale: 1.25 }}
            transition={{ duration: durationSec }} style={{ transformOrigin: "800px 860px", transformBox: "view-box" }}>
            <Smoke />
          </motion.g>
        </svg>
      ) : (
        <>
          {/* corridor: deck + bulkhead door at the right */}
          <div className="metal-grate absolute inset-x-0 bottom-[18%] h-10 border-y-[4px] border-ink-black" />
          <div className="absolute bottom-[calc(18%+2.5rem)] right-[8%] h-48 w-28 overflow-hidden rounded-t-xl border-[4px] border-b-0 border-ink-black bg-space-ink sm:h-60 sm:w-36">
            <div className="absolute inset-x-0 top-0 h-3 bg-status-warn" />
            {[0, 1].map((side) => (
              <motion.div
                key={side}
                className="absolute top-3 h-full w-1/2 border-ink-black bg-hangar-slate"
                style={{ left: side === 0 ? 0 : "50%", borderRightWidth: side === 0 ? 3 : 0, borderLeftWidth: side === 1 ? 3 : 0 }}
                initial={{ x: "0%" }}
                animate={{ x: side === 0 ? "-90%" : "90%" }}
                transition={{ delay: durationSec * 0.45, duration: 0.5 }}
              />
            ))}
          </div>
          {/* the squad marching */}
          <motion.div
            className="absolute bottom-[calc(18%+2.5rem)] flex items-end gap-1 sm:gap-3"
            initial={{ left: "-30%" }}
            animate={{ left: kind === "sync" ? "34%" : "62%" }}
            transition={{ duration: durationSec * 0.9, ease: "easeInOut" }}
          >
            {SQUAD.map((role, i) => (
              <motion.div
                key={role}
                animate={reduce ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.08 }}
                className="relative flex flex-col items-center"
              >
                {role === myRole && (
                  <span className="mb-1 rounded border-2 border-ink-black bg-paper-cream px-1.5 font-mono text-[10px] font-bold text-ink-black">
                    {t("YOU")}
                  </span>
                )}
                <CrewmateAvatar role={role} state="walk" actionEffect="thruster" size={role === myRole ? 96 : 80} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* caption */}
      <div className="absolute inset-x-0 top-[14%] flex justify-center px-4">
        <motion.div
          initial={{ y: -20, opacity: 0, rotate: -3 }}
          animate={{ y: 0, opacity: 1, rotate: -2 }}
          className="rounded-2xl border-4 border-ink-black bg-paper-cream px-6 py-3 text-center text-ink-black shadow-paper-lg"
        >
          <div className="font-display text-3xl font-black uppercase sm:text-5xl">{title}</div>
          <div className="mt-0.5 font-mono text-xs font-bold uppercase tracking-widest text-slate-600 sm:text-sm">
            {kind === "liftoff" ? `${t(dest.label)} · ${subtitle}` : subtitle}
          </div>
        </motion.div>
      </div>
      <span className="absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-widest text-slate-400/80">{t("AI-generated art")}</span>
    </motion.div>
  );
}

export default MissionCutscene;
