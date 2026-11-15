// Owner: Abraham (Task ABR-04) — Wave 1 Scientific Instruments + Spectral Calibration minigame. See docs/19-roadmap-abraham.md
import { useEffect, useRef } from "react";
import type { MinigameProps } from "../../types/game";

export function Rol4A_SpectralLabTask({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const autoSubmitted = useRef(false);

  const sampleInstruments = [
    { id: "hirise", name: "HiRISE Camera", mass_kg: 65.0 },
    { id: "ctx", name: "Context Camera (CTX)", mass_kg: 3.0 },
  ];

  const buildPayload = () => ({
    instruments_mass_kg: 68.0,
    instruments_power_w: 67.0,
    data_generated_gbit: 115.0,
    science_value: 85.0,
    has_visual_autonomy: true,
    selected_instruments: sampleInstruments,
    spectral_marks: [656.3, 486.1],
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
        Rol 4A · Payload & Spectral Lab ({missionId})
      </h3>
      <p className="font-mono text-xs text-slate-300">
        Current Payload Mass: {liveMetrics.instruments_mass_kg.toFixed(1)} kg
      </p>
      <p className="text-sm text-slate-300">
        Stub ready for Abraham (Task ABR-04). Implement instrument picker + interactive spectral peak marker from spectralChallenge.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isLocked}
          onClick={() =>
            onLiveMutation({
              instruments_mass_kg: 68.0,
              selected_instruments: sampleInstruments,
            })
          }
          className="paper-btn bg-role-science px-4 py-2 text-paper-cream"
        >
          Mount HiRISE + CTX (68 kg)
        </button>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSubmitTake(buildPayload())}
          className="paper-btn bg-status-ok px-4 py-2 text-ink-black"
        >
          Confirm Science Take
        </button>
      </div>
    </div>
  );
}

export default Rol4A_SpectralLabTask;
