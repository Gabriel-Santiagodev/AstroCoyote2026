// Owner: Leonardo (Task LEO-07) — Always-present NASA causal feedback & score report
export interface MissionOutcomeUI {
  outcome: "FAILED" | "PARTIAL_SUCCESS" | "FULL_SUCCESS";
  completion_pct: number;
  total_score: number;
  failed_or_degraded_gate: string | null;
  causal_chain_explanation: string;
  nasa_real_world_fact: string;
}

interface MissionReportDashboardProps {
  report: MissionOutcomeUI;
  onRetry: () => void;
}

export function MissionReportDashboard({ report, onRetry }: MissionReportDashboardProps) {
  const bannerColor =
    report.outcome === "FULL_SUCCESS"
      ? "bg-status-ok text-ink-black"
      : report.outcome === "PARTIAL_SUCCESS"
      ? "bg-status-warn text-ink-black"
      : "bg-status-crit text-ink-black";

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className={`paper-card ${bannerColor}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase">
              GATE: {report.failed_or_degraded_gate || "ALL 4 NODES CLEARED"}
            </p>
            <h1 className="font-display text-3xl font-bold">{report.outcome}</h1>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs font-bold">MISSION SCORE</div>
            <div className="text-3xl font-bold tabular-nums">{report.total_score} / 1000</div>
          </div>
        </div>
      </div>

      <section className="paper-card space-y-2">
        <h2 className="font-display text-lg font-bold text-role-spacecraft">
          Causal Engineering Breakdown
        </h2>
        <p className="text-sm text-paper-cream">{report.causal_chain_explanation}</p>
      </section>

      <section className="paper-card space-y-2">
        <h2 className="font-display text-lg font-bold text-role-finance">
          Real NASA Mission Connection
        </h2>
        <p className="text-sm text-slate-200">{report.nasa_real_world_fact}</p>
      </section>

      <button
        type="button"
        onClick={onRetry}
        className="paper-btn w-full bg-paper-cream py-4 text-lg text-ink-black"
      >
        REDESIGN & RETRY
      </button>
    </main>
  );
}

export default MissionReportDashboard;
