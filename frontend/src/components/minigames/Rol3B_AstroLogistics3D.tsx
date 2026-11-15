// Owner: Abraham (Task ABR-06) — Wave 2 Three.js 3D Rover Power Logistics minigame. See docs/19-roadmap-abraham.md
import { useEffect, useRef } from "react";
import type { MinigameProps } from "../../types/game";

export function Rol3B_AstroLogistics3D({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const autoSubmitted = useRef(false);

  const buildPayload = () => ({
    power_source: missionId === "mars_sample_return" ? "rtg_nuclear" : "fuel_cell",
    total_energy_mj: 245,
    power_generation_w: 850,
    battery_reserve_pct: 28,
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
        Rol 3B · AstroLogistics 3D Power ({missionId})
      </h3>
      <p className="font-mono text-xs text-slate-300">
        R&D Funding Factor F={liveMetrics.funding_factor_F.toFixed(2)} | Available Bus Power:{" "}
        {liveMetrics.available_power_w.toFixed(0)} W
      </p>
      <p className="text-sm text-slate-300">
        Stub ready for Abraham (Task ABR-06). Implement Three.js rover scene with N_max=3 crates, H2 spawn rate & WASD + touch joystick.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onLiveMutation({ available_power_w: 850 })}
          className="paper-btn bg-role-orbit px-4 py-2 text-ink-black"
        >
          Deliver H2 Pack (+100 MJ)
        </button>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSubmitTake(buildPayload())}
          className="paper-btn bg-status-ok px-4 py-2 text-ink-black"
        >
          Confirm Power Take
        </button>
      </div>
    </div>
  );
}

export default Rol3B_AstroLogistics3D;
