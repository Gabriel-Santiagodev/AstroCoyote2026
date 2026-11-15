// Owner: Leonardo (Task LEO-02) — Deep-space tsParticles + Paper Mario parallax celestial cutouts
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Particles, { initParticlesEngine, type IParticlesProps } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

let engineReadyPromise: Promise<void> | null = null;

function ensureParticlesEngine(): Promise<void> {
  if (!engineReadyPromise) {
    engineReadyPromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }
  return engineReadyPromise;
}

const STAR_OPTIONS: NonNullable<IParticlesProps["options"]> = {
  fullScreen: { enable: false },
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  detectRetina: true,
  particles: {
    number: {
      value: 70,
      density: { enable: true, width: 1200, height: 800 },
    },
    color: { value: ["#F8FAFC", "#CBD5E1", "#FEF3C7", "#CFFAFE"] },
    shape: { type: "circle" },
    opacity: {
      value: { min: 0.25, max: 0.85 },
      animation: { enable: true, speed: 0.8, sync: false },
    },
    size: { value: { min: 1, max: 2.8 } },
    move: {
      enable: true,
      speed: 0.35,
      direction: "left",
      random: true,
      straight: false,
      outModes: { default: "out" },
    },
  },
};

export function Starfield() {
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    let active = true;
    ensureParticlesEngine()
      .then(() => {
        if (active) setParticlesReady(true);
      })
      .catch(() => {
        // Fallback CSS starfield remains visible if canvas init is blocked
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-space-ink"
      aria-hidden="true"
    >
      {/* Subtle NASA blueprint grid */}
      <div className="blueprint-grid absolute inset-0 opacity-45" />

      {/* Immediate CSS star layer (frame-0 fallback & far depth) */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(#F8FAFC 1.5px, transparent 1.5px), radial-gradient(#94A3B8 1px, transparent 1px)",
          backgroundSize: "76px 76px, 43px 43px",
          backgroundPosition: "0 0, 21px 17px",
        }}
      />

      {/* Interactive-free tsParticles starfield */}
      {particlesReady && (
        <Particles
          id="paper-orbit-stars"
          options={STAR_OPTIONS}
          className="absolute inset-0 h-full w-full"
        />
      )}

      {/* Parallax Paper Cutout 1: Cratered Moon (Top Right) */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-12 -top-12 opacity-80 sm:right-6 sm:top-6"
      >
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
          style={{ filter: "drop-shadow(6px 6px 0px #0F172A)" }}
        >
          {/* Outer white sticker contour */}
          <circle cx="80" cy="80" r="64" fill="#F8FAFC" />
          <circle cx="80" cy="80" r="57" fill="#CBD5E1" stroke="#0F172A" strokeWidth="4" />
          {/* Paper crescent shadow */}
          <path
            d="M80 23 A57 57 0 0 1 80 137 A44 57 0 0 0 80 23 Z"
            fill="#94A3B8"
            opacity="0.55"
          />
          {/* Craters */}
          <circle cx="58" cy="60" r="11" fill="#94A3B8" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="96" cy="94" r="14" fill="#94A3B8" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="95" cy="52" r="7" fill="#94A3B8" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="54" cy="100" r="6" fill="#94A3B8" stroke="#0F172A" strokeWidth="2.5" />
        </svg>
      </motion.div>

      {/* Parallax Paper Cutout 2: Ringed Cyan Exoplanet (Bottom Left) */}
      <motion.div
        animate={{ y: [0, 12, 0], x: [0, 6, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-10 -left-10 opacity-75 sm:bottom-6 sm:left-6"
      >
        <svg
          width="170"
          height="130"
          viewBox="0 0 170 130"
          fill="none"
          style={{ filter: "drop-shadow(6px 6px 0px #0F172A)" }}
        >
          {/* Back ring arc */}
          <ellipse
            cx="85"
            cy="65"
            rx="72"
            ry="20"
            transform="rotate(-16 85 65)"
            stroke="#F8FAFC"
            strokeWidth="12"
          />
          <ellipse
            cx="85"
            cy="65"
            rx="72"
            ry="20"
            transform="rotate(-16 85 65)"
            stroke="#0F172A"
            strokeWidth="7"
          />
          <ellipse
            cx="85"
            cy="65"
            rx="72"
            ry="20"
            transform="rotate(-16 85 65)"
            stroke="#F2C94C"
            strokeWidth="3.5"
          />
          {/* Planet sticker body */}
          <circle cx="85" cy="65" r="39" fill="#F8FAFC" />
          <circle cx="85" cy="65" r="33" fill="#162347" stroke="#0F172A" strokeWidth="4" />
          <path
            d="M57 55 Q85 45 113 55"
            stroke="#06B6D4"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M55 75 Q85 66 115 75"
            stroke="#10B981"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.65"
          />
          {/* Front ring half */}
          <path
            d="M17 85 C38 98 132 70 153 45"
            stroke="#0F172A"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M17 85 C38 98 132 70 153 45"
            stroke="#F2C94C"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Parallax Paper Cutout 3: Mars / Red Dwarf Accent (Mid Left, subtle) */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="hidden opacity-60 lg:block lg:left-10 lg:top-1/3 lg:absolute"
      >
        <svg
          width="68"
          height="68"
          viewBox="0 0 68 68"
          fill="none"
          style={{ filter: "drop-shadow(4px 4px 0px #0F172A)" }}
        >
          <circle cx="34" cy="34" r="28" fill="#F8FAFC" />
          <circle cx="34" cy="34" r="23" fill="#FF5A4E" stroke="#0F172A" strokeWidth="3.5" />
          <circle cx="26" cy="27" r="4" fill="#F2C94C" opacity="0.7" />
          <circle cx="42" cy="40" r="5" fill="#0F172A" opacity="0.22" />
        </svg>
      </motion.div>
    </div>
  );
}

export default Starfield;
