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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-black bg-role-science px-2.5 py-0.5 font-mono text-xs font-bold text-paper-cream">
            <Microscope className="h-3.5 w-3.5" />
            STATION 1 · PAYLOAD &amp; SPECTRAL LAB
          </span>
          <h3 className="mt-1 font-display text-xl font-bold text-paper-cream">
            Pick the science
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowConceptGuide((v) => !v)}
          className="paper-btn flex items-center gap-1.5 bg-blueprint-navy px-3 py-1.5 text-xs text-paper-cream"
        >
          <HelpCircle className="h-4 w-4 text-role-science" />
          {showConceptGuide ? "Hide Science Guide" : "Science Guide"}
        </button>
      </div>

      {showConceptGuide && (
        <div className="rounded-xl border-2 border-role-science bg-space-ink/90 p-3 text-xs leading-relaxed text-slate-200">
          <p className="font-bold text-role-science">
            {activeChallenge.educational_guide?.title ?? "Spectral Calibration Basics"}
          </p>
          <p className="mt-1">{activeChallenge.educational_guide?.concept_summary}</p>
          <p className="mt-1 text-slate-300">{activeChallenge.educational_guide?.how_to_read_chart}</p>
        </div>
      )}

      {/* Phase Navigation */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPhase("payload")}
          className={`paper-btn flex-1 px-3 py-2 text-xs sm:text-sm ${
            phase === "payload"
              ? "bg-role-science text-paper-cream"
              : "bg-space-ink text-slate-300"
          }`}
        >
          1. Instruments ({selectedInstruments.length})
        </button>
        <button
          type="button"
          onClick={() => setPhase("spectral")}
          className={`paper-btn flex-1 px-3 py-2 text-xs sm:text-sm ${
            phase === "spectral"
              ? "bg-role-science text-paper-cream"
              : "bg-space-ink text-slate-300"
          }`}
        >
          2. Spectral Lab ({marks.length} marks)
        </button>
      </div>

      {phase === "payload" ? (
        <div className="space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {missionInstruments.map((inst) => {
              const active = selectedIds.includes(inst.id);
              return (
                <button
                  key={inst.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => toggleInstrument(inst)}
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    active
                      ? "border-role-science bg-role-science/20 shadow-paper"
                      : "border-ink-black bg-space-ink/75 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold text-paper-cream">
                      {inst.name}
                    </span>
                    {active && <CheckCircle2 className="h-4 w-4 shrink-0 text-status-ok" />}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px] text-slate-300">
                    <span>{inst.mass_kg} kg</span>
                    <span>{inst.power_w} W</span>
                    <span>{inst.data_gbit_day} Gbit/d</span>
                    <span className="text-status-ok">+{inst.science_value} Sci</span>
                  </div>
                </button>
              );
            })}
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 border-ink-black bg-space-ink/80 p-3">
            <div className="flex items-center gap-2.5">
              <Eye className="h-5 w-5 text-role-science" />
              <div>
                <div className="font-display text-sm font-bold text-paper-cream">
                  Visual Autopilot (Natural Feature Tracking)
                </div>
                <div className="text-xs text-slate-300">
                  Self-driving landing (+10 science).
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              disabled={isLocked}
              checked={hasVisualAutonomy}
              onChange={(e) => setHasVisualAutonomy(e.target.checked)}
              className="h-5 w-5 accent-purple-500"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Interactive Pipeline Controls (Plantilla) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isLocked || baselineCleaned}
              onClick={handleBaselineStep}
              className="paper-btn flex items-center gap-1.5 bg-role-science px-3 py-1.5 text-xs text-paper-cream"
            >
              <Activity className="h-3.5 w-3.5" />
              {baselineCleaned ? "1. Baseline Clean" : "1. Clean Baseline"}
            </button>
            <button
              type="button"
              disabled={isLocked}
              onClick={handleCropStep}
              className="paper-btn bg-blueprint-navy px-3 py-1.5 text-xs text-paper-cream"
            >
              2. {croppedView ? "Full Axis" : "Crop Region"}
            </button>
            <button
              type="button"
              disabled={isLocked || marks.length === 0}
              onClick={() => setMarks([])}
              className="paper-btn flex items-center gap-1 bg-space-ink px-3 py-1.5 text-xs text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear Marks
            </button>
          </div>

          {workflowToast && (
            <div className="rounded-lg border-2 border-ink-black bg-space-ink/90 px-3 py-1.5 font-mono text-xs text-status-warn">
              {workflowToast}
            </div>
          )}

          {/* Clickable SVG Spectrum Canvas */}
          <div className="rounded-xl border-2 border-ink-black bg-space-ink p-2">
            <div className="mb-1 flex items-center justify-between px-1 font-mono text-[11px] text-slate-300">
              <span>
                {activeChallenge.y_label} vs. {activeChallenge.x_unit} (Click crests to mark peaks)
              </span>
              <span className="text-role-science">{activeChallenge.archetype}</span>
            </div>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${chartGeom.w} ${chartGeom.h}`}
              onClick={handleChartClick}
              className="h-48 w-full cursor-crosshair select-none rounded-lg bg-[#070B18]"
              aria-label="Interactive Spectral Plot"
            >
              {/* Grid lines */}
              <line x1={chartGeom.padX} y1={chartGeom.h - chartGeom.padY} x2={chartGeom.w - 14} y2={chartGeom.h - chartGeom.padY} stroke="#334155" strokeWidth="1.5" />
              <line x1={chartGeom.padX} y1={10} x2={chartGeom.padX} y2={chartGeom.h - chartGeom.padY} stroke="#334155" strokeWidth="1.5" />

              {/* Baseline drift overlay before cleaning */}
              {chartGeom.basePoly && (
                <polyline
                  points={chartGeom.basePoly}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                />
              )}

              {/* Spectrum curve */}
              <polyline
                points={chartGeom.poly}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Suggested peak guides (subtle dots) */}
              {(activeChallenge.detected_peaks ?? []).map((pk) => {
                const sx =
                  chartGeom.padX +
                  ((pk - chartGeom.minX) / Math.max(1e-6, chartGeom.maxX - chartGeom.minX)) *
                    (chartGeom.w - chartGeom.padX * 1.5);
                if (sx < chartGeom.padX || sx > chartGeom.w - 10) return null;
                return (
                  <line
                    key={`hint-${pk}`}
                    x1={sx}
                    y1={12}
                    x2={sx}
                    y2={chartGeom.h - chartGeom.padY}
                    stroke="#A855F7"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                    opacity="0.55"
                  />
                );
              })}

              {/* User-placed spectral marks */}
              {marks.map((m, idx) => {
                const sx =
                  chartGeom.padX +
                  ((m - chartGeom.minX) / Math.max(1e-6, chartGeom.maxX - chartGeom.minX)) *
                    (chartGeom.w - chartGeom.padX * 1.5);
                return (
                  <g key={`mark-${idx}-${m}`}>
                    <line
                      x1={sx}
                      y1={14}
                      x2={sx}
                      y2={chartGeom.h - chartGeom.padY}
                      stroke="#3DDC84"
                      strokeWidth="2"
                    />
                    <circle cx={sx} cy={18} r="4.5" fill="#3DDC84" stroke="#0F172A" strokeWidth="1.5" />
                  </g>
                );
              })}

              <text x={chartGeom.padX} y={chartGeom.h - 4} fill="#94A3B8" fontSize="10" fontFamily="monospace">
                {chartGeom.minX.toFixed(0)} {activeChallenge.x_unit}
              </text>
              <text x={chartGeom.w - 20} y={chartGeom.h - 4} textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                {chartGeom.maxX.toFixed(0)} {activeChallenge.x_unit}
              </text>
            </svg>
          </div>

          {marks.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {marks.map((m, idx) => (
                <button
                  key={`${m}-${idx}`}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setMarks((prev) => prev.filter((_, i) => i !== idx))}
                  className="inline-flex items-center gap-1 rounded-full border border-ink-black bg-status-ok/25 px-2.5 py-0.5 font-mono text-xs text-status-ok"
                >
                  {m} {activeChallenge.x_unit}
                  <Trash2 className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Live Totals & Submit */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink-black bg-space-ink/80 p-3">
        <div className="flex flex-wrap gap-4 font-mono text-xs">
          <span>
            Mass: <strong className="text-paper-cream">{totals.massKg.toFixed(1)} kg</strong>
          </span>
          <span>
            Power: <strong className="text-paper-cream">{totals.powerW.toFixed(1)} W</strong>
          </span>
          <span>
            Science: <strong className="text-status-ok">{totals.scienceVal.toFixed(0)} pts</strong>
          </span>
          {totals.costUsd > liveMetrics.remaining_budget_usd && (
            <span className="font-bold text-status-crit">Over remaining budget!</span>
          )}
        </div>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSubmitTake(buildPayload())}
          className="paper-btn flex items-center gap-2 bg-status-ok px-4 py-2 text-sm text-ink-black"
        >
          <Sparkles className="h-4 w-4" />
          {isLocked ? "Science Locked" : "Submit Science & Calibration"}
        </button>
      </div>
    </div>
  );
}
