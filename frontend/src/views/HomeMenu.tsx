// Owner: Leonardo (Task LEO-04) — 2D Flash-Game Home Hangar, Astro Squad Showcase, Host Stage vs Mobile PIN Pad
import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Cpu,
  KeyRound,
  Rocket,
  Shield,
  Smartphone,
  Sparkles,
  Tv,
  Users,
  Wrench,
  X,
} from "lucide-react";
import {
  CrewmateAvatar,
  ROLE_CHARACTER_PROFILE,
} from "../components/paper/CrewmateAvatar";
import { MissionLoadingScreen } from "../components/paper/LoadingScreen";
import type { RoleType } from "../types/game";

interface HomeMenuProps {
  onSelectMode: (mode: "single" | "multi") => void;
  onOpenSandbox: () => void;
  onJoinWithPin?: (pin: string, playerName: string) => void;
  onCreateRoom?: (mode: "single" | "multi", hostName: string) => void;
  isConnecting?: boolean;
  connectionError?: string | null;
  connectionStatus?: "checking" | "online" | "offline";
}

const SQUAD_ROLES: RoleType[] = [
  "finance_launch",
  "spacecraft_mass",
  "orbit_power",
  "science_comms",
];

type PendingAction =
  | { type: "create"; mode: "single" | "multi" }
  | { type: "join"; pin: string }
  | null;

export function HomeMenu({
  onSelectMode,
  onOpenSandbox,
  onJoinWithPin,
  onCreateRoom,
  isConnecting = false,
  connectionError = null,
  connectionStatus,
}: HomeMenuProps) {
  const [callsign, setCallsign] = useState("Commander");
  const [previewRole, setPreviewRole] = useState<RoleType>("finance_launch");
  const [pinInput, setPinInput] = useState("");
  const [pinNotice, setPinNotice] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const safeName = callsign.trim() || "Commander";
  const selectedProfile = ROLE_CHARACTER_PROFILE[previewRole];

  // Clear local boot loader if a connection error comes back
  useEffect(() => {
    if (connectionError) {
      setPendingAction(null);
    }
  }, [connectionError]);

  const executePendingAction = (action: PendingAction) => {
    if (!action) return;
    if (action.type === "create") {
      if (onCreateRoom) {
        onCreateRoom(action.mode, safeName);
      } else {
        onSelectMode(action.mode);
      }
    } else if (action.type === "join") {
      if (onJoinWithPin) {
        onJoinWithPin(action.pin, safeName);
      } else {
        onSelectMode("multi");
      }
    }
    setPendingAction(null);
  };

  const handleModeStart = (mode: "single" | "multi") => {
    setPinNotice(null);
    setPendingAction({ type: "create", mode });
  };

  const handleJoinSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanedPin = pinInput.trim().toUpperCase();
    if (cleanedPin.length < 4) {
      setPinNotice("Enter a valid 4–8 character room PIN (e.g. MARS26).");
      return;
    }
    setPinNotice(null);
    setPendingAction({ type: "join", pin: cleanedPin });
  };

  const showBootLoader = Boolean(pendingAction) || isConnecting;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-5 px-3 py-6 sm:px-6 sm:py-8">
      {/* 2D Flash-Game Loading Overlay on Boot / Room Link */}
      {showBootLoader && (
        <MissionLoadingScreen
          variant="boot"
          roleId={previewRole}
          durationMs={750}
          isMobileClient={pendingAction?.type === "join"}
          progressPct={isConnecting && !pendingAction ? 72 : undefined}
          title={
            pendingAction?.type === "join"
              ? `LINKING HANDHELD TO ROOM ${pendingAction.pin}`
              : "BOOTING ASTRO SQUAD COMMAND"
          }
          subtitle={
            pendingAction?.type === "join"
              ? "Syncing your phone console with the Host Main Stage & subsystem controls..."
              : "Spinning up 2D Astro Squad hangar bays, NASA constraints, and Mission Control..."
          }
          allowSkip={Boolean(pendingAction) && !isConnecting}
          onComplete={() => {
            if (pendingAction) {
              executePendingAction(pendingAction);
            }
          }}
        />
      )}

      {/* Top Hero Header & 2D Astro Squad Hangar Lineup */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flash-panel w-full overflow-hidden p-4 sm:p-6"
      >
        {/* Top Arcade Hazard Stripe */}
        <div className="hazard-stripe-bar -mx-4 -mt-4 mb-4 h-3 border-b-3 border-ink-black sm:-mx-6 sm:-mt-6" />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="paper-badge bg-role-spacecraft px-2.5 py-1 text-[10px] uppercase tracking-widest text-ink-black">
              <Sparkles className="h-3.5 w-3.5" />
              Space Apps 2026 · 2D Tactical Space Sim
            </span>
            {connectionStatus && (
              <span
                className={`paper-badge px-2.5 py-1 text-[10px] uppercase text-ink-black ${
                  connectionStatus === "online"
                    ? "bg-status-ok"
                    : connectionStatus === "checking"
                    ? "bg-status-warn"
                    : "bg-slate-300"
                }`}
              >
                {connectionStatus === "online"
                  ? "BACKEND ONLINE"
                  : connectionStatus === "checking"
                  ? "LINK CHECK..."
                  : "PREVIEW MODE"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="paper-btn inline-flex items-center gap-1.5 bg-space-ink px-3 py-1.5 text-xs text-paper-cream"
            >
              <BookOpen className="h-3.5 w-3.5 text-role-spacecraft" />
              NASA Briefing
            </button>
            <button
              type="button"
              onClick={onOpenSandbox}
              className="paper-btn inline-flex items-center gap-1 bg-slate-800 px-3 py-1.5 font-mono text-[11px] text-slate-200"
            >
              <Wrench className="h-3.5 w-3.5 text-role-finance" />
              /dev-sandbox
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-paper-cream sm:text-5xl">
            MISSION CONTROL: ASTRO SQUAD
          </h1>
          <p className="mx-auto mt-1.5 max-w-2xl text-xs text-slate-300 sm:text-sm">
            Command the <strong className="text-paper-cream">Main Stage</strong> on PC/TV
            while teammates join via <strong className="text-role-spacecraft">Room PIN</strong>{" "}
            on their phones—playing parallel engineering minigames &amp; 15s crisis turns from
            each handheld console.
          </p>
        </div>

        {/* Interactive ASTRO SPRITES (IN-GAME MINI SQUAD) Roster */}
        <div className="mt-5 rounded-2xl border-3 border-ink-black bg-space-ink/90 p-3 sm:p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            <span>ASTRO SPRITES · CLICK A SPECIALIST TO INSPECT ROLE LOADOUT</span>
            <span className="text-role-finance">4 DETERMINISTIC ROLES</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {SQUAD_ROLES.map((r, idx) => {
              const profile = ROLE_CHARACTER_PROFILE[r];
              const isActive = previewRole === r;
              const defaultState =
                idx === 0 ? "cheer" : idx === 1 ? "work" : idx === 2 ? "idle" : "walk";

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setPreviewRole(r)}
                  className={`flex flex-col items-center rounded-xl border-3 p-2.5 text-center transition-all ${
                    isActive
                      ? "border-paper-cream bg-blueprint-navy shadow-paper"
                      : "border-ink-black bg-space-ink/70 hover:bg-blueprint-navy/60"
                  }`}
                >
                  <span
                    className="mb-1 font-mono text-[10px] font-bold tracking-wider"
                    style={{ color: profile.suit }}
                  >
                    {profile.codename}
                  </span>
                  <CrewmateAvatar
                    role={r}
                    state={isActive ? "cheer" : defaultState}
                    size={76}
                  />
                  <span className="mt-1 font-display text-xs font-bold text-paper-cream">
                    {profile.label}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {profile.short}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Frontend Role Definition Inspector Card */}
          <div className="mt-3 grid gap-2.5 rounded-xl border-2 border-ink-black bg-blueprint-navy/85 p-3 sm:grid-cols-12 sm:items-center">
            <div className="sm:col-span-5">
              <div className="flex items-center gap-2">
                <span
                  className="paper-badge px-2 py-0.5 text-[10px] text-ink-black"
                  style={{ backgroundColor: selectedProfile.suit }}
                >
                  {selectedProfile.codename}
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-300">
                  {selectedProfile.squadClass}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-200">
                {selectedProfile.briefing}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px] sm:col-span-7 sm:grid-cols-3">
              <div className="rounded-lg border-2 border-ink-black bg-space-ink px-2.5 py-2">
                <div className="text-[9px] text-slate-400">STATION 1 (30S)</div>
                <div className="font-bold text-role-spacecraft">
                  {selectedProfile.wave1Task}
                </div>
              </div>
              <div className="rounded-lg border-2 border-ink-black bg-space-ink px-2.5 py-2">
                <div className="text-[9px] text-slate-400">STATION 2 (30S)</div>
                <div className="font-bold text-role-orbit">
                  {selectedProfile.wave2Task}
                </div>
              </div>
              <div className="rounded-lg border-2 border-ink-black bg-space-ink px-2.5 py-2">
                <div className="text-[9px] text-slate-400">FLIGHT CRISIS</div>
                <div className="font-bold text-role-finance">
                  {selectedProfile.flightGate}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Dual Entry Console: Host Main Stage vs Phone Crew Handheld */}
      <div className="grid w-full gap-4 md:grid-cols-12">
        {/* Left: Callsign + Host Main Screen Actions */}
        <section className="flash-panel space-y-4 p-4 sm:p-5 md:col-span-7">
          <div className="flex items-center justify-between gap-2 border-b-2 border-ink-black pb-2.5">
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-status-ok" />
              <h2 className="font-display text-lg font-bold text-paper-cream">
                HOST MAIN STAGE (PC / PROJECTOR)
              </h2>
            </div>
            <span className="paper-badge bg-status-ok px-2 py-0.5 text-[10px] text-ink-black">
              STAGE + ROOM PIN
            </span>
          </div>

          <div className="rounded-xl border-2 border-ink-black bg-space-ink/85 p-3">
            <label
              htmlFor="engineer-callsign"
              className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300"
            >
              Engineer Callsign (Shown on Crew Roster)
            </label>
            <input
              id="engineer-callsign"
              type="text"
              maxLength={18}
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              placeholder="Commander"
              className="w-full rounded-lg border-2 border-ink-black bg-paper-cream px-3 py-2 font-mono text-sm font-bold text-ink-black focus:outline-none focus:ring-2 focus:ring-role-spacecraft"
            />
          </div>

          {connectionError && (
            <div
              role="alert"
              className="rounded-xl border-2 border-ink-black bg-status-crit px-4 py-2.5 font-mono text-xs font-bold text-ink-black"
            >
              LINK WARNING: {connectionError}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={showBootLoader}
              onClick={() => handleModeStart("single")}
              className="paper-btn flex flex-col items-start gap-1 bg-status-ok px-4 py-3.5 text-left text-ink-black"
            >
              <span className="inline-flex items-center gap-2 text-base font-bold sm:text-lg">
                <Rocket className="h-5 w-5" />
                SINGLEPLAYER
              </span>
              <span className="font-mono text-[11px] font-normal opacity-85">
                Command 1 Astro unit + 3 AI Autopilot bots
              </span>
            </button>

            <button
              type="button"
              disabled={showBootLoader}
              onClick={() => handleModeStart("multi")}
              className="paper-btn flex flex-col items-start gap-1 bg-role-finance px-4 py-3.5 text-left text-ink-black"
            >
              <span className="inline-flex items-center gap-2 text-base font-bold sm:text-lg">
                <Users className="h-5 w-5" />
                HOST MULTIPLAYER
              </span>
              <span className="font-mono text-[11px] font-normal opacity-85">
                Create Room PIN for 1–4 phones + big screen
              </span>
            </button>
          </div>
        </section>

        {/* Right: Handheld Phone Crew PIN Console */}
        <section className="handheld-console-frame flex flex-col justify-between space-y-4 p-4 sm:p-5 md:col-span-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 border-b-2 border-ink-black pb-2.5">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-role-spacecraft" />
                <h2 className="font-display text-lg font-bold text-paper-cream">
                  PHONE CREW CONSOLE
                </h2>
              </div>
              <span className="paper-badge bg-role-spacecraft px-2 py-0.5 text-[10px] text-ink-black">
                HANDHELD MODE
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              Joining a friend&apos;s room? Enter the <strong className="text-paper-cream">Room PIN</strong>{" "}
              displayed on the Host screen to play your role&apos;s minigames and 15s crisis
              decisions right on your mobile device.
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-3">
            <div className="rounded-xl border-2 border-ink-black bg-space-ink p-3">
              <label
                htmlFor="room-pin-input"
                className="mb-1 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-role-spacecraft"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Room PIN Code
              </label>
              <input
                id="room-pin-input"
                type="text"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                placeholder="E.G. MARS26"
                aria-label="Room PIN"
                className="w-full rounded-lg border-2 border-ink-black bg-paper-cream px-3 py-2.5 text-center font-mono text-lg font-bold uppercase tracking-[0.25em] text-ink-black focus:outline-none focus:ring-2 focus:ring-role-spacecraft"
              />
            </div>

            {pinNotice && (
              <p className="font-mono text-xs font-bold text-status-warn">
                {pinNotice}
              </p>
            )}

            <button
              type="submit"
              disabled={showBootLoader}
              className="paper-btn flex w-full items-center justify-center gap-2 bg-role-spacecraft px-5 py-3.5 text-base text-ink-black"
            >
              <Cpu className="h-5 w-5" />
              {showBootLoader ? "CONNECTING..." : "JOIN ROOM AS CREW"}
            </button>
          </form>

          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-space-ink/70 px-3 py-2 font-mono text-[10px] text-slate-300">
            <Shield className="h-3.5 w-3.5 shrink-0 text-status-ok" />
            <span>Zero copyright assets · Original Astro Squad 2D sprites</span>
          </div>
        </section>
      </div>

      {/* Quick Visual Modal: NASA Briefing */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-space-ink/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-modal-title"
          >
            <motion.div
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 12 }}
              className="flash-panel max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto p-6"
            >
              <div className="flex items-start justify-between gap-2 border-b-2 border-ink-black pb-3">
                <div>
                  <span className="paper-badge bg-role-finance px-2 py-0.5 text-[10px] text-ink-black">
                    BRIEFING · 5 MIN LOOP
                  </span>
                  <h2 id="guide-modal-title" className="mt-1 font-display text-2xl font-bold">
                    Host Main Stage + Phone Crew Architecture
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="Close guide"
                  className="paper-btn bg-paper-cream p-1.5 text-ink-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ol className="grid gap-3 text-sm sm:grid-cols-2">
                <li className="rounded-xl border-2 border-ink-black bg-space-ink p-3">
                  <div className="font-mono text-xs font-bold text-role-finance">
                    01 · LOBBY &amp; ASTRO SQUAD
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Host picks the NASA mission; each phone picks an Astro unit (`ENGINEER`,
                    `MEDIC`, `SOLDIER`, `DEFENDER`). Empty seats use AI Autopilot.
                  </p>
                </li>
                <li className="rounded-xl border-2 border-ink-black bg-space-ink p-3">
                  <div className="font-mono text-xs font-bold text-role-spacecraft">
                    02 · WAVE 1 &amp; 2 ON PHONES
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Main screen shows live telemetry &amp; squad movement; each phone runs
                    its dedicated 30s minigame and fires live mutations.
                  </p>
                </li>
                <li className="rounded-xl border-2 border-ink-black bg-space-ink p-3">
                  <div className="font-mono text-xs font-bold text-role-orbit">
                    03 · 60S TURN-BASED FLIGHT
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Survive 4 real-physics crisis gates (15s per turn): Launch,
                    Propulsion, Space Event, and Deep Space Network Downlink.
                  </p>
                </li>
                <li className="rounded-xl border-2 border-ink-black bg-space-ink p-3">
                  <div className="font-mono text-xs font-bold text-role-science">
                    04 · CAUSAL NASA REPORT
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Win or fail, review the physical chain reaction across all 4 gates and
                    compare your mission to NASA Artemis, OSIRIS-REx &amp; MRO.
                  </p>
                </li>
              </ol>

              <div className="rounded-xl border-2 border-ink-black bg-space-ink/80 p-3 font-mono text-[11px] text-slate-300">
                <span className="font-bold text-paper-cream">Verified Sources: </span>
                NIMA WGS84 orbital physics, SpaceX Rideshare v11 payload caps,
                NASA Artemis I, OSIRIS-REx &amp; Mars Reconnaissance Orbiter (JPL
                DESCANSO). Zero official NASA logos used.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default HomeMenu;
