// Owner: Leonardo (Task LEO-02) — Original SVG crewmate cutout (Paper Mario x Among Us, zero copyright assets)
import type { RoleType } from "../../types/game";

export type AvatarState = "idle" | "walk" | "work" | "panic" | "cheer";

const ROLE_COLORS: Record<RoleType, { suit: string; visor: string; label: string }> = {
  finance_launch: { suit: "#F59E0B", visor: "#FEF3C7", label: "Finance & Launch" },
  spacecraft_mass: { suit: "#06B6D4", visor: "#CFFAFE", label: "Spacecraft & Mass" },
  orbit_power: { suit: "#10B981", visor: "#D1FAE5", label: "Orbit & Power" },
  science_comms: { suit: "#A855F7", visor: "#F3E8FF", label: "Science & Comms" },
};

interface CrewmateAvatarProps {
  role: RoleType;
  state?: AvatarState;
  size?: number;
}

export function CrewmateAvatar({
  role,
  state = "idle",
  size = 64,
}: CrewmateAvatarProps) {
  const palette = ROLE_COLORS[role];
  const tiltClass =
    state === "walk"
      ? "animate-bounce"
      : state === "panic"
      ? "-rotate-6"
      : state === "cheer"
      ? "rotate-3 scale-105"
      : "";

  return (
    <div
      className={`inline-flex flex-col items-center select-none ${tiltClass}`}
      aria-label={`${palette.label} (${state})`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(4px 4px 0px #0F172A)" }}
      >
        {/* Sticker white outer border */}
        <rect x="8" y="18" width="16" height="40" rx="8" fill="#FFFFFF" />
        <rect x="18" y="8" width="44" height="68" rx="22" fill="#FFFFFF" />
        {/* Backpack */}
        <rect
          x="10"
          y="24"
          width="14"
          height="32"
          rx="6"
          fill={palette.suit}
          stroke="#0F172A"
          strokeWidth="3.5"
        />
        {/* Main suit body */}
        <path
          d="M22 28C22 16 31 11 42 11C53 11 60 18 60 28V63C60 67 57 71 52 71C48 71 46 68 46 64V58H36V64C36 68 33 71 29 71C24 71 22 67 22 63V28Z"
          fill={palette.suit}
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Helmet visor */}
        <rect
          x="33"
          y="22"
          width="28"
          height="16"
          rx="8"
          fill={palette.visor}
          stroke="#0F172A"
          strokeWidth="3"
        />
        <rect x="44" y="25" width="12" height="4" rx="2" fill="#FFFFFF" opacity="0.85" />
      </svg>
    </div>
  );
}

export default CrewmateAvatar;
