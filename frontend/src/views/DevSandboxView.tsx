// Owner: Leonardo (Task LEO-03) — Isolated tester for all eight minigames.
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { LockKeyhole, Pause, Play, RotateCcw, UnlockKeyhole } from "lucide-react";
import { MinigameShell } from "../components/MinigameShell";
import { CrewmateAvatar, ROLE_CHARACTER_PROFILE } from "../components/paper/CrewmateAvatar";
import { ResourceHUD } from "../components/paper/ResourceHUD";
import { soundEngine } from "../components/paper/SoundEngine";
import { Rol1A_BudgetTable } from "../components/minigames/Rol1A_BudgetTable";
import { Rol1B_LauncherAuction } from "../components/minigames/Rol1B_LauncherAuction";
import { Rol2A_TopologicalAssembly } from "../components/minigames/Rol2A_TopologicalAssembly";
import { Rol2B_MassBalanceTask } from "../components/minigames/Rol2B_MassBalanceTask";
import { Rol3A_OrbitalSniper } from "../components/minigames/Rol3A_OrbitalSniper";
import { Rol3B_AstroLogistics3D } from "../components/minigames/Rol3B_AstroLogistics3D";
import { Rol4A_SpectralLabTask } from "../components/minigames/Rol4A_SpectralLabTask";
import { Rol4B_CommsSpectralHacker } from "../components/minigames/Rol4B_CommsSpectralHacker";
import nasaCatalog from "../data/nasa_catalog.json";
import type {
  DifficultyType, LiveMetrics, MinigameProps, MissionIdType, RoleType,
} from "../types/game";

type MinigameKey = "Rol1A" | "Rol1B" | "Rol2A" | "Rol2B" | "Rol3A" | "Rol3B" | "Rol4A" | "Rol4B";
type NumericMetricKey = {
  [Key in keyof LiveMetrics]-?: LiveMetrics[Key] extends number ? Key : never;
}[keyof LiveMetrics];

const ROUND_SECONDS = 30; // docs/04-juego.md: one 30-second take per station.
const REGISTRY: Record<
  MinigameKey,
  { roleId: RoleType; wave: 1 | 2; title: string; Component: ComponentType<MinigameProps> }
> = {
  Rol1A: { roleId: "finance_launch", wave: 1, title: "Budget Table", Component: Rol1A_BudgetTable },
  Rol1B: { roleId: "finance_launch", wave: 2, title: "Launcher Auction", Component: Rol1B_LauncherAuction },
  Rol2A: { roleId: "spacecraft_mass", wave: 1, title: "Topological Assembly", Component: Rol2A_TopologicalAssembly },
  Rol2B: { roleId: "spacecraft_mass", wave: 2, title: "Mass Balance", Component: Rol2B_MassBalanceTask },
  Rol3A: { roleId: "orbit_power", wave: 1, title: "Orbital Sniper", Component: Rol3A_OrbitalSniper },
  Rol3B: { roleId: "orbit_power", wave: 2, title: "AstroLogistics 3D", Component: Rol3B_AstroLogistics3D },
  Rol4A: { roleId: "science_comms", wave: 1, title: "Spectral Lab", Component: Rol4A_SpectralLabTask },
  Rol4B: { roleId: "science_comms", wave: 2, title: "Comms Spectral Hacker", Component: Rol4B_CommsSpectralHacker },
};
const NUMERIC_KEYS: NumericMetricKey[] = [
  "estimated_wet_mass_kg", "remaining_budget_usd", "ufe_reserve_pct",
  "funding_factor_F", "fspl_loss_db", "fuel_burn_multiplier",
  "available_power_w", "instruments_mass_kg", "required_dv_ms",
];

function createMockMetrics(missionId: MissionIdType): LiveMetrics {
  const mission = nasaCatalog.missions[missionId];
  const launcher = nasaCatalog.launchers.find(({ id }) => id === "falcon9_block5") ?? nasaCatalog.launchers[0];
  const orbit = nasaCatalog.orbits.find(({ id }) => id === "sso_700") ?? nasaCatalog.orbits[0];
  const engine = nasaCatalog.engines.find(({ id }) => id === "hall_thruster") ?? nasaCatalog.engines[0];
  // Mock boundary values come from the catalog; they are not mission results.
  return {
    estimated_wet_mass_kg: launcher.max_mass_kg,
    remaining_budget_usd: mission.budget_limit_usd,
    ufe_reserve_pct: mission.recommended_ufe_pct,
    funding_factor_F: 1,
    fspl_loss_db: orbit.fspl_s_band_db,
    cg_balanced: true,
    fuel_burn_multiplier: 1,
    available_power_w: engine.power_demand_w,
    instruments_mass_kg: 0,
    selected_instruments: [],
    required_dv_ms: mission.default_required_dv_ms,
    has_thermal_protection: mission.requires_thermal_protection,
  };
}

function mergeRecognizedMetrics(current: LiveMetrics, delta: Record<string, unknown>): LiveMetrics {
  const next = { ...current };
  for (const key of NUMERIC_KEYS) {
    const value = delta[key];
    if (typeof value === "number" && Number.isFinite(value)) next[key] = value;
  }
  if (typeof delta.cg_balanced === "boolean") next.cg_balanced = delta.cg_balanced;
  if (typeof delta.has_thermal_protection === "boolean") next.has_thermal_protection = delta.has_thermal_protection;
  if (
    Array.isArray(delta.selected_instruments) &&
    delta.selected_instruments.every(
      (item: unknown) => typeof item === "object" && item !== null &&
        "id" in item && typeof item.id === "string" &&
        "name" in item && typeof item.name === "string" &&
        "mass_kg" in item && typeof item.mass_kg === "number"
    )
  ) next.selected_instruments = delta.selected_instruments;
  return next;
}

function JsonInspector({ title, value, accent }: { title: string; value: unknown; accent: string }) {
  return (
    <section className="min-w-0">
      <h3 className={"mb-2 font-display text-sm font-bold " + accent}>{title}</h3>
      <pre className="max-h-56 min-h-20 overflow-auto whitespace-pre-wrap break-all rounded-xl border-2 border-ink-black bg-space-ink p-3 font-mono text-xs leading-relaxed text-paper-cream">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}

export function DevSandboxView({ onExitSandbox }: { onExitSandbox?: () => void }) {
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );
  const [selectedKey, setSelectedKey] = useState<MinigameKey>("Rol1A");
  const [missionId, setMissionId] = useState<MissionIdType>("artemis_moon");
  const [difficulty, setDifficulty] = useState<DifficultyType>("easy");
  const [timeLeftSec, setTimeLeftSec] = useState(ROUND_SECONDS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [runId, setRunId] = useState(0);
  const [metrics, setMetrics] = useState<LiveMetrics>(() => createMockMetrics("artemis_moon"));
  const [lastLiveDelta, setLastLiveDelta] = useState<Record<string, unknown> | null>(null);
  const [lastSubmitPayload, setLastSubmitPayload] = useState<Record<string, unknown> | null>(null);
  const [toastAlert, setToastAlert] = useState<string | null>(null);
  const [toastText, setToastText] = useState("Teammate updated mission constraints.");
  const [toastSource, setToastSource] = useState<RoleType>("science_comms");
  const [simulatedEvent, setSimulatedEvent] = useState<Record<string, unknown> | null>(null);
  const [spectralJson, setSpectralJson] = useState("");
  const submittedRef = useRef(false);

  useEffect(() => {
    const viewport = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobileViewport(viewport.matches);
    updateViewport();
    viewport.addEventListener("change", updateViewport);
    return () => viewport.removeEventListener("change", updateViewport);
  }, []);
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => setTimeLeftSec((previous) => Math.max(0, previous - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [isPlaying]);
  useEffect(() => {
    if (timeLeftSec === 0) setIsPlaying(false);
  }, [timeLeftSec]);
  useEffect(() => {
    if (!toastAlert) return;
    const timeout = window.setTimeout(() => setToastAlert(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toastAlert]);

  const resetRun = useCallback(() => {
    submittedRef.current = false;
    setTimeLeftSec(ROUND_SECONDS);
    setIsPlaying(false);
    setIsLocked(false);
    setRunId((previous) => previous + 1);
    setLastLiveDelta(null);
    setLastSubmitPayload(null);
    setToastAlert(null);
  }, []);
  const handleLiveMutation = useCallback((delta: Record<string, unknown>) => {
    setLastLiveDelta(delta);
    setMetrics((previous) => mergeRecognizedMetrics(previous, delta));
    setToastAlert("Live mutation from " + ROLE_CHARACTER_PROFILE[REGISTRY[selectedKey].roleId].codename);
  }, [selectedKey]);
  const handleSubmitTake = useCallback((payload: Record<string, unknown>) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setLastSubmitPayload(payload);
    setIsLocked(true);
    setIsPlaying(false);
  }, []);

  const entry = REGISTRY[selectedKey];
  const ActiveComponent = entry.Component;
  const activeProfile = ROLE_CHARACTER_PROFILE[entry.roleId];
  const mission = nasaCatalog.missions[missionId];
  const orbitLosses = nasaCatalog.orbits.flatMap((orbit) => [orbit.fspl_s_band_db, orbit.fspl_x_band_db]);
  const controls: Array<{ key: NumericMetricKey; unit: string; min: number; max: number; step: number }> = [
    { key: "estimated_wet_mass_kg", unit: "kg", min: 0, max: Math.max(...nasaCatalog.launchers.map((launcher) => launcher.max_mass_kg)), step: 1 },
    { key: "remaining_budget_usd", unit: "USD", min: 0, max: mission.budget_limit_usd, step: mission.budget_limit_usd / 1000 },
    { key: "ufe_reserve_pct", unit: "%", min: 0, max: 100, step: 1 },
    { key: "funding_factor_F", unit: "F", min: 0, max: 1, step: 0.01 },
    { key: "fspl_loss_db", unit: "dB", min: Math.min(...orbitLosses), max: Math.max(...orbitLosses), step: 0.1 },
    { key: "fuel_burn_multiplier", unit: "×", min: 1, max: 1.5, step: 0.5 },
    { key: "available_power_w", unit: "W", min: 0, max: Math.max(...nasaCatalog.engines.map((engine) => engine.power_demand_w)), step: 1 },
    { key: "instruments_mass_kg", unit: "kg", min: 0, max: nasaCatalog.instruments.reduce((total, instrument) => total + instrument.mass_kg, 0), step: 0.1 },
    { key: "required_dv_ms", unit: "m/s", min: 0, max: mission.default_required_dv_ms, step: 0.1 },
  ];
  let spectralChallenge: unknown;
  let spectralError = "";
  if (spectralJson.trim()) {
    try {
      spectralChallenge = JSON.parse(spectralJson);
    } catch {
      spectralError = "Enter valid JSON to pass a spectral challenge.";
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-3 py-4 text-paper-cream sm:space-y-5 sm:px-4 sm:py-6">
      <header className="flash-panel overflow-hidden p-4 sm:p-5">
        <div className="hazard-stripe-bar -mx-4 -mt-4 mb-4 h-2 border-b-2 border-ink-black sm:-mx-5 sm:-mt-5" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold tracking-widest text-role-finance">ENGINEERING TEST DECK</p>
          <h1 className="font-display text-2xl font-black sm:text-3xl">Minigame Sandbox</h1>
          <p className="mt-1 text-sm text-slate-300">Isolated station preview · /dev-sandbox</p>
        </div>
        {onExitSandbox && <button type="button" onClick={() => { soundEngine.playClick(); onExitSandbox(); }} className="paper-btn bg-paper-cream px-4 py-2 text-sm text-ink-black">Back to Menu</button>}
        </div>
      </header>

      <section className="flash-panel grid min-w-0 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5" aria-label="Sandbox selectors">
        <label className="space-y-1 font-mono text-xs font-bold" htmlFor="sandbox-game">
          <span>MINIGAME</span>
          <select id="sandbox-game" value={selectedKey} onChange={(event) => { soundEngine.playClick(); setSelectedKey(event.target.value as MinigameKey); resetRun(); }} className="w-full min-w-0 rounded-lg border-2 border-ink-black bg-white px-3 py-2 text-sm text-ink-black">
            {(Object.keys(REGISTRY) as MinigameKey[]).map((key) => <option key={key} value={key}>{key} · {REGISTRY[key].title}</option>)}
          </select>
        </label>
        <label className="space-y-1 font-mono text-xs font-bold" htmlFor="sandbox-mission">
          <span>MISSION ID</span>
          <select id="sandbox-mission" value={missionId} onChange={(event) => { soundEngine.playClick(); const next = event.target.value as MissionIdType; setMissionId(next); setMetrics(createMockMetrics(next)); resetRun(); }} className="w-full min-w-0 rounded-lg border-2 border-ink-black bg-white px-3 py-2 text-sm text-ink-black">
            {(Object.keys(nasaCatalog.missions) as MissionIdType[]).map((id) => <option key={id} value={id}>{nasaCatalog.missions[id].name}</option>)}
          </select>
        </label>
        <label className="space-y-1 font-mono text-xs font-bold" htmlFor="sandbox-difficulty">
          <span>DIFFICULTY</span>
          <select id="sandbox-difficulty" value={difficulty} onChange={(event) => { soundEngine.playClick(); setDifficulty(event.target.value as DifficultyType); resetRun(); }} className="w-full min-w-0 rounded-lg border-2 border-ink-black bg-white px-3 py-2 text-sm text-ink-black">
            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
        </label>
      </section>

      <ResourceHUD key={isMobileViewport ? "mobile" : "desktop"} liveMetrics={metrics} missionId={missionId} activeRole={entry.roleId} compact={isMobileViewport} />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <div className="min-w-0 space-y-5">
          <section className="flash-panel flex flex-wrap items-center justify-between gap-4 p-4" aria-label="Sandbox clock controls">
            <div><p className="font-mono text-xs text-slate-300">LOCAL STATION CLOCK</p><div className="font-mono text-4xl font-bold tabular-nums">{String(timeLeftSec).padStart(2, "0")}s</div></div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" disabled={timeLeftSec === 0 || isPlaying} onClick={() => { soundEngine.playClick(); setIsPlaying(true); }} className="paper-btn inline-flex items-center gap-2 bg-status-ok px-4 py-2 text-sm text-ink-black"><Play size={17} /> Play</button>
              <button type="button" disabled={!isPlaying} onClick={() => { soundEngine.playClick(); setIsPlaying(false); }} className="paper-btn inline-flex items-center gap-2 bg-status-warn px-4 py-2 text-sm text-ink-black"><Pause size={17} /> Pause</button>
              <button type="button" onClick={() => { soundEngine.playClick(); resetRun(); }} className="paper-btn inline-flex items-center gap-2 bg-paper-cream px-4 py-2 text-sm text-ink-black"><RotateCcw size={17} /> Reset</button>
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-ink-black bg-paper-cream px-3 py-2 font-mono text-xs font-bold text-ink-black">
              <input type="checkbox" checked={isLocked} onChange={(event) => { soundEngine.playClick(); submittedRef.current = event.target.checked; setIsLocked(event.target.checked); }} />
              {isLocked ? <LockKeyhole size={16} /> : <UnlockKeyhole size={16} />} isLocked
            </label>
          </section>

          <div className="handheld-console-frame min-w-0 space-y-3 p-2 sm:p-3">
            <div className="flex min-w-0 items-center gap-2 rounded-xl border-2 border-ink-black bg-space-ink/80 px-2 py-1">
              <CrewmateAvatar role={entry.roleId} state="work" size={isMobileViewport ? 46 : 56} />
              <div className="min-w-0">
                <p className="truncate font-mono text-[11px] font-bold text-role-finance">{activeProfile.codename} · {activeProfile.squadClass}</p>
                <p className="truncate font-mono text-[10px] text-slate-300">GEAR: {activeProfile.gearLabel}</p>
              </div>
            </div>
            <MinigameShell roleId={entry.roleId} wave={entry.wave} timeLeftSec={timeLeftSec} isLocked={isLocked} toastAlert={toastAlert}>
              <ActiveComponent key={selectedKey + "-" + runId} missionId={missionId} difficulty={difficulty} roleId={entry.roleId} wave={entry.wave} timeLeftSec={timeLeftSec} liveMetrics={metrics} spectralChallenge={spectralChallenge} onLiveMutation={handleLiveMutation} onSubmitTake={handleSubmitTake} isLocked={isLocked} />
            </MinigameShell>
          </div>

          <section className="flash-panel space-y-3 p-4">
            <h2 className="font-display text-lg font-bold">Simulate mutacion_en_vivo</h2>
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
              <label className="font-mono text-xs" htmlFor="toast-source">SOURCE ROLE
                <select id="toast-source" value={toastSource} onChange={(event) => { soundEngine.playClick(); setToastSource(event.target.value as RoleType); }} className="mt-1 w-full rounded-lg border-2 border-ink-black bg-paper-cream px-2 py-2 text-ink-black">
                  {(Object.keys(ROLE_CHARACTER_PROFILE) as RoleType[]).map((role) => <option key={role} value={role}>{ROLE_CHARACTER_PROFILE[role].codename}</option>)}
                </select>
              </label>
              <label className="font-mono text-xs" htmlFor="toast-message">TOAST ALERT
                <input id="toast-message" value={toastText} onChange={(event) => setToastText(event.target.value)} className="mt-1 w-full rounded-lg border-2 border-ink-black bg-paper-cream px-2 py-2 text-ink-black" />
              </label>
              <button type="button" onClick={() => { soundEngine.playClick(); soundEngine.playMutationToast(); const alert = toastText.trim() || "Mission constraints updated."; setToastAlert(alert); setSimulatedEvent({ source_role: toastSource, live_metrics: metrics, toast_alert: alert }); }} className="paper-btn self-end bg-role-spacecraft px-3 py-2 text-sm text-ink-black">Send Toast</button>
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-5">
          <section className="paper-card-light space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><h2 className="font-display text-lg font-bold">Mock LiveMetrics</h2><p className="text-xs text-slate-600">Local test values only. Numeric fields accept values beyond slider limits.</p></div>
              <button type="button" onClick={() => { soundEngine.playClick(); setMetrics(createMockMetrics(missionId)); }} className="paper-btn bg-role-orbit px-3 py-1.5 text-xs text-ink-black">Reset Metrics</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {controls.map((control) => (
                <label key={control.key} className="block space-y-1 font-mono text-xs">
                  <span className="block break-all font-bold">{control.key} <span className="font-normal text-slate-600">({control.unit})</span></span>
                  <div className="flex items-center gap-2">
                    <input type="range" min={Math.min(control.min, metrics[control.key])} max={Math.max(control.max, metrics[control.key])} step={control.step} value={metrics[control.key]} onChange={(event) => setMetrics((previous) => ({ ...previous, [control.key]: Number(event.target.value) }))} className="min-w-0 flex-1 accent-blue-600" />
                    <input type="number" step={control.step} value={metrics[control.key]} onChange={(event) => { const value = Number(event.target.value); if (event.target.value !== "" && Number.isFinite(value)) setMetrics((previous) => ({ ...previous, [control.key]: value })); }} aria-label={control.key + " numeric value"} className="w-28 rounded-lg border-2 border-ink-black bg-white px-2 py-1 text-right tabular-nums" />
                  </div>
                </label>
              ))}
            </div>
            <div className="grid gap-2 border-t-2 border-ink-black pt-3 font-mono text-xs sm:grid-cols-2 xl:grid-cols-1">
              <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={metrics.cg_balanced} onChange={(event) => setMetrics((previous) => ({ ...previous, cg_balanced: event.target.checked, fuel_burn_multiplier: event.target.checked ? 1 : 1.5 }))} />cg_balanced</label>
              <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={metrics.has_thermal_protection} onChange={(event) => setMetrics((previous) => ({ ...previous, has_thermal_protection: event.target.checked }))} />has_thermal_protection</label>
            </div>
            <fieldset className="space-y-2 border-t-2 border-ink-black pt-3 font-mono text-xs">
              <legend className="font-bold">selected_instruments</legend>
              <p className="text-slate-600">Selection also updates instruments_mass_kg; the mass slider can override it.</p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {nasaCatalog.instruments.map((instrument) => (
                  <label key={instrument.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={metrics.selected_instruments.some(({ id }) => id === instrument.id)} onChange={(event) => setMetrics((previous) => { const selected = event.target.checked ? [...previous.selected_instruments, { id: instrument.id, name: instrument.name, mass_kg: instrument.mass_kg }] : previous.selected_instruments.filter(({ id }) => id !== instrument.id); return { ...previous, selected_instruments: selected, instruments_mass_kg: selected.reduce((total, item) => total + item.mass_kg, 0) }; })} />
                    <span>{instrument.name} · {instrument.mass_kg} kg</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="flash-panel space-y-3 p-4 sm:p-5">
            <h2 className="font-display text-lg font-bold">Callback Inspector</h2>
            <JsonInspector title="onLiveMutation(partialDelta)" value={lastLiveDelta} accent="text-role-spacecraft" />
            <JsonInspector title="onSubmitTake(finalPayload)" value={lastSubmitPayload} accent="text-status-ok" />
            <JsonInspector title="Simulated mutacion_en_vivo" value={simulatedEvent} accent="text-status-warn" />
          </section>
          <details className="flash-panel p-4 sm:p-5">
            <summary className="cursor-pointer font-display text-sm font-bold">Optional spectralChallenge JSON</summary>
            <label className="mt-3 block space-y-2 font-mono text-xs" htmlFor="spectral-json">
              <span>Passed directly to spectral minigames when valid.</span>
              <textarea id="spectral-json" value={spectralJson} onChange={(event) => setSpectralJson(event.target.value)} rows={5} spellCheck={false} className="w-full rounded-xl border-2 border-ink-black bg-space-ink p-2 text-paper-cream" placeholder='{"game_type":"bioespectro"}' />
              {spectralError && <span className="text-status-crit" role="alert">{spectralError}</span>}
            </label>
          </details>
        </aside>
      </div>
    </main>
  );
}

export default DevSandboxView;
