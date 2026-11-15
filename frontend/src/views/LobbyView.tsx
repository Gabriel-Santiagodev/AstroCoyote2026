// Owner: Leonardo (Task LEO-04) — Two-step briefing lobby: 1) pick your specialist, 2) pick the mission.
// Each step is its own screen. Mission cards carry their difficulty; nothing else sits below them.
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  Copy,
  Flame,
  MonitorSmartphone,
  Rocket,
  Smartphone,
  Tv,
  Wallet,
} from "lucide-react";
import nasaCatalog from "../data/nasa_catalog.json";
import {
  CrewmateAvatar,
  ROLE_CHARACTER_PROFILE,
} from "../components/paper/CrewmateAvatar";
import { MissionLoadingScreen } from "../components/paper/LoadingScreen";
import { soundEngine } from "../components/paper/SoundEngine";
import type { DifficultyType, MissionIdType, RoleType } from "../types/game";

export interface LobbyPlayer {
  player_id: string;
  player_name: string;
  role_id?: RoleType | null;
  is_host?: boolean;
}

export type ConsolePerspective = "auto" | "host" | "mobile";

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
  players?: LobbyPlayer[];
  takenRoles?: RoleType[];
  isHost?: boolean;
  playerName?: string;
  onBackToHome?: () => void;
  onChangePerspective?: (perspective: ConsolePerspective) => void;
}

type LobbyStep = "role" | "mission";

const ROLE_ORDER: RoleType[] = [
  "finance_launch",
  "spacecraft_mass",
  "orbit_power",
  "science_comms",
];

const MISSION_ORDER: MissionIdType[] = ["artemis_moon", "asteroid_hunter", "mars_sample_return"];

/** Visual difficulty language: one color + filled pips, so the level reads without words. */
const DIFFICULTY_STYLE: Record<DifficultyType, { label: string; pips: number; chip: string; ring: string }> = {
  easy: { label: "EASY", pips: 1, chip: "bg-status-ok", ring: "ring-status-ok" },
  medium: { label: "MEDIUM", pips: 2, chip: "bg-status-warn", ring: "ring-status-warn" },
  hard: { label: "HARD", pips: 3, chip: "bg-status-crit", ring: "ring-status-crit" },
};
const MAX_DIFFICULTY_PIPS = 3;

/** Flat Flash-style planet drawn per mission (no external art). */
const MISSION_PLANET: Record<MissionIdType, { body: string; spots: string; shape: string }> = {
  artemis_moon: { body: "#CBD5E1", spots: "#94A3B8", shape: "50%" },
  asteroid_hunter: { body: "#A8825A", spots: "#6B4F35", shape: "58% 42% 55% 45% / 48% 60% 40% 52%" },
  mars_sample_return: { body: "#E4572E", spots: "#9A3412", shape: "50%" },
};

function missionDifficulty(id: MissionIdType): DifficultyType {
  return nasaCatalog.missions[id].difficulty_default as DifficultyType;
}

function MissionPlanet({ id, size }: { id: MissionIdType; size: number }) {
  const planet = MISSION_PLANET[id];
  return (
    <div aria-hidden className="relative flex shrink-0 items-center justify-center" style={{ width: size * 1.5, height: size * 1.15 }}>
      <span className="hangar-glow absolute inset-0" />
      <span
        className="absolute rounded-[50%] border-2 border-dashed border-sky-glow/60"
        style={{ width: size * 1.45, height: size * 0.5, transform: "rotate(-14deg)" }}
      />
    <div
      className="relative shrink-0 border-3 border-ink-black shadow-paper-sm"
      style={{
        width: size,
        height: size,
        borderRadius: planet.shape,
        backgroundColor: planet.body,
        backgroundImage: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.45), rgba(255,255,255,0) 45%), radial-gradient(circle at 75% 80%, rgba(15,23,42,0.35), rgba(15,23,42,0) 55%)",
      }}
    >
      <span
        className="absolute rounded-full"
        style={{ width: size * 0.26, height: size * 0.22, left: "18%", top: "22%", backgroundColor: planet.spots }}
      />
      <span
        className="absolute rounded-full"
        style={{ width: size * 0.16, height: size * 0.16, right: "20%", top: "48%", backgroundColor: planet.spots }}
      />
      <span
        className="absolute rounded-full"
        style={{ width: size * 0.12, height: size * 0.1, left: "40%", bottom: "14%", backgroundColor: planet.spots }}
      />
    </div>
    </div>
  );
}

function DifficultyPips({ level }: { level: DifficultyType }) {
  const style = DIFFICULTY_STYLE[level];
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${style.label} difficulty`}>
      {Array.from({ length: MAX_DIFFICULTY_PIPS }, (_, i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rotate-45 border-2 ${i < style.pips ? `border-ink-black ${style.chip}` : "border-slate-500 bg-transparent"}`}
        />
      ))}
    </span>
  );
}

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
  players,
  takenRoles,
  isHost = true,
  playerName = "Commander",
  onBackToHome,
  onChangePerspective,
}: LobbyViewProps) {
  const [step, setStep] = useState<LobbyStep>("role");
  const [copiedPin, setCopiedPin] = useState(false);
  const [perspective, setPerspective] = useState<ConsolePerspective>("auto");
  const [isNarrowScreen, setIsNarrowScreen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [isLaunchingWave1, setIsLaunchingWave1] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsNarrowScreen(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobilePad =
    perspective === "mobile" ||
    (perspective === "auto" && (isNarrowScreen || (mode === "multi" && !isHost)));
  const canControlMission = mode === "single" || isHost;
  const isMulti = mode === "multi";

  // The mission card is the only difficulty control: keep the pair in sync.
  useEffect(() => {
    if (!canControlMission) return;
    const expected = missionDifficulty(selectedMission);
    if (difficulty !== expected) onChangeDifficulty(expected);
  }, [canControlMission, selectedMission, difficulty, onChangeDifficulty]);

  const handleCopyPin = () => {
    soundEngine.playClick();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(pin).catch(() => {});
    }
    setCopiedPin(true);
    window.setTimeout(() => setCopiedPin(false), 1800);
  };

  const occupantOf = (roleId: RoleType): LobbyPlayer | null => {
    if (players && players.length > 0) return players.find((p) => p.role_id === roleId) ?? null;
    if (roleId === selectedRole) {
      return { player_id: "local", player_name: playerName, role_id: selectedRole, is_host: true };
    }
    return null;
  };

  const isRoleTakenByOther = (roleId: RoleType) => {
    if (roleId === selectedRole) return false;
    if (players && players.some((p) => p.role_id === roleId)) return true;
    return Boolean(takenRoles && takenRoles.includes(roleId));
  };

  const goToStep = (next: LobbyStep) => {
    soundEngine.playClick();
    setStep(next);
  };

  const pickMission = (id: MissionIdType) => {
    if (!canControlMission) return;
    soundEngine.playClick();
    onChangeMission(id);
  };

  const triggerLaunch = () => {
    soundEngine.playComplete();
    setIsLaunchingWave1(true);
  };

  const humanCount = players && players.length > 0 ? players.length : 1;
  const aiSeats = Math.max(0, ROLE_ORDER.length - humanCount);

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-3 pb-6 pt-14 sm:px-5 sm:pt-16">
      {isLaunchingWave1 && (
        <MissionLoadingScreen
          variant="lobby_to_wave1"
          missionId={selectedMission}
          roleId={selectedRole}
          durationMs={850}
          isMobileClient={isMobilePad}
          allowSkip
          onComplete={() => {
            setIsLaunchingWave1(false);
            onLaunchMission();
          }}
        />
      )}

      {/* Header: back · step tracker · room PIN */}
      <header className="flash-panel flex flex-wrap items-center justify-between gap-3 overflow-hidden px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => (step === "mission" ? goToStep("role") : onBackToHome?.())}
            aria-label={step === "mission" ? "Back to role" : "Back to home"}
            className="paper-btn shrink-0 bg-space-ink p-2.5 text-paper-cream"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <ol className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase">
            {(["role", "mission"] as LobbyStep[]).map((s, i) => {
              const active = step === s;
              const done = s === "role" && step === "mission";
              return (
                <li key={s} className="flex items-center gap-1.5">
                  {i > 0 && <span className="h-0.5 w-4 bg-slate-500 sm:w-8" />}
                  <button
                    type="button"
                    onClick={() => goToStep(s)}
                    className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink-black px-2.5 py-1 ${
                      active
                        ? "bg-paper-cream text-ink-black"
                        : done
                        ? "bg-status-ok text-ink-black"
                        : "bg-space-ink text-slate-300"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
                    {s === "role" ? "Role" : "Mission"}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-xl border-2 border-ink-black bg-space-ink p-1 sm:inline-flex">
            {(["auto", "host", "mobile"] as ConsolePerspective[]).map((viewMode) => {
              const Icon = viewMode === "auto" ? MonitorSmartphone : viewMode === "host" ? Tv : Smartphone;
              return (
                <button
                  key={viewMode}
                  type="button"
                  title={viewMode === "auto" ? "Auto layout" : viewMode === "host" ? "Big screen" : "Phone"}
                  aria-label={viewMode === "auto" ? "Auto layout" : viewMode === "host" ? "Big screen layout" : "Phone layout"}
                  onClick={() => {
                    soundEngine.playClick();
                    setPerspective(viewMode);
                    onChangePerspective?.(viewMode);
                  }}
                  className={`rounded-lg p-1.5 transition-colors ${
                    perspective === viewMode ? "bg-role-spacecraft text-ink-black" : "text-slate-300 hover:text-paper-cream"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          {isMulti && (
            <button
              type="button"
              onClick={handleCopyPin}
              className="paper-btn inline-flex items-center gap-2 bg-paper-cream px-3 py-1.5 text-ink-black"
              aria-label={`Copy room PIN ${pin}`}
            >
              <span className="font-mono text-lg font-bold tracking-widest">{pin}</span>
              {copiedPin ? <Check className="h-4 w-4 text-status-ok" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === "role" ? (
          <motion.section
            key="role"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            <h2 className="text-center font-display text-2xl font-bold text-paper-cream sm:text-4xl">
              Pick your specialist
            </h2>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {ROLE_ORDER.map((roleId) => {
                const profile = ROLE_CHARACTER_PROFILE[roleId];
                const isSelected = selectedRole === roleId;
                const takenOther = isRoleTakenByOther(roleId);
                const occupant = occupantOf(roleId);
                return (
                  <motion.button
                    key={roleId}
                    type="button"
                    disabled={takenOther}
                    whileTap={takenOther ? undefined : { scale: 0.97 }}
                    onClick={() => {
                      soundEngine.playClick();
                      onChangeRole(roleId);
                    }}
                    className={`paper-btn relative flex flex-col items-center gap-2 px-2 pb-3 pt-4 text-center ${
                      isSelected ? "bg-paper-cream text-ink-black" : "bg-space-ink text-paper-cream"
                    } ${takenOther ? "opacity-60" : ""}`}
                    style={isSelected ? { boxShadow: `0 0 0 4px ${profile.suit}, 5px 5px 0 4px #0F172A` } : undefined}
                  >
                    <span className="relative flex items-center justify-center">
                      <span className="hangar-glow absolute -inset-4 rounded-full" />
                      <CrewmateAvatar
                        role={roleId}
                        state={isSelected ? "cheer" : "idle"}
                        actionEffect={isSelected ? "complete" : "none"}
                        size={isMobilePad ? 70 : 96}
                      />
                    </span>
                    <span
                      className="rounded-md border-2 border-ink-black px-2 py-0.5 font-mono text-[11px] font-bold text-ink-black"
                      style={{ backgroundColor: profile.suit }}
                    >
                      {profile.short}
                    </span>
                    <span className="font-display text-sm font-bold leading-tight sm:text-base">{profile.label}</span>
                    <span className="flex flex-wrap justify-center gap-1">
                      {profile.strengths.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                            isSelected ? "border-ink-black/40 text-slate-700" : "border-slate-600 text-slate-300"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                    {isMulti && (
                      <span
                        className={`mt-0.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                          isSelected
                            ? "bg-status-ok text-ink-black"
                            : occupant
                            ? "bg-status-warn text-ink-black"
                            : "bg-blueprint-navy text-slate-300"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-3 w-3" /> YOU
                          </>
                        ) : occupant ? (
                          occupant.player_name
                        ) : (
                          <>
                            <Bot className="h-3 w-3" /> AI
                          </>
                        )}
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute right-2 top-2 rounded-full border-2 border-ink-black bg-status-ok p-0.5">
                        <Check className="h-3 w-3 text-ink-black" />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {isMulti && (
              <p className="flex items-center justify-center gap-2 font-mono text-xs text-slate-300">
                <span className="font-bold text-paper-cream">{humanCount}/4 crew</span>
                {aiSeats > 0 && (
                  <span className="inline-flex items-center gap-1">
                    · <Bot className="h-3.5 w-3.5 text-role-spacecraft" /> {aiSeats} AI
                  </span>
                )}
              </p>
            )}

            <button
              type="button"
              onClick={() => goToStep("mission")}
              className="paper-btn mx-auto flex w-full max-w-md items-center justify-center gap-2 bg-status-ok py-3.5 text-lg text-ink-black"
            >
              Next: mission
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.section>
        ) : (
          <motion.section
            key="mission"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            <h2 className="text-center font-display text-2xl font-bold text-paper-cream sm:text-4xl">
              {canControlMission ? "Pick your mission" : "Host picks the mission"}
            </h2>

            <div className="grid gap-3 md:grid-cols-3">
              {MISSION_ORDER.map((id) => {
                const spec = nasaCatalog.missions[id];
                const level = missionDifficulty(id);
                const style = DIFFICULTY_STYLE[level];
                const active = selectedMission === id;
                const budgetM = Math.round(spec.budget_limit_usd / 1_000_000);
                return (
                  <motion.button
                    key={id}
                    type="button"
                    disabled={!canControlMission}
                    whileTap={canControlMission ? { scale: 0.97 } : undefined}
                    onClick={() => pickMission(id)}
                    className={`paper-btn relative flex items-center gap-3 p-3.5 text-left md:flex-col md:items-stretch md:gap-4 md:p-5 ${
                      active ? `bg-paper-cream text-ink-black ring-4 ${style.ring}` : "bg-space-ink text-paper-cream"
                    } ${!canControlMission && !active ? "opacity-55" : ""}`}
                  >
                    <div className="md:self-center">
                      <MissionPlanet id={id} size={isMobilePad ? 60 : 104} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5 md:space-y-2">
                      <div className="flex items-center gap-2 pr-6 md:justify-between md:pr-0">
                        <span
                          className={`rounded-md border-2 border-ink-black px-2 py-0.5 font-mono text-xs font-bold text-ink-black ${style.chip}`}
                        >
                          {style.label}
                        </span>
                        <DifficultyPips level={level} />
                      </div>
                      <div className="font-display text-base font-bold leading-tight sm:text-lg">{spec.name}</div>
                      <div
                        className={`flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] font-bold ${
                          active ? "text-slate-700" : "text-slate-300"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1" title="Budget">
                          <Wallet className="h-3.5 w-3.5" />${budgetM}M
                        </span>
                        {spec.requires_thermal_protection && (
                          <span className="inline-flex items-center gap-1" title="Needs a heat shield">
                            <Flame className="h-3.5 w-3.5" />
                            Heat shield
                          </span>
                        )}
                      </div>
                    </div>
                    {active && (
                      <span className="absolute right-2 top-2 rounded-full border-2 border-ink-black bg-status-ok p-0.5 md:right-3 md:top-3">
                        <Check className="h-3.5 w-3.5 text-ink-black" />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {canControlMission ? (
              <button
                type="button"
                onClick={triggerLaunch}
                className="paper-btn mx-auto flex w-full max-w-md items-center justify-center gap-2 bg-status-ok py-4 text-xl text-ink-black"
              >
                <Rocket className="h-6 w-6" />
                Launch
              </button>
            ) : (
              <div className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl border-3 border-ink-black bg-blueprint-navy py-3.5 font-mono text-sm font-bold text-status-ok">
                <motion.span
                  className="h-2.5 w-2.5 rounded-full bg-status-ok"
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                Waiting for host…
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

export default LobbyView;
