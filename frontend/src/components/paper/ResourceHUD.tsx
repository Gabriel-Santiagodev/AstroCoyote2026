// Owner: Leonardo (Task LEO-05) — Shared live telemetry HUD connected to mutacion_en_vivo
import type { LiveMetrics } from "../../types/game";

interface ResourceHUDProps {
  liveMetrics: LiveMetrics;
}

export function ResourceHUD({ liveMetrics }: ResourceHUDProps) {
  const budgetM = (liveMetrics.remaining_budget_usd / 1_000_000).toFixed(1);
  return (
    <div className="paper-card grid grid-cols-2 gap-3 px-4 py-3 font-mono text-xs tabular-nums md:grid-cols-6">
      <div>
        <div className="text-slate-400">WET MASS</div>
        <div className="text-sm font-bold text-paper-cream">
          {liveMetrics.estimated_wet_mass_kg.toFixed(0)} kg
        </div>
      </div>
      <div>
        <div className="text-slate-400">BUDGET LEFT</div>
        <div className="text-sm font-bold text-role-finance">${budgetM}M</div>
      </div>
      <div>
        <div className="text-slate-400">UFE RESERVE</div>
        <div
          className={`text-sm font-bold ${
            liveMetrics.ufe_reserve_pct >= 25
              ? "text-status-ok"
              : liveMetrics.ufe_reserve_pct >= 15
              ? "text-status-warn"
              : "text-status-crit"
          }`}
        >
          {liveMetrics.ufe_reserve_pct.toFixed(0)}% (F={liveMetrics.funding_factor_F.toFixed(2)})
        </div>
      </div>
      <div>
        <div className="text-slate-400">CG STATUS</div>
        <div
          className={`text-sm font-bold ${
            liveMetrics.cg_balanced ? "text-status-ok" : "text-status-crit"
          }`}
        >
          {liveMetrics.cg_balanced ? "OK 1.0x" : "WARN 1.5x"}
        </div>
      </div>
      <div>
        <div className="text-slate-400">POWER BUS</div>
        <div className="text-sm font-bold text-role-orbit">
          {liveMetrics.available_power_w.toFixed(0)} W
        </div>
      </div>
      <div>
        <div className="text-slate-400">DSN FSPL</div>
        <div className="text-sm font-bold text-role-science">
          {liveMetrics.fspl_loss_db.toFixed(1)} dB
        </div>
      </div>
    </div>
  );
}

export default ResourceHUD;
