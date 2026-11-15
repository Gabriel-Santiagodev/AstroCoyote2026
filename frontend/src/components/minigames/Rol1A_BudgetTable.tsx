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
import { AnimatePresence, motion } from "framer-motion";
import { soundEngine } from "../paper/SoundEngine";
import { GameLayout, GoalList, LockButton, PanelCard, PlayBackdrop, Readout, type Goal } from "./kit/GameKit";

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
    title: "Stronger fuel tanks?",
    department: "Engine team",
    description:
      "+$40M from the vault. More fuel cells for Power, but -10% reserve.",
    extraCostUsd: 40_000_000,
    ufeDrainPct: 10,
    bonusF: 0.12,
  },
  {
    id: "card_12s",
    triggerSec: 12,
    title: "Spare camera optics?",
    department: "Science team",
    description:
      "+$25M from the vault to protect the cameras. -5% reserve.",
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

  // ---------------------------------------------------------------------------
  // Game window UI (2026-11-15): three coin vaults + a request inbox + goals panel.
  // The model above (coins, requests, payload) is unchanged.
  // ---------------------------------------------------------------------------
  const recommendedUfe = Number(missionCfg.recommended_ufe_pct ?? 25);
  const pendingRequest = SURPRISE_REQUESTS.find((r) => cardDecisions[r.id] === "pending") ?? null;
  const leftForRocketUsd = totalBudgetUsd - computed.subsystemsCostUsd;
  const goals: Goal[] = [
    { label: `Safety vault ${recommendedUfe}%+`, done: computed.ufeReservePct >= recommendedUfe },
    { label: "Fund engineering and science", done: coins.eng > 0 && coins.sci > 0 },
    { label: "Answer the requests", done: pendingRequest === null },
  ];
  const vaults: Array<{ key: BucketKey; label: string; color: string; Icon: typeof Wrench; hint: string }> = [
    { key: "eng", label: "Engineering", color: "#06B6D4", Icon: Wrench, hint: "Fuel cells for Power" },
    { key: "sci", label: "Science", color: "#A855F7", Icon: FlaskConical, hint: "Instruments + radio" },
    { key: "ufe", label: "Safety vault", color: "#22C55E", Icon: ShieldAlert, hint: "Emergency cash" },
  ];
  const usdOf = (key: BucketKey) =>
    key === "eng" ? computed.budgetEngineeringUsd : key === "sci" ? computed.budgetScienceUsd : coins.ufe * coinValueUsd;

  return (
    <GameLayout
      play={
        <div className="relative flex h-full flex-col">
          <PlayBackdrop tint="#F59E0B" />
          <div className="relative flex items-center justify-between gap-2 px-3 pt-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink-black bg-paper-cream px-2 py-1 font-mono text-xs font-bold text-ink-black">
              <Coins className="h-4 w-4 text-amber-500" /> 1 coin = ${Math.round(coinValueUsd / 1e6)}M
            </span>
            <span className="font-mono text-[11px] font-bold uppercase text-slate-400">
              Budget ${Math.round(totalBudgetUsd / 1e6)}M
            </span>
          </div>

          <div className="relative grid min-h-0 flex-1 grid-cols-3 gap-2 px-3 pb-3 pt-2 sm:gap-4">
            {vaults.map(({ key, label, color, Icon, hint }) => (
              <div key={key} className="flex min-h-0 flex-col items-center gap-1.5">
                <div className="flex items-center gap-1 font-display text-xs font-bold sm:text-sm" style={{ color }}>
                  <Icon className="h-4 w-4" /> {label}
                </div>
                {/* glass vault with stacked coins */}
                <div
                  className="relative w-full max-w-[9rem] flex-1 overflow-hidden rounded-2xl border-[3px] border-ink-black shadow-paper"
                  style={{ background: `linear-gradient(180deg, ${color}10, ${color}30)`, minHeight: 120 }}
                >
                  <div className="absolute inset-x-2 top-1 h-3 rounded-full bg-white/10" />
                  <div className="absolute inset-x-0 bottom-1 flex flex-col-reverse items-center gap-[3px]">
                    <AnimatePresence>
                      {Array.from({ length: coins[key] }, (_, i) => (
                        <motion.span
                          key={i}
                          initial={{ y: -60, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -30, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 420, damping: 22 }}
                          className="block h-3 w-3/4 rounded-full border-2 border-ink-black bg-amber-400 sm:h-3.5"
                          style={{ boxShadow: "inset 0 -2px 0 #B45309" }}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
                  {key === "ufe" ? `${computed.ufeReservePct}%` : `$${Math.round(usdOf(key) / 1e6)}M`}
                </div>
                <div className="hidden text-center text-[10px] text-slate-400 sm:block">{hint}</div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    aria-label={`Remove a coin from ${label}`}
                    disabled={isLocked || coins[key] <= 0}
                    onClick={() => {
                      soundEngine.playClick();
                      handleAdjustCoin(key, -1);
                    }}
                    className="paper-btn flex h-9 w-9 items-center justify-center bg-space-ink text-paper-cream"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Add a coin to ${label}`}
                    disabled={isLocked || coins[key] >= TOTAL_COINS}
                    onClick={() => {
                      soundEngine.playClick();
                      handleAdjustCoin(key, 1);
                    }}
                    className="paper-btn flex h-9 w-9 items-center justify-center text-ink-black"
                    style={{ backgroundColor: color }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      }
      panel={
        <>
          {/* Request inbox: requests arrive one after another (no timer) */}
          <AnimatePresence mode="wait">
            {pendingRequest && (
              <motion.div
                key={pendingRequest.id}
                initial={{ x: 40, opacity: 0, rotate: 3 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                exit={{ x: -40, opacity: 0 }}
                className="rounded-xl border-[3px] border-ink-black bg-paper-cream p-3 text-ink-black shadow-paper"
              >
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-amber-700">
                  <Sparkles className="h-3.5 w-3.5" /> {pendingRequest.department} asks
                </div>
                <div className="font-display text-base font-bold leading-tight">{pendingRequest.title}</div>
                <p className="mt-1 text-xs text-slate-700">{pendingRequest.description}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      soundEngine.playComplete();
                      handleDecision(pendingRequest.id, "approved");
                    }}
                    className="paper-btn flex items-center justify-center gap-1 bg-status-ok py-1.5 text-sm text-ink-black"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      soundEngine.playClick();
                      handleDecision(pendingRequest.id, "rejected");
                    }}
                    className="paper-btn flex items-center justify-center gap-1 bg-slate-300 py-1.5 text-sm text-ink-black"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <GoalList goals={goals} />
          <PanelCard title="Live">
            <div className="space-y-2">
              <Readout
                label="Safety vault"
                value={`${computed.ufeReservePct}%`}
                pct={(computed.ufeReservePct / (recommendedUfe * 2)) * 100}
                tone={computed.ufeReservePct >= recommendedUfe ? "ok" : computed.ufeReservePct > 0 ? "warn" : "bad"}
              />
              <Readout label="Fuel cell chance" value={`${computed.h2ProbPct}%`} pct={computed.h2ProbPct} tone="info" />
              <Readout
                label="Left for the rocket"
                value={`$${Math.round(leftForRocketUsd / 1e6)}M`}
                tone={leftForRocketUsd > 0 ? "ok" : "bad"}
              />
            </div>
          </PanelCard>
          {computed.ufeReservePct < recommendedUfe && (
            <div className="flex items-center gap-2 rounded-xl border-[3px] border-ink-black bg-status-warn px-2.5 py-1.5 text-xs font-bold text-ink-black">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Thin reserve: crises will hurt more.
            </div>
          )}
          <LockButton
            isLocked={isLocked}
            ready={goals.every((g) => g.done)}
            label="Lock budget"
            onLock={() => onSubmitTake(buildPayload())}
          />
        </>
      }
    />
  );
}

export default Rol1A_BudgetTable;
