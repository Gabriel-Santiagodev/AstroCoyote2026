// Owner: Abraham (Task ABR-05) — Wave 2 DSN Antenna Drift + Spectral Hacker DTMF minigame. See docs/19-roadmap-abraham.md
import { useEffect, useRef } from "react";
import type { MinigameProps } from "../../types/game";

export function Rol4B_CommsSpectralHacker({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const autoSubmitted = useRef(false);

  const buildPayload = () => ({
    link_margin_db: 4.2,
    downlink_rate_mbps: 4.5,
    downlink_efficiency: 1.0,
    dtmf_code_ok: true,
    solar_conjunction_warning: missionId === "mars_sample_return",
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
        Rol 4B · DSN Comms & Spectral Hacker ({missionId})
      </h3>
      <p className="font-mono text-xs text-slate-300">
        FSPL: {liveMetrics.fspl_loss_db.toFixed(1)} dB | Drift:{" "}
        {liveMetrics.cg_balanced ? "1.0x Nominal" : "1.5x Unbalanced CG!"}
      </p>
      <p className="text-sm text-slate-300">
        Stub ready for Abraham (Task ABR-05). Implement DSN oscilloscope tracking + DTMF anomaly filter + bitrate slider.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onLiveMutation({ downlink_rate_mbps: 4.5 })}
          className="paper-btn bg-role-science px-4 py-2 text-paper-cream"
        >
          Lock Carrier (+4.2 dB)
        </button>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSubmitTake(buildPayload())}
          className="paper-btn bg-status-ok px-4 py-2 text-ink-black"
        >
          Confirm Downlink Take
        </button>
      </div>
    </div>
  );
}

export default Rol4B_CommsSpectralHacker;
