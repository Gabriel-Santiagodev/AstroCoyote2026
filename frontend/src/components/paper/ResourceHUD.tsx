// Owner: Leonardo (Task LEO-05) — Shared live telemetry HUD connected to mutacion_en_vivo
import {
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  Coins,
  Radio,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Weight,
  XOctagon,
} from "lucide-react";
import nasaCatalog from "../../data/nasa_catalog.json";
import type { LiveMetrics, MissionIdType } from "../../types/game";

interface ResourceHUDProps {
  liveMetrics: LiveMetrics;
  maxMassKg?: number;
  missionBudgetUsd?: number;
  missionId?: MissionIdType;
}

type StatusLevel = "OK" | "WARN" | "CRIT";

function StatusPill({ level }: { level: StatusLevel }) {
  if (level === "OK") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-ink-black bg-status-ok px-1.5 py-0.5 text-[10px] font-bold text-ink-black">
        <CheckCircle2 className="h-3 w-3" />
        OK
      </span>
    );
  }
  if (level === "WARN") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-ink-black bg-status-warn px-1.5 py-0.5 text-[10px] font-bold text-ink-black">
        <AlertTriangle className="h-3 w-3" />
        WARN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-ink-black bg-status-crit px-1.5 py-0.5 text-[10px] font-bold text-ink-black">
      <XOctagon className="h-3 w-3" />
      CRIT
    </span>
  );
}

function SegmentedBar({ pct, level }: { pct: number; level: StatusLevel }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const fillColor =
    level === "OK"
      ? "bg-status-ok"
      : level === "WARN"
      ? "bg-status-warn"
      : "bg-status-crit";

  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full border-2 border-ink-black bg-space-ink">
      <div
        className={`h-full transition-all duration-300 ${fillColor}`}
        style={{ width: `${clamped}%` }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 18%, #0F172A 18%, #0F172A 20%)",
        }}
      />
    </div>
  );
}

export function ResourceHUD({
  liveMetrics,
  maxMassKg,
  missionBudgetUsd,
  missionId = "artemis_moon",
}: ResourceHUDProps) {
  const missionSpec = nasaCatalog.missions[missionId];
  const falcon9MarsCap =
    nasaCatalog.launchers.find((l) => l.id === "falcon9_block5")?.max_mass_mars_kg ??
    4020;
  const maxPowerRefW =
    nasaCatalog.engines.find((e) => e.id === "hall_thruster")?.power_demand_w ??
    1200;
  const maxFsplRefDb =
    nasaCatalog.orbits.find((o) => o.id === "geo_35786")?.fspl_x_band_db ?? 202.9;
  const leoFsplRefDb =
    nasaCatalog.orbits.find((o) => o.id === "leo_350")?.fspl_s_band_db ??
    nasaCatalog.orbits[0]?.fspl_s_band_db ??
    161.6;

  const capMassKg = maxMassKg ?? falcon9MarsCap;
  const budgetCapUsd = missionBudgetUsd ?? missionSpec.budget_limit_usd;
  const recommendedUfe = missionSpec.recommended_ufe_pct ?? 25;

  const massPct = (liveMetrics.estimated_wet_mass_kg / capMassKg) * 100;
  const massLevel: StatusLevel =
    massPct <= 85 ? "OK" : massPct <= 100 ? "WARN" : "CRIT";

  const budgetPct = (liveMetrics.remaining_budget_usd / budgetCapUsd) * 100;
  const budgetLevel: StatusLevel =
    budgetPct >= 20 ? "OK" : budgetPct > 0 ? "WARN" : "CRIT";
  const budgetM = (liveMetrics.remaining_budget_usd / 1_000_000).toFixed(1);

  const ufeLevel: StatusLevel =
    liveMetrics.ufe_reserve_pct >= recommendedUfe
      ? "OK"
      : liveMetrics.ufe_reserve_pct >= 15
      ? "WARN"
      : "CRIT";

  const cgLevel: StatusLevel =
    liveMetrics.cg_balanced &&
    (!missionSpec.requires_thermal_protection || liveMetrics.has_thermal_protection)
      ? "OK"
      : liveMetrics.cg_balanced || liveMetrics.has_thermal_protection
      ? "WARN"
      : "CRIT";

  const powerPct = (liveMetrics.available_power_w / maxPowerRefW) * 100;
  const powerLevel: StatusLevel =
    liveMetrics.available_power_w >= 450
      ? "OK"
      : liveMetrics.available_power_w >= 200
      ? "WARN"
      : "CRIT";

  const fsplSpan = Math.max(1, maxFsplRefDb - leoFsplRefDb);
  const fsplPct = ((liveMetrics.fspl_loss_db - leoFsplRefDb) / fsplSpan) * 100;
  const fsplLevel: StatusLevel =
    liveMetrics.fspl_loss_db <= 178
      ? "OK"
      : liveMetrics.fspl_loss_db <= 192
      ? "WARN"
      : "CRIT";

  return (
    <section
      aria-label="Mission Resource HUD"
      className="paper-card grid grid-cols-2 gap-3 px-4 py-3 font-mono text-xs tabular-nums sm:grid-cols-3 lg:grid-cols-6"
    >
      {/* 1. Wet Mass vs Reference Cap */}
      <div className="space-y-1.5 rounded-xl border-2 border-ink-black bg-space-ink/80 p-2.5">
        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-300">
          <span className="inline-flex items-center gap-1 font-bold">
            <Weight className="h-3.5 w-3.5 text-role-spacecraft" />
            MASS
          </span>
          <StatusPill level={massLevel} />
        </div>
        <div className="text-sm font-bold text-paper-cream">
          {liveMetrics.estimated_wet_mass_kg.toFixed(0)}
          <span className="text-[11px] font-normal text-slate-400">
            /{capMassKg}kg
          </span>
        </div>
        <SegmentedBar pct={massPct} level={massLevel} />
      </div>

      {/* 2. Remaining Budget */}
      <div className="space-y-1.5 rounded-xl border-2 border-ink-black bg-space-ink/80 p-2.5">
        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-300">
          <span className="inline-flex items-center gap-1 font-bold">
            <Coins className="h-3.5 w-3.5 text-role-finance" />
            BUDGET
          </span>
          <StatusPill level={budgetLevel} />
        </div>
        <div className="text-sm font-bold text-role-finance">
          ${budgetM}M
          <span className="text-[11px] font-normal text-slate-400">
            /{(budgetCapUsd / 1_000_000).toFixed(0)}M
          </span>
        </div>
        <SegmentedBar pct={budgetPct} level={budgetLevel} />
      </div>

      {/* 3. UFE Reserve & R&D Factor F */}
      <div className="space-y-1.5 rounded-xl border-2 border-ink-black bg-space-ink/80 p-2.5">
        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-300">
          <span className="font-bold">UFE VAULT</span>
          <StatusPill level={ufeLevel} />
        </div>
        <div className="text-sm font-bold text-paper-cream">
          {liveMetrics.ufe_reserve_pct.toFixed(0)}%
          <span className="ml-1.5 text-[11px] font-normal text-role-orbit">
            F={liveMetrics.funding_factor_F.toFixed(2)}
          </span>
        </div>
        <SegmentedBar pct={liveMetrics.ufe_reserve_pct * 2} level={ufeLevel} />
      </div>

      {/* 4. CG Balance & Thermal Shield */}
      <div className="space-y-1.5 rounded-xl border-2 border-ink-black bg-space-ink/80 p-2.5">
        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-300">
          <span className="inline-flex items-center gap-1 font-bold">
            <Scale className="h-3.5 w-3.5 text-role-spacecraft" />
            CG / TPS
          </span>
          <StatusPill level={cgLevel} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <span
            className={
              liveMetrics.cg_balanced ? "text-status-ok" : "text-status-crit"
            }
          >
            {liveMetrics.cg_balanced
              ? `CG ${liveMetrics.fuel_burn_multiplier.toFixed(1)}x`
              : `DRIFT ${liveMetrics.fuel_burn_multiplier.toFixed(1)}x`}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-200">
            {liveMetrics.has_thermal_protection ? (
              <ShieldCheck className="h-3.5 w-3.5 text-status-ok" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-status-crit" />
            )}
            {liveMetrics.has_thermal_protection ? "TPS" : "NO TPS"}
          </span>
        </div>
        <div className="text-[10px] text-slate-400">
          Δv {liveMetrics.required_dv_ms.toFixed(0)} m/s · Payload{" "}
          {liveMetrics.instruments_mass_kg.toFixed(0)} kg
        </div>
      </div>

      {/* 5. Available Power Bus */}
      <div className="space-y-1.5 rounded-xl border-2 border-ink-black bg-space-ink/80 p-2.5">
        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-300">
          <span className="inline-flex items-center gap-1 font-bold">
            <BatteryCharging className="h-3.5 w-3.5 text-role-orbit" />
            POWER
          </span>
          <StatusPill level={powerLevel} />
        </div>
        <div className="text-sm font-bold text-role-orbit">
          {liveMetrics.available_power_w.toFixed(0)} W
        </div>
        <SegmentedBar pct={powerPct} level={powerLevel} />
      </div>

      {/* 6. DSN FSPL Path Loss */}
      <div className="space-y-1.5 rounded-xl border-2 border-ink-black bg-space-ink/80 p-2.5">
        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-300">
          <span className="inline-flex items-center gap-1 font-bold">
            <Radio className="h-3.5 w-3.5 text-role-science" />
            DSN FSPL
          </span>
          <StatusPill level={fsplLevel} />
        </div>
        <div className="text-sm font-bold text-role-science">
          {liveMetrics.fspl_loss_db.toFixed(1)} dB
        </div>
        <SegmentedBar pct={fsplPct} level={fsplLevel} />
      </div>
    </section>
  );
}

export default ResourceHUD;
