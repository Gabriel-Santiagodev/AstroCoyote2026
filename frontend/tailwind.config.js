/** @type {import('tailwindcss').Config} */
// Owner: Leonardo (Task LEO-01 / LEO-02) — Shared Paper Mario x Among Us + NASA HUD theme tokens
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "space-ink": "#0B1021",
        "blueprint-navy": "#162347",
        "paper-cream": "#F8FAFC",
        "ink-black": "#0F172A",
        "role-finance": "#F59E0B",
        "role-spacecraft": "#06B6D4",
        "role-orbit": "#10B981",
        "role-science": "#A855F7",
        "status-ok": "#3DDC84",
        "status-warn": "#F2C94C",
        "status-crit": "#FF5A4E",
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
