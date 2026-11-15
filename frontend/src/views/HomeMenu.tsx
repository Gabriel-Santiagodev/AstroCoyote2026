// Owner: Leonardo (Task LEO-04) — Singleplayer / Multiplayer entry screen
import { CrewmateAvatar } from "../components/paper/CrewmateAvatar";

interface HomeMenuProps {
  onSelectMode: (mode: "single" | "multi") => void;
  onOpenSandbox: () => void;
}

export function HomeMenu({ onSelectMode, onOpenSandbox }: HomeMenuProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="flex items-center gap-3">
        <CrewmateAvatar role="finance_launch" state="cheer" size={58} />
        <CrewmateAvatar role="spacecraft_mass" state="idle" size={58} />
        <CrewmateAvatar role="orbit_power" state="walk" size={58} />
        <CrewmateAvatar role="science_comms" state="idle" size={58} />
      </div>

      <div className="paper-card w-full max-w-xl space-y-5 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-role-spacecraft">
          Space Apps Challenge 2026 · 5-Min Mission Simulator
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          MISSION CONTROL: PAPER ORBIT
        </h1>
        <p className="text-sm text-slate-300">
          Design a NASA-grounded space mission across 2 linear station waves, survive a 60s
          turn-based deep-space flight, and uncover real engineering trade-offs.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelectMode("single")}
            className="paper-btn bg-status-ok px-5 py-4 text-lg text-ink-black"
          >
            SINGLEPLAYER
          </button>
          <button
            type="button"
            onClick={() => onSelectMode("multi")}
            className="paper-btn bg-role-finance px-5 py-4 text-lg text-ink-black"
          >
            MULTIPLAYER (PIN)
          </button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenSandbox}
            className="font-mono text-xs text-slate-400 underline hover:text-paper-cream"
          >
            Open /dev-sandbox (Minigame Tester)
          </button>
        </div>
      </div>
    </main>
  );
}

export default HomeMenu;
