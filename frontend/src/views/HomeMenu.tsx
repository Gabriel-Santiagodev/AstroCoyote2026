// Owner: Leonardo (Task LEO-04) — Main menu (team mockup): ASTRO SQUAD title + SINGLE PLAYER,
// MULTI PLAYER and an options gear. Multiplayer opens HOST / JOIN; JOIN MATCH is a two-step,
// Kahoot-style screen (game PIN, then nickname). Background: AI art nebula + floating sprites.
import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ClipboardList,
  KeyRound,
  LogIn,
  Languages,
  Music,
  Settings,
  Users,
  Volume2,
  VolumeX,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { soundEngine } from "../components/paper/SoundEngine";
import { t, useI18n } from "../i18n";
import { MenuBackdrop, type FloatingSprite } from "../components/paper/MenuBackdrop";
import { ART } from "../data/artManifest";

interface HomeMenuProps {
  onSelectMode: (mode: "single" | "multi") => void;
  onOpenSandbox: () => void;
  onJoinWithPin?: (pin: string, playerName: string) => void;
  onCreateRoom?: (mode: "single" | "multi", hostName: string) => void;
  isConnecting?: boolean;
  connectionError?: string | null;
  connectionStatus?: "checking" | "online" | "offline";
}

/** Floating AI-art sprites behind the main menu (Python art pipeline output). */
const MENU_SPRITES: FloatingSprite[] = [
  { src: ART.vehicles.spaceship.src, alt: "", className: "left-[-10%] top-[12%] w-[38vw] max-w-[520px]",
    drift: { x: ["0vw", "70vw", "0vw"], y: [0, -14, 0] }, durationSec: 46 },
  { src: ART.planets.planetMars.src, alt: "", className: "bottom-[-8%] left-[-6%] w-[28vw] max-w-[360px]",
    drift: { x: [0, 10, 0], y: [0, -10, 0], rotate: [0, 8, 0] }, durationSec: 30 },
  { src: ART.planets.planetMoon.src, alt: "", className: "right-[4%] top-[8%] w-[12vw] max-w-[150px]",
    drift: { x: [0, -8, 0], y: [0, 8, 0] }, durationSec: 22 },
  { src: ART.anim.astronautFloat.src, alt: "", className: "bottom-[10%] right-[6%] w-[14vw] max-w-[200px]",
    drift: { x: [0, -12, 0], y: [0, -18, 0] }, durationSec: 9 },
  { src: ART.vehicles.satellite.src, alt: "", className: "right-[18%] bottom-[38%] hidden w-[16vw] max-w-[220px] md:block",
    drift: { x: [0, 14, 0], y: [0, 10, 0], rotate: [-4, 4, -4] }, durationSec: 18 },
];

type MenuView = "main" | "multi" | "host_name" | "join_pin" | "join_name";

const MIN_PIN_LENGTH = 4;
const MAX_PIN_LENGTH = 8;
const MAX_CALLSIGN_LENGTH = 18;
const NAME_STORAGE_KEY = "astro-squad-name";

const GUIDE_STEPS: Array<{ icon: typeof Users; title: string; text: string }> = [
  { icon: Users, title: "Pick a role", text: "4 specialists. Empty seats fly on AI." },
  { icon: ClipboardList, title: "Pick a mission", text: "Moon (easy), asteroid (medium) or Mars (hard)." },
  { icon: Wrench, title: "Build it", text: "2 stations each. Every choice changes the crew's limits." },
  { icon: Zap, title: "Fly & survive", text: "Liftoff, random events, 4 calls. Then see why." },
];

function readStoredName(): string {
  try {
    return window.localStorage.getItem(NAME_STORAGE_KEY) || "Commander";
  } catch {
    return "Commander";
  }
}

function storeName(name: string) {
  try {
    window.localStorage.setItem(NAME_STORAGE_KEY, name);
  } catch {
    /* storage blocked: keep the name in memory only */
  }
}

/** Big mockup-style menu button (red slab, thick ink outline, hard shadow). */
function MenuButton({
  children,
  onClick,
  disabled,
  tone = "gold",
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "gold" | "steel";
  label?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.03, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 2 }}
      onMouseEnter={() => soundEngine.playHover()}
      onClick={() => {
        soundEngine.playClick();
        onClick();
      }}
      className={`flex w-full items-center justify-center gap-3 px-6 py-3 font-display text-2xl font-black uppercase tracking-wide disabled:opacity-50 sm:text-3xl ${
        tone === "gold" ? "plate-gold" : "plate-steel"
      }`}
    >
      {children}
    </motion.button>
  );
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
  const [view, setView] = useState<MenuView>("main");
  const [callsign, setCallsign] = useState<string>(readStoredName);
  const [pinInput, setPinInput] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [muted, setMuted] = useState(() => soundEngine.isMuted());
  const [music, setMusic] = useState(() => soundEngine.isAmbientPlaying());
  const { lang, setLang } = useI18n();

  useEffect(
    () =>
      soundEngine.subscribe(() => {
        setMuted(soundEngine.isMuted());
        setMusic(soundEngine.isAmbientPlaying());
      }),
    []
  );

  useEffect(() => {
    if (connectionError) soundEngine.playError();
  }, [connectionError]);

  const safeName = callsign.trim() || "Commander";

  const go = (next: MenuView) => {
    setNotice(null);
    setView(next);
  };

  const startSingle = () => {
    storeName(safeName);
    if (onCreateRoom) onCreateRoom("single", safeName);
    else onSelectMode("single");
  };

  const submitHost = (e: FormEvent) => {
    e.preventDefault();
    storeName(safeName);
    if (onCreateRoom) onCreateRoom("multi", safeName);
    else onSelectMode("multi");
  };

  const submitPin = (e: FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim().toUpperCase();
    if (clean.length < MIN_PIN_LENGTH) {
      soundEngine.playError();
      setNotice(t("The game PIN has {n}+ characters", { n: MIN_PIN_LENGTH }));
      return;
    }
    soundEngine.playComplete();
    go("join_name");
  };

  const submitJoin = (e: FormEvent) => {
    e.preventDefault();
    storeName(safeName);
    const clean = pinInput.trim().toUpperCase();
    if (onJoinWithPin) onJoinWithPin(clean, safeName);
    else onSelectMode("multi");
  };

  const statusChip = connectionStatus && (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink-black px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-ink-black ${
        connectionStatus === "online" ? "bg-status-ok" : connectionStatus === "checking" ? "bg-status-warn" : "bg-slate-300"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-ink-black" />
      {connectionStatus === "online" ? t("Online") : connectionStatus === "checking" ? t("Linking…") : t("Offline demo")}
    </span>
  );

  const panelMotion = {
    initial: { opacity: 0, y: 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -12, scale: 0.98 },
    transition: { duration: 0.2 },
  };

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pb-8 pt-12">
      <MenuBackdrop backgroundSrc={ART.bg.nebula.src} sprites={MENU_SPRITES} />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 16 }}
          className="text-center font-display text-5xl font-black uppercase leading-none tracking-tight text-paper-cream sm:text-7xl"
          style={{ textShadow: "4px 4px 0 #0F172A, -2px -2px 0 #0F172A, 2px -2px 0 #0F172A, -2px 2px 0 #0F172A, 0 8px 24px rgba(249,115,22,0.35)" }}
        >
          Astro Squad
        </motion.h1>
        <p className="mt-2 font-mono text-xs font-bold uppercase tracking-[0.25em] text-sky-glow sm:text-sm">
          {t("Design · Launch · Survive")}
        </p>
        <div className="mt-3">{statusChip}</div>

        <div className="mt-5 w-full">
          <AnimatePresence mode="wait">
            {view === "main" && (
              <motion.div key="main" {...panelMotion} className="flex flex-col items-center gap-4">
                <MenuButton onClick={startSingle} disabled={isConnecting}>
                  {t("Single Player")}
                </MenuButton>
                <MenuButton onClick={() => go("multi")} disabled={isConnecting}>
                  {t("Multi Player")}
                </MenuButton>
                <div className="w-1/2">
                  <MenuButton onClick={() => setShowOptions(true)} label={t("Options")} tone="steel">
                    <Settings className="h-8 w-8" strokeWidth={2.5} />
                  </MenuButton>
                </div>
              </motion.div>
            )}

            {view === "multi" && (
              <motion.div key="multi" {...panelMotion} className="flex flex-col gap-4">
                <MenuButton onClick={() => go("host_name")} disabled={isConnecting}>
                  <Users className="h-7 w-7" /> {t("Host match")}
                </MenuButton>
                <MenuButton onClick={() => go("join_pin")} disabled={isConnecting}>
                  <LogIn className="h-7 w-7" /> {t("Join match")}
                </MenuButton>
                <button type="button" onClick={() => go("main")}
                  className="mx-auto mt-1 inline-flex items-center gap-1.5 font-mono text-sm font-bold uppercase text-slate-300 hover:text-paper-cream">
                  <ArrowLeft className="h-4 w-4" /> {t("Back")}
                </button>
              </motion.div>
            )}

            {(view === "host_name" || view === "join_name") && (
              <motion.form
                key={view}
                {...panelMotion}
                onSubmit={view === "host_name" ? submitHost : submitJoin}
                className="rounded-2xl border-[4px] border-ink-black bg-paper-cream p-5 text-ink-black shadow-[8px_8px_0_#0F172A]"
              >
                <div className="text-center font-display text-2xl font-black uppercase">
                  {view === "host_name" ? t("Host match") : t("Join {pin}", { pin: pinInput.trim().toUpperCase() })}
                </div>
                <label className="mt-3 block font-mono text-xs font-bold uppercase text-slate-600">
                  {t("Nickname")}
                  <input
                    autoFocus
                    type="text"
                    maxLength={MAX_CALLSIGN_LENGTH}
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    className="mt-1 w-full rounded-lg border-[3px] border-ink-black bg-white px-3 py-3 text-center font-display text-2xl font-bold text-ink-black focus:outline-none focus:ring-4 focus:ring-sky-glow"
                  />
                </label>
                <button type="submit" disabled={isConnecting}
                  className="plate-gold mt-4 w-full py-3 font-display text-xl font-black uppercase disabled:opacity-60">
                  {isConnecting ? t("Connecting…") : view === "host_name" ? t("Create room") : t("OK, go!")}
                </button>
                <button type="button" onClick={() => go(view === "host_name" ? "multi" : "join_pin")}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 font-mono text-xs font-bold uppercase text-slate-500">
                  <ArrowLeft className="h-3.5 w-3.5" /> {t("Back")}
                </button>
              </motion.form>
            )}

            {view === "join_pin" && (
              <motion.form
                key="join_pin"
                {...panelMotion}
                onSubmit={submitPin}
                className="rounded-2xl border-[4px] border-ink-black bg-paper-cream p-5 text-ink-black shadow-[8px_8px_0_#0F172A]"
              >
                <div className="text-center font-display text-3xl font-black uppercase">{t("Join match")}</div>
                <div className="relative mt-4">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    inputMode="text"
                    maxLength={MAX_PIN_LENGTH}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                    placeholder={t("Game PIN")}
                    aria-label={t("Game PIN")}
                    className="w-full rounded-lg border-[3px] border-ink-black bg-white py-4 pl-11 pr-3 text-center font-mono text-3xl font-bold uppercase tracking-[0.3em] text-ink-black placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-glow"
                  />
                </div>
                {notice && <p className="mt-2 text-center font-mono text-xs font-bold text-red-600">{notice}</p>}
                <button type="submit"
                  className="plate-gold mt-4 w-full py-3 font-display text-xl font-black uppercase">
                  {t("Enter")}
                </button>
                <button type="button" onClick={() => go("multi")}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 font-mono text-xs font-bold uppercase text-slate-500">
                  <ArrowLeft className="h-3.5 w-3.5" /> {t("Back")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {connectionError && (
            <div role="alert" className="mt-4 rounded-xl border-[3px] border-ink-black bg-status-crit px-4 py-2 text-center font-mono text-xs font-bold text-ink-black">
              {connectionError}
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-space-ink/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="options-title"
            onClick={() => setShowOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border-[4px] border-ink-black bg-paper-cream p-5 text-ink-black shadow-[8px_8px_0_#0F172A]"
            >
              <div className="flex items-center justify-between">
                <h2 id="options-title" className="font-display text-3xl font-black uppercase">{t("Options")}</h2>
                <button type="button" onClick={() => setShowOptions(false)} aria-label={t("Close options")}
                  className="rounded-lg border-[3px] border-ink-black bg-white p-1.5">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <label className="block font-mono text-xs font-bold uppercase text-slate-600">
                {t("Your name")}
                <input type="text" maxLength={MAX_CALLSIGN_LENGTH} value={callsign}
                  onChange={(e) => setCallsign(e.target.value)} onBlur={() => storeName(safeName)}
                  className="mt-1 w-full rounded-lg border-[3px] border-ink-black bg-white px-3 py-2 font-display text-lg font-bold" />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => soundEngine.toggleMute()}
                  className={`flex items-center justify-center gap-2 rounded-lg border-[3px] border-ink-black py-2.5 font-bold ${muted ? "bg-slate-300" : "bg-status-ok"}`}>
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />} {muted ? t("Sound off") : t("Sound on")}
                </button>
                <button type="button" onClick={() => soundEngine.toggleAmbientPad()}
                  className={`flex items-center justify-center gap-2 rounded-lg border-[3px] border-ink-black py-2.5 font-bold ${music ? "bg-status-ok" : "bg-slate-300"}`}>
                  <Music className="h-5 w-5" /> {music ? t("Music on") : t("Music off")}
                </button>
              </div>

              <div>
                <div className="mb-1.5 flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-slate-600">
                  <Languages className="h-4 w-4" /> {t("Language")}
                </div>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("Language")}>
                  {([["en", "English"], ["es", "Español"]] as const).map(([code, name]) => (
                    <button key={code} type="button" role="radio" aria-checked={lang === code}
                      onClick={() => { soundEngine.playClick(); setLang(code); }}
                      className={`rounded-lg border-[3px] border-ink-black py-2.5 font-bold ${lang === code ? "bg-amber-400" : "bg-white"}`}>
                      {name}
                    </button>
                  ))}
                </div>
                <p className="mt-1 font-mono text-[10px] text-slate-500">{t("Mission data and flight logbook stay in English for now.")}</p>
              </div>

              <div>
                <div className="mb-2 font-display text-lg font-black uppercase">{t("How to play")}</div>
                <ol className="grid gap-2 sm:grid-cols-2">
                  {GUIDE_STEPS.map(({ icon: Icon, title, text }, i) => (
                    <li key={title} className="flex items-start gap-2 rounded-xl border-[3px] border-ink-black bg-white p-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-ink-black bg-amber-400">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-mono text-[11px] font-bold uppercase">{i + 1} · {t(title)}</div>
                        <p className="text-sm leading-snug text-slate-700">{t(text)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center justify-between gap-2 border-t-2 border-dashed border-slate-300 pt-3">
                <p className="font-mono text-[10px] text-slate-500">{t("AI-generated art · real NASA mission data · no NASA logos")}</p>
                <button type="button" onClick={() => { setShowOptions(false); onOpenSandbox(); }}
                  className="inline-flex items-center gap-1 rounded-lg border-2 border-ink-black bg-white px-2 py-1 font-mono text-[11px] font-bold">
                  <Wrench className="h-3.5 w-3.5" /> {t("Sandbox")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default HomeMenu;
