// Owner: Leonardo (Task LEO-03) — Isolated /dev-sandbox tester for all 8 minigames
import { useEffect, useState, type ComponentType } from "react";
import { MinigameShell } from "../components/MinigameShell";
import { ResourceHUD } from "../components/paper/ResourceHUD";
import { Rol1A_BudgetTable } from "../components/minigames/Rol1A_BudgetTable";
import { Rol1B_LauncherAuction } from "../components/minigames/Rol1B_LauncherAuction";
import { Rol2A_TopologicalAssembly } from "../components/minigames/Rol2A_TopologicalAssembly";
import { Rol2B_MassBalanceTask } from "../components/minigames/Rol2B_MassBalanceTask";
import { Rol3A_OrbitalSniper } from "../components/minigames/Rol3A_OrbitalSniper";
import { Rol3B_AstroLogistics3D } from "../components/minigames/Rol3B_AstroLogistics3D";
import { Rol4A_SpectralLabTask } from "../components/minigames/Rol4A_SpectralLabTask";
import { Rol4B_CommsSpectralHacker } from "../components/minigames/Rol4B_CommsSpectralHacker";
import type {
  DifficultyType,
  LiveMetrics,
  MinigameProps,
  MissionIdType,
  RoleType,
} from "../types/game";

type MinigameKey = "Rol1A" | "Rol1B" | "Rol2A" | "Rol2B" | "Rol3A" | "Rol3B" | "Rol4A" | "Rol4B";

const REGISTRY: Record<
  MinigameKey,
  { roleId: RoleType; wave: 1 | 2; Component: ComponentType<MinigameProps> }
> = {
  Rol1A: { roleId: "finance_launch", wave: 1, Component: Rol1A_BudgetTable },
  Rol1B: { roleId: "finance_launch", wave: 2, Component: Rol1B_LauncherAuction },
  Rol2A: { roleId: "spacecraft_mass", wave: 1, Component: Rol2A_TopologicalAssembly },
  Rol2B: { roleId: "spacecraft_mass", wave: 2, Component: Rol2B_MassBalanceTask },
  Rol3A: { roleId: "orbit_power", wave: 1, Component: Rol3A_OrbitalSniper },
  Rol3B: { roleId: "orbit_power", wave: 2, Component: Rol3B_AstroLogistics3D },
  Rol4A: { roleId: "science_comms", wave: 1, Component: Rol4A_SpectralLabTask },
  Rol4B: { roleId: "science_comms", wave: 2, Component: Rol4B_CommsSpectralHacker },
};

const INITIAL_METRICS: LiveMetrics = {
  estimated_wet_mass_kg: 1850,
  remaining_budget_usd: 450_000_000,
  ufe_reserve_pct: 25,
  funding_factor_F: 0.65,
  fspl_loss_db: 166.0,
  cg_balanced: true,
  fuel_burn_multiplier: 1.0,
  available_power_w: 750,
  instruments_mass_kg: 68,
  selected_instruments: [
    { id: "hirise", name: "HiRISE Camera", mass_kg: 65 },
    { id: "ctx", name: "Context Camera (CTX)", mass_kg: 3 },
  ],
  required_dv_ms: 1803.6,
  has_thermal_protection: true,
};

export function DevSandboxView({ onExitSandbox }: { onExitSandbox?: () => void }) {
  const [selectedKey, setSelectedKey] = useState<MinigameKey>("Rol1A");
  const [missionId, setMissionId] = useState<MissionIdType>("artemis_moon");
  const [difficulty, setDifficulty] = useState<DifficultyType>("medium");
  const [timeLeftSec, setTimeLeftSec] = useState<number>(30);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<LiveMetrics>(INITIAL_METRICS);
  const [lastLiveDelta, setLastLiveDelta] = useState<Record<string, unknown>>({});
  const [lastSubmitPayload, setLastSubmitPayload] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (isLocked || timeLeftSec <= 0) return;
    const timer = window.setInterval(() => {
      setTimeLeftSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isLocked, timeLeftSec]);

  const entry = REGISTRY[selectedKey];
  const ActiveComponent = entry.Component;

  const resetSandbox = () => {
    setTimeLeftSec(30);
    setIsLocked(false);
    setLastSubmitPayload(null);
  };

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
      <div className="paper-card flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-role-finance">ISOLATED MINIGAME SANDBOX</p>
          <h1 className="font-display text-2xl font-bold">/dev-sandbox</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedKey}
            onChange={(e) => {
              setSelectedKey(e.target.value as MinigameKey);
              resetSandbox();
            }}
            className="rounded-lg border-2 border-ink-black bg-paper-cream px-3 py-1.5 font-mono text-sm font-bold text-ink-black"
          >
            {(Object.keys(REGISTRY) as MinigameKey[]).map((key) => (
              <option key={key} value={key}>
                {key} ({REGISTRY[key].roleId})
              </option>
            ))}
          </select>

          <select
            value={missionId}
            onChange={(e) => setMissionId(e.target.value as MissionIdType)}
            className="rounded-lg border-2 border-ink-black bg-paper-cream px-3 py-1.5 font-mono text-sm font-bold text-ink-black"
          >
            <option value="artemis_moon">artemis_moon</option>
            <option value="asteroid_hunter">asteroid_hunter</option>
            <option value="mars_sample_return">mars_sample_return</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyType)}
            className="rounded-lg border-2 border-ink-black bg-paper-cream px-3 py-1.5 font-mono text-sm font-bold text-ink-black"
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>

          <button
            type="button"
            onClick={resetSandbox}
            className="paper-btn bg-role-spacecraft px-3 py-1.5 text-xs text-ink-black"
          >
            Reset 30s
          </button>

          {onExitSandbox && (
            <button
              type="button"
              onClick={onExitSandbox}
              className="paper-btn bg-paper-cream px-3 py-1.5 text-xs text-ink-black"
            >
              Back to Menu
            </button>
          )}
        </div>
      </div>

      <ResourceHUD liveMetrics={metrics} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MinigameShell
            roleId={entry.roleId}
            wave={entry.wave}
            timeLeftSec={timeLeftSec}
            isLocked={isLocked}
          >
            <ActiveComponent
              missionId={missionId}
              difficulty={difficulty}
              roleId={entry.roleId}
              wave={entry.wave}
              timeLeftSec={timeLeftSec}
              liveMetrics={metrics}
              onLiveMutation={(delta) => {
                setLastLiveDelta(delta);
                setMetrics((prev) => ({ ...prev, ...delta } as LiveMetrics));
              }}
              onSubmitTake={(payload) => {
                setLastSubmitPayload(payload);
                setIsLocked(true);
              }}
              isLocked={isLocked}
            />
          </MinigameShell>
        </div>

        <aside className="paper-card space-y-4 font-mono text-xs">
          <h2 className="font-display text-base font-bold text-role-finance">
            Mock LiveMetrics Controls
          </h2>

          <label className="block space-y-1">
            <span>estimated_wet_mass_kg: {metrics.estimated_wet_mass_kg}</span>
            <input
              type="range"
              min={200}
              max={6000}
              step={50}
              value={metrics.estimated_wet_mass_kg}
              onChange={(e) =>
                setMetrics((m) => ({ ...m, estimated_wet_mass_kg: Number(e.target.value) }))
              }
              className="w-full"
            />
          </label>

          <label className="block space-y-1">
            <span>funding_factor_F: {metrics.funding_factor_F.toFixed(2)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={metrics.funding_factor_F}
              onChange={(e) =>
                setMetrics((m) => ({ ...m, funding_factor_F: Number(e.target.value) }))
              }
              className="w-full"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={metrics.cg_balanced}
              onChange={(e) =>
                setMetrics((m) => ({
                  ...m,
                  cg_balanced: e.target.checked,
                  fuel_burn_multiplier: e.target.checked ? 1.0 : 1.5,
                }))
              }
            />
            <span>cg_balanced (false = 1.5x burn)</span>
          </label>

          <div>
            <div className="font-bold text-role-spacecraft">Last onLiveMutation:</div>
            <pre className="mt-1 max-h-28 overflow-auto rounded bg-space-ink p-2 text-[11px]">
              {JSON.stringify(lastLiveDelta, null, 2)}
            </pre>
          </div>

          <div>
            <div className="font-bold text-status-ok">Last onSubmitTake:</div>
            <pre className="mt-1 max-h-36 overflow-auto rounded bg-space-ink p-2 text-[11px]">
              {JSON.stringify(lastSubmitPayload, null, 2)}
            </pre>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default DevSandboxView;
