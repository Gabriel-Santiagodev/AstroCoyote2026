// Owner: Leonardo (Task LEO-02) — Original SVG crewmate cutout (Paper Mario x Among Us, zero copyright assets)
import { motion } from "framer-motion";
import type { RoleType } from "../../types/game";

export type AvatarState = "idle" | "walk" | "work" | "panic" | "cheer";

export const ROLE_PALETTE: Record<
  RoleType,
  { suit: string; shade: string; visor: string; label: string; short: string }
> = {
  finance_launch: {
    suit: "#F59E0B",
    shade: "#D97706",
    visor: "#FEF3C7",
    label: "Finance & Launch",
    short: "FINANCE",
  },
  spacecraft_mass: {
    suit: "#06B6D4",
    shade: "#0891B2",
    visor: "#CFFAFE",
    label: "Spacecraft & Mass",
    short: "SPACECRAFT",
  },
  orbit_power: {
    suit: "#10B981",
    shade: "#059669",
    visor: "#D1FAE5",
    label: "Orbit & Power",
    short: "ORBIT",
  },
  science_comms: {
    suit: "#A855F7",
    shade: "#7E22CE",
    visor: "#F3E8FF",
    label: "Science & Comms",
    short: "SCIENCE",
  },
};

interface CrewmateAvatarProps {
  role: RoleType;
  state?: AvatarState;
  size?: number;
  flipX?: boolean;
  showRoleTag?: boolean;
  className?: string;
}

const STATE_ANIMATIONS: Record<
  AvatarState,
  {
    animate: { y?: number[]; x?: number[]; rotate?: number[]; scale?: number[] };
    duration: number;
  }
> = {
  idle: {
    animate: { y: [0, -3, 0], rotate: [0, 1, 0] },
    duration: 2.6,
  },
  walk: {
    animate: { y: [0, -7, 0, -7, 0], rotate: [-5, 5, -5] },
    duration: 0.65,
  },
  work: {
    animate: { y: [0, -2, 0], rotate: [-3, 3, -3], scale: [1, 1.03, 1] },
    duration: 0.85,
  },
  panic: {
    animate: { x: [-2.5, 2.5, -2.5, 2.5, 0], rotate: [-7, 7, -7] },
    duration: 0.38,
  },
  cheer: {
    animate: { y: [0, -10, 0], rotate: [-4, 4, -4], scale: [1, 1.07, 1] },
    duration: 0.75,
  },
};

function RoleChestEmblem({ role }: { role: RoleType }) {
  if (role === "finance_launch") {
    return (
      <path
        d="M41 44 L45 50 L41 56 L37 50 Z"
        fill="#FEF3C7"
        stroke="#0F172A"
        strokeWidth="2"
      />
    );
  }
  if (role === "spacecraft_mass") {
    return (
      <rect
        x="36.5"
        y="46"
        width="9"
        height="8"
        rx="1.5"
        fill="#CFFAFE"
        stroke="#0F172A"
        strokeWidth="2"
      />
    );
  }
  if (role === "orbit_power") {
    return (
      <circle
        cx="41"
        cy="50"
        r="4.5"
        fill="#D1FAE5"
        stroke="#0F172A"
        strokeWidth="2"
      />
    );
  }
  return (
    <path
      d="M36 52 Q41 44 46 52"
      fill="none"
      stroke="#F3E8FF"
      strokeWidth="3"
      strokeLinecap="round"
    />
  );
}

export function CrewmateAvatar({
  role,
  state = "idle",
  size = 64,
  flipX = false,
  showRoleTag = false,
  className = "",
}: CrewmateAvatarProps) {
  const palette = ROLE_PALETTE[role];
  const motionCfg = STATE_ANIMATIONS[state];

  return (
    <motion.div
      animate={motionCfg.animate}
      transition={{
        duration: motionCfg.duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`inline-flex flex-col items-center select-none ${className}`}
      aria-label={`${palette.label} (${state})`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 84 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(4px 4px 0px #0F172A)",
          transform: flipX ? "scaleX(-1)" : undefined,
        }}
      >
        {/* Outer white Paper Mario sticker silhouette */}
        <rect x="6" y="19" width="20" height="44" rx="10" fill="#FFFFFF" />
        <rect x="16" y="7" width="50" height="72" rx="25" fill="#FFFFFF" />
        <rect x="20" y="60" width="19" height="20" rx="9" fill="#FFFFFF" />
        <rect x="43" y="60" width="19" height="20" rx="9" fill="#FFFFFF" />

        {/* Life-support backpack */}
        <rect
          x="10"
          y="25"
          width="15"
          height="33"
          rx="7"
          fill={palette.shade}
          stroke="#0F172A"
          strokeWidth="3.5"
        />

        {/* Suit body + two boots */}
        <path
          d="M22 29C22 16 31 11 42 11C53 11 61 18 61 29V66C61 70.5 57.5 74 53 74C48.5 74 46 70.5 46 66V60H37V66C37 70.5 34.5 74 30 74C25.5 74 22 70.5 22 66V29Z"
          fill={palette.suit}
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Subtle lower paper cutout shading */}
        <path
          d="M24 55 H59 V65 C59 68.5 56 71.5 53 71.5 C49.5 71.5 47.5 68.5 47.5 65 V58.5 H35.5 V65 C35.5 68.5 33.5 71.5 30 71.5 C26.5 71.5 24 68.5 24 65 Z"
          fill={palette.shade}
          opacity="0.38"
        />

        {/* Role chest patch */}
        <RoleChestEmblem role={role} />

        {/* Helmet visor + paper reflection */}
        <rect
          x="33"
          y="22"
          width="30"
          height="17"
          rx="8.5"
          fill={palette.visor}
          stroke="#0F172A"
          strokeWidth="3.2"
        />
        <rect
          x="45"
          y="25.5"
          width="12"
          height="4.5"
          rx="2.25"
          fill="#FFFFFF"
          opacity="0.9"
        />

        {/* State indicators (panic alert / cheer star) */}
        {state === "panic" && (
          <g>
            <circle
              cx="66"
              cy="14"
              r="9"
              fill="#FF5A4E"
              stroke="#0F172A"
              strokeWidth="2.5"
            />
            <path
              d="M66 9.5 V15 M66 17.5 V18.5"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        )}
        {state === "cheer" && (
          <path
            d="M67 7 L69 12 L74 14 L69 16 L67 21 L65 16 L60 14 L65 12 Z"
            fill="#F2C94C"
            stroke="#0F172A"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {showRoleTag && (
        <span
          className="paper-badge mt-1 px-2 py-0.5 text-[10px] tracking-wider text-ink-black"
          style={{ backgroundColor: palette.suit }}
        >
          {palette.short}
        </span>
      )}
    </motion.div>
  );
}

export default CrewmateAvatar;
