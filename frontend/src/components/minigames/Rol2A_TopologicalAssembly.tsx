// Owner: Ismael (Task ISM-01) — Wave 1 Spacecraft Topological Assembly minigame. See docs/18-roadmap-ismael.md
import { useEffect, useRef } from "react";
import type { MinigameProps } from "../../types/game";

export function Rol2A_TopologicalAssembly({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const autoSubmitted = useRef(false);

  const buildPayload = () => ({
    bus_dry_mass_kg: missionId === "mars_sample_return" ? 461 : 373,
    has_thermal_protection: true,
    assembly_integrity_pct: 100,
    has_deorbit_device: true,
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
        Rol 2A · Spacecraft Assembly ({missionId})
      </h3>
      <p className="font-mono text-xs text-slate-300">
        Heat Shield: {liveMetrics.has_thermal_protection ? "INSTALLED" : "MISSING"}
      </p>
      <p className="text-sm text-slate-300">
        Stub ready for Ismael (Task ISM-01). Build the ordered step-by-step chassis, power, shield & torque minigame here.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onLiveMutation({ dry_mass_kg: 373, has_thermal_protection: true })}
          className="paper-btn bg-role-spacecraft px-4 py-2 text-ink-black"
        >
          Install Heat Shield
        </button>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSubmitTake(buildPayload())}
          className="paper-btn bg-status-ok px-4 py-2 text-ink-black"
        >
          Confirm Assembly Take
        </button>
      </div>
    </div>
  );
}

export default Rol2A_TopologicalAssembly;
