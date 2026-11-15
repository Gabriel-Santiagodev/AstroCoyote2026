// Owner: Leonardo (Task LEO-04) — Singleplayer / Multiplayer entry, Join with PIN & How to Play modal
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  KeyRound,
  Rocket,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { CrewmateAvatar } from "../components/paper/CrewmateAvatar";

interface HomeMenuProps {
  onSelectMode: (mode: "single" | "multi") => void;
  onOpenSandbox: () => void;
  onJoinWithPin?: (pin: string, playerName: string) => void;
  onCreateRoom?: (mode: "single" | "multi", hostName: string) => void;
  isConnecting?: boolean;
  connectionError?: string | null;
  connectionStatus?: "checking" | "online" | "offline";
}

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
  const [showJoinPanel, setShowJoinPanel] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinNotice, setPinNotice] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const safeName = callsign.trim() || "Commander";

  const handleModeStart = (mode: "single" | "multi") => {
    if (onCreateRoom) {
      onCreateRoom(mode, safeName);
    } else {
      onSelectMode(mode);
    }
  };

  const handleJoinSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanedPin = pinInput.trim().toUpperCase();
    if (cleanedPin.length < 4) {
      setPinNotice("Enter a valid 4–6 character room PIN (e.g. MARS26).");
      return;
    }
    setPinNotice(null);
    if (onJoinWithPin) {
      onJoinWithPin(cleanedPin, safeName);
    } else {
      onSelectMode("multi");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-4 py-8">
      {/* Paper Mario x Among Us Floating Crew Lineup */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-wrap items-end justify-center gap-4 sm:gap-6"
      >
        <CrewmateAvatar role="finance_launch" state="cheer" size={64} showRoleTag />
        <CrewmateAvatar role="spacecraft_mass" state="idle" size={64} showRoleTag />
        <CrewmateAvatar role="orbit_power" state="walk" size={64} showRoleTag />
        <CrewmateAvatar role="science_comms" state="work" size={64} showRoleTag />
      </motion.div>

      {/* Main Mission Control Card */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="paper-card w-full max-w-2xl space-y-5 p-6 sm:p-8"
      >
        <div className="space-y-2 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="paper-badge bg-role-spacecraft px-3 py-1 text-xs uppercase tracking-widest text-ink-black">
              <Sparkles className="h-3.5 w-3.5" />
              Space Apps Challenge 2026 · 5-Min Mission Game
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
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            MISSION CONTROL: PAPER ORBIT
          </h1>
          <p className="mx-auto max-w-xl text-sm text-slate-300">
            Co-design a real-physics space mission across two synchronized station waves,
            survive a 60-second turn-based deep-space flight, and uncover causal NASA
            engineering trade-offs.
          </p>
        </div>

        {/* Crewmember Callsign */}
        <div className="rounded-xl border-2 border-ink-black bg-space-ink/80 p-3">
          <label
            htmlFor="engineer-callsign"
            className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300"
          >
            Engineer Callsign
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

        {/* Primary Mode Buttons */}
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={isConnecting}
            onClick={() => handleModeStart("single")}
            className="paper-btn flex flex-col items-start gap-1 bg-status-ok px-5 py-4 text-left text-ink-black"
          >
            <span className="inline-flex items-center gap-2 text-lg font-bold">
              <Rocket className="h-5 w-5" />
              SINGLEPLAYER
            </span>
            <span className="font-mono text-xs font-normal opacity-85">
              Solo command + AI Autopilot teammates
            </span>
          </button>

          <button
            type="button"
            disabled={isConnecting}
            onClick={() => handleModeStart("multi")}
            className="paper-btn flex flex-col items-start gap-1 bg-role-finance px-5 py-4 text-left text-ink-black"
          >
            <span className="inline-flex items-center gap-2 text-lg font-bold">
              <Users className="h-5 w-5" />
              MULTIPLAYER (PIN)
            </span>
            <span className="font-mono text-xs font-normal opacity-85">
              Host a 1–4 player room with live mutations
            </span>
          </button>
        </div>

        {/* Join with PIN Section (Great for Phone Players) */}
        <div className="space-y-3 border-t-2 border-ink-black pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowJoinPanel((prev) => !prev)}
              className="paper-btn inline-flex items-center gap-2 bg-paper-cream px-4 py-2 text-sm text-ink-black"
            >
              <KeyRound className="h-4 w-4" />
              {showJoinPanel ? "Hide PIN Entry" : "Join with PIN"}
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="paper-btn inline-flex items-center gap-1.5 bg-space-ink px-3.5 py-2 text-xs text-paper-cream"
              >
                <BookOpen className="h-3.5 w-3.5 text-role-spacecraft" />
                How to Play / NASA Data
              </button>

              <button
                type="button"
                onClick={onOpenSandbox}
                className="inline-flex items-center gap-1 font-mono text-xs text-slate-400 underline hover:text-paper-cream"
              >
                <Wrench className="h-3.5 w-3.5" />
                /dev-sandbox
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {showJoinPanel && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleJoinSubmit}
                className="overflow-hidden"
              >
                <div className="mt-1 flex flex-col gap-2 rounded-xl border-2 border-ink-black bg-space-ink p-3 sm:flex-row">
                  <input
                    type="text"
                    maxLength={8}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                    placeholder="ENTER PIN (E.G. MARS26)"
                    aria-label="Room PIN"
                    className="flex-1 rounded-lg border-2 border-ink-black bg-paper-cream px-3 py-2 font-mono text-base font-bold uppercase tracking-widest text-ink-black focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="paper-btn bg-role-spacecraft px-5 py-2 text-sm text-ink-black"
                  >
                    {isConnecting ? "CONNECTING..." : "JOIN ROOM"}
                  </button>
                </div>
                {pinNotice && (
                  <p className="mt-1.5 font-mono text-xs text-status-warn">
                    {pinNotice}
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Quick Visual Modal: How to Play / NASA Data */}
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
              className="paper-card max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto p-6"
            >
              <div className="flex items-start justify-between gap-2 border-b-2 border-ink-black pb-3">
                <div>
                  <span className="paper-badge bg-role-finance px-2 py-0.5 text-[10px] text-ink-black">
                    BRIEFING · 5 MIN LOOP
                  </span>
                  <h2 id="guide-modal-title" className="mt-1 font-display text-2xl font-bold">
                    How the Mission Works
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
                    01 · LOBBY & ROLES
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Pick 1 of 4 subsystem roles and a NASA mission. Empty seats are
                    piloted dynamically by constraint-aware AI.
                  </p>
                </li>
                <li className="rounded-xl border-2 border-ink-black bg-space-ink p-3">
                  <div className="font-mono text-xs font-bold text-role-spacecraft">
                    02 · STATION 1 & 2 (30S EACH)
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Your crewmate walks automatically along the linear track. Every
                    slider mutates live teammate mass, budget, power &amp; FSPL.
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
                    Win or fail, see the exact physical chain reaction behind your
                    outcome plus the real NASA mission comparison.
                  </p>
                </li>
              </ol>

              <div className="rounded-xl border-2 border-ink-black bg-space-ink/80 p-3 font-mono text-[11px] text-slate-300">
                <span className="font-bold text-paper-cream">Verified Sources: </span>
                NIMA WGS84 orbital physics, Rocket/SpaceX Rideshare v11 payload caps,
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
