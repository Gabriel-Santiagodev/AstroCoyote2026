// Owner: Abraham (Task ABR-05) — Wave 2 DSN Antenna Drift + Spectral Hacker DTMF minigame.
// Implements MinigameProps with CG-coupled drift (1.5x when unbalanced), DTMF spectrum
// glitch filtering, and bitrate validation against MRO 160 Gbit capacity & bus watts.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  HelpCircle,
  Radio,
  ShieldAlert,
  Sparkles,
  Waves,
} from "lucide-react";
import nasaCatalog from "../../data/nasa_catalog.json";
import type { MinigameProps } from "../../types/game";

interface HackerPayload {
  points?: Array<{ x: number; y: number }>;
  corrected_points?: Array<{ x: number; y: number }>;
  dtmf_pair_hz?: [number, number];
  expected_key?: string;
  injected_glitch_hz?: number[];
  dtmf_keypad?: Record<string, [number, number]>;
}

const DEFAULT_DTMF: Record<string, [number, number]> = {
  "1": [697, 1209],
  "2": [697, 1336],
  "3": [697, 1477],
  "4": [770, 1209],
  "5": [770, 1336],
  "6": [770, 1477],
  "7": [852, 1209],
  "8": [852, 1336],
  "9": [852, 1477],
  "0": [941, 1336],
};

const RECORDER_GBIT = nasaCatalog.constants.mro_recorder_capacity_gbit;
const MIN_MARGIN_DB = nasaCatalog.constants.min_dsn_link_margin_db;

export function Rol4B_CommsSpectralHacker({
  missionId,
  timeLeftSec,
  liveMetrics,
  spectralChallenge,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const [phase, setPhase] = useState<"dsn" | "hacker">("dsn");
  const [reticlePos, setReticlePos] = useState<{ x: number; y: number }>({ x: 35, y: 28 });
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [driftClean, setDriftClean] = useState<boolean>(false);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [bitrateMbps, setBitrateMbps] = useState<number>(3.5);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const hasAutoSwitched = useRef(false);
  const autoSubmitted = useRef(false);

  const hackerData: HackerPayload = useMemo(() => {
    if (
      spectralChallenge &&
      typeof spectralChallenge === "object" &&
      (spectralChallenge as HackerPayload).expected_key
    ) {
      return spectralChallenge as HackerPayload;
    }
    // Clean /dev-sandbox fallback spectrum
    const pair: [number, number] = [770, 1336];
    const pts: Array<{ x: number; y: number }> = [];
    const corr: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 110; i++) {
      const f = 550 + (i / 110) * 1250;
      const g1 = 0.88 * Math.exp(-Math.pow((f - pair[0]) / 24, 2));
      const g2 = 0.94 * Math.exp(-Math.pow((f - pair[1]) / 24, 2));
      const glitch = Math.abs(f - 1060) < 12 ? 1.3 : 0;
      const drift = 0.25 * (1 - i / 110);
      pts.push({ x: Math.round(f), y: Number((g1 + g2 + glitch + drift).toFixed(4)) });
      corr.push({ x: Math.round(f), y: Number((g1 + g2).toFixed(4)) });
    }
    return {
      points: pts,
      corrected_points: corr,
      dtmf_pair_hz: pair,
      expected_key: "5",
      injected_glitch_hz: [1060],
      dtmf_keypad: DEFAULT_DTMF,
    };
  }, [spectralChallenge]);

  // Orbital reticle drift (1.5x speed when spacecraft CG is unbalanced!)
  const driftMultiplier = liveMetrics.cg_balanced ? 1.0 : 1.5;

  useEffect(() => {
    if (isLocked) return;
    const interval = window.setInterval(() => {
      const t = performance.now() * 0.0014 * driftMultiplier;
      setTargetPos({
        x: 50 + Math.sin(t * 1.1) * 26,
        y: 50 + Math.cos(t * 0.85) * 22,
      });
    }, 60);
    return () => window.clearInterval(interval);
  }, [driftMultiplier, isLocked]);

  // Move to Phase 2 automatically around 15s remaining once
  useEffect(() => {
    if (timeLeftSec <= 15 && timeLeftSec > 0 && !hasAutoSwitched.current) {
      hasAutoSwitched.current = true;
      setPhase("hacker");
    }
    if (timeLeftSec > 15) {
      hasAutoSwitched.current = false;
    }
  }, [timeLeftSec]);

  const steerReticle = useCallback(
    (dx: number, dy: number) => {
      if (isLocked) return;
      setReticlePos((prev) => ({
        x: Math.max(8, Math.min(92, prev.x + dx)),
        y: Math.max(8, Math.min(92, prev.y + dy)),
      }));
    },
    [isLocked]
  );

  // Keyboard arrow / WASD tracking in DSN phase
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phase !== "dsn" || isLocked) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") steerReticle(0, -6);
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") steerReticle(0, 6);
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") steerReticle(-6, 0);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") steerReticle(6, 0);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, isLocked, steerReticle]);

  // Link margin calculation coupling FSPL loss from Rol 3A + reticle lock accuracy
  const linkMetrics = useMemo(() => {
    const dist = Math.hypot(reticlePos.x - targetPos.x, reticlePos.y - targetPos.y);
    const alignmentBonus = Math.max(-6, 8.5 - dist * 0.25);
    const fsplPenalty = Math.max(0, (liveMetrics.fspl_loss_db - 166.0) * 0.12);
    const marginDb = Number((alignmentBonus - fsplPenalty).toFixed(2));
    const rfWattsRequired = Math.round(95 + bitrateMbps * 42);
    const powerExceeded = rfWattsRequired > liveMetrics.available_power_w;
    const dtmfMatched =
      selectedKey !== "" && selectedKey === (hackerData.expected_key ?? "5");
    const downlinkEfficiency = Number(
      (
        (marginDb >= MIN_MARGIN_DB ? 0.65 : 0.3) +
        (dtmfMatched ? 0.35 : 0.0)
      ).toFixed(2)
    );
    const hoursToClear = (RECORDER_GBIT * 1000) / Math.max(0.5, bitrateMbps) / 3600;

    return {
      dist,
      marginDb,
      rfWattsRequired,
      powerExceeded,
      dtmfMatched,
      downlinkEfficiency,
      hoursToClear,
    };
  }, [
    reticlePos,
    targetPos,
    liveMetrics.fspl_loss_db,
    liveMetrics.available_power_w,
    bitrateMbps,
    selectedKey,
    hackerData.expected_key,
  ]);

  const buildPayload = useCallback(
    () => ({
      link_margin_db: linkMetrics.marginDb,
      downlink_rate_mbps: Number(bitrateMbps.toFixed(2)),
      downlink_efficiency: linkMetrics.downlinkEfficiency,
      dtmf_code_ok: linkMetrics.dtmfMatched || Boolean(driftClean && selectedKey),
      solar_conjunction_warning: missionId === "mars_sample_return",
    }),
    [linkMetrics, bitrateMbps, driftClean, selectedKey, missionId]
  );

  useEffect(() => {
    if (timeLeftSec <= 0 && !isLocked && !autoSubmitted.current) {
      autoSubmitted.current = true;
      onSubmitTake(buildPayload());
    }
  }, [timeLeftSec, isLocked, onSubmitTake, buildPayload]);

  const spectrumSvg = useMemo(() => {
    const pts =
      driftClean && hackerData.corrected_points?.length
        ? hackerData.corrected_points
        : hackerData.points ?? [];
    if (pts.length < 2) return "";
    const minX = pts[0].x;
    const maxX = pts[pts.length - 1].x;
    const maxY = Math.max(...pts.map((p) => p.y), 1.0);
    return pts
      .map((p) => {
        const sx = 20 + ((p.x - minX) / Math.max(1, maxX - minX)) * 420;
        const sy = 118 - (Math.max(0, p.y) / maxY) * 95;
        return `${sx.toFixed(1)},${sy.toFixed(1)}`;
      })
      .join(" ");
  }, [hackerData, driftClean]);

  const keypadKeys = Object.keys(hackerData.dtmf_keypad ?? DEFAULT_DTMF).slice(0, 10);
  const dtmfPair = hackerData.dtmf_pair_hz ?? [770, 1336];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-black bg-role-science px-2.5 py-0.5 font-mono text-xs font-bold text-paper-cream">
            <Radio className="h-3.5 w-3.5" />
            STATION 2 · DSN COMMS &amp; SPECTRUM HACKER
          </span>
          <h3 className="mt-1 font-display text-xl font-bold text-paper-cream">
            Send data home
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          className="paper-btn flex items-center gap-1.5 bg-blueprint-navy px-3 py-1.5 text-xs text-paper-cream"
        >
          <HelpCircle className="h-4 w-4 text-role-science" />
          {showGuide ? "Hide Guide" : "How DSN & DTMF Work"}
        </button>
      </div>

      {showGuide && (
        <div className="rounded-xl border-2 border-role-science bg-space-ink/90 p-3 text-xs text-slate-200">
          <p className="font-bold text-role-science">Deep Space Communications Checklist:</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            <li>
              <strong>Antenna Tracking:</strong> Align your High-Gain Antenna crosshair over the
              drifting Earth DSN beacon until Link Margin exceeds <strong>+{MIN_MARGIN_DB.toFixed(1)} dB</strong>.
            </li>
            <li>
              <strong>DTMF Spectrum Hacker:</strong> Clean baseline drift first to ignore narrow
              radiation glitches, then tap the keypad digit matching the two genuine frequencies.
            </li>
          </ul>
        </div>
      )}

      {/* Alerts: Unbalanced CG 1.5x Drift + Mars Solar Conjunction */}
      <div className="flex flex-wrap gap-2">
        {!liveMetrics.cg_balanced && (
          <div className="flex items-center gap-1.5 rounded-lg border-2 border-ink-black bg-status-crit/25 px-3 py-1.5 font-mono text-xs font-bold text-status-crit">
            <ShieldAlert className="h-4 w-4" />
            Unbalanced CG causing 1.5x antenna drift!
          </div>
        )}
        {missionId === "mars_sample_return" && (
          <div className="flex items-center gap-1.5 rounded-lg border-2 border-ink-black bg-status-warn/20 px-3 py-1.5 font-mono text-xs text-status-warn">
            Solar Conjunction ahead: downlink 160 Gbit quickly!
          </div>
        )}
      </div>

      {/* Phase Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPhase("dsn")}
          className={`paper-btn flex-1 px-3 py-2 text-xs sm:text-sm ${
            phase === "dsn" ? "bg-role-science text-paper-cream" : "bg-space-ink text-slate-300"
          }`}
        >
          1. DSN Oscilloscope ({linkMetrics.marginDb >= MIN_MARGIN_DB ? "Locked" : "Aiming"})
        </button>
        <button
          type="button"
          onClick={() => setPhase("hacker")}
          className={`paper-btn flex-1 px-3 py-2 text-xs sm:text-sm ${
            phase === "hacker" ? "bg-role-science text-paper-cream" : "bg-space-ink text-slate-300"
          }`}
        >
          2. Spectrum Hacker &amp; Bitrate
        </button>
      </div>

      {phase === "dsn" ? (
        <div className="grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-7">
            <svg
              viewBox="0 0 100 100"
              onClick={(e) => {
                if (isLocked) return;
                const rect = e.currentTarget.getBoundingClientRect();
                setReticlePos({
                  x: Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100)),
                  y: Math.max(8, Math.min(92, ((e.clientY - rect.top) / rect.height) * 100)),
                });
              }}
              className="h-52 w-full cursor-crosshair rounded-xl border-2 border-ink-black bg-[#060B17]"
              aria-label="DSN Oscilloscope Radar"
            >
              <circle cx="50" cy="50" r="36" fill="none" stroke="#1E293B" strokeWidth="1" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="#1E293B" strokeWidth="1" />
              <line x1="50" y1="6" x2="50" y2="94" stroke="#1E293B" strokeWidth="0.8" />
              <line x1="6" y1="50" x2="94" y2="50" stroke="#1E293B" strokeWidth="0.8" />

              {/* Drifting Earth Target */}
              <circle
                cx={targetPos.x}
                cy={targetPos.y}
                r="10"
                fill="none"
                stroke="#3DDC84"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle cx={targetPos.x} cy={targetPos.y} r="3.5" fill="#3DDC84" />

              {/* User Antenna Crosshair */}
              <g transform={`translate(${reticlePos.x}, ${reticlePos.y})`}>
                <circle
                  r="8"
                  fill="none"
                  stroke={linkMetrics.marginDb >= MIN_MARGIN_DB ? "#3DDC84" : "#A855F7"}
                  strokeWidth="2"
                />
                <line x1="-11" y1="0" x2="11" y2="0" stroke="#F8FAFC" strokeWidth="1.2" />
                <line x1="0" y1="-11" x2="0" y2="11" stroke="#F8FAFC" strokeWidth="1.2" />
              </g>
            </svg>
          </div>

          <div className="flex flex-col justify-between gap-3 sm:col-span-5">
            <div className="paper-card bg-space-ink/80 p-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">FSPL Loss (Rol 3A):</span>
                <span>{liveMetrics.fspl_loss_db.toFixed(1)} dB</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-slate-400">Link Margin:</span>
                <span
                  className={
                    linkMetrics.marginDb >= MIN_MARGIN_DB
                      ? "font-bold text-status-ok"
                      : "font-bold text-status-crit"
                  }
                >
                  {linkMetrics.marginDb >= 0 ? "+" : ""}
                  {linkMetrics.marginDb} dB
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-300">
                Keep the dot in the green zone.
              </p>
            </div>

            <div className="mx-auto grid w-36 grid-cols-3 gap-1.5">
              <div />
              <button
                type="button"
                disabled={isLocked}
                onClick={() => steerReticle(0, -8)}
                className="paper-btn flex items-center justify-center bg-blueprint-navy p-2 text-paper-cream"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <div />
              <button
                type="button"
                disabled={isLocked}
                onClick={() => steerReticle(-8, 0)}
                className="paper-btn flex items-center justify-center bg-blueprint-navy p-2 text-paper-cream"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={isLocked}
                onClick={() => setReticlePos({ ...targetPos })}
                className="paper-btn bg-role-science p-2 font-mono text-[10px] text-paper-cream"
              >
                LOCK
              </button>
              <button
                type="button"
                disabled={isLocked}
                onClick={() => steerReticle(8, 0)}
                className="paper-btn flex items-center justify-center bg-blueprint-navy p-2 text-paper-cream"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <div />
              <button
                type="button"
                disabled={isLocked}
                onClick={() => steerReticle(0, 8)}
                className="paper-btn flex items-center justify-center bg-blueprint-navy p-2 text-paper-cream"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <div />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* DTMF Signal Plot + Filter */}
          <div className="rounded-xl border-2 border-ink-black bg-space-ink p-2.5">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs text-slate-300">
                Detected Dual Tone: <strong className="text-role-science">{dtmfPair[0]} Hz + {dtmfPair[1]} Hz</strong>
              </span>
              <button
                type="button"
                disabled={isLocked || driftClean}
                onClick={() => setDriftClean(true)}
                className="paper-btn flex items-center gap-1 bg-role-science px-2.5 py-1 text-xs text-paper-cream"
              >
                <Waves className="h-3.5 w-3.5" />
                {driftClean ? "Drift & Glitches Filtered" : "Filter Baseline + Flag Glitches"}
              </button>
            </div>
            <svg viewBox="0 0 460 130" className="h-32 w-full rounded bg-[#070B18]">
              <polyline points={spectrumSvg} fill="none" stroke="#A855F7" strokeWidth="2.2" />
              {!driftClean && (
                <text x="230" y="20" textAnchor="middle" fill="#F2C94C" fontSize="10" fontFamily="monospace">
                  Solar drift + cosmic-ray spike active
                </text>
              )}
              <text x="25" y="126" fill="#94A3B8" fontSize="9" fontFamily="monospace">550 Hz</text>
              <text x="435" y="126" textAnchor="end" fill="#94A3B8" fontSize="9" fontFamily="monospace">1800 Hz</text>
            </svg>
          </div>

          {/* Keypad + Bitrate Slider */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 font-mono text-xs font-bold text-slate-300">
                Tap Matching ITU-T Q.23 Keypad Key:
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {keypadKeys.map((k) => {
                  const pair = (hackerData.dtmf_keypad ?? DEFAULT_DTMF)[k];
                  const active = selectedKey === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      disabled={isLocked}
                      onClick={() => setSelectedKey(k)}
                      className={`paper-btn px-2 py-1.5 text-center ${
                        active
                          ? "bg-status-ok text-ink-black"
                          : "bg-blueprint-navy text-paper-cream"
                      }`}
                    >
                      <div className="font-display text-sm font-bold">{k}</div>
                      <div className="font-mono text-[9px] opacity-75">
                        {pair[0]}/{pair[1]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="paper-card bg-space-ink/80 p-3 font-mono text-xs">
              <div className="flex justify-between">
                <span>Downlink Bitrate:</span>
                <strong className="text-role-orbit">{bitrateMbps.toFixed(1)} Mbps</strong>
              </div>
              <input
                type="range"
                disabled={isLocked}
                min={0.5}
                max={6.0}
                step={0.5}
                value={bitrateMbps}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBitrateMbps(val);
                  onLiveMutation({ downlink_rate_mbps: val });
                }}
                className="mt-2 w-full accent-purple-500"
              />
              <div className="mt-2 space-y-0.5 text-[11px] text-slate-300">
                <div>
                  RF Power Draw:{" "}
                  <strong className={linkMetrics.powerExceeded ? "text-status-crit" : "text-status-ok"}>
                    {linkMetrics.rfWattsRequired} W / {liveMetrics.available_power_w.toFixed(0)} W
                  </strong>
                </div>
                <div>
                  160 Gbit Recorder Clear Time: <strong>{linkMetrics.hoursToClear.toFixed(1)} h</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-xs text-slate-300">
          Efficiency Estimate: <strong className="text-status-ok">{(linkMetrics.downlinkEfficiency * 100).toFixed(0)}%</strong>
        </div>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSubmitTake(buildPayload())}
          className="paper-btn flex items-center gap-2 bg-status-ok px-4 py-2 text-sm text-ink-black"
        >
          <Sparkles className="h-4 w-4" />
          {isLocked ? "Downlink Locked" : "Confirm Downlink & Telemetry"}
        </button>
      </div>
    </div>
  );
}
