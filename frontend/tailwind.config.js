/** @type {import('tailwindcss').Config} */
// Owner: Leonardo (Task LEO-01 / LEO-02) — Shared 2D Flash-Game Astro Squad & NASA HUD theme tokens
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "space-ink": "#0F172A",
        "blueprint-navy": "#1E293B",
        "paper-cream": "#F8FAFC",
        "ink-black": "#0F172A",
        "role-finance": "#F59E0B",
        "role-spacecraft": "#06B6D4",
        "role-orbit": "#10B981",
        "role-science": "#A855F7",
        "status-ok": "#22C55E",
        "status-warn": "#FACC15",
        "status-crit": "#EF4444",
        // Art direction 2026-11-15: aerospace workshop accents
        "hangar-slate": "#334155",
        "tank-orange": "#F97316",
        "electric-blue": "#2563EB",
        "sky-glow": "#38BDF8",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
      },
      borderWidth: {
        3: "3px",
      },
      boxShadow: {
        "paper-sm": "2px 2px 0px #0F172A",
        paper: "4px 4px 0px #0F172A",
        "paper-lg": "6px 6px 0px #0F172A",
      },
    },
  },
  plugins: [],
};
