// Owner: Leonardo (Task LEO-04) — Among Us / Kahoot style PIN room, role picker & 3 NASA missions
import type { DifficultyType, MissionIdType, RoleType } from "../types/game";

interface LobbyViewProps {
  pin: string;
  mode: "single" | "multi";
  selectedRole: RoleType;
  selectedMission: MissionIdType;
  difficulty: DifficultyType;
  onChangeRole: (role: RoleType) => void;
  onChangeMission: (mission: MissionIdType) => void;
  onChangeDifficulty: (diff: DifficultyType) => void;
  onLaunchMission: () => void;
}

const ROLES: Array<{ id: RoleType; label: string }> = [
  { id: "finance_launch", label: "Rol 1 · Finance & Launch" },
  { id: "spacecraft_mass", label: "Rol 2 · Spacecraft & Mass" },
  { id: "orbit_power", label: "Rol 3 · Orbit & Power" },
  { id: "science_comms", label: "Rol 4 · Science & Comms" },
];

const MISSIONS: Array<{ id: MissionIdType; label: string; tag: string }> = [
  { id: "artemis_moon", label: "Artemis Moon", tag: "EASY" },
  { id: "asteroid_hunter", label: "Asteroid Hunter", tag: "MEDIUM" },
  { id: "mars_sample_return", label: "Mars Sample Return (MRO)", tag: "HARD" },
];

export function LobbyView({
  pin,
  mode,
  selectedRole,
  selectedMission,
  difficulty,
  onChangeRole,
  onChangeMission,
  onChangeDifficulty,
  onLaunchMission,
}: LobbyViewProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="paper-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-slate-400">
            MODE: {mode.toUpperCase()}
          </p>
          <h2 className="font-display text-2xl font-bold">MISSION LOBBY</h2>
        </div>
        <div className="rounded-xl border-2 border-ink-black bg-paper-cream px-4 py-2 font-mono text-lg font-bold text-ink-black">
          PIN: {pin}
        </div>
      </div>

      <section className="paper-card space-y-3">
        <h3 className="font-display text-lg font-bold">1. Select Your Role</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => onChangeRole(role.id)}
              className={`paper-btn px-4 py-3 text-left ${
                selectedRole === role.id
                  ? "bg-role-spacecraft text-ink-black"
                  : "bg-space-ink text-paper-cream"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </section>

      <section className="paper-card space-y-3">
        <h3 className="font-display text-lg font-bold">2. Select NASA Mission & Difficulty</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {MISSIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChangeMission(m.id)}
              className={`paper-btn px-4 py-3 text-left ${
                selectedMission === m.id
                  ? "bg-role-finance text-ink-black"
                  : "bg-space-ink text-paper-cream"
              }`}
            >
              <div className="text-sm font-bold">{m.label}</div>
              <div className="font-mono text-xs opacity-75">{m.tag}</div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {(["easy", "medium", "hard"] as DifficultyType[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChangeDifficulty(d)}
              className={`paper-btn px-3 py-1.5 font-mono text-xs uppercase ${
                difficulty === d
                  ? "bg-paper-cream text-ink-black"
                  : "bg-space-ink text-slate-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={onLaunchMission}
        className="paper-btn w-full bg-status-ok py-4 text-xl text-ink-black"
      >
        LAUNCH MISSION SEQUENCE
      </button>
    </main>
  );
}

export default LobbyView;
