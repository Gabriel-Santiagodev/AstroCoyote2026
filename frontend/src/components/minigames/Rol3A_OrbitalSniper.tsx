// Owner: Abraham (Task ABR-03) — Wave 1 Orbital Constraints & Propulsion minigame. See docs/19-roadmap-abraham.md
import { useEffect, useRef } from "react";
import type { MinigameProps } from "../../types/game";

export function Rol3A_OrbitalSniper({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const autoSubmitted = useRef(false);

  const buildPayload = () => ({
    trajectory_choice: "free_return_sso_700",
    required_dv_ms: 1803.6,
    isp_seconds: 315.0,
    propellant_mass_kg: 820.0,
    max_eclipse_min: 35.29,
    fspl_loss_db: 166.0,
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
        Rol 3A · Orbital Constraints & Propulsion ({missionId})
      </h3>
      <p className="font-mono text-xs text-slate-300">
        Current FSPL: {liveMetrics.fspl_loss_db.toFixed(1)} dB | Required Delta-v:{" "}
        {liveMetrics.required_dv_ms.toFixed(0)} m/s
      </p>
      <p className="text-sm text-slate-300">
        Stub ready for Abraham (Task ABR-03). Implement orbit selector (LEO/SSO/MEO/GEO) + mission route dilemma + engine Isp.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onLiveMutation({ fspl_loss_db: 166.0, required_dv_ms: 1803.6, propellant_mass_kg: 820 })}
          className="paper-btn bg-role-orbit px-4 py-2 text-ink-black"
        >
          Lock SSO 700 km (Preview)
        </button>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSubmitTake(buildPayload())}
          className="paper-btn bg-status-ok px-4 py-2 text-ink-black"
        >
          Confirm Orbit & Engine
        </button>
      </div>
    </div>
  );
}

export default Rol3A_OrbitalSniper;
