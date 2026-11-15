// Owner: Leonardo (Task LEO-04) — Home screen: title, squad lineup, name, Solo / Host and PIN join.
// Kept deliberately light on text: every block reads in under two seconds.
import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  ClipboardList,
  KeyRound,
  LogIn,
  Rocket,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { KeyArt } from "../components/paper/KeyArt";
import { MissionLoadingScreen } from "../components/paper/LoadingScreen";
import { soundEngine } from "../components/paper/SoundEngine";

interface HomeMenuProps {
  onSelectMode: (mode: "single" | "multi") => void;
  onOpenSandbox: () => void;
  onJoinWithPin?: (pin: string, playerName: string) => void;
  onCreateRoom?: (mode: "single" | "multi", hostName: string) => void;
  isConnecting?: boolean;
  connectionError?: string | null;
  connectionStatus?: "checking" | "online" | "offline";
}

const MIN_PIN_LENGTH = 4;
const MAX_PIN_LENGTH = 8;
const MAX_CALLSIGN_LENGTH = 18;

/** How a match plays, in four glanceable steps (shown in the guide modal). */
const GUIDE_STEPS: Array<{ icon: typeof Rocket; title: string; text: string; tint: string }> = [
  { icon: Users, title: "Pick a role", text: "4 specialists. Empty seats = AI.", tint: "text-role-finance" },
  { icon: ClipboardList, title: "Pick a mission", text: "Moon, asteroid or Mars.", tint: "text-role-spacecraft" },
  { icon: Wrench, title: "Build it", text: "2 stations. Your choices affect the crew.", tint: "text-role-orbit" },
  { icon: Zap, title: "Fly it", text: "4 crisis calls. Then see why.", tint: "text-role-science" },
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
  const [pinInput, setPinInput] = useState("");
  const [pinNotice, setPinNotice] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const safeName = callsign.trim() || "Commander";

  // Clear the local boot loader if a connection error comes back
  useEffect(() => {
    if (connectionError) {
      soundEngine.playError();
      setPendingAction(null);
    }
  }, [connectionError]);

  const executePendingAction = (action: PendingAction) => {
    if (!action) return;
    if (action.type === "create") {
      if (onCreateRoom) onCreateRoom(action.mode, safeName);
      else onSelectMode(action.mode);
    } else if (onJoinWithPin) {
      onJoinWithPin(action.pin, safeName);
    } else {
      onSelectMode("multi");
    }
    setPendingAction(null);
  };

  const handleModeStart = (mode: "single" | "multi") => {
    soundEngine.playClick();
    setPinNotice(null);
    setPendingAction({ type: "create", mode });
  };

  const handleJoinSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanedPin = pinInput.trim().toUpperCase();
    if (cleanedPin.length < MIN_PIN_LENGTH) {
      soundEngine.playError();
      setPinNotice(`PIN needs ${MIN_PIN_LENGTH}+ characters`);
      return;
    }
    soundEngine.playClick();
    setPinNotice(null);
    setPendingAction({ type: "join", pin: cleanedPin });
  };

  const showBootLoader = Boolean(pendingAction) || isConnecting;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-5 px-3 pb-8 pt-14 sm:px-6 sm:pt-16">
      {showBootLoader && (
        <MissionLoadingScreen
          variant="boot"
          roleId="finance_launch"
          durationMs={750}
          isMobileClient={pendingAction?.type === "join"}
          progressPct={isConnecting && !pendingAction ? 72 : undefined}
          title={pendingAction?.type === "join" ? `JOINING ${pendingAction.pin}` : "BOOTING MISSION CONTROL"}
          subtitle={pendingAction?.type === "join" ? "Linking your phone…" : "Warming up the hangar…"}
          allowSkip={Boolean(pendingAction) && !isConnecting}
          onComplete={() => {
            if (pendingAction) executePendingAction(pendingAction);
          }}
        />
      )}

      {/* Title + squad */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flash-panel w-full overflow-hidden p-4 sm:p-6"
      >
        <div className="hazard-stripe-bar -mx-4 -mt-4 mb-4 h-3 border-b-3 border-ink-black sm:-mx-6 sm:-mt-6" />

        <div className="flex items-center justify-between gap-2">
          {connectionStatus ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink-black px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-ink-black ${
                connectionStatus === "online"
                  ? "bg-status-ok"
                  : connectionStatus === "checking"
                  ? "bg-status-warn"
                  : "bg-slate-300"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ink-black" />
              {connectionStatus === "online" ? "Online" : connectionStatus === "checking" ? "Linking…" : "Offline demo"}
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShowGuide(true);
              }}
              className="paper-btn inline-flex items-center gap-1.5 bg-space-ink px-3 py-1.5 text-xs text-paper-cream"
            >
              <BookOpen className="h-3.5 w-3.5 text-role-spacecraft" />
              How to play
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenSandbox();
              }}
              title="Developer sandbox"
              aria-label="Open developer sandbox"
              className="paper-btn bg-slate-800 p-1.5 text-slate-200"
            >
              <Wrench className="h-4 w-4 text-role-finance" />
            </button>
          </div>
        </div>

        <KeyArt className="mt-3" />

        <div className="mt-4 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-paper-cream drop-shadow-[3px_3px_0_#0F172A] sm:text-6xl">
            ASTRO SQUAD
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-sky-glow sm:text-sm">
            Build a NASA mission · 5 min
          </p>
        </div>
      </motion.section>

      {/* Name + play buttons + PIN join */}
      <section className="flash-panel w-full space-y-4 p-4 sm:p-5">
        <label className="block">
          <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Your name
          </span>
          <input
            type="text"
            maxLength={MAX_CALLSIGN_LENGTH}
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            placeholder="Commander"
            className="w-full rounded-lg border-2 border-ink-black bg-paper-cream px-3 py-2.5 font-mono text-base font-bold text-ink-black focus:outline-none focus:ring-2 focus:ring-role-spacecraft"
          />
        </label>

        {connectionError && (
          <div role="alert" className="rounded-xl border-2 border-ink-black bg-status-crit px-4 py-2 font-mono text-xs font-bold text-ink-black">
            {connectionError}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={showBootLoader}
            onClick={() => handleModeStart("single")}
            className="paper-btn flex items-center justify-between gap-3 bg-status-ok px-4 py-4 text-left text-ink-black"
          >
            <span className="inline-flex items-center gap-2 text-xl font-bold">
              <Rocket className="h-6 w-6" />
              Solo
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold opacity-80">
              You + 3 <Bot className="h-4 w-4" />
            </span>
          </button>
          <button
            type="button"
            disabled={showBootLoader}
            onClick={() => handleModeStart("multi")}
            className="paper-btn flex items-center justify-between gap-3 bg-role-finance px-4 py-4 text-left text-ink-black"
          >
            <span className="inline-flex items-center gap-2 text-xl font-bold">
              <Users className="h-6 w-6" />
              Host room
            </span>
            <span className="font-mono text-xs font-bold opacity-80">1–4 players</span>
          </button>
        </div>

        <form onSubmit={handleJoinSubmit} className="flex gap-2 border-t-2 border-dashed border-slate-700 pt-4">
          <div className="relative flex-1">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              maxLength={MAX_PIN_LENGTH}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.toUpperCase())}
              placeholder="ROOM PIN"
              aria-label="Room PIN"
              className="w-full rounded-lg border-2 border-ink-black bg-paper-cream py-2.5 pl-9 pr-3 font-mono text-base font-bold uppercase tracking-[0.25em] text-ink-black focus:outline-none focus:ring-2 focus:ring-role-spacecraft"
            />
          </div>
          <button
            type="submit"
            disabled={showBootLoader}
            className="paper-btn inline-flex shrink-0 items-center gap-1.5 bg-role-spacecraft px-4 py-2.5 text-base text-ink-black"
          >
            <LogIn className="h-5 w-5" />
            Join
          </button>
        </form>
        {pinNotice && <p className="font-mono text-xs font-bold text-status-warn">{pinNotice}</p>}
      </section>

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
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="flash-panel max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 id="guide-modal-title" className="font-display text-2xl font-bold">
                  How to play
                </h2>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="Close guide"
                  className="paper-btn bg-paper-cream p-1.5 text-ink-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="grid gap-2.5 sm:grid-cols-2">
                {GUIDE_STEPS.map(({ icon: Icon, title, text, tint }, i) => (
                  <li key={title} className="flex items-start gap-3 rounded-xl border-2 border-ink-black bg-space-ink p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink-black bg-blueprint-navy">
                      <Icon className={`h-5 w-5 ${tint}`} />
                    </span>
                    <div>
                      <div className={`font-mono text-xs font-bold uppercase ${tint}`}>
                        {i + 1} · {title}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-200">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="font-mono text-[10px] text-slate-400">
                Real data: NASA Artemis, OSIRIS-REx, MRO. No NASA logos used.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default HomeMenu;
