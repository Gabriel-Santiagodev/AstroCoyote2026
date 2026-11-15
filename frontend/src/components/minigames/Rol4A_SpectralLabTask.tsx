// Owner: Abraham (Task ABR-04) — Wave 1 Scientific Payload + Interactive Spectral Lab minigame.
// Integrates nasa_catalog.json verified instruments with backend spectralChallenge payloads
// (and provides an educational offline physics preview in /dev-sandbox).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Eye,
  HelpCircle,
  Microscope,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import nasaCatalog from "../../data/nasa_catalog.json";
import type { MinigameProps, MissionIdType } from "../../types/game";
import { AnimatePresence, motion } from "framer-motion";
import { soundEngine } from "../paper/SoundEngine";
import { GameLayout, GoalList, LockButton, PanelCard, PlayBackdrop, Readout, type Goal } from "./kit/GameKit";

interface InstrumentCatalogItem {
  id: string;
  name: string;
  missions: string[];
  mass_kg: number;
  power_w: number;
  data_gbit_day: number;
  cost_musd: number;
  science_value: number;
}

interface SpectralPoint {
  x: number;
  y: number;
}

interface SpectralChallengePayload {
  archetype: string;
  x_unit: string;
  y_label: string;
  points: SpectralPoint[];
  baseline_points?: SpectralPoint[];
  corrected_points?: SpectralPoint[];
  expected_peaks?: number[];
  detected_peaks?: number[];
  tolerance?: number;
  candidate_labels?: Array<Record<string, unknown>>;
  educational_guide?: {
    title?: string;
    concept_summary?: string;
    how_to_read_chart?: string;
    step_by_step_hint?: string[];
  };
}

const INSTRUMENTS = nasaCatalog.instruments as InstrumentCatalogItem[];

function buildOfflineChallenge(missionId: MissionIdType): SpectralChallengePayload {
  if (missionId === "artemis_moon") {
    // Blackbody / Wien curve centered near 260 K sunlit polar regolith (~11,145 nm)
    const pts: SpectralPoint[] = [];
    const basePts: SpectralPoint[] = [];
    const corrPts: SpectralPoint[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = 4000 + (i / 120) * 18000;
      const dome = Math.exp(-Math.pow((x - 11145) / 3600, 2));
      const drift = 0.08 + 0.04 * (i / 120);
      pts.push({ x: Math.round(x), y: Number((dome + drift).toFixed(4)) });
      basePts.push({ x: Math.round(x), y: Number(drift.toFixed(4)) });
      corrPts.push({ x: Math.round(x), y: Number(dome.toFixed(4)) });
    }
    return {
      archetype: "detectives_luz",
      x_unit: "nm",
      y_label: "Intensidad",
      points: pts,
      baseline_points: basePts,
      corrected_points: corrPts,
      detected_peaks: [11145],
      tolerance: 1200,
      educational_guide: {
        title: "Light Detectives: Lunar Surface Temperature (Wien's Law)",
        concept_summary:
          "Hotter regolith peaks at shorter wavelengths: lambda_max * T = 2,897,772 nm*K.",
        how_to_read_chart:
          "Click the crest of the thermal radiance dome (~11,145 nm = 260 K polar boundary).",
        step_by_step_hint: [
          "1. Optional: Click Clean Baseline to strip background instrument offset.",
          "2. Click the crest of the dome peak in nanometers.",
          "3. Confirm your Science & Calibration Take.",
        ],
      },
    };
  }

  // FTIR Hydrated Clay / Carbonate / Amide-I blend for M2 & M3
  const targets =
    missionId === "asteroid_hunter" ? [1435, 3620] : [1435, 1654, 3620];
  const pts: SpectralPoint[] = [];
  const basePts: SpectralPoint[] = [];
  const corrPts: SpectralPoint[] = [];
  for (let i = 0; i <= 140; i++) {
    const x = 1000 + (i / 140) * 2900;
    let sig = 0;
    for (const c of targets) {
      sig += 0.78 * Math.exp(-Math.pow((x - c) / 95, 2));
    }
    const drift = 0.12 + 0.22 * (i / 140);
    pts.push({ x: Math.round(x), y: Number((sig + drift).toFixed(4)) });
    basePts.push({ x: Math.round(x), y: Number(drift.toFixed(4)) });
    corrPts.push({ x: Math.round(x), y: Number(sig.toFixed(4)) });
  }
  return {
    archetype: "bioespectro",
    x_unit: "cm-1",
    y_label: "Absorbancia",
    points: pts,
    baseline_points: basePts,
    corrected_points: corrPts,
    detected_peaks: targets,
    tolerance: 90,
    educational_guide: {
      title: "BioSpectrum: Orbital FTIR Spectroscopy",
      concept_summary:
        "Hydrated minerals and organics vibrate at fixed wavenumbers: Carbonate ~1435, Amide-I ~1654, Clay O-H ~3620 cm^-1.",
      how_to_read_chart:
        "Follow spectroscopy order: Baseline -> Crop -> Mark Peaks along the X wavenumber axis.",
      step_by_step_hint: [
        "1. Click '1. Baseline' first to remove the tilted continuum slope.",
        "2. Click directly on each absorption crest to drop a peak marker.",
        "3. Confirm payload & calibrated peaks before timer runs out.",
      ],
    },
  };
}

export function Rol4A_SpectralLabTask({
  missionId,
  timeLeftSec,
  liveMetrics,
  spectralChallenge,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const missionInstruments = useMemo(
    () => INSTRUMENTS.filter((inst) => inst.missions.includes(missionId)),
    [missionId]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    missionInstruments.slice(0, 2).map((i) => i.id)
  );
  const [hasVisualAutonomy, setHasVisualAutonomy] = useState<boolean>(
    missionId === "asteroid_hunter"
  );
  const [phase, setPhase] = useState<"payload" | "spectral">("payload");
  const [baselineCleaned, setBaselineCleaned] = useState<boolean>(false);
  const [croppedView, setCroppedView] = useState<boolean>(false);
  const [workflowToast, setWorkflowToast] = useState<string | null>(null);
  const [marks, setMarks] = useState<number[]>([]);
  const [showConceptGuide, setShowConceptGuide] = useState<boolean>(false);

  const hasAutoSwitched = useRef(false);
  const autoSubmitted = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Re-initialize default instruments if missionId switches in /dev-sandbox
  useEffect(() => {
    const valid = missionInstruments.map((i) => i.id);
    setSelectedIds((prev) => {
      const kept = prev.filter((id) => valid.includes(id));
      return kept.length > 0 ? kept : valid.slice(0, 2);
    });
    setHasVisualAutonomy(missionId === "asteroid_hunter");
    setMarks([]);
    setBaselineCleaned(false);
    setCroppedView(false);
  }, [missionId, missionInstruments]);

  // Guide smoothly into Phase 2 (Spectral Lab) after 10s elapsed (at 20s remaining)
  useEffect(() => {
    if (timeLeftSec <= 20 && timeLeftSec > 0 && !hasAutoSwitched.current) {
      hasAutoSwitched.current = true;
      setPhase("spectral");
    }
    if (timeLeftSec > 20) {
      hasAutoSwitched.current = false;
    }
  }, [timeLeftSec]);

  const activeChallenge: SpectralChallengePayload = useMemo(() => {
    if (
      spectralChallenge &&
      typeof spectralChallenge === "object" &&
      Array.isArray((spectralChallenge as SpectralChallengePayload).points)
    ) {
      return spectralChallenge as SpectralChallengePayload;
    }
    return buildOfflineChallenge(missionId);
  }, [spectralChallenge, missionId]);

  const activePoints = useMemo(() => {
    const raw =
      baselineCleaned && activeChallenge.corrected_points?.length
        ? activeChallenge.corrected_points
        : activeChallenge.points;
    if (!croppedView || raw.length < 12) return raw;
    const minX = raw[0].x;
    const maxX = raw[raw.length - 1].x;
    const margin = (maxX - minX) * 0.1;
    return raw.filter((p) => p.x >= minX + margin && p.x <= maxX - margin);
  }, [activeChallenge, baselineCleaned, croppedView]);

  const selectedInstruments = useMemo(
    () => missionInstruments.filter((inst) => selectedIds.includes(inst.id)),
    [missionInstruments, selectedIds]
  );

  const totals = useMemo(() => {
    const massKg = selectedInstruments.reduce((acc, i) => acc + i.mass_kg, 0);
    const powerW = selectedInstruments.reduce((acc, i) => acc + i.power_w, 0);
    const dataGbit = selectedInstruments.reduce((acc, i) => acc + i.data_gbit_day, 0);
    const scienceVal = Math.min(
      100,
      selectedInstruments.reduce((acc, i) => acc + i.science_value, 0) +
        (hasVisualAutonomy ? 10 : 0)
    );
    const costUsd = selectedInstruments.reduce((acc, i) => acc + i.cost_musd * 1_000_000, 0);
    return { massKg, powerW, dataGbit, scienceVal, costUsd };
  }, [selectedInstruments, hasVisualAutonomy]);

  const toggleInstrument = (inst: InstrumentCatalogItem) => {
    if (isLocked) return;
    const exists = selectedIds.includes(inst.id);
    const nextIds = exists
      ? selectedIds.filter((id) => id !== inst.id)
      : [...selectedIds, inst.id];
    setSelectedIds(nextIds);

    const nextList = missionInstruments.filter((i) => nextIds.includes(i.id));
    onLiveMutation({
      instruments_mass_kg: Number(
        nextList.reduce((acc, i) => acc + i.mass_kg, 0).toFixed(2)
      ),
      selected_instruments: nextList.map((i) => ({
        id: i.id,
        name: i.name,
        mass_kg: i.mass_kg,
      })),
    });
  };

  const buildPayload = useCallback(
    () => ({
      instruments_mass_kg: Number(totals.massKg.toFixed(2)),
      instruments_power_w: Number(totals.powerW.toFixed(1)),
      data_generated_gbit: Number(totals.dataGbit.toFixed(1)),
      science_value: Number(totals.scienceVal.toFixed(1)),
      has_visual_autonomy: hasVisualAutonomy,
      selected_instruments: selectedInstruments.map((i) => ({
        id: i.id,
        name: i.name,
        mass_kg: i.mass_kg,
      })),
      spectral_marks: marks.length > 0 ? marks : activeChallenge.detected_peaks ?? [],
    }),
    [totals, hasVisualAutonomy, selectedInstruments, marks, activeChallenge.detected_peaks]
  );

  useEffect(() => {
    if (timeLeftSec <= 0 && !isLocked && !autoSubmitted.current) {
      autoSubmitted.current = true;
      onSubmitTake(buildPayload());
    }
  }, [timeLeftSec, isLocked, onSubmitTake, buildPayload]);

  // Compute SVG polyline coordinates
  const chartGeom = useMemo(() => {
    const w = 520;
    const h = 190;
    const padX = 36;
    const padY = 18;
    if (activePoints.length < 2) {
      return { w, h, padX, padY, minX: 0, maxX: 1, minY: 0, maxY: 1, poly: "", basePoly: "" };
    }
    const xs = activePoints.map((p) => p.x);
    const ys = activePoints.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys, 0);
    const maxY = Math.max(...ys) * 1.08 || 1;

    const toSvg = (x: number, y: number) => {
      const sx = padX + ((x - minX) / Math.max(1e-6, maxX - minX)) * (w - padX * 1.5);
      const sy = h - padY - ((y - minY) / Math.max(1e-6, maxY - minY)) * (h - padY * 2);
      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
    };

    const poly = activePoints.map((p) => toSvg(p.x, p.y)).join(" ");
    const basePoly =
      !baselineCleaned && activeChallenge.baseline_points?.length
        ? activeChallenge.baseline_points
            .filter((p) => p.x >= minX && p.x <= maxX)
            .map((p) => toSvg(p.x, p.y))
            .join(" ")
        : "";

    return { w, h, padX, padY, minX, maxX, minY, maxY, poly, basePoly };
  }, [activePoints, baselineCleaned, activeChallenge.baseline_points]);

  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isLocked || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickRatioX = (e.clientX - rect.left) / rect.width;
    const svgX = clickRatioX * chartGeom.w;
    const normX = (svgX - chartGeom.padX) / (chartGeom.w - chartGeom.padX * 1.5);
    const clampedNorm = Math.max(0, Math.min(1, normX));
    const physicalX = Number(
      (chartGeom.minX + clampedNorm * (chartGeom.maxX - chartGeom.minX)).toFixed(1)
    );
    setMarks((prev) => [...prev.slice(-5), physicalX]);
  };

  const handleBaselineStep = () => {
    setBaselineCleaned(true);
    setWorkflowToast("Baseline subtracted! True spectral bands now sit flat against zero.");
  };

  const handleCropStep = () => {
    if (!baselineCleaned) {
      setWorkflowToast(
        "Wrong order (-3 pts): flatten the baseline first!"
      );
      return;
    }
    setCroppedView((v) => !v);
    setWorkflowToast("Diagnostic spectral window isolated cleanly.");
  };

  // ---------------------------------------------------------------------------
  // Game window UI (2026-11-15): two steps in one window. 1) load instruments into the payload
  // bay; 2) clean the light spectrum and tap its peaks. Model above (payload, marks) unchanged.
  // ---------------------------------------------------------------------------
  const expectedPeaks = activeChallenge.expected_peaks?.length || activeChallenge.detected_peaks?.length || 1;
  const goals: Goal[] = [
    { label: "Instruments loaded", done: selectedInstruments.length > 0 },
    { label: "Spectrum baseline flattened", done: baselineCleaned },
    { label: `Peaks marked (${Math.min(marks.length, expectedPeaks)}/${expectedPeaks})`, done: marks.length >= expectedPeaks },
  ];
  const markToSvgX = (x: number) =>
    chartGeom.padX + ((x - chartGeom.minX) / Math.max(1e-6, chartGeom.maxX - chartGeom.minX)) * (chartGeom.w - chartGeom.padX * 1.5);

  return (
    <GameLayout
      play={
        <div className="relative flex h-full flex-col">
          <PlayBackdrop tint="#A855F7" />
          <div className="relative z-10 flex gap-1.5 p-2">
            {(["payload", "spectral"] as const).map((p, i) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setPhase(p);
                }}
                className={`paper-btn flex-1 py-1.5 text-sm ${phase === p ? "bg-paper-cream text-ink-black" : "bg-space-ink text-slate-300"}`}
              >
                {i + 1}. {p === "payload" ? "Load the bay" : "Read the light"}
              </button>
            ))}
          </div>

          {phase === "payload" ? (
            <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto p-2 pt-0 sm:grid-cols-2">
              {missionInstruments.map((inst) => {
                const on = selectedIds.includes(inst.id);
                return (
                  <motion.button
                    key={inst.id}
                    type="button"
                    disabled={isLocked}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      soundEngine.playClick();
                      toggleInstrument(inst);
                    }}
                    className={`flex items-center gap-2 rounded-xl border-[3px] p-2 text-left ${
                      on ? "border-status-ok bg-emerald-950/50" : "border-ink-black bg-space-ink hover:bg-blueprint-navy"
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink-black ${on ? "bg-status-ok text-ink-black" : "bg-blueprint-navy text-role-science"}`}>
                      {on ? <CheckCircle2 className="h-5 w-5" /> : <Microscope className="h-5 w-5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold">{inst.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {inst.mass_kg} kg · {inst.power_w} W · +{inst.science_value} sci
                      </span>
                    </span>
                  </motion.button>
                );
              })}
              <button
                type="button"
                disabled={isLocked}
                onClick={() => {
                  soundEngine.playClick();
                  setHasVisualAutonomy((v) => !v);
                }}
                className={`flex items-center gap-2 rounded-xl border-[3px] border-dashed p-2 text-left ${hasVisualAutonomy ? "border-sky-glow bg-sky-950/40" : "border-slate-600"}`}
              >
                <Eye className="h-5 w-5 shrink-0 text-sky-glow" />
                <span className="text-xs font-bold">Self-driving camera {hasVisualAutonomy ? "ON" : "OFF"} (+10 sci)</span>
              </button>
            </div>
          ) : (
            <div className="relative flex min-h-0 flex-1 flex-col gap-2 p-2 pt-0">
              <div className="flex flex-wrap gap-1.5">
                <button type="button" disabled={isLocked || baselineCleaned} onClick={() => { soundEngine.playComplete(); handleBaselineStep(); }}
                  className={`paper-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs ${baselineCleaned ? "bg-status-ok text-ink-black" : "animate-pulse bg-status-warn text-ink-black"}`}>
                  <Activity className="h-3.5 w-3.5" /> {baselineCleaned ? "Baseline flat" : "1 · Flatten baseline"}
                </button>
                <button type="button" disabled={isLocked} onClick={() => { soundEngine.playClick(); handleCropStep(); }}
                  className="paper-btn inline-flex items-center gap-1 bg-space-ink px-2.5 py-1 text-xs text-paper-cream">
                  <Sparkles className="h-3.5 w-3.5" /> 2 · Zoom
                </button>
                <button type="button" disabled={isLocked || marks.length === 0} onClick={() => setMarks([])}
                  className="paper-btn inline-flex items-center gap-1 bg-space-ink px-2.5 py-1 text-xs text-paper-cream">
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </button>
              </div>
              {workflowToast && (
                <div className="rounded-lg border-2 border-ink-black bg-paper-cream px-2 py-1 text-xs font-bold text-ink-black">{workflowToast}</div>
              )}
              <div className="relative min-h-0 flex-1 rounded-xl border-[3px] border-ink-black bg-slate-950">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${chartGeom.w} ${chartGeom.h}`}
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full cursor-crosshair"
                  onClick={(e) => {
                    if (isLocked) return;
                    soundEngine.playClick();
                    handleChartClick(e);
                  }}
                  role="img"
                  aria-label="Light spectrum: tap the peaks"
                >
                  {chartGeom.basePoly && <polyline points={chartGeom.basePoly} fill="none" stroke="#F97316" strokeWidth="2" strokeDasharray="6 5" />}
                  <polyline points={chartGeom.poly} fill="none" stroke="#38BDF8" strokeWidth="2.5" />
                  {marks.map((m, i) => (
                    <line key={`${m}-${i}`} x1={markToSvgX(m)} x2={markToSvgX(m)} y1="6" y2={chartGeom.h - 6} stroke="#EF4444" strokeWidth="2.5" />
                  ))}
                </svg>
                <span className="pointer-events-none absolute bottom-1 left-2 rounded border border-ink-black bg-paper-cream px-1.5 font-mono text-[10px] font-bold text-ink-black">
                  Tap the tall peaks
                </span>
              </div>
            </div>
          )}
        </div>
      }
      panel={
        <>
          <GoalList goals={goals} />
          <PanelCard title="Science payload">
            <div className="space-y-2">
              <Readout label="Weight" value={`${totals.massKg.toFixed(1)} kg`} tone="info" />
              <Readout label="Power use" value={`${totals.powerW.toFixed(0)} W`}
                tone={totals.powerW > liveMetrics.available_power_w ? "bad" : "ok"} />
              <Readout label="Science value" value={`${totals.scienceVal.toFixed(0)}`} pct={totals.scienceVal} tone="ok" />
              <Readout label="Data / day" value={`${totals.dataGbit.toFixed(1)} Gbit`} tone="info" />
            </div>
          </PanelCard>
          <LockButton isLocked={isLocked} ready={goals.every((g) => g.done)} label="Lock science" onLock={() => onSubmitTake(buildPayload())} />
        </>
      }
    />
  );
}

export default Rol4A_SpectralLabTask;
