// Owner: Ismael (Task ISM-03) — Wave 2 Launch Vehicle Auction minigame. See docs/18-roadmap-ismael.md
import { useEffect, useRef } from "react";
import type { MinigameProps } from "../../types/game";

export function Rol1B_LauncherAuction({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const autoSubmitted = useRef(false);

  const buildPayload = () => ({
    selected_launcher: "falcon9_block5",
    launcher_max_mass_kg: 4020,
    fairing_ok: true,
    launch_cost_usd: 74_000_000,
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
        Rol 1B · Launch Vehicle Auction ({missionId})
      </h3>
      <p className="font-mono text-xs text-slate-300">
        Spacecraft Wet Mass: {liveMetrics.estimated_wet_mass_kg.toFixed(0)} kg | Budget Left: $
        {(liveMetrics.remaining_budget_usd / 1_000_000).toFixed(1)}M
      </p>
      <p className="text-sm text-slate-300">
        Stub ready for Ismael (Task ISM-03). Implement launcher cards from src/data/nasa_catalog.json here.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onLiveMutation({ selected_launcher: "falcon9_block5", launch_cost_usd: 74_000_000 })}
          className="paper-btn bg-role-finance px-4 py-2 text-ink-black"
        >
          Preview Falcon 9
        </button>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSubmitTake(buildPayload())}
          className="paper-btn bg-status-ok px-4 py-2 text-ink-black"
        >
          Confirm Launcher Take
        </button>
      </div>
    </div>
  );
}

export default Rol1B_LauncherAuction;
