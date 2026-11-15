// Owner: Leonardo (Task LEO-03) — Common 30s minigame wrapper with live mutation toast & fallback
import type { ReactNode } from "react";
import type { RoleType } from "../types/game";

interface MinigameShellProps {
  roleId: RoleType;
  wave: 1 | 2;
  timeLeftSec: number;
  isLocked: boolean;
  toastAlert?: string | null;
  children: ReactNode;
}

export function MinigameShell({
  roleId,
  wave,
  timeLeftSec,
  isLocked,
  toastAlert,
  children,
}: MinigameShellProps) {
  return (
    <section className="paper-card space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink-black pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg border-2 border-ink-black bg-paper-cream px-2.5 py-1 font-mono text-xs font-bold uppercase text-ink-black">
            STATION {wave} · {roleId}
          </span>
          {isLocked && (
            <span className="rounded-lg border-2 border-ink-black bg-status-ok px-2.5 py-1 font-mono text-xs font-bold text-ink-black">
              LOCKED
            </span>
          )}
        </div>
        <div
          className={`rounded-xl border-2 border-ink-black px-3 py-1 font-mono text-lg font-bold tabular-nums ${
            timeLeftSec <= 5
              ? "bg-status-crit text-ink-black"
              : "bg-space-ink text-paper-cream"
          }`}
        >
          {Math.max(0, Math.ceil(timeLeftSec))}s
        </div>
      </header>

      {toastAlert && (
        <div className="rounded-xl border-2 border-ink-black bg-status-warn px-3 py-2 font-mono text-xs font-bold text-ink-black">
          LIVE MUTATION: {toastAlert}
        </div>
      )}

      <div>{children}</div>
    </section>
  );
}

export default MinigameShell;
