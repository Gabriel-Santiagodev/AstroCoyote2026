// Owner: Leonardo (Task LEO-06) — 60s Turn-Based Flight Scene (4 rounds x 15s)
import type { RoleType } from "../types/game";

export interface FlightQuestionOptionUI {
  option_id: string;
  label: string;
  engineering_tradeoff_hint: string;
}

export interface FlightQuestionUI {
  question_id: string;
  gate: "NODE_1_LAUNCH" | "NODE_2_PROPULSION" | "NODE_3_EVENT" | "NODE_4_DOWNLINK";
  assigned_role: RoleType;
  title: string;
  scenario_context: string;
  nasa_concept_badge: string;
  options: FlightQuestionOptionUI[];
}

interface Flight60sViewProps {
  round: number;
  timeLeftSec: number;
  myRole: RoleType;
  question: FlightQuestionUI | null;
  onAnswerOption: (questionId: string, optionId: string) => void;
}

export function Flight60sView({
  round,
  timeLeftSec,
  myRole,
  question,
  onAnswerOption,
}: Flight60sViewProps) {
  const isMyTurn = question ? question.assigned_role === myRole : true;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="paper-card flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-role-spacecraft">
            DEEP SPACE FLIGHT · ROUND {round}/4
          </p>
          <h2 className="font-display text-2xl font-bold">
            {question?.gate || "TRANSIT TELEMETRY"}
          </h2>
        </div>
        <div className="rounded-xl border-2 border-ink-black bg-paper-cream px-4 py-2 font-mono text-xl font-bold tabular-nums text-ink-black">
          {Math.max(0, Math.ceil(timeLeftSec))}s
        </div>
      </div>

      <section className="paper-card space-y-4">
        {question ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-lg border-2 border-ink-black bg-role-finance px-2.5 py-1 font-mono text-xs font-bold text-ink-black">
                {question.nasa_concept_badge}
              </span>
              <span className="font-mono text-xs font-bold text-status-ok">
                {isMyTurn ? "YOUR TURN!" : `TURN: ${question.assigned_role}`}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold">{question.title}</h3>
            <p className="text-sm text-slate-300">{question.scenario_context}</p>
            <div className="grid gap-3 pt-2">
              {question.options.map((opt) => (
                <button
                  key={opt.option_id}
                  type="button"
                  disabled={!isMyTurn}
                  onClick={() => onAnswerOption(question.question_id, opt.option_id)}
                  className="paper-btn bg-paper-cream p-3 text-left text-ink-black"
                >
                  <div className="font-bold">{opt.label}</div>
                  <div className="font-mono text-xs text-slate-600">
                    {opt.engineering_tradeoff_hint}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="font-mono text-sm text-slate-300">
            Waiting for telemetry event from Mission Control...
          </p>
        )}
      </section>
    </main>
  );
}

export default Flight60sView;
