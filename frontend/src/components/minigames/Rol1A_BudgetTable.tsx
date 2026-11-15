// Owner: Ismael (Task ISM-02) — Wave 1 Finance & UFE Vault minigame. See docs/18-roadmap-ismael.md
import { useEffect, useRef } from "react";
import type { MinigameProps } from "../../types/game";

export function Rol1A_BudgetTable({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const autoSubmitted = useRef(false);

  const buildPayload = () => ({
    budget_engineering_usd: 320_000_000,
    budget_science_usd: 240_000_000,
    ufe_reserve_pct: 30,
    funding_factor_F: 0.67,
    subsystems_cost_usd: 560_000_000,
  });

  useEffect(() => {
    if (timeLeftSec <= 0 && !isLocked && !autoSubmitted.current) {
      autoSubmitted.current = true;
      onSubmitTake(buildPayload());
    }
  }, [timeLeftSec, isLocked, onSubmitTake]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">
          Rol 1A · Mission Budget & UFE Vault ({missionId})
        </h3>
        <span className="font-mono text-xs text-slate-300">
          Live F={liveMetrics.funding_factor_F.toFixed(2)} | UFE={liveMetrics.ufe_reserve_pct}%
        </span>
      </div>
      <p className="text-sm text-slate-300">
        Stub ready for Ismael (Task ISM-02). Implement the 10-coin allocator and emergency surprise cards here.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onLiveMutation({ funding_factor_F: 0.83, ufe_reserve_pct: 25 })}
          className="paper-btn bg-role-finance px-4 py-2 text-ink-black"
        >
          Test Live Allocation
        </button>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSubmitTake(buildPayload())}
          className="paper-btn bg-status-ok px-4 py-2 text-ink-black"
        >
          Confirm Budget Take
        </button>
      </div>
    </div>
  );
}

export default Rol1A_BudgetTable;
