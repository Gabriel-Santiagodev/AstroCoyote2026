// Owner: Leonardo (Task LEO-04) — 2D Flash-Game Briefing Lobby: Host Main Stage vs Phone Crew Handheld Pad
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  Check,
  Copy,
  Cpu,
  Flame,
  Rocket,
  Scale,
  Shield,
  Smartphone,
  Tv,
  UserCheck,
} from "lucide-react";
import nasaCatalog from "../data/nasa_catalog.json";
import {
  CrewmateAvatar,
  ROLE_CHARACTER_PROFILE,
} from "../components/paper/CrewmateAvatar";
import { MissionLoadingScreen } from "../components/paper/LoadingScreen";
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

const ROLE_ORDER: RoleType[] = [
  "finance_launch",
  "spacecraft_mass",
  "orbit_power",
  "science_comms",
];

const MISSION_ORDER: Array<{ id: MissionIdType; badge: string; accent: string }> = [
  { id: "artemis_moon", badge: "EASY", accent: "bg-status-ok" },
  { id: "asteroid_hunter", badge: "MEDIUM", accent: "bg-status-warn" },
  { id: "mars_sample_return", badge: "HARD", accent: "bg-status-crit" },
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
  players,
  takenRoles,
  isHost = true,
  playerName = "Commander",
  onBackToHome,
  onChangePerspective,
}: LobbyViewProps) {
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

  const handleCopyPin = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(pin).catch(() => {});
    }
    setCopiedPin(true);
    window.setTimeout(() => setCopiedPin(false), 1800);
  };

  const getSlotOccupant = (roleId: RoleType) => {
    if (players && players.length > 0) {
      return players.find((p) => p.role_id === roleId) ?? null;
    }
    if (roleId === selectedRole) {
      return {
        player_id: "local",
        player_name: playerName,
        role_id: selectedRole,
        is_host: true,
      };
    }
    return null;
  };

  const isRoleTakenByOther = (roleId: RoleType) => {
    if (roleId === selectedRole) return false;
    if (players && players.some((p) => p.role_id === roleId)) return true;
    return Boolean(takenRoles && takenRoles.includes(roleId));
  };

  const canControlMission = mode === "single" || isHost;
  const activeMission = nasaCatalog.missions[selectedMission];
  const myProfile = ROLE_CHARACTER_PROFILE[selectedRole];

  const triggerLaunch = () => {
    setIsLaunchingWave1(true);
  };

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-3 py-5 sm:px-5 sm:py-7">
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

      {/* Top Hangar Room Header + PIN + Screen Mode Switcher */}
      <div className="flash-panel overflow-hidden p-4 sm:p-5">
        <div className="hazard-stripe-bar -mx-4 -mt-4 mb-4 h-2.5 border-b-2 border-ink-black sm:-mx-5 sm:-mt-5" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                aria-label="Back to Home Menu"
                className="paper-btn bg-space-ink p-2.5 text-paper-cream"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="paper-badge bg-role-spacecraft px-2 py-0.5 text-[10px] text-ink-black">
                  {mode === "single" ? "SINGLEPLAYER" : "MULTIPLAYER ROOM"}
                </span>
                <span className="paper-badge bg-space-ink px-2 py-0.5 text-[10px] text-paper-cream">
                  {isMobilePad ? (
                    <>
                      <Smartphone className="h-3 w-3 text-role-spacecraft" />
                      PHONE HANDHELD CONSOLE
                    </>
                  ) : (
                    <>
                      <Tv className="h-3 w-3 text-status-ok" />
                      HOST MAIN STAGE
                    </>
                  )}
                </span>
                {mode === "multi" && (
                  <span className="font-mono text-xs text-slate-300">
                    {players?.length ?? 1}/4 CREW CONNECTED
                  </span>
                )}
              </div>
              <h2 className="mt-1 font-display text-xl font-bold sm:text-3xl">
                {isMobilePad ? "CREW HANDHELD TERMINAL" : "MISSION BRIEFING HANGAR"}
              </h2>
            </div>
          </div>

          {/* Room PIN & Perspective Preview Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden items-center rounded-xl border-2 border-ink-black bg-space-ink p-1 font-mono text-[10px] sm:inline-flex">
              {(["auto", "host", "mobile"] as ConsolePerspective[]).map((viewMode) => (
                <button
                  key={viewMode}
                  type="button"
                  onClick={() => {
                    setPerspective(viewMode);
                    onChangePerspective?.(viewMode);
                  }}
                  className={`rounded-lg px-2 py-1 font-bold uppercase transition-colors ${
                    perspective === viewMode
                      ? "bg-role-spacecraft text-ink-black"
                      : "text-slate-300 hover:text-paper-cream"
                  }`}
                >
                  {viewMode === "auto"
                    ? "AUTO"
                    : viewMode === "host"
                    ? "STAGE"
                    : "PHONE PAD"}
                </button>
              ))}
            </div>

            <div className="rounded-xl border-3 border-ink-black bg-paper-cream px-3.5 py-1.5 text-ink-black shadow-paper-sm">
              <div className="font-mono text-[9px] font-bold uppercase text-slate-500">
                ROOM PIN
              </div>
              <div className="font-mono text-lg font-bold tracking-widest sm:text-xl">
                {pin}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyPin}
              className="paper-btn inline-flex items-center gap-1.5 bg-role-finance px-3 py-2.5 text-xs text-ink-black"
            >
              {copiedPin ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedPin ? "COPIED" : "COPY"}
            </button>
          </div>
        </div>
      </div>

      {isMobilePad ? (
        /* =================================================================
           MOBILE CREW HANDHELD CONSOLE (Personal Role Selector & Ready Card)
           ================================================================= */
        <div className="handheld-console-frame mx-auto max-w-xl space-y-4 p-4">
          <div className="flex items-center justify-between border-b-2 border-ink-black pb-2.5">
            <div>
              <div className="font-mono text-[10px] uppercase text-role-spacecraft">
                CREW OPERATOR
              </div>
              <div className="font-display text-lg font-bold text-paper-cream">
                {playerName} {isHost ? "(HOST)" : "(PHONE UNIT)"}
              </div>
            </div>
            <span
              className="paper-badge px-2.5 py-1 text-[10px] text-ink-black"
              style={{ backgroundColor: myProfile.suit }}
            >
              {myProfile.codename}
            </span>
          </div>

          {/* 4 Astro Squad Units Picker for Phone */}
          <div className="space-y-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Tap Your Astro Specialist
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {ROLE_ORDER.map((r) => {
                const profile = ROLE_CHARACTER_PROFILE[r];
                const isSelected = selectedRole === r;
                const takenOther = isRoleTakenByOther(r);
                const taker = players?.find((p) => p.role_id === r)?.player_name;

                return (
                  <button
                    key={r}
                    type="button"
                    disabled={takenOther}
                    onClick={() => onChangeRole(r)}
                    className={`paper-btn flex flex-col items-center gap-1 p-2.5 text-center ${
                      isSelected
                        ? "bg-paper-cream text-ink-black"
                        : "bg-space-ink text-paper-cream"
                    }`}
                  >
                    <CrewmateAvatar
                      role={r}
                      state={isSelected ? "cheer" : "idle"}
                      size={66}
                    />
                    <span className="font-mono text-[10px] font-bold uppercase">
                      {profile.codename}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        isSelected ? "text-slate-700" : "text-slate-300"
                      }`}
                    >
                      {profile.label}
                    </span>
                    {takenOther && (
                      <span className="rounded bg-status-warn px-1.5 py-0.5 font-mono text-[9px] font-bold text-ink-black">
                        TAKEN: {taker || "CREW"}
                      </span>
                    )}
                    {isSelected && (
                      <span className="rounded bg-status-ok px-1.5 py-0.5 font-mono text-[9px] font-bold text-ink-black">
                        LOCKED TO YOU
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personal Role Definition Briefing on Phone */}
          <div className="rounded-xl border-3 border-ink-black bg-space-ink p-3.5">
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-role-finance">
              <Cpu className="h-4 w-4" />
              YOUR CONSOLE BRIEFING · {myProfile.squadClass}
            </div>
            <p className="mt-1 text-xs text-slate-200">{myProfile.briefing}</p>
            <div className="mt-2.5 grid gap-1.5 font-mono text-[11px]">
              <div className="rounded-lg border border-slate-700 bg-blueprint-navy px-2.5 py-1.5">
                <span className="text-slate-400">GEAR: </span>
                <span className="font-bold text-paper-cream">{myProfile.gearLabel}</span>
              </div>
              <div className="rounded-lg border border-slate-700 bg-blueprint-navy px-2.5 py-1.5">
                <span className="text-slate-400">WAVE 1: </span>
                <span className="font-bold text-role-spacecraft">{myProfile.wave1Task}</span>
              </div>
              <div className="rounded-lg border border-slate-700 bg-blueprint-navy px-2.5 py-1.5">
                <span className="text-slate-400">WAVE 2: </span>
                <span className="font-bold text-role-orbit">{myProfile.wave2Task}</span>
              </div>
              <div className="rounded-lg border border-slate-700 bg-blueprint-navy px-2.5 py-1.5">
                <span className="text-slate-400">60S CRISIS: </span>
                <span className="font-bold text-role-finance">{myProfile.flightGate}</span>
              </div>
            </div>
          </div>

          {/* Mission Assigned by Host */}
          <div className="rounded-xl border-2 border-ink-black bg-space-ink/80 p-3 font-mono text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-300">HOST TARGET:</span>
              <span className="paper-badge bg-role-finance px-2 py-0.5 text-[10px] uppercase text-ink-black">
                {difficulty}
              </span>
            </div>
            <div className="mt-1 font-display text-base font-bold text-paper-cream">
              {activeMission.name}
            </div>
          </div>

          {canControlMission ? (
            <button
              type="button"
              onClick={triggerLaunch}
              className="paper-btn flex w-full items-center justify-center gap-2 bg-status-ok py-3.5 text-lg text-ink-black"
            >
              <Rocket className="h-5 w-5" />
              LAUNCH MISSION SEQUENCE
            </button>
          ) : (
            <div className="rounded-xl border-3 border-ink-black bg-blueprint-navy px-4 py-3 text-center font-mono text-xs font-bold text-status-ok">
              HANDHELD LINK READY — YOUR MINIGAMES &amp; DECISIONS APPEAR HERE WHEN HOST LAUNCHES!
            </div>
          )}
        </div>
      ) : (
        /* =================================================================
           HOST MAIN STAGE HANGAR (Big Screen 4-Bay Squad + Mission Control)
           ================================================================= */
        <>
          {/* Live Astro Squad Hangar Bays */}
          <section className="flash-panel space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold uppercase tracking-wide text-paper-cream">
                  Astro Squad Hangar Bays (Main Screen Overview)
                </h3>
                <p className="font-mono text-[11px] text-slate-300">
                  Teammates join via Room PIN <strong className="text-role-finance">{pin}</strong>{" "}
                  on their phones. Empty bays activate Constraint AI Autopilot automatically.
                </p>
              </div>
              <span className="paper-badge bg-space-ink px-2.5 py-1 text-[10px] text-role-spacecraft">
                2D FLASH SQUAD · READY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ROLE_ORDER.map((roleId) => {
                const profile = ROLE_CHARACTER_PROFILE[roleId];
                const occupant = getSlotOccupant(roleId);
                const isMine = roleId === selectedRole;
                return (
                  <motion.div
                    key={roleId}
                    layout
                    className={`flex flex-col items-center rounded-xl border-3 p-3 text-center ${
                      occupant
                        ? "border-ink-black bg-space-ink shadow-paper-sm"
                        : "border-dashed border-slate-600 bg-space-ink/55 opacity-90"
                    }`}
                  >
                    <span
                      className="mb-1 rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-ink-black"
                      style={{ backgroundColor: profile.suit }}
                    >
                      {profile.codename}
                    </span>
                    <CrewmateAvatar
                      role={roleId}
                      state={isMine ? "cheer" : occupant ? "idle" : "work"}
                      size={74}
                    />
                    <div className="mt-1 font-display text-xs font-bold text-paper-cream">
                      {profile.label}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      {profile.flightGate}
                    </div>
                    {occupant ? (
                      <span className="mt-2 inline-flex items-center gap-1 rounded bg-paper-cream px-2 py-0.5 font-mono text-[10px] font-bold text-ink-black">
                        <UserCheck className="h-3 w-3 text-status-ok" />
                        {isMine ? `${occupant.player_name} (YOU)` : occupant.player_name}
                      </span>
                    ) : (
                      <span className="mt-2 inline-flex items-center gap-1 rounded border border-slate-600 bg-blueprint-navy px-2 py-0.5 font-mono text-[10px] text-slate-300">
                        <Bot className="h-3 w-3 text-role-spacecraft" />
                        AI Autopilot Ready
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {players && players.some((p) => !p.role_id) && (
              <div className="rounded-xl border-2 border-ink-black bg-space-ink/85 px-3 py-2 font-mono text-xs text-slate-300">
                <span className="font-bold text-status-warn">Picking specialist on phone: </span>
                {players
                  .filter((p) => !p.role_id)
                  .map((p) => p.player_name)
                  .join(", ")}
              </div>
            )}
          </section>

          {/* 1. Claim Specialist Role + View Full Frontend Definition */}
          <section className="flash-panel space-y-3 p-4 sm:p-5">
            <h3 className="font-display text-lg font-bold text-paper-cream">
              1. Select Your Astro Squad Role &amp; Frontend Station Loadout
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {ROLE_ORDER.map((roleId) => {
                const profile = ROLE_CHARACTER_PROFILE[roleId];
                const isSelected = selectedRole === roleId;
                const takenOther = isRoleTakenByOther(roleId);
                const taker = players?.find((p) => p.role_id === roleId)?.player_name;

                return (
                  <button
                    key={roleId}
                    type="button"
                    disabled={takenOther}
                    onClick={() => onChangeRole(roleId)}
                    className={`paper-btn flex items-center justify-between gap-3 px-4 py-3 text-left ${
                      isSelected
                        ? "bg-paper-cream text-ink-black"
                        : "bg-space-ink text-paper-cream"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CrewmateAvatar
                        role={roleId}
                        state={isSelected ? "cheer" : "idle"}
                        size={54}
                      />
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className="rounded border border-ink-black px-1.5 py-0.5 font-mono text-[9px] font-bold text-ink-black"
                            style={{ backgroundColor: profile.suit }}
                          >
                            {profile.codename}
                          </span>
                          <span className="font-display text-sm font-bold sm:text-base">
                            {profile.label}
                          </span>
                        </div>
                        <div
                          className={`font-mono text-[10px] ${
                            isSelected ? "text-slate-700" : "text-slate-300"
                          }`}
                        >
                          {profile.wave1Task} · {profile.wave2Task}
                        </div>
                        <div
                          className={`text-[11px] ${
                            isSelected ? "text-slate-600" : "text-slate-400"
                          }`}
                        >
                          {profile.gearLabel}
                        </div>
                        {takenOther && (
                          <div className="font-mono text-[11px] font-bold text-status-warn">
                            Claimed on phone by {taker || "Teammate"}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="paper-badge shrink-0 bg-status-ok px-2 py-0.5 text-[10px] text-ink-black">
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. NASA Mission & Difficulty Picker */}
          <section className="flash-panel space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-paper-cream">
                2. Select NASA Mission &amp; Difficulty
              </h3>
              {!canControlMission && (
                <span className="paper-badge bg-status-warn px-2.5 py-1 text-[10px] text-ink-black">
                  HOST CONTROLS MISSION
                </span>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {MISSION_ORDER.map(({ id, badge, accent }) => {
                const spec = nasaCatalog.missions[id];
                const active = selectedMission === id;
                const budgetM = (spec.budget_limit_usd / 1_000_000).toFixed(0);
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={!canControlMission}
                    onClick={() => onChangeMission(id)}
                    className={`paper-btn flex flex-col justify-between gap-2 p-4 text-left ${
                      active
                        ? "bg-paper-cream text-ink-black"
                        : "bg-space-ink text-paper-cream"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`paper-badge px-2 py-0.5 text-[10px] text-ink-black ${accent}`}>
                          {badge}
                        </span>
                        <span className="font-mono text-xs font-bold">
                          ${budgetM}M
                        </span>
                      </div>
                      <div className="font-display text-base font-bold leading-tight">
                        {spec.name}
                      </div>
                    </div>

                    <div
                      className={`flex flex-wrap gap-2 border-t pt-2 font-mono text-[11px] ${
                        active
                          ? "border-ink-black/20 text-slate-700"
                          : "border-slate-700 text-slate-300"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Scale className="h-3 w-3" />
                        CG ±{spec.cg_tolerance_m}m
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        UFE ≥{spec.recommended_ufe_pct}%
                      </span>
                      {spec.requires_thermal_protection && (
                        <span className="inline-flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          TPS Req
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border-2 border-ink-black bg-space-ink/90 p-3 font-mono text-xs text-slate-200">
              <span className="font-bold text-role-finance">NASA MISSION FACT: </span>
              {activeMission.nasa_real_world_fact}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-xs font-bold uppercase text-slate-300">
                DIFFICULTY:
              </span>
              {(["easy", "medium", "hard"] as DifficultyType[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={!canControlMission}
                  onClick={() => onChangeDifficulty(d)}
                  className={`paper-btn px-4 py-1.5 font-mono text-xs uppercase ${
                    difficulty === d
                      ? "bg-role-finance text-ink-black"
                      : "bg-space-ink text-slate-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </section>

          {/* Launch Button */}
          <button
            type="button"
            disabled={!canControlMission}
            onClick={triggerLaunch}
            className="paper-btn flex w-full items-center justify-center gap-2 bg-status-ok py-4 text-xl text-ink-black"
          >
            <Rocket className="h-6 w-6" />
            {canControlMission
              ? "LAUNCH MISSION SEQUENCE (HOST + MOBILE TERMINALS)"
              : "WAITING FOR HOST TO LAUNCH..."}
          </button>
        </>
      )}
    </main>
  );
}

export default LobbyView;
