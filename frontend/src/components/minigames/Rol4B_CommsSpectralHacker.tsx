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
import { AnimatePresence, motion } from "framer-motion";
import { soundEngine } from "../paper/SoundEngine";
import { GameLayout, GoalList, LockButton, PanelCard, PlayBackdrop, Readout, type Goal } from "./kit/GameKit";

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

  // ---------------------------------------------------------------------------
  // Game window UI (2026-11-15): 1) chase the drifting Earth signal with the dish and lock it
  // (the margin is captured at the lock, so nobody is punished for a drift after locking);
  // 2) clean the noise and find the key whose two tones match the peaks.
  // ---------------------------------------------------------------------------
  const [capturedMarginDb, setCapturedMarginDb] = useState<number | null>(null);
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const finalMarginDb = capturedMarginDb ?? linkMetrics.marginDb;
  const finalEfficiency = Number(
    ((finalMarginDb >= MIN_MARGIN_DB ? 0.65 : 0.3) + (linkMetrics.dtmfMatched ? 0.35 : 0)).toFixed(2)
  );
  const buildFinalPayload = () => ({
    ...buildPayload(),
    link_margin_db: finalMarginDb,
    downlink_efficiency: finalEfficiency,
  });
  const onTarget = linkMetrics.marginDb >= MIN_MARGIN_DB;
  const lockSignal = () => {
    if (isLocked) return;
    if (onTarget) soundEngine.playComplete();
    else soundEngine.playError();
    setCapturedMarginDb(linkMetrics.marginDb);
    onLiveMutation({ downlink_rate_mbps: Number(bitrateMbps.toFixed(2)) });
  };
  const tapScope = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLocked || !scopeRef.current || capturedMarginDb !== null) return;
    const rect = scopeRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    steerReticle(x - reticlePos.x, y - reticlePos.y);
  };
  const goals: Goal[] = [
    { label: "Dish locked on Earth", done: capturedMarginDb !== null && capturedMarginDb >= MIN_MARGIN_DB },
    { label: "Noise cleaned", done: driftClean },
    { label: "Signal code matched", done: linkMetrics.dtmfMatched },
  ];
  const signalPct = Math.max(0, Math.min(100, ((linkMetrics.marginDb + 6) / 14.5) * 100));
  const keypad = hackerData.dtmf_keypad ?? DEFAULT_DTMF;

  return (
    <GameLayout
      play={
        <div className="relative flex h-full flex-col">
          <PlayBackdrop tint="#6366F1" />
          <div className="relative z-10 flex gap-1.5 p-2">
            {(["dsn", "hacker"] as const).map((p, i) => (
              <button key={p} type="button" onClick={() => { soundEngine.playClick(); setPhase(p); }}
                className={`paper-btn flex-1 py-1.5 text-sm ${phase === p ? "bg-paper-cream text-ink-black" : "bg-space-ink text-slate-300"}`}>
                {i + 1}. {p === "dsn" ? "Aim the dish" : "Send the code"}
              </button>
            ))}
          </div>

          {phase === "dsn" ? (
            <div className="relative flex min-h-0 flex-1 flex-col items-center gap-2 p-2 pt-0 sm:flex-row sm:items-stretch">
              <div
                ref={scopeRef}
                onPointerDown={tapScope}
                className="relative aspect-square h-full max-h-[340px] min-h-[180px] cursor-crosshair overflow-hidden rounded-full border-[4px] border-ink-black shadow-paper"
                style={{
                  background:
                    "radial-gradient(circle, rgba(34,197,94,0.18) 0 20%, transparent 21% 45%, rgba(34,197,94,0.14) 46% 47%, transparent 48% 72%, rgba(34,197,94,0.14) 73% 74%, transparent 75%), #0F172A",
                }}
                role="application"
                aria-label="Dish aiming scope: keep the crosshair on the green signal"
              >
                <motion.span className="absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(34,197,94,0.45), transparent 60deg)" }}
                  animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                {/* Earth signal */}
                <span className="absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink-black bg-status-ok/80 shadow-[0_0_18px_rgba(34,197,94,0.8)]"
                  style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }} />
                {/* crosshair */}
                <span className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${reticlePos.x}%`, top: `${reticlePos.y}%` }}>
                  <span className={`block h-10 w-10 rounded-full border-[3px] ${onTarget ? "border-status-ok" : "border-status-crit"}`} />
                  <span className="absolute left-1/2 top-[-6px] h-[52px] w-0.5 -translate-x-1/2 bg-paper-cream/80" />
                  <span className="absolute left-[-6px] top-1/2 h-0.5 w-[52px] -translate-y-1/2 bg-paper-cream/80" />
                </span>
                {capturedMarginDb !== null && (
                  <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-xl font-bold text-paper-cream drop-shadow-[2px_2px_0_#0F172A]">
                    LOCKED
                  </span>
                )}
              </div>
              <div className="flex w-full min-w-0 flex-col gap-2 sm:w-48">
                <Readout label="Signal" value={`${linkMetrics.marginDb.toFixed(1)} dB`} pct={signalPct} tone={onTarget ? "ok" : "warn"} />
                <div className="grid grid-cols-3 gap-1 self-center">
                  <div />
                  <button type="button" aria-label="Aim up" onClick={() => steerReticle(0, -6)} className="paper-btn flex h-10 w-10 items-center justify-center bg-blueprint-navy text-paper-cream"><ArrowUp className="h-5 w-5" /></button>
                  <div />
                  <button type="button" aria-label="Aim left" onClick={() => steerReticle(-6, 0)} className="paper-btn flex h-10 w-10 items-center justify-center bg-blueprint-navy text-paper-cream"><ArrowLeft className="h-5 w-5" /></button>
                  <button type="button" aria-label="Aim down" onClick={() => steerReticle(0, 6)} className="paper-btn flex h-10 w-10 items-center justify-center bg-blueprint-navy text-paper-cream"><ArrowDown className="h-5 w-5" /></button>
                  <button type="button" aria-label="Aim right" onClick={() => steerReticle(6, 0)} className="paper-btn flex h-10 w-10 items-center justify-center bg-blueprint-navy text-paper-cream"><ArrowRight className="h-5 w-5" /></button>
                </div>
                <button type="button" disabled={isLocked} onClick={capturedMarginDb === null ? lockSignal : () => setCapturedMarginDb(null)}
                  className={`paper-btn py-2 text-sm text-ink-black ${capturedMarginDb !== null ? "bg-slate-300" : onTarget ? "bg-status-ok" : "bg-status-warn"}`}>
                  {capturedMarginDb !== null ? "Re-aim" : "Lock signal"}
                </button>
                <label className="space-y-1 font-mono text-[10px] font-bold uppercase text-slate-400">
                  Data speed {bitrateMbps.toFixed(1)} Mbps
                  <input type="range" min={0.5} max={6} step={0.5} value={bitrateMbps} disabled={isLocked}
                    onChange={(e) => setBitrateMbps(Number(e.target.value))} className="w-full accent-sky-400" />
                </label>
              </div>
            </div>
          ) : (
            <div className="relative flex min-h-0 flex-1 flex-col gap-2 p-2 pt-0">
              <div className="flex items-center gap-2">
                <button type="button" disabled={isLocked || driftClean} onClick={() => { soundEngine.playComplete(); setDriftClean(true); }}
                  className={`paper-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs text-ink-black ${driftClean ? "bg-status-ok" : "animate-pulse bg-status-warn"}`}>
                  <Waves className="h-3.5 w-3.5" /> {driftClean ? "Noise cleaned" : "Clean the noise"}
                </button>
                <span className="font-mono text-[10px] text-slate-400">Find the 2 tall peaks</span>
              </div>
              <div className="relative min-h-[110px] flex-1 rounded-xl border-[3px] border-ink-black bg-slate-950">
                <svg viewBox="0 0 460 130" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label="Signal spectrum">
                  <polyline points={spectrumSvg} fill="none" stroke="#38BDF8" strokeWidth="2.5" />
                  {[600, 800, 1000, 1200, 1400, 1600].map((hz) => {
                    const pts = hackerData.points ?? [];
                    const minX = pts[0]?.x ?? 550;
                    const maxX = pts[pts.length - 1]?.x ?? 1800;
                    const x = 20 + ((hz - minX) / Math.max(1, maxX - minX)) * 420;
                    return <text key={hz} x={x} y="128" fontSize="9" textAnchor="middle" fill="#94A3B8" fontFamily="IBM Plex Mono, monospace">{hz}</text>;
                  })}
                </svg>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {keypadKeys.map((k) => {
                  const pair = keypad[k] ?? [0, 0];
                  const sel = selectedKey === k;
                  return (
                    <button key={k} type="button" disabled={isLocked}
                      onClick={() => { soundEngine.playClick(); setSelectedKey(k); }}
                      className={`rounded-lg border-[3px] py-1 text-center ${sel ? (linkMetrics.dtmfMatched ? "border-status-ok bg-emerald-900" : "border-status-crit bg-rose-950") : "border-ink-black bg-space-ink hover:bg-blueprint-navy"}`}>
                      <span className="block font-display text-lg font-bold leading-none">{k}</span>
                      <span className="font-mono text-[9px] text-slate-400">{pair[0]}·{pair[1]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      }
      panel={
        <>
          <GoalList goals={goals} />
          <PanelCard title="Link to Earth">
            <div className="space-y-2">
              <Readout label="Locked signal" value={capturedMarginDb === null ? "—" : `${capturedMarginDb.toFixed(1)} dB`}
                tone={capturedMarginDb !== null && capturedMarginDb >= MIN_MARGIN_DB ? "ok" : "warn"} />
              <Readout label="Needed" value={`${MIN_MARGIN_DB} dB`} tone="info" />
              <Readout label="Radio power" value={`${linkMetrics.rfWattsRequired} W`} tone={linkMetrics.powerExceeded ? "bad" : "ok"} />
              <Readout label="Data delivered" value={`${Math.round(finalEfficiency * 100)}%`} pct={finalEfficiency * 100} tone={finalEfficiency >= 0.9 ? "ok" : "warn"} />
            </div>
          </PanelCard>
          {liveMetrics.cg_balanced === false && (
            <div className="flex items-center gap-2 rounded-xl border-[3px] border-ink-black bg-status-warn px-2.5 py-1.5 text-xs font-bold text-ink-black">
              <ShieldAlert className="h-4 w-4 shrink-0" /> Ship off-balance: the signal drifts faster.
            </div>
          )}
          <LockButton isLocked={isLocked} ready={goals.every((g) => g.done)} label="Send data" onLock={() => onSubmitTake(buildFinalPayload())} />
        </>
      }
    />
  );
}

export default Rol4B_CommsSpectralHacker;
