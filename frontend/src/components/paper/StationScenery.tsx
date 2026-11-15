// Owner: Leonardo (Art direction 2026-11-15) — Per-station scene banner drawn above each minigame.
// Gives every phase its own setting without touching minigame logic:
//   vab      → vertical assembly hangar: yellow crane, scaffolding, rocket split into zones (1A, 1B, 2A, 2B)
//   ascent   → Earth curvature ascent + dotted trajectory map to the mission target (3A, 4A)
//   station  → modular orbital station with gold grid solar wings and docking ring (4B)
//   rover    → layered warm terrain, 6-wheel rover with arm + analyzer laser at glowing crystals (3B)
import { motion, useReducedMotion } from "framer-motion";
import type { MissionIdType, RoleType } from "../../types/game";

export type StationScene = "vab" | "ascent" | "station" | "rover";

const INK = "#0F172A";

export function sceneFor(roleId: RoleType, wave: 1 | 2): StationScene {
  if (roleId === "finance_launch" || roleId === "spacecraft_mass") return "vab";
  if (roleId === "orbit_power") return wave === 1 ? "ascent" : "rover";
  return wave === 1 ? "ascent" : "station";
}

const SCENE_LABEL: Record<StationScene, string> = {
  vab: "ASSEMBLY HANGAR",
  ascent: "ASCENT & TRAJECTORY",
  station: "ORBITAL BASE",
  rover: "SURFACE ROVER",
};

const TARGET_COLOR: Record<MissionIdType, string> = {
  artemis_moon: "#CBD5E1",
  asteroid_hunter: "#A8825A",
  mars_sample_return: "#E4572E",
};

function VabScene() {
  return (
    <g>
      {/* scaffolding towers */}
      {[180, 1360].map((x) => (
        <g key={x}>
          <rect x={x} y="20" width="60" height="200" fill="none" stroke="#94A3B8" strokeWidth="6" />
          {Array.from({ length: 5 }, (_, i) => (
            <path key={i} d={`M${x} ${20 + i * 40} L${x + 60} ${60 + i * 40} M${x + 60} ${20 + i * 40} L${x} ${60 + i * 40}`} stroke="#64748B" strokeWidth="4" />
          ))}
        </g>
      ))}
      {/* yellow overhead crane */}
      <rect x="120" y="14" width="1360" height="20" fill="#FACC15" stroke={INK} strokeWidth="5" />
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1={130 + i * 62} y1="16" x2={160 + i * 62} y2="32" stroke={INK} strokeWidth="3" />
      ))}
      <rect x="700" y="34" width="60" height="22" fill="#FACC15" stroke={INK} strokeWidth="4" />
      <line x1="730" y1="56" x2="730" y2="78" stroke={INK} strokeWidth="4" />
      {/* horizontal rocket split into zones: nose | payload | orange core | engines + side boosters */}
      <g transform="translate(330 150)">
        <rect x="120" y="-62" width="760" height="22" rx="8" fill="#F8FAFC" stroke={INK} strokeWidth="5" />
        <rect x="120" y="40" width="760" height="22" rx="8" fill="#F8FAFC" stroke={INK} strokeWidth="5" />
        <rect x="200" y="-38" width="520" height="76" fill="#F97316" stroke={INK} strokeWidth="6" />
        {[300, 400, 500, 600].map((x) => (
          <line key={x} x1={x} y1="-38" x2={x} y2="38" stroke="#C2410C" strokeWidth="3" />
        ))}
        <rect x="80" y="-38" width="120" height="76" fill="#F8FAFC" stroke={INK} strokeWidth="6" />
        <circle cx="140" cy="0" r="14" fill="#38BDF8" stroke={INK} strokeWidth="4" />
        <path d="M80 -38 Q-10 0 80 38 Z" fill="#F8FAFC" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <path d="M720 -38 L790 -52 L790 52 L720 38 Z" fill="#475569" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        {/* zone tags */}
        {[
          [40, "NOSE"],
          [140, "PAYLOAD"],
          [460, "CORE TANK"],
          [760, "ENGINES"],
        ].map(([x, t]) => (
          <g key={t as string} transform={`translate(${x} -78)`}>
            <rect x="-48" y="-14" width="96" height="22" rx="5" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
            <text x="0" y="2" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700" fill="#38BDF8">
              {t}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}

function AscentScene({ target }: { target: string }) {
  return (
    <g>
      {/* Earth curvature with atmosphere glow */}
      <ellipse cx="300" cy="420" rx="520" ry="270" fill="#2563EB" stroke={INK} strokeWidth="6" />
      <ellipse cx="300" cy="420" rx="540" ry="290" fill="none" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="14" />
      <path d="M40 230 Q140 190 220 214 T380 200" fill="none" stroke="#22C55E" strokeWidth="18" strokeLinecap="round" opacity="0.8" />
      {/* ascent arc + rocket */}
      <path d="M260 160 Q380 40 620 52" fill="none" stroke="#F8FAFC" strokeWidth="4" strokeDasharray="10 10" />
      <g transform="translate(620 52) rotate(80)">
        <rect x="-10" y="-30" width="20" height="50" rx="6" fill="#F97316" stroke={INK} strokeWidth="4" />
        <path d="M-10 -30 Q0 -52 10 -30 Z" fill="#F8FAFC" stroke={INK} strokeWidth="4" />
        <path d="M-7 20 Q0 44 7 20 Z" fill="#FACC15" stroke={INK} strokeWidth="3" />
      </g>
      {/* trajectory map */}
      <g transform="translate(1040 110)">
        <rect x="-300" y="-92" width="600" height="184" rx="16" fill="#0F172A" fillOpacity="0.55" stroke="#38BDF8" strokeOpacity="0.5" strokeWidth="3" />
        <circle cx="-210" cy="0" r="26" fill="#2563EB" stroke={INK} strokeWidth="5" />
        <ellipse cx="-210" cy="0" rx="60" ry="34" fill="none" stroke="#F8FAFC" strokeDasharray="6 8" strokeWidth="3" />
        <path d="M-150 0 C-40 -110 120 -100 200 0" fill="none" stroke="#FACC15" strokeWidth="4" strokeDasharray="12 9" />
        <line x1="40" y1="-60" x2="96" y2="-74" stroke="#EF4444" strokeWidth="4" markerEnd="url(#ss-arrow)" />
        <circle cx="210" cy="0" r="30" fill={target} stroke={INK} strokeWidth="5" />
        <circle cx="200" cy="-8" r="7" fill={INK} opacity="0.25" />
      </g>
    </g>
  );
}

function StationScene() {
  return (
    <g>
      <ellipse cx="800" cy="470" rx="900" ry="300" fill="#2563EB" stroke={INK} strokeWidth="6" />
      <ellipse cx="800" cy="470" rx="920" ry="320" fill="none" stroke="#38BDF8" strokeOpacity="0.4" strokeWidth="14" />
      <g transform="translate(800 92)">
        {[-1, 1].map((side) => (
          <g key={side} transform={`translate(${side * 300} 0)`}>
            <rect x="-180" y="-46" width="360" height="92" fill="#B45309" stroke={INK} strokeWidth="5" />
            {[-120, -60, 0, 60, 120].map((x) => (
              <line key={x} x1={x} x2={x} y1="-46" y2="46" stroke="#FACC15" strokeWidth="3" />
            ))}
            <line x1="-180" x2="180" y1="0" y2="0" stroke="#FACC15" strokeWidth="3" />
          </g>
        ))}
        <rect x="-140" y="-8" width="280" height="16" fill="#94A3B8" stroke={INK} strokeWidth="4" />
        {[-70, 70].map((x) => (
          <rect key={x} x={x - 40} y="-34" width="80" height="68" rx="16" fill="#F8FAFC" stroke={INK} strokeWidth="5" />
        ))}
        <circle cx="0" cy="0" r="30" fill="#F8FAFC" stroke={INK} strokeWidth="5" />
        <circle cx="0" cy="0" r="16" fill="#38BDF8" stroke={INK} strokeWidth="4" />
        <circle cx="0" cy="-58" r="18" fill="none" stroke="#FACC15" strokeWidth="6" />
        {/* dish */}
        <path d="M150 -40 Q190 -72 214 -36" fill="#F8FAFC" stroke={INK} strokeWidth="4" />
      </g>
    </g>
  );
}

function RoverScene({ reduce }: { reduce: boolean }) {
  return (
    <g>
      <path d="M0 220 L0 120 Q300 80 600 112 T1200 96 T1600 110 L1600 220 Z" fill="#C2410C" stroke={INK} strokeWidth="6" />
      <path d="M0 220 L0 160 Q400 132 800 156 T1600 146 L1600 220 Z" fill="#EA580C" stroke={INK} strokeWidth="6" />
      <path d="M0 220 L0 196 Q800 180 1600 192 L1600 220 Z" fill="#F97316" stroke={INK} strokeWidth="5" />
      {[[1120, 150], [1180, 158], [360, 160]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y - 14} r="26" fill="#38BDF8" opacity="0.2" />
          <path d={`M${x - 12} ${y} l12 -34 12 34 Z`} fill="#38BDF8" stroke={INK} strokeWidth="4" />
        </g>
      ))}
      <motion.g
        animate={reduce ? undefined : { x: [0, 24, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <g transform="translate(820 150)">
          <rect x="-120" y="-36" width="240" height="36" rx="10" fill="#F8FAFC" stroke={INK} strokeWidth="6" />
          <path d="M-70 -36 L-48 -84 L46 -84 L66 -36 Z" fill="#38BDF8" fillOpacity="0.35" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
          {/* astronaut silhouette in the cabin */}
          <circle cx="-4" cy="-60" r="14" fill="#F59E0B" stroke={INK} strokeWidth="4" />
          <rect x="-12" y="-66" width="18" height="9" rx="4" fill="#FEF3C7" stroke={INK} strokeWidth="2" />
          <path d="M110 -24 L160 -66 L206 -46" fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M110 -24 L160 -66 L206 -46" fill="none" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <motion.line
            x1="206"
            y1="-46"
            x2="296"
            y2="-4"
            stroke="#EF4444"
            strokeWidth="4"
            strokeDasharray="8 6"
            animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          {[-96, -32, 32, 96].map((x) => (
            <g key={x} transform={`translate(${x} 6)`}>
              <circle r="22" fill="#334155" stroke={INK} strokeWidth="6" />
              <circle r="8" fill="#94A3B8" stroke={INK} strokeWidth="3" />
            </g>
          ))}
        </g>
      </motion.g>
    </g>
  );
}

export function StationScenery({
  roleId,
  wave,
  missionId,
  compact = false,
}: {
  roleId: RoleType;
  wave: 1 | 2;
  missionId: MissionIdType;
  compact?: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const scene = sceneFor(roleId, wave);
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border-[3px] border-ink-black shadow-paper-sm ${compact ? "h-14" : "h-20 sm:h-28"}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1600 220" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`ss-bg-${scene}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scene === "rover" ? "#7C2D12" : "#1E293B"} />
            <stop offset="100%" stopColor={scene === "rover" ? "#9A3412" : "#334155"} />
          </linearGradient>
          <pattern id="ss-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0 L0 0 0 32" fill="none" stroke="#94A3B8" strokeOpacity="0.14" strokeWidth="1.5" />
          </pattern>
          <marker id="ss-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" fill="#EF4444" />
          </marker>
        </defs>
        <rect width="1600" height="220" fill={`url(#ss-bg-${scene})`} />
        <rect width="1600" height="220" fill="url(#ss-grid)" />
        {scene !== "rover" &&
          [[90, 40], [520, 30], [980, 24], [1500, 60], [1250, 190], [60, 180]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 2.5 : 3.5} fill="#F8FAFC" opacity="0.75" />
          ))}
        {scene === "vab" && <VabScene />}
        {scene === "ascent" && <AscentScene target={TARGET_COLOR[missionId]} />}
        {scene === "station" && <StationScene />}
        {scene === "rover" && <RoverScene reduce={reduce} />}
      </svg>
      <span className="absolute left-2 top-2 rounded border-2 border-ink-black bg-paper-cream px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-ink-black">
        {SCENE_LABEL[scene]}
      </span>
    </div>
  );
}

export default StationScenery;
