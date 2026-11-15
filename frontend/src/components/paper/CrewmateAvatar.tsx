// Owner: Leonardo (Task LEO-02) — Original 2D Flash-game ASTRO SPRITES mini squad (zero copyright assets)
import { motion } from "framer-motion";
import type { RoleType } from "../../types/game";

export type AvatarState = "idle" | "walk" | "work" | "panic" | "cheer";

export interface RoleCharacterProfile {
  role: RoleType;
  codename: string;
  squadClass: string;
  label: string;
  short: string;
  suit: string;
  shade: string;
  visor: string;
  glow: string;
  gearLabel: string;
  gearDesc: string;
  wave1Task: string;
  wave2Task: string;
  flightGate: string;
  briefing: string;
  /** 2-3 micro tags (1-2 words) shown on role pickers instead of paragraphs. */
  strengths: string[];
}

export const ROLE_CHARACTER_PROFILE: Record<RoleType, RoleCharacterProfile> = {
  finance_launch: {
    role: "finance_launch",
    codename: "ASTRO_ENGINEER",
    squadClass: "BUDGET BOSS",
    label: "Finance & Launch",
    short: "ENGINEER",
    suit: "#F59E0B",
    shade: "#B45309",
    visor: "#FEF3C7",
    glow: "#FB923C",
    gearLabel: "Wrench + cash drone",
    gearDesc: "Keeps cash in reserve and picks a rocket strong enough.",
    wave1Task: "Split the budget",
    wave2Task: "Pick the rocket",
    flightGate: "Liftoff",
    briefing: "Spend smart, save a safety reserve, pick the rocket.",
    strengths: ["Budget", "Rocket", "Reserve"],
  },
  spacecraft_mass: {
    role: "spacecraft_mass",
    codename: "ASTRO_MEDIC",
    squadClass: "SHIP DOCTOR",
    label: "Spacecraft & Mass",
    short: "MEDIC",
    suit: "#F8FAFC",
    shade: "#06B6D4",
    visor: "#CFFAFE",
    glow: "#22D3EE",
    gearLabel: "Mass scanner",
    gearDesc: "Builds a tough ship, adds a heat shield, keeps weight centered.",
    wave1Task: "Build the ship",
    wave2Task: "Balance the weight",
    flightGate: "Space hazard",
    briefing: "Build a tough ship and keep it balanced.",
    strengths: ["Build", "Heat shield", "Balance"],
  },
  orbit_power: {
    role: "orbit_power",
    codename: "ASTRO_SOLDIER",
    squadClass: "ORBIT PILOT",
    label: "Orbit & Power",
    short: "SOLDIER",
    suit: "#EF4444",
    shade: "#991B1B",
    visor: "#D1FAE5",
    glow: "#F87171",
    gearLabel: "Thrust rifle",
    gearDesc: "Aims the path through space and keeps the power on.",
    wave1Task: "Aim the orbit",
    wave2Task: "Power the ship",
    flightGate: "Engine burn",
    briefing: "Aim the route and keep the power flowing.",
    strengths: ["Aim", "Fuel", "Power"],
  },
  science_comms: {
    role: "science_comms",
    codename: "ASTRO_DEFENDER",
    squadClass: "SCIENCE GUARD",
    label: "Science & Comms",
    short: "DEFENDER",
    suit: "#6366F1",
    shade: "#4338CA",
    visor: "#E0E7FF",
    glow: "#38BDF8",
    gearLabel: "Signal shield",
    gearDesc: "Picks the best instruments and gets the data home.",
    wave1Task: "Pick the science",
    wave2Task: "Send data home",
    flightGate: "Call Earth",
    briefing: "Pick great science and get the data back.",
    strengths: ["Science", "Signal", "Data"],
  },
};

export const ROLE_PALETTE: Record<
  RoleType,
  { suit: string; shade: string; visor: string; label: string; short: string }
> = {
  finance_launch: {
    suit: ROLE_CHARACTER_PROFILE.finance_launch.suit,
    shade: ROLE_CHARACTER_PROFILE.finance_launch.shade,
    visor: ROLE_CHARACTER_PROFILE.finance_launch.visor,
    label: ROLE_CHARACTER_PROFILE.finance_launch.label,
    short: ROLE_CHARACTER_PROFILE.finance_launch.short,
  },
  spacecraft_mass: {
    suit: ROLE_CHARACTER_PROFILE.spacecraft_mass.shade,
    shade: "#0E7490",
    visor: ROLE_CHARACTER_PROFILE.spacecraft_mass.visor,
    label: ROLE_CHARACTER_PROFILE.spacecraft_mass.label,
    short: ROLE_CHARACTER_PROFILE.spacecraft_mass.short,
  },
  orbit_power: {
    suit: "#10B981",
    shade: "#047857",
    visor: ROLE_CHARACTER_PROFILE.orbit_power.visor,
    label: ROLE_CHARACTER_PROFILE.orbit_power.label,
    short: ROLE_CHARACTER_PROFILE.orbit_power.short,
  },
  science_comms: {
    suit: "#A855F7",
    shade: "#6D28D9",
    visor: "#F3E8FF",
    label: ROLE_CHARACTER_PROFILE.science_comms.label,
    short: ROLE_CHARACTER_PROFILE.science_comms.short,
  },
};

export type ActionEffect = "none" | "complete" | "error" | "scan" | "thruster";

interface CrewmateAvatarProps {
  role: RoleType;
  state?: AvatarState;
  size?: number;
  flipX?: boolean;
  showRoleTag?: boolean;
  className?: string;
  actionEffect?: ActionEffect;
  statusBadgeText?: string;
}

const STATE_ANIMATIONS: Record<
  AvatarState,
  {
    animate: { y?: number[]; x?: number[]; rotate?: number[]; scale?: number[] };
    duration: number;
  }
> = {
  idle: {
    animate: { y: [0, -2.5, 0], rotate: [0, 0.8, 0] },
    duration: 2.4,
  },
  walk: {
    animate: { y: [0, -6, 0, -6, 0], rotate: [-4, 4, -4] },
    duration: 0.58,
  },
  work: {
    animate: { y: [0, -2, 0], rotate: [-2.5, 2.5, -2.5], scale: [1, 1.03, 1] },
    duration: 0.8,
  },
  panic: {
    animate: { x: [-2.5, 2.5, -2.5, 2.5, 0], rotate: [-6, 6, -6] },
    duration: 0.35,
  },
  cheer: {
    animate: { y: [0, -9, 0], rotate: [-3, 3, -3], scale: [1, 1.06, 1] },
    duration: 0.72,
  },
};

function VisorExpression({
  role,
  state,
  isError,
  isComplete,
}: {
  role: RoleType;
  state: AvatarState;
  isError: boolean;
  isComplete: boolean;
}) {
  if (isError || state === "panic") {
    return (
      <g>
        <path d="M47 36 L55 44 M55 36 L47 44" stroke="#FF5A4E" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M65 36 L73 44 M73 36 L65 44" stroke="#FF5A4E" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M51 49 Q60 44 69 49" stroke="#FF5A4E" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </g>
    );
  }

  if (isComplete) {
    return (
      <g>
        <path d="M47 40 L51 35 L55 40" stroke="#3DDC84" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M65 40 L69 35 L73 40" stroke="#3DDC84" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M51 46 Q60 54 69 46" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    );
  }

  if (role === "finance_launch") {
    // ASTRO_ENGINEER: glowing orange twin rotating gear eyes + friendly smile
    const spinning = state === "work" || state === "walk";
    return (
      <g>
        <motion.g
          animate={spinning ? { rotate: 360 } : undefined}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          style={{ originX: "51px", originY: "39px" }}
        >
          <circle cx="51" cy="39" r="5.5" fill="none" stroke="#FB923C" strokeWidth="2.6" strokeDasharray="3 2" />
          <circle cx="51" cy="39" r="2.2" fill="#FDE68A" />
        </motion.g>
        <motion.g
          animate={spinning ? { rotate: -360 } : undefined}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          style={{ originX: "69px", originY: "39px" }}
        >
          <circle cx="69" cy="39" r="5.5" fill="none" stroke="#FB923C" strokeWidth="2.6" strokeDasharray="3 2" />
          <circle cx="69" cy="39" r="2.2" fill="#FDE68A" />
        </motion.g>
        <path d="M53 48 Q60 53 67 48" stroke="#FB923C" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </g>
    );
  }

  if (role === "spacecraft_mass") {
    // ASTRO_MEDIC: glowing cyan-red medical cross + pulsing ECG waveform
    return (
      <g>
        <motion.path
          d="M58 29 H62 V33 H66 V37 H62 V41 H58 V37 H54 V33 H58 Z"
          fill="#FF5A4E"
          animate={state === "work" ? { scale: [1, 1.18, 1] } : undefined}
          transition={{ duration: 0.9, repeat: Infinity }}
          style={{ originX: "60px", originY: "35px" }}
        />
        <motion.path
          d="M42 46 H49 L53 39 L57 51 L62 35 L66 49 L70 46 H78"
          stroke="#22D3EE"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      </g>
    );
  }

  if (role === "orbit_power") {
    // ASTRO_SOLDIER: angled tactical crimson HUD eyes + stern visor line
    return (
      <g>
        <path d="M45 36 L55 40 L52 43 L45 40 Z" fill="#FF5A4E" />
        <path d="M75 36 L65 40 L68 43 L75 40 Z" fill="#FF5A4E" />
        <path d="M54 48 Q60 46 66 48" stroke="#F87171" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    );
  }

  // ASTRO_DEFENDER: cyan holographic T-visor HUD bars
  return (
    <g>
      <rect x="44" y="34" width="32" height="5" rx="2" fill="#38BDF8" />
      <rect x="56" y="39" width="8" height="11" rx="2" fill="#38BDF8" />
      <motion.rect
        x="46"
        y="42"
        width="7"
        height="3"
        rx="1.5"
        fill="#A855F7"
        animate={state === "work" ? { opacity: [0.4, 1, 0.4] } : undefined}
        transition={{ duration: 0.7, repeat: Infinity }}
      />
      <motion.rect
        x="67"
        y="42"
        width="7"
        height="3"
        rx="1.5"
        fill="#A855F7"
        animate={state === "work" ? { opacity: [1, 0.4, 1] } : undefined}
        transition={{ duration: 0.7, repeat: Infinity }}
      />
    </g>
  );
}

function RoleBackpackAndGear({
  role,
  state,
  actionEffect,
}: {
  role: RoleType;
  state: AvatarState;
  actionEffect: ActionEffect;
}) {
  const isScanning = state === "work" || actionEffect === "scan";
  const isThrusting = state === "walk" || actionEffect === "thruster";

  if (role === "finance_launch") {
    // Backpack + antenna + animated hovering mini-drone + shoulder wrench + scan beam
    return (
      <g>
        <rect x="33" y="56" width="54" height="30" rx="8" fill="#92400E" stroke="#0F172A" strokeWidth="3" />
        <line x1="88" y1="60" x2="101" y2="42" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        <motion.g
          transform="translate(94, 24)"
          animate={isScanning || isThrusting ? { y: [-2, 2.5, -2] } : { y: [-1, 1, -1] }}
          transition={{ duration: isScanning ? 0.65 : 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="2" y="6" width="18" height="13" rx="5" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.4" />
          <circle cx="11" cy="12" r="3.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.6" />
          <ellipse cx="3" cy="5" rx="6" ry="2" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.6" />
          <ellipse cx="19" cy="5" rx="6" ry="2" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.6" />
          {isScanning && (
            <motion.polygon
              points="11,16 3,34 19,34"
              fill="#38BDF8"
              animate={{ opacity: [0.15, 0.5, 0.15] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          )}
        </motion.g>
        <motion.g
          animate={isScanning ? { rotate: [-6, 10, -6] } : undefined}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "34px", originY: "72px" }}
        >
          <path d="M16 48 L36 74" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
          <path d="M16 48 L36 74" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="15" cy="46" r="7" fill="#94A3B8" stroke="#0F172A" strokeWidth="2.5" />
          <rect x="11" y="40" width="6" height="6" rx="1" fill="#0B1021" />
        </motion.g>
      </g>
    );
  }

  if (role === "spacecraft_mass") {
    // ASTRO_MEDIC: cryo tank + handheld diagnostic scanner (animated scan cone) & med-pad
    return (
      <g>
        <rect x="33" y="57" width="54" height="29" rx="8" fill="#0891B2" stroke="#0F172A" strokeWidth="3" />
        <rect x="14" y="75" width="18" height="10" rx="3" fill="#22D3EE" stroke="#0F172A" strokeWidth="2.4" />
        <rect x="11" y="77" width="5" height="6" rx="1" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
        {isScanning && (
          <motion.polygon
            points="11,80 -2,68 -2,92"
            fill="#22D3EE"
            animate={{ opacity: [0.18, 0.55, 0.18] }}
            transition={{ duration: 0.75, repeat: Infinity }}
          />
        )}
        <rect x="88" y="60" width="17" height="23" rx="3" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2.5" />
        <rect x="91" y="64" width="11" height="10" rx="1.5" fill="#10B981" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="78" y="88" width="20" height="15" rx="3" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2.4" />
        <path d="M87 92 H90 V95 H93 V97 H90 V100 H87 V97 H84 V95 H87 Z" fill="#FF5A4E" />
      </g>
    );
  }

  if (role === "orbit_power") {
    // ASTRO_SOLDIER: twin orbital propellant pack + thruster flames + Delta-v pulse carbine
    return (
      <g>
        <rect x="31" y="55" width="58" height="31" rx="8" fill="#475569" stroke="#0F172A" strokeWidth="3" />
        {(isThrusting || isScanning) && (
          <motion.g
            animate={{ scaleY: [0.85, 1.25, 0.85], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 0.25, repeat: Infinity }}
            style={{ originY: "86px" }}
          >
            <polygon points="36,86 42,102 48,86" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
            <polygon points="72,86 78,102 84,86" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
          </motion.g>
        )}
        <g transform="translate(0, 2)">
          <rect x="20" y="72" width="76" height="13" rx="4" fill="#334155" stroke="#0F172A" strokeWidth="2.8" />
          <rect x="35" y="75" width="38" height="6" rx="2" fill="#EF4444" stroke="#0F172A" strokeWidth="1.8" />
          <rect x="88" y="75" width="14" height="7" rx="2" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
          <rect x="46" y="65" width="16" height="7" rx="2" fill="#64748B" stroke="#0F172A" strokeWidth="2" />
          {isScanning && (
            <motion.circle
              cx="105"
              cy="78.5"
              r="5"
              fill="#38BDF8"
              animate={{ opacity: [0.3, 0.95, 0.3], scale: [0.8, 1.25, 0.8] }}
              transition={{ duration: 0.45, repeat: Infinity }}
              style={{ originX: "105px", originY: "78.5px" }}
            />
          )}
        </g>
      </g>
    );
  }

  // ASTRO_DEFENDER: heavy shoulder shield pack + pulsing holo-dish shield
  return (
    <g>
      <rect x="31" y="55" width="58" height="31" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
      <rect x="13" y="76" width="19" height="11" rx="3" fill="#38BDF8" stroke="#0F172A" strokeWidth="2.4" />
      {isScanning && (
        <motion.circle
          cx="11"
          cy="81"
          r="5"
          fill="#22D3EE"
          animate={{ opacity: [0.25, 0.9, 0.25] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
      <motion.ellipse
        cx="98"
        cy="78"
        rx="16"
        ry="25"
        fill="#38BDF8"
        fillOpacity="0.28"
        stroke="#38BDF8"
        strokeWidth="3"
        animate={isScanning || isThrusting ? { scale: [0.96, 1.08, 0.96], opacity: [0.7, 1, 0.7] } : undefined}
        transition={{ duration: 0.85, repeat: Infinity }}
        style={{ originX: "98px", originY: "78px" }}
      />
      <ellipse
        cx="98"
        cy="78"
        rx="10"
        ry="16"
        fill="#A855F7"
        fillOpacity="0.32"
        stroke="#E0E7FF"
        strokeWidth="2"
      />
      <circle cx="98" cy="78" r="4.5" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
    </g>
  );
}

export function CrewmateAvatar({
  role,
  state = "idle",
  size = 64,
  flipX = false,
  showRoleTag = false,
  className = "",
  actionEffect = "none",
  statusBadgeText,
}: CrewmateAvatarProps) {
  const profile = ROLE_CHARACTER_PROFILE[role];
  const isError = actionEffect === "error" || state === "panic";
  const isComplete = actionEffect === "complete" || state === "cheer";
  const effectiveState: AvatarState =
    actionEffect === "error" ? "panic" : actionEffect === "complete" ? "cheer" : state;
  const motionCfg = STATE_ANIMATIONS[effectiveState];

  const suitPrimary =
    role === "finance_launch"
      ? "#F59E0B"
      : role === "spacecraft_mass"
      ? "#F8FAFC"
      : role === "orbit_power"
      ? "#DC2626"
      : "#3B82F6";

  const suitSecondary =
    role === "finance_launch"
      ? "#D97706"
      : role === "spacecraft_mass"
      ? "#10B981"
      : role === "orbit_power"
      ? "#475569"
      : "#4F46E5";

  const bootTrim =
    role === "finance_launch"
      ? "#FBBF24"
      : role === "spacecraft_mass"
      ? "#10B981"
      : role === "orbit_power"
      ? "#EF4444"
      : "#60A5FA";

  return (
    <motion.div
      animate={motionCfg.animate}
      transition={{
        duration: motionCfg.duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      aria-label={`${profile.codename} (${effectiveState})`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 132"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(3px 4px 0px #0F172A)",
          transform: flipX ? "scaleX(-1)" : undefined,
        }}
      >
        {/* Completion green halo ring */}
        {isComplete && (
          <motion.ellipse
            cx="60"
            cy="68"
            rx="50"
            ry="56"
            stroke="#3DDC84"
            strokeWidth="3.5"
            strokeDasharray="8 5"
            fill="#3DDC84"
            fillOpacity="0.1"
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.45, 0.95, 0.45] }}
            transition={{ duration: 0.95, repeat: Infinity }}
            style={{ originX: "60px", originY: "68px" }}
          />
        )}

        {/* Error red short-circuit aura */}
        {isError && (
          <motion.ellipse
            cx="60"
            cy="68"
            rx="49"
            ry="55"
            stroke="#FF5A4E"
            strokeWidth="3.5"
            fill="#FF5A4E"
            fillOpacity="0.12"
            animate={{ opacity: [0.25, 0.95, 0.25] }}
            transition={{ duration: 0.35, repeat: Infinity }}
          />
        )}

        {/* Ground shadow */}
        <ellipse cx="60" cy="124" rx="28" ry="5" fill="#0F172A" opacity="0.35" />

        {/* Subtle sticker contour silhouette for readable contrast over dark space */}
        <circle cx="60" cy="36" r="29" fill="#FFFFFF" opacity="0.92" />
        <rect x="33" y="55" width="54" height="58" rx="16" fill="#FFFFFF" opacity="0.9" />

        {/* Role gear behind arms/torso */}
        <RoleBackpackAndGear role={role} state={effectiveState} actionEffect={actionEffect} />

        {/* Left Leg + Kneepad + Boot (Articulated) */}
        <motion.g
          animate={
            effectiveState === "walk"
              ? { y: [0, -5, 0], rotate: [-8, 8, -8] }
              : effectiveState === "cheer"
              ? { y: [0, -3, 0] }
              : undefined
          }
          transition={{ duration: effectiveState === "walk" ? 0.58 : 0.72, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "48px", originY: "88px" }}
        >
          <rect x="41" y="88" width="15" height="27" rx="6" fill={suitPrimary} stroke="#0F172A" strokeWidth="3" />
          <rect x="40" y="95" width="17" height="10" rx="4" fill="#475569" stroke="#0F172A" strokeWidth="2.6" />
          <path d="M36 112 H57 V120 C57 122 55 123 52 123 H39 C37 123 36 121 36 119 Z" fill="#334155" stroke="#0F172A" strokeWidth="3" />
          <rect x="38" y="109" width="18" height="5" rx="2" fill={bootTrim} stroke="#0F172A" strokeWidth="2" />
        </motion.g>

        {/* Right Leg + Kneepad + Boot (Articulated) */}
        <motion.g
          animate={
            effectiveState === "walk"
              ? { y: [-5, 0, -5], rotate: [8, -8, 8] }
              : effectiveState === "cheer"
              ? { y: [-3, 0, -3] }
              : undefined
          }
          transition={{ duration: effectiveState === "walk" ? 0.58 : 0.72, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "72px", originY: "88px" }}
        >
          <rect x="64" y="88" width="15" height="27" rx="6" fill={suitPrimary} stroke="#0F172A" strokeWidth="3" />
          <rect x="63" y="95" width="17" height="10" rx="4" fill="#475569" stroke="#0F172A" strokeWidth="2.6" />
          <path d="M63 112 H84 V119 C84 121 83 123 81 123 H68 C65 123 63 122 63 120 Z" fill="#334155" stroke="#0F172A" strokeWidth="3" />
          <rect x="64" y="109" width="18" height="5" rx="2" fill={bootTrim} stroke="#0F172A" strokeWidth="2" />
        </motion.g>

        {/* Articulated Left Arm + Glove */}
        <motion.g
          animate={
            effectiveState === "walk"
              ? { rotate: [12, -12, 12] }
              : effectiveState === "work"
              ? { rotate: [-10, 12, -10] }
              : effectiveState === "cheer"
              ? { y: [-6, -12, -6], rotate: [18, 32, 18] }
              : effectiveState === "panic"
              ? { rotate: [-22, 22, -22] }
              : undefined
          }
          transition={{
            duration: effectiveState === "panic" ? 0.28 : effectiveState === "walk" ? 0.58 : 0.72,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: "34px", originY: "63px" }}
        >
          <rect x="26" y="61" width="13" height="24" rx="6" fill={suitPrimary} stroke="#0F172A" strokeWidth="2.8" />
          <circle cx="32" cy="84" r="6" fill={suitSecondary} stroke="#0F172A" strokeWidth="2.6" />
        </motion.g>

        {/* Articulated Right Arm + Glove */}
        <motion.g
          animate={
            effectiveState === "walk"
              ? { rotate: [-12, 12, -12] }
              : effectiveState === "work"
              ? { rotate: [12, -10, 12] }
              : effectiveState === "cheer"
              ? { y: [-6, -12, -6], rotate: [-18, -32, -18] }
              : effectiveState === "panic"
              ? { rotate: [22, -22, 22] }
              : undefined
          }
          transition={{
            duration: effectiveState === "panic" ? 0.28 : effectiveState === "walk" ? 0.58 : 0.72,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: "86px", originY: "63px" }}
        >
          <rect x="81" y="61" width="13" height="24" rx="6" fill={suitPrimary} stroke="#0F172A" strokeWidth="2.8" />
          <circle cx="88" cy="84" r="6" fill={suitSecondary} stroke="#0F172A" strokeWidth="2.6" />
        </motion.g>

        {/* Torso Suit */}
        <rect x="38" y="57" width="44" height="37" rx="11" fill={suitPrimary} stroke="#0F172A" strokeWidth="3.2" />

        {/* Shoulder straps & harness */}
        <path d="M42 58 L50 75 M78 58 L70 75" stroke={suitSecondary} strokeWidth="5.5" strokeLinecap="round" />
        <path d="M42 58 L50 75 M78 58 L70 75" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

        {/* Chest Life-Support Telemetry Box */}
        <rect x="49" y="64" width="22" height="16" rx="4" fill="#94A3B8" stroke="#0F172A" strokeWidth="2.6" />
        <circle cx="56" cy="72" r="3" fill={profile.glow} stroke="#0F172A" strokeWidth="1.5" />
        <rect x="62" y="69" width="6" height="6" rx="1.5" fill={bootTrim} stroke="#0F172A" strokeWidth="1.4" />

        {/* Utility Belt + Buckle */}
        <rect x="38" y="83" width="44" height="8" rx="3" fill="#334155" stroke="#0F172A" strokeWidth="2.6" />
        <rect x="55" y="82" width="10" height="10" rx="2" fill="#CBD5E1" stroke="#0F172A" strokeWidth="2.2" />

        {/* Helmet Ear-Pods */}
        <circle cx="32" cy="39" r="7" fill="#64748B" stroke="#0F172A" strokeWidth="3" />
        <circle cx="32" cy="39" r="3" fill={bootTrim} />
        <circle cx="88" cy="39" r="7" fill="#64748B" stroke="#0F172A" strokeWidth="3" />
        <circle cx="88" cy="39" r="3" fill={bootTrim} />

        {/* Outer Helmet Dome */}
        <rect x="33" y="10" width="54" height="51" rx="25" fill={suitPrimary} stroke="#0F172A" strokeWidth="3.5" />
        {/* Metallic helmet crest */}
        <rect x="52" y="10" width="16" height="11" rx="4" fill={suitSecondary} stroke="#0F172A" strokeWidth="2.4" />

        {/* Inner Steel Visor Bezel */}
        <rect x="38" y="19" width="44" height="36" rx="17" fill="#64748B" stroke="#0F172A" strokeWidth="2.8" />
        {/* Dark Curved Glass Visor */}
        <rect x="41" y="23" width="38" height="30" rx="14" fill="#0B132B" stroke="#0F172A" strokeWidth="2.6" />
        {/* Glossy Flash reflection */}
        <path d="M47 28 Q60 24 73 28" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" opacity="0.45" />

        {/* Unique Astro-Squad Glowing LED Visor Face */}
        <VisorExpression role={role} state={effectiveState} isError={isError} isComplete={isComplete} />

        {/* Dynamic Error / Danger Sparks & Sweat Drop */}
        {isError && (
          <g>
            <circle cx="98" cy="18" r="10" fill="#FF5A4E" stroke="#0F172A" strokeWidth="2.5" />
            <path d="M98 13 V19 M98 22 V23" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <motion.path
              d="M15 24 L23 18 L20 27 L27 25 L17 34"
              stroke="#F2C94C"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            />
            <motion.path
              d="M20 56 C17 61 17 66 20 66 C23 66 23 61 20 56 Z"
              fill="#38BDF8"
              stroke="#0F172A"
              strokeWidth="1.6"
              animate={{ y: [0, 5, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </g>
        )}

        {/* Dynamic Completion Stars & Sparkles */}
        {isComplete && (
          <g>
            <motion.path
              d="M98 8 L101 14 L107 17 L101 20 L98 26 L95 20 L89 17 L95 14 Z"
              fill="#F2C94C"
              stroke="#0F172A"
              strokeWidth="2.2"
              strokeLinejoin="round"
              animate={{ scale: [0.85, 1.2, 0.85], rotate: [-12, 12, -12] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ originX: "98px", originY: "17px" }}
            />
            <motion.path
              d="M18 14 L20 18 L24 20 L20 22 L18 26 L16 22 L12 20 L16 18 Z"
              fill="#3DDC84"
              stroke="#0F172A"
              strokeWidth="1.8"
              animate={{ scale: [1.1, 0.8, 1.1] }}
              transition={{ duration: 0.75, repeat: Infinity }}
              style={{ originX: "18px", originY: "20px" }}
            />
          </g>
        )}
      </svg>

      {statusBadgeText && (
        <span
          className={`paper-badge mt-0.5 px-1.5 py-0.5 text-[9px] tracking-wider text-ink-black ${
            isError ? "bg-status-crit" : isComplete ? "bg-status-ok" : "bg-role-spacecraft"
          }`}
        >
          {statusBadgeText}
        </span>
      )}

      {showRoleTag && (
        <span
          className="paper-badge mt-1 px-2 py-0.5 text-[10px] tracking-wider text-ink-black"
          style={{ backgroundColor: profile.suit }}
        >
          {profile.codename}
        </span>
      )}
    </motion.div>
  );
}

export default CrewmateAvatar;
