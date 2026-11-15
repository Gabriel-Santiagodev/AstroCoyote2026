// Owner: Leonardo (Task LEO-04) — Among Us / Kahoot style PIN room, live crew roster & 3 NASA missions
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  Check,
  Copy,
  Flame,
  Rocket,
  Scale,
  Shield,
  UserCheck,
} from "lucide-react";
import nasaCatalog from "../data/nasa_catalog.json";
import { CrewmateAvatar, ROLE_PALETTE } from "../components/paper/CrewmateAvatar";
import type { DifficultyType, MissionIdType, RoleType } from "../types/game";

export interface LobbyPlayer {
  player_id: string;
  player_name: string;
  role_id?: RoleType | null;
  is_host?: boolean;
}

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
}

const ROLE_CARDS: Array<{
  id: RoleType;
  title: string;
  station1: string;
  station2: string;
}> = [
  {
    id: "finance_launch",
    title: "Rol 1 · Finance & Launch",
    station1: "1A: Budget & UFE Vault",
    station2: "1B: Launcher & Fairing",
  },
  {
    id: "spacecraft_mass",
    title: "Rol 2 · Spacecraft & Mass",
    station1: "2A: Topological Assembly",
    station2: "2B: 2D CG Balance",
  },
  {
    id: "orbit_power",
    title: "Rol 3 · Orbit & Power",
    station1: "3A: Orbital Sniper",
    station2: "3B: AstroLogistics 3D",
  },
  {
    id: "science_comms",
    title: "Rol 4 · Science & Comms",
    station1: "4A: Payload & Spectral Lab",
    station2: "4B: DSN & DTMF Link",
  },
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
}: LobbyViewProps) {
  const [copiedPin, setCopiedPin] = useState(false);

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

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:py-8">
      {/* Top Room Header + Big PIN */}
      <div className="paper-card flex flex-wrap items-center justify-between gap-4">
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
            <div className="flex items-center gap-2">
              <span className="paper-badge bg-role-spacecraft px-2 py-0.5 text-[10px] text-ink-black">
                {mode === "single" ? "SINGLEPLAYER" : "MULTIPLAYER ROOM"}
              </span>
              {mode === "multi" && (
                <span className="font-mono text-xs text-slate-300">
                  {players?.length ?? 1}/4 CREW CONNECTED
                </span>
              )}
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              MISSION BRIEFING LOBBY
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border-3 border-ink-black bg-paper-cream px-4 py-2 text-ink-black shadow-paper-sm">
            <div className="font-mono text-[10px] font-bold uppercase text-slate-500">
              ROOM PIN
            </div>
            <div className="font-mono text-xl font-bold tracking-widest">
              {pin}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyPin}
            className="paper-btn inline-flex items-center gap-1.5 bg-role-finance px-3.5 py-3 text-xs text-ink-black"
          >
            {copiedPin ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedPin ? "COPIED" : "COPY"}
          </button>
        </div>
      </div>

      {/* Live Crew Roster (Among Us Waiting Room Slots) */}
      <section className="paper-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold uppercase tracking-wide text-slate-200">
            Crew Lineup (Unclaimed Roles Auto-Pilot via Constraint AI)
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ROLE_CARDS.map((card) => {
            const occupant = getSlotOccupant(card.id);
            const isMine = card.id === selectedRole;
            const palette = ROLE_PALETTE[card.id];
            return (
              <motion.div
                key={card.id}
                layout
                className={`flex flex-col items-center rounded-xl border-2 border-ink-black p-3 text-center ${
                  occupant
                    ? "bg-space-ink shadow-paper-sm"
                    : "border-dashed bg-space-ink/50 opacity-85"
                }`}
              >
                <CrewmateAvatar
                  role={card.id}
                  state={isMine ? "cheer" : occupant ? "idle" : "work"}
                  size={54}
                />
                <div
                  className="mt-1.5 font-mono text-[10px] font-bold uppercase"
                  style={{ color: palette.suit }}
                >
                  {palette.label}
                </div>
                {occupant ? (
                  <span className="mt-1 inline-flex items-center gap-1 rounded bg-paper-cream px-2 py-0.5 font-mono text-[11px] font-bold text-ink-black">
                    <UserCheck className="h-3 w-3 text-status-ok" />
                    {isMine ? `${occupant.player_name} (YOU)` : occupant.player_name}
                  </span>
                ) : (
                  <span className="mt-1 inline-flex items-center gap-1 rounded border border-slate-600 bg-blueprint-navy px-2 py-0.5 font-mono text-[10px] text-slate-300">
                    <Bot className="h-3 w-3 text-role-spacecraft" />
                    AI Autopilot Ready
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
        {players && players.some((p) => !p.role_id) && (
          <div className="rounded-xl border-2 border-ink-black bg-space-ink/80 px-3 py-2 font-mono text-xs text-slate-300">
            <span className="font-bold text-status-warn">Picking role: </span>
            {players
              .filter((p) => !p.role_id)
              .map((p) => p.player_name)
              .join(", ")}
          </div>
        )}
      </section>

      {/* 1. Role Picker */}
      <section className="paper-card space-y-3">
        <h3 className="font-display text-lg font-bold">1. Claim Your Engineering Role</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLE_CARDS.map((role) => {
            const palette = ROLE_PALETTE[role.id];
            const isSelected = selectedRole === role.id;
            const takenOther = isRoleTakenByOther(role.id);
            const taker = players?.find((p) => p.role_id === role.id)?.player_name;

            return (
              <button
                key={role.id}
                type="button"
                disabled={takenOther}
                onClick={() => onChangeRole(role.id)}
                className={`paper-btn flex items-center justify-between gap-3 px-4 py-3 text-left ${
                  isSelected
                    ? "bg-paper-cream text-ink-black"
                    : "bg-space-ink text-paper-cream"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full border-2 border-ink-black"
                      style={{ backgroundColor: palette.suit }}
                    />
                    <span className="font-display text-base font-bold">
                      {role.title}
                    </span>
                  </div>
                  <div
                    className={`font-mono text-[11px] ${
                      isSelected ? "text-slate-700" : "text-slate-300"
                    }`}
                  >
                    {role.station1} · {role.station2}
                  </div>
                  {takenOther && (
                    <div className="font-mono text-[11px] font-bold text-status-warn">
                      Claimed by {taker || "Teammate"}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <span className="paper-badge bg-status-ok px-2 py-0.5 text-[10px] text-ink-black">
                    SELECTED
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. NASA Mission & Difficulty Picker */}
      <section className="paper-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold">
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

        {/* Selected Mission NASA Briefing Fact */}
        <div className="rounded-xl border-2 border-ink-black bg-space-ink/90 p-3 font-mono text-xs text-slate-200">
          <span className="font-bold text-role-finance">NASA MISSION FACT: </span>
          {activeMission.nasa_real_world_fact}
        </div>

        {/* Difficulty Selector */}
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
        onClick={onLaunchMission}
        className="paper-btn flex w-full items-center justify-center gap-2 bg-status-ok py-4 text-xl text-ink-black"
      >
        <Rocket className="h-6 w-6" />
        {canControlMission
          ? "LAUNCH MISSION SEQUENCE"
          : "WAITING FOR HOST TO LAUNCH..."}
      </button>
    </main>
  );
}

export default LobbyView;
