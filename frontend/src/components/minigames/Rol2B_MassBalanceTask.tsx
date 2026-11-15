// Owner: Ismael (Task ISM-04) — Wave 2 Center of Gravity & Mass Balance minigame. See docs/18-roadmap-ismael.md
import { useEffect, useRef } from "react";
import type { MinigameProps } from "../../types/game";

export function Rol2B_MassBalanceTask({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const autoSubmitted = useRef(false);

  const buildPayload = () => ({
    cg_balanced: true,
    fuel_burn_multiplier: 1.0,
    mass_growth_margin_pct: 35,
    ballast_jettisoned_kg: 0,
  });

  useEffect(() => {
    if (timeLeftSec <= 0 && !isLocked && !autoSubmitted.current) {
      autoSubmitted.current = true;
      onSubmitTake(buildPayload());
    }
  }, [timeLeftSec, isLocked, onSubmitTake]);

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold">
        Rol 2B · Center of Gravity Balance ({missionId})
      </h3>
      <p className="font-mono text-xs text-slate-300">
        Instruments to mount: {liveMetrics.selected_instruments.length} | Burn Multiplier:{" "}
        {liveMetrics.fuel_burn_multiplier.toFixed(1)}x
      </p>
      <p className="text-sm text-slate-300">
        Stub ready for Ismael (Task ISM-04). Implement the 8-slot 2D CG grid & ballast jettison button here.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onLiveMutation({ cg_balanced: true, fuel_burn_multiplier: 1.0 })}
          className="paper-btn bg-role-spacecraft px-4 py-2 text-ink-black"
        >
          Simulate Balanced CG
        </button>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSubmitTake(buildPayload())}
          className="paper-btn bg-status-ok px-4 py-2 text-ink-black"
        >
          Confirm Balance Take
        </button>
      </div>
    </div>
  );
}

export default Rol2B_MassBalanceTask;
