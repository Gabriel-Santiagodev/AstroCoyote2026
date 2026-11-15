// Owner: Ismael (Task ISM-02) — Wave 1 Budget Allocation & NASA NPR 7120.5 UFE Vault Minigame
// Implements 10-coin distribution + 2 Push-Your-Luck surprise engineering cards per docs/18-roadmap-ismael.md.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  FlaskConical,
  Gauge,
  Minus,
  Plus,
  ShieldAlert,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";
import nasaCatalog from "../../data/nasa_catalog.json";
import type { MinigameProps } from "../../types/game";

type BucketKey = "eng" | "sci" | "ufe";

interface SurpriseRequest {
  id: "card_20s" | "card_12s";
  triggerSec: number;
  title: string;
  department: string;
  description: string;
  extraCostUsd: number;
  ufeDrainPct: number;
  bonusF: number;
}

const SURPRISE_REQUESTS: SurpriseRequest[] = [
  {
    id: "card_20s",
    triggerSec: 20,
    title: "Urgent Memo: Cryogenic Tank Reinforcement",
    department: "Propulsion & R&D Division",
    description:
      "Propulsion asks for +$40M from the UFE Vault for composite overwrapped tanks. Boosts R&D Factor F (+0.12) for Rol 3B H2 Fuel Cells, but drains 10% UFE reserve.",
    extraCostUsd: 40_000_000,
    ufeDrainPct: 10,
    bonusF: 0.12,
  },
  {
    id: "card_12s",
    triggerSec: 12,
    title: "Urgent Memo: Flight-Spare Calibration Optics",
    department: "Payload & DSN Telemetry Lab",
    description:
      "Science asks for +$25M from the UFE Vault to shield optical benches against radiation. Drains 5% UFE reserve.",
    extraCostUsd: 25_000_000,
    ufeDrainPct: 5,
    bonusF: 0.05,
  },
];

const TOTAL_COINS = 10;

export function Rol1A_BudgetTable({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const missionCfg = nasaCatalog.missions[missionId] ?? nasaCatalog.missions.artemis_moon;
  const totalBudgetUsd = Number(missionCfg.budget_limit_usd || 800_000_000);
  const coinValueUsd = totalBudgetUsd / TOTAL_COINS;

  // 10 golden coins distributed across 3 buckets (starts at 4 / 3 / 3 = 10)
  const [coins, setCoins] = useState<{ eng: number; sci: number; ufe: number }>({
    eng: 4,
    sci: 3,
    ufe: 3,
  });

  // Push-Your-Luck card decisions: "pending" | "approved" | "rejected"
  const [cardDecisions, setCardDecisions] = useState<
    Record<SurpriseRequest["id"], "pending" | "approved" | "rejected">
  >({
    card_20s: "pending",
    card_12s: "pending",
  });

  const autoSubmitted = useRef(false);

  const computed = useMemo(() => {
    let extraSpendUsd = 0;
    let ufeDrainPct = 0;
    let bonusF = 0;

    for (const req of SURPRISE_REQUESTS) {
      if (cardDecisions[req.id] === "approved") {
        extraSpendUsd += req.extraCostUsd;
        ufeDrainPct += req.ufeDrainPct;
        bonusF += req.bonusF;
      }
    }

    const budgetEngineeringUsd = Math.round(coins.eng * coinValueUsd);
    const budgetScienceUsd = Math.round(coins.sci * coinValueUsd);
    const baseUfePct = coins.ufe * 10;
    const ufeReservePct = Math.max(0, baseUfePct - ufeDrainPct);
    const fundingFactorF = Number(
      Math.min(1, Math.max(0, coins.eng / 6 + bonusF)).toFixed(2)
    );
    const subsystemsCostUsd = Math.round(
      budgetEngineeringUsd + budgetScienceUsd + extraSpendUsd
    );

    // Spawn probability preview for Rol 3B (matches backend/physics_engine.py compute_power_spawn_probabilities)
    const h2ProbPct =
      fundingFactorF <= 0.5
        ? Math.round((0.05 + (fundingFactorF / 0.5) * 0.15) * 100)
        : Math.round((0.2 + ((fundingFactorF - 0.5) / 0.5) * 0.3) * 100);

    return {
      budgetEngineeringUsd,
      budgetScienceUsd,
      ufeReservePct,
      fundingFactorF,
      subsystemsCostUsd,
      extraSpendUsd,
      h2ProbPct,
    };
  }, [coins, coinValueUsd, cardDecisions]);

  const emitLive = useCallback(
    (
      nextCoins: { eng: number; sci: number; ufe: number },
      nextDecisions: Record<SurpriseRequest["id"], "pending" | "approved" | "rejected">
    ) => {
      if (isLocked) return;
      let extraSpendUsd = 0;
      let ufeDrainPct = 0;
      let bonusF = 0;
      for (const req of SURPRISE_REQUESTS) {
        if (nextDecisions[req.id] === "approved") {
          extraSpendUsd += req.extraCostUsd;
          ufeDrainPct += req.ufeDrainPct;
          bonusF += req.bonusF;
        }
      }
      const engUsd = Math.round(nextCoins.eng * coinValueUsd);
      const sciUsd = Math.round(nextCoins.sci * coinValueUsd);
      const ufePct = Math.max(0, nextCoins.ufe * 10 - ufeDrainPct);
      const fVal = Number(Math.min(1, Math.max(0, nextCoins.eng / 6 + bonusF)).toFixed(2));
      const subCostUsd = Math.round(engUsd + sciUsd + extraSpendUsd);

      onLiveMutation({
        budget_engineering_usd: engUsd,
        budget_science_usd: sciUsd,
        ufe_reserve_pct: ufePct,
        funding_factor_F: fVal,
        subsystems_cost_usd: subCostUsd,
      });
    },
    [isLocked, coinValueUsd, onLiveMutation]
  );

  // Move 1 coin into `target` bucket by taking 1 coin from another bucket (keeps total = 10 coins)
  const handleAdjustCoin = useCallback(
    (target: BucketKey, delta: 1 | -1) => {
      if (isLocked) return;
      setCoins((prev) => {
        const next = { ...prev };
        if (delta === 1) {
          if (next[target] >= TOTAL_COINS) return prev;
          // Prefer taking from UFE first if target != ufe, else from sci, else eng
          const donorOrder: BucketKey[] =
            target === "eng"
              ? ["ufe", "sci"]
              : target === "sci"
              ? ["ufe", "eng"]
              : ["sci", "eng"];
          const donor = donorOrder.find((k) => next[k] > 0);
          if (!donor) return prev;
          next[target] += 1;
          next[donor] -= 1;
        } else {
          if (next[target] <= 0) return prev;
          const receiver: BucketKey = target === "ufe" ? "eng" : "ufe";
          next[target] -= 1;
          next[receiver] += 1;
        }
        emitLive(next, cardDecisions);
        return next;
      });
    },
    [isLocked, emitLive, cardDecisions]
  );

  const handleDecision = useCallback(
    (cardId: SurpriseRequest["id"], decision: "approved" | "rejected") => {
      if (isLocked) return;
      setCardDecisions((prev) => {
        const next = { ...prev, [cardId]: decision };
        emitLive(coins, next);
        return next;
      });
    },
    [isLocked, coins, emitLive]
  );

  const buildPayload = useCallback(
    () => ({
      budget_engineering_usd: computed.budgetEngineeringUsd,
      budget_science_usd: computed.budgetScienceUsd,
      ufe_reserve_pct: computed.ufeReservePct,
      funding_factor_F: computed.fundingFactorF,
      subsystems_cost_usd: computed.subsystemsCostUsd,
    }),
    [computed]
  );

  useEffect(() => {
    if (timeLeftSec <= 0 && !isLocked && !autoSubmitted.current) {
      autoSubmitted.current = true;
      onSubmitTake(buildPayload());
    }
  }, [timeLeftSec, isLocked, onSubmitTake, buildPayload]);

  const ufeStatus =
    computed.ufeReservePct >= 25
      ? {
          label: "SAFE (>= 25% NASA NPR 7120.5)",
          color: "text-emerald-300",
          bg: "bg-emerald-500/20 border-emerald-400",
          barColor: "bg-emerald-400",
        }
      : computed.ufeReservePct >= 15
      ? {
          label: "CAUTION (15–24% Thin Reserve)",
          color: "text-amber-300",
          bg: "bg-amber-500/20 border-amber-400",
          barColor: "bg-amber-400",
        }
      : {
          label: "CRITICAL (< 15% Nunn-McCurdy Risk!)",
          color: "text-rose-300",
          bg: "bg-rose-500/25 border-rose-400",
          barColor: "bg-rose-500",
        };

  // Speedometer needle angle (-80 deg to +80 deg for 0% to 50% UFE)
  const needleDeg = Math.min(80, Math.max(-80, (computed.ufeReservePct / 50) * 160 - 80));

  return (
    <div className="space-y-4 text-slate-100">
      {/* Header Banner */}
      <div className="paper-card flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink-black bg-role-finance font-display text-sm font-bold text-ink-black">
            1A
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Mission Budget Table & UFE Vault ({missionCfg.name})
            </h3>
            <p className="text-xs text-slate-300">
              Distribute <b>10 Golden Coins</b> (1 coin ={" "}
              <b className="font-mono text-amber-300">${Math.round(coinValueUsd / 1e6)}M</b> of{" "}
              <b className="font-mono text-amber-300">${Math.round(totalBudgetUsd / 1e6)}M</b> cap).
              Keep UFE Vault ≥ 25% per NASA NPR 7120.5!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="rounded-lg border-2 border-ink-black bg-slate-950 px-3 py-1.5">
            <span className="text-slate-400">R&D Factor F: </span>
            <strong className="text-amber-300">{computed.fundingFactorF.toFixed(2)}</strong>
            <span className="ml-1.5 text-[11px] text-emerald-300">
              ({computed.h2ProbPct}% H2 spawn in 3B)
            </span>
          </div>
          <div className="rounded-lg border-2 border-ink-black bg-slate-950 px-3 py-1.5">
            <span className="text-slate-400">Committed: </span>
            <strong className="text-white">
              ${Math.round(computed.subsystemsCostUsd / 1e6)}M
            </strong>
          </div>
        </div>
      </div>

      {/* 3 Coin Allocation Columns */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Box 1: Engineering & R&D */}
        <div className="paper-card flex flex-col justify-between bg-slate-900/95 p-3.5">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-display text-sm font-bold text-cyan-300">
                <Wrench className="h-4 w-4" /> 1. Engineering & R&D
              </span>
              <span className="paper-badge bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-200">
                {coins.eng * 10}% (${Math.round(computed.budgetEngineeringUsd / 1e6)}M)
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Drives <b>Funding Factor F = {computed.fundingFactorF.toFixed(2)}</b>. Higher F spawns
              more 100 MJ H2 Fuel Cells for your Power teammate in Station 3B.
            </p>

            {/* Visual Coin Stack */}
            <div className="my-3 flex min-h-[48px] flex-wrap items-center gap-1.5 rounded-xl border-2 border-ink-black bg-slate-950/90 p-2">
              {Array.from({ length: coins.eng }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink-black bg-amber-400 font-mono text-xs font-extrabold text-ink-black shadow-paper-sm"
                  title="10% Budget Coin"
                >
                  $
                </div>
              ))}
              {coins.eng === 0 && (
                <span className="text-xs italic text-slate-500">0 coins allocated</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={isLocked || coins.eng <= 0}
              onClick={() => handleAdjustCoin("eng", -1)}
              className="paper-btn flex flex-1 items-center justify-center gap-1 bg-slate-800 py-2 text-sm text-white"
            >
              <Minus className="h-4 w-4" /> -1 Coin
            </button>
            <span className="font-mono text-lg font-extrabold text-amber-300">{coins.eng}</span>
            <button
              type="button"
              disabled={isLocked || coins.eng >= TOTAL_COINS}
              onClick={() => handleAdjustCoin("eng", 1)}
              className="paper-btn flex flex-1 items-center justify-center gap-1 bg-cyan-400 py-2 text-sm text-ink-black"
            >
              <Plus className="h-4 w-4" /> +1 Coin
            </button>
          </div>
        </div>

        {/* Box 2: Science & Comms */}
        <div className="paper-card flex flex-col justify-between bg-slate-900/95 p-3.5">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-display text-sm font-bold text-violet-300">
                <FlaskConical className="h-4 w-4" /> 2. Science & Comms
              </span>
              <span className="paper-badge bg-violet-500/20 px-2 py-0.5 text-xs text-violet-200">
                {coins.sci * 10}% (${Math.round(computed.budgetScienceUsd / 1e6)}M)
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Funds NASA payload instruments (HiRISE, CRISM, OVIRS) and Deep Space Network X-Band
              transponders in Stations 4A & 4B.
            </p>

            <div className="my-3 flex min-h-[48px] flex-wrap items-center gap-1.5 rounded-xl border-2 border-ink-black bg-slate-950/90 p-2">
              {Array.from({ length: coins.sci }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink-black bg-amber-400 font-mono text-xs font-extrabold text-ink-black shadow-paper-sm"
                >
                  $
                </div>
              ))}
              {coins.sci === 0 && (
                <span className="text-xs italic text-slate-500">0 coins allocated</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={isLocked || coins.sci <= 0}
              onClick={() => handleAdjustCoin("sci", -1)}
              className="paper-btn flex flex-1 items-center justify-center gap-1 bg-slate-800 py-2 text-sm text-white"
            >
              <Minus className="h-4 w-4" /> -1 Coin
            </button>
            <span className="font-mono text-lg font-extrabold text-amber-300">{coins.sci}</span>
            <button
              type="button"
              disabled={isLocked || coins.sci >= TOTAL_COINS}
              onClick={() => handleAdjustCoin("sci", 1)}
              className="paper-btn flex flex-1 items-center justify-center gap-1 bg-violet-400 py-2 text-sm text-ink-black"
            >
              <Plus className="h-4 w-4" /> +1 Coin
            </button>
          </div>
        </div>

        {/* Box 3: Emergency Vault (UFE) + Speedometer Gauge */}
        <div className="paper-card flex flex-col justify-between bg-slate-900/95 p-3.5">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-display text-sm font-bold text-amber-300">
                <Gauge className="h-4 w-4" /> 3. Emergency Vault (UFE)
              </span>
              <span className={`paper-badge px-2 py-0.5 text-xs ${ufeStatus.bg} ${ufeStatus.color}`}>
                {computed.ufeReservePct}% Reserve
              </span>
            </div>

            {/* Speedometer Gauge */}
            <div className="my-2 flex flex-col items-center rounded-xl border-2 border-ink-black bg-slate-950/90 p-2">
              <svg viewBox="0 0 160 88" className="h-20 w-40">
                {/* Red / Yellow / Green Arcs */}
                <path
                  d="M 20 76 A 60 60 0 0 1 56 22"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M 58 21 A 60 60 0 0 1 102 21"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="12"
                />
                <path
                  d="M 104 22 A 60 60 0 0 1 140 76"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Needle */}
                <g transform={`translate(80,76) rotate(${needleDeg})`}>
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-48"
                    stroke="#F8FAFC"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="0" cy="0" r="6" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
                </g>
                <text
                  x="80"
                  y="70"
                  textAnchor="middle"
                  className="fill-white font-mono text-[11px] font-bold"
                >
                  UFE {computed.ufeReservePct}%
                </text>
              </svg>
              <span className={`font-mono text-[11px] font-bold ${ufeStatus.color}`}>
                {ufeStatus.label}
              </span>
            </div>

            <div className="my-2 flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-xl border-2 border-ink-black bg-slate-950/90 p-1.5">
              {Array.from({ length: coins.ufe }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink-black bg-emerald-400 font-mono text-xs font-extrabold text-ink-black"
                >
                  $
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={isLocked || coins.ufe <= 0}
              onClick={() => handleAdjustCoin("ufe", -1)}
              className="paper-btn flex flex-1 items-center justify-center gap-1 bg-slate-800 py-2 text-sm text-white"
            >
              <Minus className="h-4 w-4" /> -1 Coin
            </button>
            <span className="font-mono text-lg font-extrabold text-emerald-300">{coins.ufe}</span>
            <button
              type="button"
              disabled={isLocked || coins.ufe >= TOTAL_COINS}
              onClick={() => handleAdjustCoin("ufe", 1)}
              className="paper-btn flex flex-1 items-center justify-center gap-1 bg-emerald-400 py-2 text-sm text-ink-black"
            >
              <Plus className="h-4 w-4" /> +1 Coin
            </button>
          </div>
        </div>
      </div>

      {/* Surprise Push-Your-Luck Engineering Requests (triggered at <= 20s and <= 12s) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {SURPRISE_REQUESTS.map((req) => {
          const isVisible = timeLeftSec <= req.triggerSec;
          const status = cardDecisions[req.id];
          if (!isVisible) {
            return (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 px-4 py-3 text-xs text-slate-400"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Incoming Engineering Memo at <b>T-{req.triggerSec}s</b>...
                </span>
                <span className="font-mono">STANDBY</span>
              </div>
            );
          }

          return (
            <div
              key={req.id}
              className="paper-card border-amber-400 bg-amber-950/30 p-3 text-xs text-slate-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase text-amber-300">
                    {req.department}
                  </span>
                  <h4 className="font-display text-sm font-bold text-white">{req.title}</h4>
                </div>
                {status !== "pending" && (
                  <span
                    className={`paper-badge px-2 py-0.5 text-[10px] ${
                      status === "approved"
                        ? "bg-emerald-400 text-ink-black"
                        : "bg-slate-700 text-slate-200"
                    }`}
                  >
                    {status.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="mt-1 text-slate-300">{req.description}</p>
              <div className="mt-2.5 flex gap-2">
                <button
                  type="button"
                  disabled={isLocked || status !== "pending"}
                  onClick={() => handleDecision(req.id, "approved")}
                  className="paper-btn flex flex-1 items-center justify-center gap-1 bg-amber-400 py-1.5 text-xs text-ink-black"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve from Vault (-{req.ufeDrainPct}%
                  UFE)
                </button>
                <button
                  type="button"
                  disabled={isLocked || status !== "pending"}
                  onClick={() => handleDecision(req.id, "rejected")}
                  className="paper-btn flex flex-1 items-center justify-center gap-1 bg-slate-800 py-1.5 text-xs text-slate-200"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject Request
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Footer */}
      <div className="paper-card flex flex-wrap items-center justify-between gap-3 bg-slate-900/95 p-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          {computed.ufeReservePct < 20 ? (
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          ) : (
            <Coins className="h-4 w-4 text-amber-300" />
          )}
          <span>
            Remaining for Wave 2 Launcher Auction:{" "}
            <b className="font-mono text-emerald-300">
              ${Math.round((totalBudgetUsd - computed.subsystemsCostUsd) / 1e6)}M
            </b>{" "}
            · Live Wet Mass:{" "}
            <b className="font-mono text-cyan-300">
              {Math.round(liveMetrics.estimated_wet_mass_kg)} kg
            </b>
          </span>
        </div>

        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSubmitTake(buildPayload())}
          className="paper-btn bg-status-ok px-6 py-2.5 text-sm text-ink-black"
        >
          {isLocked ? "BUDGET LOCKED ✓" : "CONFIRM BUDGET ALLOCATION"}
        </button>
      </div>
    </div>
  );
}

export default Rol1A_BudgetTable;
