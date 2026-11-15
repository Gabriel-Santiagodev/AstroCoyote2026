// Owner: Ismael (Task ISM-01) — Wave 1 Topological Spacecraft & Lunar Rover Assembly Workshop
// Integrates Ismael's "Taller de Ensamblaje del Vehículo Lunar.html" SVG art, telemetry & role bonuses
// with the DAG topological assembly rules from docs/18-roadmap-ismael.md.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Cable,
  CheckCircle2,
  Flame,
  HelpCircle,
  Lock,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";
import nasaCatalog from "../../data/nasa_catalog.json";
import type { MinigameProps, MissionIdType, RoleType } from "../../types/game";
import { AnimatePresence, motion } from "framer-motion";
import { soundEngine } from "../paper/SoundEngine";
import { GameLayout, GoalList, LockButton, PanelCard, PlayBackdrop, Readout, type Goal } from "./kit/GameKit";

type SlotId =
  | "chasis"
  | "ruedas"
  | "bateria"
  | "panel"
  | "escudo"
  | "deorbit"
  | "asiento"
  | "antena"
  | "herramienta"
  | "carga";

type CategoryId = "all" | "chasis" | "ruedas" | "energia" | "proteccion" | "cabina" | "equipo";

interface RoverPiece {
  id: string;
  slot: SlotId;
  cat: Exclude<CategoryId, "all">;
  locked?: boolean;
  name: string;
  spec: string;
  costM: number;
  massKg: number;
  maxLoadKg?: number;
  tractionPct?: number;
  speedKmh?: number;
  kwh?: number;
  rangeKm?: number;
  sciencePts?: number;
  cargoCapKg?: number;
  variant: string;
  missions?: MissionIdType[];
}

interface RoleConfig {
  id: string;
  key: "eng" | "med" | "sol" | "def";
  name: string;
  bonusText: string;
  accent: string;
  suit: string;
  helmet: string;
  visor: string;
  refl: string;
  pack: string;
  boot: string;
}

const ROLE_CONFIGS: Record<RoleType, RoleConfig> = {
  finance_launch: {
    id: "ASTRO_ENGINEER",
    key: "eng",
    name: "Engineer Pilot",
    bonusText: "Bonus: -15% total build cost",
    accent: "#F59E0B",
    suit: "#F6A21E",
    helmet: "#F97316",
    visor: "#131E2A",
    refl: "#FFB648",
    pack: "#3A4350",
    boot: "#D97706",
  },
  spacecraft_mass: {
    id: "ASTRO_MEDIC",
    key: "med",
    name: "Spacecraft Architect",
    bonusText: "Bonus: +15% chassis payload capacity",
    accent: "#14B8A6",
    suit: "#FFFFFF",
    helmet: "#FFFFFF",
    visor: "#0E2233",
    refl: "#2DD4BF",
    pack: "#14B8A6",
    boot: "#0F766E",
  },
  orbit_power: {
    id: "ASTRO_SOLDIER",
    key: "sol",
    name: "Orbital & Power Navigator",
    bonusText: "Bonus: +15% electric range",
    accent: "#EF4444",
    suit: "#EF4444",
    helmet: "#DC2626",
    visor: "#22090C",
    refl: "#F87171",
    pack: "#7F1D1D",
    boot: "#991B1B",
  },
  science_comms: {
    id: "ASTRO_DEFENDER",
    key: "def",
    name: "Science & Comms Officer",
    bonusText: "Bonus: +20% science output",
    accent: "#38BDF8",
    suit: "#3B82F6",
    helmet: "#2563EB",
    visor: "#0A1830",
    refl: "#7DD3FC",
    pack: "#1E3A8A",
    boot: "#1D4ED8",
  },
};

// Piece catalog ported from Ismael's "Taller de Ensamblaje del Vehículo Lunar.html" + docs/18-roadmap-ismael.md
const INITIAL_PIECES: RoverPiece[] = [
  // Chassis (Step 1)
  {
    id: "chasis_c1",
    slot: "chasis",
    cat: "chasis",
    name: "Light Chassis MLI C-1",
    spec: "Aluminum structure with MLI blankets. Lightweight for short sorties.",
    costM: 4,
    massKg: 180,
    maxLoadKg: 480,
    variant: "base",
  },
  {
    id: "chasis_c2",
    slot: "chasis",
    cat: "chasis",
    name: "Reinforced Chassis C-2",
    spec: "Cross-braced frame with gold Kapton MLI insulation. Higher payload limit.",
    costM: 7,
    massKg: 210,
    maxLoadKg: 620,
    variant: "refuerzo",
  },
  {
    id: "chasis_c3",
    slot: "chasis",
    cat: "chasis",
    locked: true,
    name: "Mars Heavy Chassis C-3",
    spec: "Dual articulated deep-space bus frame for extreme terrain & MSR loads.",
    costM: 12,
    massKg: 260,
    maxLoadKg: 760,
    variant: "refuerzo",
  },
  // Wheels
  {
    id: "rueda_malla",
    slot: "ruedas",
    cat: "ruedas",
    name: "Wire-Mesh Lunar Wheels",
    spec: "Flexible zinc-coated piano wire mesh for regolith. Balanced performance.",
    costM: 1.5,
    massKg: 14,
    tractionPct: 78,
    speedKmh: 12,
    variant: "malla",
  },
  {
    id: "rueda_ancha",
    slot: "ruedas",
    cat: "ruedas",
    name: "Wide Traction Treads",
    spec: "Deep-grooved chevrons for steep crater slopes. High grip, lower speed.",
    costM: 2.2,
    massKg: 22,
    tractionPct: 90,
    speedKmh: 9,
    variant: "ancha",
  },
  {
    id: "rueda_veloz",
    slot: "ruedas",
    cat: "ruedas",
    name: "High-Speed Alloy Wheels",
    spec: "Low-mass spoked hubs. Fast across flat mare plains.",
    costM: 2,
    massKg: 12,
    tractionPct: 62,
    speedKmh: 16,
    variant: "veloz",
  },
  {
    id: "rueda_titanio",
    slot: "ruedas",
    cat: "ruedas",
    locked: true,
    name: "Shape-Memory Titanium Wheels",
    spec: "NASA Glenn Nitinol spring tire alloy. Ultra-light with top traction.",
    costM: 5,
    massKg: 10,
    tractionPct: 88,
    speedKmh: 14,
    variant: "malla",
  },
  // Energy & Power (Step 2)
  {
    id: "bateria_b20",
    slot: "bateria",
    cat: "energia",
    name: "Li-Ion Battery Pack B-25",
    spec: "Space-grade lithium-ion cells. Standard eclipse survival reserve.",
    costM: 2,
    massKg: 25,
    kwh: 20,
    variant: "3",
  },
  {
    id: "bateria_b35",
    slot: "bateria",
    cat: "energia",
    name: "Extended Battery Pack B-35",
    spec: "High-capacity silver-zinc & Li-ion array for long polar shadow transits.",
    costM: 4,
    massKg: 60,
    kwh: 35,
    variant: "5",
  },
  {
    id: "rtg_pu238",
    slot: "bateria",
    cat: "energia",
    name: "Boom Mast + Pu-238 MMRTG",
    spec: "Continuous nuclear heat & 110 W electric power immune to dust storms (docs/18).",
    costM: 7,
    massKg: 56,
    kwh: 55,
    variant: "5",
  },
  {
    id: "panel_plegable",
    slot: "panel",
    cat: "energia",
    name: "Foldable Solar Array (1x)",
    spec: "Recharges the battery bank during sunlit orbital/surface phases.",
    costM: 2,
    massKg: 28,
    kwh: 10,
    variant: "base",
  },
  {
    id: "panel_ext",
    slot: "panel",
    cat: "energia",
    name: "Dual Wing Solar Panels",
    spec: "Twin gallium-arsenide wings (2x 22.5 kg) for high power demand.",
    costM: 4,
    massKg: 45,
    kwh: 18,
    variant: "ext",
  },
  // Thermal Protection & Deorbit (Step 2 — Mandatory per docs/18-roadmap-ismael.md)
  {
    id: "escudo_tps",
    slot: "escudo",
    cat: "proteccion",
    name: "AVCOAT Heat Shield (TPS)",
    spec: "Ablative thermal protection for 40,000 km/h Earth return (Node 3 survival).",
    costM: 4.5,
    massKg: 60,
    variant: "tps",
  },
  {
    id: "escudo_msr",
    slot: "escudo",
    cat: "proteccion",
    name: "Sealed Sample Capsule + TPS",
    spec: "Reinforced Earth Entry Vehicle (EEV) carbon-phenolic shield for Mars samples.",
    costM: 8,
    massKg: 95,
    sciencePts: 15,
    variant: "msr",
  },
  {
    id: "deorbit_thruster",
    slot: "deorbit",
    cat: "proteccion",
    name: "Deorbit Retro-Thruster (18 kg)",
    spec: "Dedicated braking thruster for safe orbital disposal & reentry targeting.",
    costM: 2,
    massKg: 18,
    variant: "thruster",
  },
  {
    id: "deorbit_kit",
    slot: "deorbit",
    cat: "proteccion",
    name: "Mars Entry & Deorbit Kit (20 kg)",
    spec: "Dual-nozzle reaction control & deorbit braking pack for Mars capture.",
    costM: 3,
    massKg: 20,
    variant: "kit",
  },
  // Cabin / Seat
  {
    id: "asiento_basico",
    slot: "asiento",
    cat: "cabina",
    name: "EVA Harness Seat",
    spec: "Lightweight foldable restraint seat with life-support umbilical.",
    costM: 1,
    massKg: 25,
    variant: "base",
  },
  {
    id: "asiento_cabina",
    slot: "asiento",
    cat: "cabina",
    name: "Roll-Cage Command Cockpit",
    spec: "Reinforced roll bar with HUD console and suit docking frame.",
    costM: 3,
    massKg: 48,
    variant: "cabina",
  },
  // Science & Equipment
  {
    id: "antena_baja",
    slot: "antena",
    cat: "equipo",
    name: "Low-Gain Omni Mast",
    spec: "Simple UHF/S-band whip antenna for short-range relay.",
    costM: 1,
    massKg: 6,
    rangeKm: 30,
    sciencePts: 20,
    variant: "baja",
  },
  {
    id: "antena_parab",
    slot: "antena",
    cat: "equipo",
    name: "HGA Parabolic Dish Mount",
    spec: "Steerable 3m High-Gain X-band dish for Deep Space Network downlink.",
    costM: 3.5,
    massKg: 30,
    rangeKm: 150,
    sciencePts: 45,
    variant: "parab",
  },
  {
    id: "herr_taladro",
    slot: "herramienta",
    cat: "equipo",
    name: "Core Sample Drill",
    spec: "Rotary-percussive drill to extract subsurface regolith & ice cores.",
    costM: 4,
    massKg: 32,
    sciencePts: 35,
    variant: "drill",
  },
  {
    id: "herr_brazo",
    slot: "herramienta",
    cat: "equipo",
    name: "Robotic Manipulator Arm",
    spec: "5-DOF articulated arm for instrument deployment & sample caching.",
    costM: 6,
    massKg: 55,
    sciencePts: 40,
    variant: "arm",
  },
  {
    id: "herr_pala",
    slot: "herramienta",
    cat: "equipo",
    name: "Regolith Trenching Scoop",
    spec: "Clears boulders and excavates shallow trenches.",
    costM: 2.5,
    massKg: 28,
    sciencePts: 15,
    variant: "shovel",
  },
  {
    id: "carga_caja",
    slot: "carga",
    cat: "equipo",
    name: "Hermetic Sample Box",
    spec: "Vacuum-sealed container for returned core tubes.",
    costM: 1.5,
    massKg: 20,
    cargoCapKg: 80,
    sciencePts: 15,
    variant: "caja",
  },
  {
    id: "carga_remolque",
    slot: "carga",
    cat: "equipo",
    name: "Auxiliary Payload Trailer",
    spec: "Two-wheeled towed utility bed for heavy science packages.",
    costM: 3,
    massKg: 45,
    cargoCapKg: 200,
    sciencePts: 25,
    variant: "remolque",
  },
];

const SLOT_LABELS: Record<SlotId, string> = {
  chasis: "1. Chassis",
  ruedas: "Wheels",
  bateria: "2. Power / RTG",
  panel: "2. Solar Array",
  escudo: "2. Heat Shield",
  deorbit: "2. Deorbit Pack",
  asiento: "Crew Cockpit",
  antena: "HGA Antenna",
  herramienta: "Front Tool",
  carga: "Sample Bay",
};

const SLOT_VIEWBOX: Record<SlotId, [number, number]> = {
  chasis: [380, 52],
  ruedas: [96, 96],
  bateria: [130, 50],
  panel: [170, 62],
  escudo: [160, 44],
  deorbit: [88, 52],
  asiento: [110, 85],
  antena: [50, 150],
  herramienta: [96, 84],
  carga: [96, 56],
};

function polar(cx: number, cy: number, r: number, a: number): [string, string] {
  return [(cx + r * Math.cos(a)).toFixed(1), (cy + r * Math.sin(a)).toFixed(1)];
}
function bolt(cx: number | string, cy: number | string, r = 1.8): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#gHub)" stroke="#38404b" stroke-width=".6"/>`;
}
function rectSvg(
  x: number | string,
  y: number | string,
  w: number | string,
  h: number | string,
  rx: number,
  fill: string,
  stroke?: string,
  sw = 1
): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ""} fill="${fill}"${
    stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ""
  }/>`;
}
function tubeSvg(d: string, w: number, light = "#b9c1cb"): string {
  return (
    `<path d="${d}" fill="none" stroke="#2e353f" stroke-width="${w + 3}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${light}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="${Math.max(
      1,
      w / 4
    )}" stroke-linecap="round" stroke-linejoin="round" transform="translate(-1 -1)"/>`
  );
}

/** Port of Ismael's procedural SVG generator (`artBody`) for each rover & spacecraft piece. */
function renderPieceInnerSvg(p: RoverPiece, roleCfg: RoleConfig): string {
  let g = "";
  switch (p.slot) {
    case "chasis": {
      g += rectSvg(14, 34, 352, 16, 4, "url(#gMetalD)", "#1c222a", 1.5);
      for (let i = 0; i < 9; i++) g += bolt(30 + i * 40, 42, 2);
      g += rectSvg(2, 0, 376, 38, 10, "url(#gMetal)", "#4b5561", 1.6);
      g += rectSvg(10, 2, 360, 5, 3, "rgba(255,255,255,.55)");
      g += rectSvg(2, 30, 376, 8, 4, "rgba(0,0,0,.18)");
      for (const px of [70, 130, 250, 310]) {
        g += `<line x1="${px}" y1="6" x2="${px}" y2="33" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/><line x1="${
          px + 1.5
        }" y1="6" x2="${px + 1.5}" y2="33" stroke="rgba(255,255,255,.5)" stroke-width="1"/>`;
      }
      for (let i = 0; i < 3; i++) {
        g += rectSvg(22, 12 + i * 7, 40, 3.5, 1.5, "#4b5561") + rectSvg(318, 12 + i * 7, 40, 3.5, 1.5, "#4b5561");
      }
      for (let i = 0; i < 9; i++) g += bolt(16 + i * 43, 5, 1.7);
      g +=
        rectSvg(76, 10, 48, 16, 3, "#2b3a4d", "#59626e", 1) +
        `<text x="100" y="21.5" text-anchor="middle" font-family="monospace" font-size="8" font-weight="700" fill="#7fa6d6">LRV-26</text>`;
      g +=
        rectSvg(258, 10, 52, 16, 3, "#3a4350", "#59626e", 1) +
        `<rect x="262" y="13" width="14" height="10" fill="#F59E0B"/><rect x="280" y="13" width="14" height="10" fill="#EF4444"/><rect x="296" y="13" width="10" height="10" fill="#22C55E"/>`;
      if (p.variant === "refuerzo") {
        g += rectSvg(144, 5, 96, 28, 3, "url(#gFoil)", "#8a5a0d", 1.2);
        for (let i = 0; i < 12; i++) {
          g += `<path d="M${147 + i * 8},7 L${151 + i * 8},20 L${147 + i * 8},31" fill="none" stroke="rgba(255,240,190,.55)" stroke-width="1.2"/>`;
        }
        let q = "M18,37";
        for (let i = 0; i < 8; i++) q += ` L${18 + i * 44 + 22},48 L${18 + (i + 1) * 44},37`;
        g += tubeSvg(q, 2.4, "#c4ccd6");
      }
      return g;
    }
    case "ruedas": {
      if (p.variant === "veloz") {
        g += `<circle cx="48" cy="48" r="45" fill="url(#gTire)" stroke="#0a0b0d" stroke-width="2"/>`;
        for (let i = 0; i < 30; i++) {
          const a = (i * Math.PI * 2) / 30;
          const q = polar(48, 48, 40, a);
          const r = polar(48, 48, 45, a);
          g += `<line x1="${q[0]}" y1="${q[1]}" x2="${r[0]}" y2="${r[1]}" stroke="#444a54" stroke-width="2.2"/>`;
        }
        g += `<circle cx="48" cy="48" r="37" fill="#1b1e24" stroke="#5a616c" stroke-width="2"/>`;
        for (let i = 0; i < 5; i++) {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const q = polar(48, 48, 9, a);
          const r = polar(48, 48, 35, a);
          g += `<line x1="${q[0]}" y1="${q[1]}" x2="${r[0]}" y2="${r[1]}" stroke="#b9c1cb" stroke-width="6" stroke-linecap="round"/>`;
        }
        g += `<circle cx="48" cy="48" r="13" fill="url(#gHubBlue)" stroke="#06265a" stroke-width="2"/><circle cx="48" cy="48" r="4.5" fill="#0b1220" stroke="#8cc4ff" stroke-width="1"/>`;
        return g;
      }
      g += `<circle cx="48" cy="48" r="46" fill="url(#gTire)" stroke="#0a0b0d" stroke-width="2"/>`;
      const count = p.variant === "ancha" ? 20 : 28;
      for (let i = 0; i < count; i++) {
        const a = (i * Math.PI * 2) / count;
        const q = polar(48, 48, 38, a);
        const r = polar(48, 48, 46, a);
        g += `<line x1="${q[0]}" y1="${q[1]}" x2="${r[0]}" y2="${r[1]}" stroke="#4a505a" stroke-width="${
          p.variant === "ancha" ? 6 : 3.4
        }"/>`;
      }
      g += `<circle cx="48" cy="48" r="34" fill="#101215" stroke="#b9c1cb" stroke-width="2.4"/>`;
      g += `<circle cx="48" cy="48" r="24" fill="none" stroke="#8d96a3" stroke-width="1.4" stroke-dasharray="3 3"/>`;
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI * 2) / 10;
        const q = polar(48, 48, 13, a);
        const r = polar(48, 48, 33, a);
        g += `<line x1="${q[0]}" y1="${q[1]}" x2="${r[0]}" y2="${r[1]}" stroke="#8d96a3" stroke-width="1.3"/>`;
      }
      g += `<circle cx="48" cy="48" r="13" fill="url(#gHub)" stroke="#3a4350" stroke-width="2"/><circle cx="48" cy="48" r="3.6" fill="#2a313b"/>`;
      return g;
    }
    case "bateria": {
      const cells = Number(p.variant) || 3;
      const isRtg = p.id === "rtg_pu238";
      g += rectSvg(20, 1, 18, 9, 2, "url(#gTubeV)", "#39414c", 1) + rectSvg(92, 1, 18, 9, 2, "url(#gTubeV)", "#39414c", 1);
      g += rectSvg(2, 8, 126, 40, 5, isRtg ? "url(#gFoil)" : "url(#gBatt)", isRtg ? "#f59e0b" : "#86abd9", 1.6);
      const step = 108 / cells;
      for (let i = 0; i < cells; i++) {
        const x = 11 + i * step;
        g += rectSvg(x.toFixed(1), 17, (step - 4).toFixed(1), 22, 2, "url(#gCell)", "#16304f", 1);
      }
      g +=
        rectSvg(8, 40, 54, 6, 1.5, "#0c1420") +
        `<text x="35" y="44.8" text-anchor="middle" font-family="monospace" font-size="4.8" font-weight="700" fill="#7fa6d6">${
          isRtg ? "PU-238 RTG" : `LI-ION ${p.kwh}kWh`
        }</text>`;
      g += `<circle cx="118" cy="43" r="3" fill="#4ade80"/>`;
      return g;
    }
    case "panel": {
      const isExt = p.variant === "ext";
      g += tubeSvg("M50,38 L44,60", 3, "#aab2bd") + tubeSvg("M120,38 L126,60", 3, "#aab2bd");
      g += `<polygon points="14,4 156,4 168,38 2,38" fill="url(#gPanel)" stroke="${
        isExt ? "#f0c24b" : "#c3cfe6"
      }" stroke-width="2.2" stroke-linejoin="round"/>`;
      const cols = isExt ? 8 : 5;
      for (let i = 1; i < cols; i++) {
        const x1 = 14 + i * (142 / cols);
        const x2 = 2 + i * (166 / cols);
        g += `<line x1="${x1.toFixed(1)}" y1="4" x2="${x2.toFixed(1)}" y2="38" stroke="rgba(170,200,255,.55)" stroke-width="1.2"/>`;
      }
      g += `<line x1="8" y1="21" x2="162" y2="21" stroke="rgba(170,200,255,.55)" stroke-width="1.2"/>`;
      g += `<polygon points="14,4 156,4 168,38 2,38" fill="url(#gGlare)"/>`;
      return g;
    }
    case "escudo": {
      const isMsr = p.variant === "msr";
      g += `<path d="M6,10 L154,10 L142,36 Q80,44 18,36 Z" fill="url(#gFoil)" stroke="#9C6812" stroke-width="2"/>`;
      g += `<path d="M16,34 Q80,42 144,34" fill="none" stroke="#EF4444" stroke-width="3.5" stroke-linecap="round"/>`;
      for (let i = 0; i < 6; i++) {
        g += `<line x1="${26 + i * 22}" y1="12" x2="${22 + i * 22}" y2="33" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>`;
      }
      g +=
        rectSvg(42, 15, 76, 13, 3, "#14171D", "#F59E0B", 1) +
        `<text x="80" y="24" text-anchor="middle" font-family="monospace" font-size="6.8" font-weight="700" fill="#FDE68A">${
          isMsr ? "MSR EEV SHIELD" : "AVCOAT TPS"
        }</text>`;
      return g;
    }
    case "deorbit": {
      g += rectSvg(8, 10, 52, 32, 6, "url(#gMetalD)", "#4b5561", 1.6);
      g += `<polygon points="60,15 84,6 84,46 60,37" fill="url(#gMetal)" stroke="#38404b" stroke-width="1.6"/>`;
      g += rectSvg(14, 16, 38, 8, 2, "#F59E0B", "#8a5a0d", 1);
      g += `<text x="33" y="35" text-anchor="middle" font-family="monospace" font-size="6" font-weight="700" fill="#93C5FD">RETRO-DV</text>`;
      return g;
    }
    case "asiento": {
      const OL = "#182230";
      g += rectSvg(8, 77, 94, 8, 2, "url(#gTubeH)", "#39414c", 1);
      if (p.variant === "cabina") {
        g += tubeSvg("M9,78 L9,24 Q9,5 55,5 Q101,5 101,24 L101,78", 4.5, "#b9c1cb");
      }
      g += rectSvg(14, 28, 15, 44, 6, "url(#gMetalD)", "#1c222a", 1.2);
      g += rectSvg(14, 66, 66, 11, 3, "url(#gMetalD)", "#1c222a", 1);
      g += `<rect x="27" y="40" width="13" height="28" rx="4.5" fill="${roleCfg.pack}" stroke="${OL}" stroke-width="2.4"/>`;
      g += `<rect x="38" y="42" width="29" height="26" rx="10" fill="${roleCfg.suit}" stroke="${OL}" stroke-width="2.8"/>`;
      g += `<circle cx="56" cy="23" r="19.5" fill="${roleCfg.helmet}" stroke="${OL}" stroke-width="3"/>`;
      g += `<ellipse cx="61" cy="24" rx="11.5" ry="10.5" fill="${roleCfg.visor}" stroke="${OL}" stroke-width="2"/>`;
      g += `<ellipse cx="56.5" cy="18.5" rx="2.8" ry="1.7" fill="rgba(255,255,255,.85)"/>`;
      g += rectSvg(90, 50, 16, 27, 3, "url(#gMetalD)", "#1c222a", 1.2);
      return g;
    }
    case "antena": {
      g += rectSvg(23, 30, 5, 112, 1.5, "url(#gTubeV)", "#39414c", 0.8);
      g += rectSvg(8, 134, 34, 16, 2, "url(#gMetalD)", "#1c222a", 1.2);
      if (p.variant === "parab") {
        g += `<path d="M2,26 Q25,66 48,26 Q25,38 2,26 Z" fill="url(#gMetal)" stroke="#4b5561" stroke-width="1.6"/>`;
        g += `<ellipse cx="25" cy="26" rx="23" ry="6.5" fill="url(#gDish)" stroke="#6b7380" stroke-width="1.2"/>`;
        g += `<circle cx="25" cy="8" r="3.5" fill="#F59E0B" stroke="#8a5a0d" stroke-width="1"/>`;
      } else {
        g += rectSvg(24, 6, 3, 26, 1, "url(#gTubeV)", "#39414c", 0.6);
        g += `<circle cx="25.5" cy="5" r="4" fill="#F59E0B" stroke="#8a5a0d" stroke-width="1"/>`;
      }
      return g;
    }
    case "herramienta": {
      g += rectSvg(0, 28, 18, 30, 3, "url(#gMetalD)", "#1c222a", 1);
      if (p.variant === "drill") {
        g += tubeSvg("M18,43 L52,43", 6.5, "#b9c1cb");
        g += rectSvg(46, 42, 14, 30, 2, "url(#gTubeV)", "#39414c", 1);
        g += `<polygon points="49,72 57,72 53,84" fill="#E0A020" stroke="#8a5a0d" stroke-width="1"/>`;
      } else if (p.variant === "arm") {
        g += tubeSvg("M18,43 L44,20", 6.5, "#b9c1cb") + tubeSvg("M44,20 L70,40", 5.5, "#b9c1cb");
        g += tubeSvg("M70,40 L84,52 L80,64", 3.2, "#E0A020") + tubeSvg("M70,40 L90,38 L93,52", 3.2, "#E0A020");
      } else {
        g += tubeSvg("M18,43 L40,51", 6.5, "#b9c1cb");
        g += `<polygon points="40,50 78,44 90,74 46,78" fill="url(#gMetal)" stroke="#4b5561" stroke-width="1.8"/>`;
      }
      return g;
    }
    case "carga": {
      g += rectSvg(4, 5, 88, 46, 4, "url(#gBox)", "#3a424d", 1.6);
      g += rectSvg(18, 19, 9, 11, 1.5, "#E0A020", "#8a5a0d", 1) + rectSvg(69, 19, 9, 11, 1.5, "#E0A020", "#8a5a0d", 1);
      g += `<text x="48" y="44" text-anchor="middle" font-family="monospace" font-size="7" font-weight="700" fill="rgba(255,255,255,.75)">SAMPLES</text>`;
      return g;
    }
  }
}

export function Rol2A_TopologicalAssembly({
  missionId,
  roleId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const roleCfg = ROLE_CONFIGS[roleId] ?? ROLE_CONFIGS.spacecraft_mass;
  const missionCfg = nasaCatalog.missions[missionId] ?? nasaCatalog.missions.artemis_moon;

  const [pieces, setPieces] = useState<RoverPiece[]>(INITIAL_PIECES);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [selectedSlot, setSelectedSlot] = useState<SlotId | null>("chasis");
  const [wheels6, setWheels6] = useState<boolean>(false);
  const [isTestingDrive, setIsTestingDrive] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Topological DAG state (docs/18-roadmap-ismael.md Paso 1)
  const [equipped, setEquipped] = useState<Partial<Record<SlotId, RoverPiece>>>({});
  const [torqued, setTorqued] = useState<boolean>(false);
  const [wired, setWired] = useState<boolean>(false);
  const [integrityPct, setIntegrityPct] = useState<number>(100);
  const [orderAlert, setOrderAlert] = useState<string | null>(null);

  const autoSubmitted = useRef(false);

  // Compute rover & spacecraft telemetry (ported from Ismael's compute() in Taller de Ensamblaje)
  const stats = useMemo(() => {
    const wheelCount = wheels6 ? 6 : 4;
    let dryMassKg = 0;
    let costM = 0;
    let kwh = 0;
    let sciencePts = 0;

    for (const [slotKey, piece] of Object.entries(equipped) as [SlotId, RoverPiece | undefined][]) {
      if (!piece) continue;
      const mult = slotKey === "ruedas" ? wheelCount : 1;
      dryMassKg += piece.massKg * mult;
      costM += piece.costM * mult;
      kwh += piece.kwh ?? 0;
      sciencePts += piece.sciencePts ?? 0;
    }

    if (roleId === "finance_launch") costM *= 0.85;
    const ch = equipped.chasis;
    const ru = equipped.ruedas;
    let maxLoadKg = ch?.maxLoadKg ?? 0;
    if (roleId === "spacecraft_mass" && maxLoadKg > 0) {
      maxLoadKg = Math.round(maxLoadKg * 1.15);
    }

    let speedKmh = 0;
    if (ru) {
      const loadRatio = maxLoadKg > 0 ? Math.min(1, dryMassKg / maxLoadKg) : 1;
      speedKmh = (ru.speedKmh ?? 12) * (1 - 0.35 * loadRatio);
    }
    const tractionPct = ru ? Math.min(100, (ru.tractionPct ?? 75) + (wheels6 ? 8 : 0)) : 0;
    const consumption = dryMassKg * 0.0013;
    let rangeKm = consumption > 0 && kwh > 0 ? kwh / consumption : 0;
    if (roleId === "orbit_power") rangeKm *= 1.15;
    if (roleId === "science_comms" && sciencePts > 0) {
      sciencePts = Math.round(sciencePts * 1.2);
    }

    const hasChassis = Boolean(equipped.chasis);
    const hasPower = Boolean(equipped.bateria || equipped.panel);
    const hasThermalProtection = Boolean(equipped.escudo);
    const hasDeorbitDevice = Boolean(equipped.deorbit);

    // Fallback to catalog baseline if nothing was mounted yet
    const fallbackMass = missionId === "mars_sample_return" ? 461 : 373;
    const effectiveDryMassKg = dryMassKg > 0 ? Math.round(dryMassKg) : fallbackMass;

    return {
      wheelCount,
      dryMassKg: effectiveDryMassKg,
      rawMountedMassKg: Math.round(dryMassKg),
      costM: Math.round(costM * 10) / 10,
      kwh,
      maxLoadKg,
      speedKmh: Math.round(speedKmh * 10) / 10,
      tractionPct: Math.round(tractionPct),
      rangeKm: Math.round(rangeKm),
      sciencePts,
      hasChassis,
      hasPower,
      hasThermalProtection,
      hasDeorbitDevice,
    };
  }, [equipped, wheels6, roleId, missionId]);

  // Share rover mass with Ismael's VAB window state for cross-screen fidelity
  useEffect(() => {
    try {
      const w = window as unknown as {
        VAB_STATE?: { roverPayload?: { mass: number; role: string } };
      };
      w.VAB_STATE = {
        roverPayload: {
          mass: Number((stats.dryMassKg / 1000).toFixed(3)),
          role: roleCfg.name,
        },
      };
    } catch {
      /* ignore SSR/sandbox window errors */
    }
  }, [stats.dryMassKg, roleCfg.name]);

  const emitMutation = useCallback(
    (
      nextEquipped: Partial<Record<SlotId, RoverPiece>>,
      nextWheels6: boolean,
      nextIntegrity: number
    ) => {
      if (isLocked) return;
      const wCount = nextWheels6 ? 6 : 4;
      let mass = 0;
      for (const [k, p] of Object.entries(nextEquipped) as [SlotId, RoverPiece | undefined][]) {
        if (!p) continue;
        mass += p.massKg * (k === "ruedas" ? wCount : 1);
      }
      const fallbackMass = missionId === "mars_sample_return" ? 461 : 373;
      const finalMass = mass > 0 ? Math.round(mass) : fallbackMass;
      const hasTps = Boolean(nextEquipped.escudo);
      const hasDeorbit = Boolean(nextEquipped.deorbit);

      onLiveMutation({
        dry_mass_kg: finalMass,
        bus_dry_mass_kg: finalMass,
        has_thermal_protection: hasTps,
        has_deorbit_device: hasDeorbit,
        assembly_integrity_pct: nextIntegrity,
      });
    },
    [isLocked, missionId, onLiveMutation]
  );

  const triggerOrderPenalty = useCallback((msg: string) => {
    setOrderAlert(msg);
    // Forgiving (2026-11-15): order mistakes teach, but never cost more than -15% in total.
    setIntegrityPct((prev) => Math.max(85, prev - 5));
  }, []);

  const handleEquipPiece = useCallback(
    (piece: RoverPiece) => {
      if (isLocked) return;
      if (piece.locked) {
        setPieces((prev) => prev.map((p) => (p.id === piece.id ? { ...p, locked: false } : p)));
        setOrderAlert(`Unlocked ${piece.name}! Tap again to mount.`);
        return;
      }

      // DAG Rule 1: Must install Chassis first! (docs/18-roadmap-ismael.md Paso 1)
      if (piece.slot !== "chasis" && !equipped.chasis) {
        triggerOrderPenalty("Install chassis first! (-5% structural integrity)");
        return;
      }

      setOrderAlert(null);
      setEquipped((prev) => {
        const next = { ...prev };
        if (next[piece.slot]?.id === piece.id) {
          delete next[piece.slot];
        } else {
          next[piece.slot] = piece;
        }
        emitMutation(next, wheels6, integrityPct);
        return next;
      });
      setSelectedSlot(piece.slot);
      // Modifying hardware after bolting/wiring requires re-torquing
      if (torqued || wired) {
        setTorqued(false);
        setWired(false);
      }
    },
    [isLocked, equipped.chasis, triggerOrderPenalty, emitMutation, wheels6, integrityPct, torqued, wired]
  );

  const handleTorqueStep = useCallback(() => {
    if (isLocked) return;
    if (!equipped.chasis) {
      triggerOrderPenalty("Install chassis first before using TORQUE (T1)! (-5% integrity)");
      return;
    }
    if (!stats.hasPower || !stats.hasThermalProtection) {
      triggerOrderPenalty(
        "Mount Power & Heat Shield (Step 2) before bolting with TORQUE (T1)! (-5% integrity)"
      );
      return;
    }
    setOrderAlert(null);
    setTorqued(true);
    emitMutation(equipped, wheels6, integrityPct);
  }, [isLocked, equipped, stats.hasPower, stats.hasThermalProtection, triggerOrderPenalty, emitMutation, wheels6, integrityPct]);

  const handleWiringStep = useCallback(() => {
    if (isLocked) return;
    if (!equipped.chasis) {
      triggerOrderPenalty("Install chassis first before connecting WIRING (T2)! (-5% integrity)");
      return;
    }
    if (!torqued) {
      triggerOrderPenalty("Apply TORQUE (T1) structural bolts before WIRING (T2)! (-5% integrity)");
      return;
    }
    setOrderAlert(null);
    setWired(true);
    emitMutation(equipped, wheels6, integrityPct);
  }, [isLocked, equipped, torqued, triggerOrderPenalty, emitMutation, wheels6, integrityPct]);

  // Port of Ismael's loadStarterRover() adapted per mission
  const handleLoadStarterBuild = useCallback(() => {
    if (isLocked) return;
    const byId = (id: string) => pieces.find((p) => p.id === id);
    const isMars = missionId === "mars_sample_return";
    const next: Partial<Record<SlotId, RoverPiece>> = {
      chasis: byId(isMars ? "chasis_c2" : "chasis_c1"),
      ruedas: byId("rueda_malla"),
      bateria: byId(isMars ? "rtg_pu238" : "bateria_b20"),
      panel: isMars ? undefined : byId("panel_ext"),
      escudo: byId(isMars ? "escudo_msr" : "escudo_tps"),
      deorbit: byId(isMars ? "deorbit_kit" : "deorbit_thruster"),
      asiento: byId("asiento_cabina"),
      antena: byId(isMars ? "antena_parab" : "antena_baja"),
      herramienta: byId("herr_taladro"),
    };
    setEquipped(next);
    setTorqued(true);
    setWired(true);
    setOrderAlert(null);
    emitMutation(next, wheels6, integrityPct);
  }, [isLocked, pieces, missionId, emitMutation, wheels6, integrityPct]);

  const handleClearAll = useCallback(() => {
    if (isLocked) return;
    setEquipped({});
    setTorqued(false);
    setWired(false);
    setOrderAlert(null);
    emitMutation({}, wheels6, integrityPct);
  }, [isLocked, emitMutation, wheels6, integrityPct]);

  const buildFinalPayload = useCallback(() => {
    const finalIntegrity = Math.max(
      60,
      integrityPct - (torqued ? 0 : 10) - (wired ? 0 : 10)
    );
    return {
      bus_dry_mass_kg: stats.dryMassKg,
      dry_mass_kg: stats.dryMassKg,
      has_thermal_protection: stats.hasThermalProtection,
      assembly_integrity_pct: finalIntegrity,
      has_deorbit_device: stats.hasDeorbitDevice,
    };
  }, [integrityPct, torqued, wired, stats.dryMassKg, stats.hasThermalProtection, stats.hasDeorbitDevice]);

  useEffect(() => {
    if (timeLeftSec <= 0 && !isLocked && !autoSubmitted.current) {
      autoSubmitted.current = true;
      onSubmitTake(buildFinalPayload());
    }
  }, [timeLeftSec, isLocked, onSubmitTake, buildFinalPayload]);

  const filteredPieces = useMemo(
    () =>
      activeCategory === "all"
        ? pieces
        : pieces.filter((p) => p.cat === activeCategory),
    [pieces, activeCategory]
  );

  const step1Done = stats.hasChassis;
  const step2Done = stats.hasPower && stats.hasThermalProtection && stats.hasDeorbitDevice;
  const step3Done = torqued;
  const step4Done = wired;

  // ---------------------------------------------------------------------------
  // Game window UI (2026-11-15): ship blueprint with slots (the next required slot glows),
  // a parts tray for the selected slot, then two hands-on steps: tap 4 bolts, match 3 cables.
  // Model above (pieces, order penalties, payload) unchanged.
  // ---------------------------------------------------------------------------
  const BOLT_COUNT = 4;
  const CABLE_COLORS = ["#EF4444", "#3B82F6", "#22C55E"] as const;
  const [boltsDone, setBoltsDone] = useState<number[]>([]);
  const [cableLeft, setCableLeft] = useState<number | null>(null);
  const [cablesDone, setCablesDone] = useState<number[]>([]);
  const rightOrder = [2, 0, 1];
  const nextSlot: SlotId | null = !step1Done
    ? "chasis"
    : !stats.hasPower
    ? "bateria"
    : !stats.hasThermalProtection
    ? "escudo"
    : !stats.hasDeorbitDevice
    ? "deorbit"
    : null;
  const slotPieces = pieces.filter((p) => p.slot === (selectedSlot ?? "chasis"));
  const goals: Goal[] = [
    { label: "Frame mounted first", done: step1Done },
    { label: "Power, heat shield, deorbit", done: step2Done },
    { label: "All bolts tight", done: step3Done },
    { label: "Cables connected", done: step4Done },
  ];

  const tapBolt = (i: number) => {
    if (isLocked || boltsDone.includes(i)) return;
    if (!step2Done) {
      handleTorqueStep(); // applies the order penalty + message
      return;
    }
    soundEngine.playClick();
    const next = [...boltsDone, i];
    setBoltsDone(next);
    if (next.length >= BOLT_COUNT) {
      soundEngine.playComplete();
      handleTorqueStep();
    }
  };
  const tapCable = (side: "L" | "R", color: number) => {
    if (isLocked || cablesDone.includes(color)) return;
    if (!torqued) {
      handleWiringStep();
      return;
    }
    if (side === "L") {
      soundEngine.playClick();
      setCableLeft(color);
      return;
    }
    if (cableLeft === null) return;
    if (cableLeft !== color) {
      soundEngine.playError();
      setCableLeft(null);
      return;
    }
    soundEngine.playComplete();
    const next = [...cablesDone, color];
    setCablesDone(next);
    setCableLeft(null);
    if (next.length >= CABLE_COLORS.length) handleWiringStep();
  };
  // Changing hardware un-bolts the ship (model resets torqued/wired): mirror it in the mini-steps.
  useEffect(() => {
    if (!torqued) setBoltsDone([]);
    if (!wired) setCablesDone([]);
  }, [torqued, wired]);

  const slotTile = (slotId: SlotId, wide = false) => {
    const piece = equipped[slotId];
    const [vbW, vbH] = SLOT_VIEWBOX[slotId];
    const isNext = nextSlot === slotId;
    const isSel = selectedSlot === slotId;
    return (
      <button
        key={slotId}
        type="button"
        disabled={isLocked}
        onClick={() => {
          soundEngine.playClick();
          setSelectedSlot(slotId);
        }}
        className={`relative flex min-h-[64px] min-w-0 flex-col items-center justify-center rounded-lg border-[3px] p-1 transition ${
          wide ? "col-span-2" : ""
        } ${
          piece
            ? "border-status-ok bg-slate-900/80"
            : isSel
            ? "border-sky-glow border-dashed bg-sky-950/40"
            : "border-dashed border-slate-600 bg-slate-900/40"
        }`}
      >
        {isNext && !piece && (
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-md border-[3px] border-status-warn"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        {piece ? (
          <svg
            viewBox={`0 0 ${vbW} ${vbH}`}
            className="h-11 w-full"
            dangerouslySetInnerHTML={{ __html: renderPieceInnerSvg(piece, roleCfg) }}
          />
        ) : (
          <span className="text-center font-mono text-[10px] font-bold text-slate-400">
            {SLOT_LABELS[slotId].replace(/^\d\.\s*/, "")}
          </span>
        )}
        {slotId === "chasis" && piece && (
          <span className="absolute inset-x-2 bottom-1 flex justify-between">
            {Array.from({ length: BOLT_COUNT }, (_, i) => (
              <span
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Bolt ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  tapBolt(i);
                }}
                className={`h-4 w-4 rounded-full border-2 border-ink-black ${
                  boltsDone.includes(i) || torqued ? "bg-status-ok" : step2Done ? "animate-pulse bg-status-warn" : "bg-slate-500"
                }`}
              />
            ))}
          </span>
        )}
      </button>
    );
  };

  return (
    <GameLayout
      play={
        <div className="relative flex h-full flex-col">
          <PlayBackdrop tint="#22D3EE" />
          {orderAlert && (
            <div className="relative z-10 mx-3 mt-2 flex items-center gap-2 rounded-lg border-[3px] border-ink-black bg-status-warn px-2.5 py-1 text-xs font-bold text-ink-black">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {orderAlert.replace(/\s*\(.*\)\s*$/, "")}
            </div>
          )}
          <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            {/* ship blueprint */}
            <div className="relative flex min-h-0 flex-col justify-center gap-2 overflow-hidden rounded-xl border-[3px] border-ink-black bg-slate-800/70 p-2">
              <svg viewBox="0 0 200 120" className="pointer-events-none absolute inset-0 h-full w-full opacity-25" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <path d="M20 70 Q20 40 60 36 L140 36 Q180 40 182 70 L182 84 L20 84 Z" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
                <path d="M70 36 L80 16 L122 16 L132 36" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
                {[40, 75, 125, 160].map((x) => (<circle key={x} cx={x} cy="94" r="12" fill="none" stroke="#38BDF8" strokeWidth="2.5" />))}
                <line x1="100" y1="16" x2="100" y2="4" stroke="#38BDF8" strokeWidth="2" />
              </svg>
              <div className="grid grid-cols-4 gap-1.5">
                {(["panel", "antena", "asiento", "herramienta"] as SlotId[]).map((s) => slotTile(s))}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {slotTile("bateria")}
                {slotTile("chasis", true)}
                {slotTile("carga")}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(["ruedas", "escudo", "deorbit"] as SlotId[]).map((s) => slotTile(s))}
              </div>
              {/* wiring panel */}
              <div className="mt-auto flex items-center justify-between gap-2 rounded-lg border-2 border-ink-black bg-space-ink px-2 py-1.5">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-slate-400">
                  <Cable className="h-3.5 w-3.5" /> Wire
                </span>
                <div className="flex gap-1.5">
                  {CABLE_COLORS.map((c, i) => (
                    <button key={`L${i}`} type="button" aria-label={`Left plug ${i + 1}`} onClick={() => tapCable("L", i)}
                      className={`h-6 w-6 rounded-md border-[3px] ${cableLeft === i ? "border-paper-cream" : "border-ink-black"} ${cablesDone.includes(i) || wired ? "opacity-40" : ""}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-slate-500">⟶</span>
                <div className="flex gap-1.5">
                  {rightOrder.map((i) => (
                    <button key={`R${i}`} type="button" aria-label={`Right plug ${i + 1}`} onClick={() => tapCable("R", i)}
                      className={`h-6 w-6 rounded-md border-[3px] border-ink-black ${cablesDone.includes(i) || wired ? "opacity-40" : ""}`}
                      style={{ backgroundColor: CABLE_COLORS[i] }} />
                  ))}
                </div>
              </div>
            </div>

            {/* parts tray for the selected slot */}
            <div className="flex min-h-0 flex-col gap-1.5 overflow-y-auto rounded-xl border-[3px] border-ink-black bg-slate-900/80 p-2">
              <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase text-slate-400">
                <span>{SLOT_LABELS[selectedSlot ?? "chasis"].replace(/^\d\.\s*/, "")} parts</span>
                <button type="button" onClick={handleLoadStarterBuild} disabled={isLocked}
                  className="inline-flex items-center gap-1 rounded border border-slate-600 px-1.5 py-0.5 text-sky-glow hover:bg-slate-800">
                  <Sparkles className="h-3 w-3" /> Auto
                </button>
              </div>
              {!step1Done && selectedSlot !== "chasis" ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-3 text-center">
                  <p className="text-sm font-bold">Mount the frame first.</p>
                  <button type="button" onClick={() => setSelectedSlot("chasis")}
                    className="paper-btn bg-status-warn px-3 py-1.5 text-sm text-ink-black">Go to frame</button>
                </div>
              ) : slotPieces.map((piece) => {
                const [vbW, vbH] = SLOT_VIEWBOX[piece.slot];
                const mounted = equipped[piece.slot]?.id === piece.id;
                return (
                  <button
                    key={piece.id}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      soundEngine.playClick();
                      handleEquipPiece(piece);
                    }}
                    className={`flex items-center gap-2 rounded-lg border-[3px] p-1.5 text-left transition ${
                      mounted ? "border-status-ok bg-emerald-950/50" : "border-ink-black bg-space-ink hover:bg-blueprint-navy"
                    }`}
                  >
                    <svg viewBox={`0 0 ${vbW} ${vbH}`} className="h-8 w-12 shrink-0"
                      dangerouslySetInnerHTML={{ __html: renderPieceInnerSvg(piece, roleCfg) }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold">{piece.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {piece.massKg} kg · ${piece.costM}M
                      </span>
                    </span>
                    {mounted && <CheckCircle2 className="h-4 w-4 shrink-0 text-status-ok" />}
                    {piece.locked && <Lock className="h-4 w-4 shrink-0 text-slate-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      }
      panel={
        <>
          <GoalList goals={goals} />
          <PanelCard title="Ship">
            <div className="space-y-2">
              <Readout label="Mass" value={`${stats.dryMassKg} kg`} tone="info" />
              <Readout label="Strength" value={`${integrityPct}%`} pct={integrityPct} tone={integrityPct >= 90 ? "ok" : integrityPct >= 75 ? "warn" : "bad"} />
              <Readout label="Heat shield" value={stats.hasThermalProtection ? "Mounted" : "Missing"} tone={stats.hasThermalProtection ? "ok" : missionCfg.requires_thermal_protection ? "bad" : "warn"} />
              <Readout label="Parts cost" value={`$${stats.costM}M`} tone="info" />
            </div>
          </PanelCard>
          <LockButton isLocked={isLocked} ready={goals.every((g) => g.done)} label="Lock ship" onLock={() => onSubmitTake(buildFinalPayload())} />
        </>
      }
    />
  );
}

export default Rol2A_TopologicalAssembly;
