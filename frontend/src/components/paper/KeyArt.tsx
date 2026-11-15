// Owner: Leonardo (Art direction 2026-11-15) — Home key art: 16:9 cut-paper aerospace diorama.
// Center: orange/white rocket lifting off a yellow gantry with stylized smoke. Left: the 4 Astro
// Sprites in heroic poses. Right: 6-wheel rover on layered Mars terrain + orbital station above.
// Original "ASTRO COYOTE" patch only — never the NASA logo. Pure SVG + the existing avatars.
import { motion, useReducedMotion } from "framer-motion";
import { CrewmateAvatar, type AvatarState } from "./CrewmateAvatar";
import type { RoleType } from "../../types/game";

const INK = "#0F172A";
const STROKE = 6;

const HERO_POSES: Array<{ role: RoleType; state: AvatarState; left: string; bottom: string; size: number }> = [
  { role: "orbit_power", state: "cheer", left: "2%", bottom: "9%", size: 92 },
  { role: "finance_launch", state: "cheer", left: "13%", bottom: "4%", size: 104 },
  { role: "spacecraft_mass", state: "work", left: "6%", bottom: "28%", size: 74 },
  { role: "science_comms", state: "idle", left: "18%", bottom: "30%", size: 70 },
];

/** Original mission patch: orbit ring + star + coyote ears silhouette. */
function CoyotePatch() {
  return (
    <g transform="translate(96 96)">
      <circle r="70" fill="#F97316" stroke={INK} strokeWidth={STROKE} />
      <circle r="52" fill="#1E293B" stroke={INK} strokeWidth={4} />
      <ellipse rx="62" ry="20" fill="none" stroke="#F8FAFC" strokeWidth={4} transform="rotate(-20)" />
      {/* coyote head */}
      <path d="M-22 18 L-26 -26 L-8 -8 L8 -8 L26 -26 L22 18 L0 34 Z" fill="#F8FAFC" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx="-9" cy="6" r="4" fill={INK} />
      <circle cx="9" cy="6" r="4" fill={INK} />
      <path d="M-4 20 L4 20 L0 26 Z" fill={INK} />
      <path d="M38 -44 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1 Z" fill="#FACC15" stroke={INK} strokeWidth={3} />
      <path id="patch-arc" d="M-46 0 A46 46 0 0 0 46 0" fill="none" />
      <text fontFamily="IBM Plex Mono, monospace" fontSize="15" fontWeight="700" fill="#F8FAFC" letterSpacing="3">
        <textPath href="#patch-arc" startOffset="50%" textAnchor="middle">
          ASTRO COYOTE
        </textPath>
      </text>
    </g>
  );
}

export function Rocket() {
  return (
    <g>
      {/* side boosters */}
      {[-58, 58].map((dx) => (
        <g key={dx} transform={`translate(${dx} 60)`}>
          <rect x="-16" y="-120" width="32" height="200" rx="8" fill="#F8FAFC" stroke={INK} strokeWidth={STROKE} />
          <path d="M-16 -120 Q0 -165 16 -120 Z" fill="#E2E8F0" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          <rect x="-16" y="-20" width="32" height="14" fill="#F97316" stroke={INK} strokeWidth={3} />
          <path d="M-14 80 L-22 104 L22 104 L14 80 Z" fill="#475569" stroke={INK} strokeWidth={4} />
        </g>
      ))}
      {/* core: orange cryogenic tank + white upper stage + ogive */}
      <rect x="-38" y="-170" width="76" height="320" rx="10" fill="#F97316" stroke={INK} strokeWidth={STROKE} />
      {[-120, -60, 0, 60, 110].map((y) => (
        <line key={y} x1="-38" x2="38" y1={y} y2={y} stroke="#C2410C" strokeWidth={3} />
      ))}
      <rect x="-26" y="-160" width="10" height="300" rx="5" fill="#FDBA74" opacity="0.75" />
      <rect x="-38" y="-280" width="76" height="112" rx="8" fill="#F8FAFC" stroke={INK} strokeWidth={STROKE} />
      <circle cx="0" cy="-232" r="15" fill="#38BDF8" stroke={INK} strokeWidth={5} />
      <circle cx="-5" cy="-237" r="5" fill="#F8FAFC" opacity="0.85" />
      <path d="M-38 -280 Q0 -380 38 -280 Z" fill="#F8FAFC" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M-38 150 L-58 186 L58 186 L38 150 Z" fill="#334155" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    </g>
  );
}

export function Flame({ reduce }: { reduce: boolean }) {
  return (
    <motion.g
      style={{ transformOrigin: "800px 700px" }}
      animate={reduce ? undefined : { scaleY: [1, 1.18, 0.94, 1.1, 1] }}
      transition={{ duration: 0.6, repeat: Infinity }}
    >
      <path d="M760 700 Q800 840 840 700 Z" fill="#FACC15" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M778 700 Q800 790 822 700 Z" fill="#F8FAFC" />
      <path d="M718 708 Q742 790 766 708 Z" fill="#FACC15" stroke={INK} strokeWidth={4} />
      <path d="M834 708 Q858 790 882 708 Z" fill="#FACC15" stroke={INK} strokeWidth={4} />
    </motion.g>
  );
}

export function Smoke() {
  const puffs = [
    [560, 830, 70], [650, 852, 82], [740, 868, 90], [860, 868, 92], [960, 852, 80], [1050, 834, 66],
    [610, 790, 52], [990, 792, 54],
  ];
  return (
    <g>
      {puffs.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? "#E2E8F0" : "#F8FAFC"} stroke={INK} strokeWidth={STROKE} />
      ))}
    </g>
  );
}

export function Gantry() {
  return (
    <g>
      <rect x="560" y="300" width="44" height="560" fill="#FACC15" stroke={INK} strokeWidth={STROKE} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M560 ${310 + i * 60} L604 ${370 + i * 60} M604 ${310 + i * 60} L560 ${370 + i * 60}`} stroke={INK} strokeWidth={4} />
      ))}
      <rect x="600" y="360" width="120" height="16" fill="#FACC15" stroke={INK} strokeWidth={4} />
      <rect x="600" y="520" width="104" height="16" fill="#FACC15" stroke={INK} strokeWidth={4} />
      {/* crane arm */}
      <rect x="548" y="280" width="220" height="22" fill="#FACC15" stroke={INK} strokeWidth={STROKE} />
      <line x1="740" y1="302" x2="740" y2="350" stroke={INK} strokeWidth={4} />
    </g>
  );
}

function Station() {
  return (
    <g transform="translate(1290 150) rotate(-8)">
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * 150} 0)`}>
          <rect x="-70" y="-34" width="140" height="68" fill="#B45309" stroke={INK} strokeWidth={5} />
          {[-35, 0, 35].map((x) => (
            <line key={x} x1={x} x2={x} y1="-34" y2="34" stroke="#FACC15" strokeWidth={3} />
          ))}
          <line x1="-70" x2="70" y1="0" y2="0" stroke="#FACC15" strokeWidth={3} />
        </g>
      ))}
      <rect x="-80" y="-6" width="160" height="12" fill="#94A3B8" stroke={INK} strokeWidth={4} />
      <rect x="-46" y="-30" width="92" height="60" rx="14" fill="#F8FAFC" stroke={INK} strokeWidth={5} />
      <circle cx="0" cy="0" r="16" fill="#38BDF8" stroke={INK} strokeWidth={4} />
      <circle cx="0" cy="-52" r="18" fill="none" stroke="#F8FAFC" strokeWidth={6} />
      <circle cx="0" cy="-52" r="18" fill="none" stroke={INK} strokeWidth={2} />
    </g>
  );
}

function MarsAndRover() {
  return (
    <g>
      <path d="M1040 900 L1040 690 Q1180 640 1320 676 T1600 640 L1600 900 Z" fill="#C2410C" stroke={INK} strokeWidth={STROKE} />
      <path d="M1040 900 L1040 760 Q1200 716 1360 748 T1600 724 L1600 900 Z" fill="#EA580C" stroke={INK} strokeWidth={STROKE} />
      <path d="M1040 900 L1040 830 Q1240 800 1600 820 L1600 900 Z" fill="#F97316" stroke={INK} strokeWidth={STROKE} />
      {/* glowing crystals */}
      <path d="M1500 760 l14 -40 14 40 Z M1524 762 l10 -28 10 28 Z" fill="#38BDF8" stroke={INK} strokeWidth={4} />
      <circle cx="1514" cy="742" r="34" fill="#38BDF8" opacity="0.18" />
      {/* rover */}
      <g transform="translate(1270 770)">
        <rect x="-110" y="-40" width="220" height="40" rx="10" fill="#F8FAFC" stroke={INK} strokeWidth={STROKE} />
        <path d="M-60 -40 L-40 -92 L52 -92 L70 -40 Z" fill="#38BDF8" fillOpacity="0.35" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        <path d="M-30 -86 L-18 -50" stroke="#F8FAFC" strokeWidth={5} strokeLinecap="round" opacity="0.8" />
        {/* robotic arm + analyzer laser */}
        <path d="M100 -30 L150 -72 L196 -50" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M100 -30 L150 -72 L196 -50" fill="none" stroke="#94A3B8" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        <line x1="196" y1="-50" x2="240" y2="-14" stroke="#EF4444" strokeWidth={4} strokeDasharray="8 6" />
        {[-88, -30, 30, 88].map((x, i) => (
          <g key={x} transform={`translate(${x} 4)`} opacity={i === 1 || i === 2 ? 1 : 1}>
            <circle r="24" fill="#334155" stroke={INK} strokeWidth={STROKE} />
            <circle r="9" fill="#94A3B8" stroke={INK} strokeWidth={3} />
          </g>
        ))}
        <line x1="-70" y1="-92" x2="-80" y2="-130" stroke={INK} strokeWidth={4} />
        <circle cx="-80" cy="-134" r="9" fill="#FACC15" stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
}

export function KeyArt({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion() ?? false;
  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl border-3 border-ink-black shadow-paper ${className}`}
      role="img"
      aria-label="Astro Squad key art: a rocket lifting off, four astronauts, a Mars rover and an orbital station"
    >
      <svg viewBox="0 0 1600 900" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ka-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <radialGradient id="ka-glow" cx="50%" cy="45%" r="45%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
          <pattern id="ka-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 L0 0 0 40" fill="none" stroke="#94A3B8" strokeOpacity="0.12" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="1600" height="900" fill="url(#ka-sky)" />
        <rect width="1600" height="900" fill="url(#ka-grid)" />
        {/* technical blueprint marks */}
        <g fill="none" stroke="#38BDF8" strokeOpacity="0.22" strokeWidth="2">
          <circle cx="800" cy="420" r="300" strokeDasharray="10 12" />
          <circle cx="800" cy="420" r="200" />
          <line x1="800" y1="60" x2="800" y2="880" strokeDasharray="4 10" />
          <line x1="380" y1="420" x2="1220" y2="420" strokeDasharray="4 10" />
        </g>
        {[[140, 90], [420, 60], [1080, 70], [1520, 330], [980, 260], [260, 400], [1440, 470]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 ? 3 : 4.5} fill="#F8FAFC" opacity="0.8" />
        ))}
        <rect x="500" y="80" width="600" height="760" fill="url(#ka-glow)" />
        <Station />
        <MarsAndRover />
        <Gantry />
        <motion.g
          animate={reduce ? undefined : { y: [0, -14, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flame reduce={reduce} />
          <g transform="translate(800 510)">
            <Rocket />
          </g>
        </motion.g>
        <Smoke />
        <CoyotePatch />
      </svg>

      {/* Heroic squad on the left (reuses the articulated Astro Sprites) */}
      {HERO_POSES.map((pose) => (
        <div
          key={pose.role}
          className="absolute"
          style={{ left: pose.left, bottom: pose.bottom, width: `${(pose.size / 1600) * 100 * 6}%` }}
        >
          <div className="origin-bottom-left scale-[0.55] sm:scale-100">
            <CrewmateAvatar role={pose.role} state={pose.state} size={pose.size} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default KeyArt;
