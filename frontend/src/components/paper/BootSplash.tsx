// Owner: Leonardo (2026-11-15) — One-time boot loading screen (first load only, never between
// stations): the Python-generated nebula loop (herramientas/arte/procesar_arte.py →
// /assets/art/anim/loading-loop.webp) with the title and a progress bar. Tap to skip.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ART } from "../../data/artManifest";

const BOOT_MIN_MS = 1800;
const BOOT_MAX_MS = 4000;

export function BootSplash({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => setElapsed(performance.now() - start), 100);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if ((ready && elapsed >= BOOT_MIN_MS) || elapsed >= BOOT_MAX_MS) onDone();
  }, [ready, elapsed, onDone]);

  const pct = Math.min(100, Math.round((elapsed / (ready ? BOOT_MIN_MS : BOOT_MAX_MS)) * 100));
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex cursor-pointer flex-col items-center justify-end overflow-hidden bg-space-ink pb-[12vh]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      onClick={onDone}
      role="status"
      aria-label="Loading Astro Squad"
    >
      <img src={ART.anim.loadingLoop.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-space-ink via-transparent to-transparent" />
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative font-display text-5xl font-black uppercase text-paper-cream sm:text-7xl"
        style={{ textShadow: "4px 4px 0 #0F172A, -2px -2px 0 #0F172A, 2px -2px 0 #0F172A, -2px 2px 0 #0F172A" }}
      >
        Astro Squad
      </motion.h1>
      <div className="relative mt-5 h-4 w-[min(80vw,26rem)] overflow-hidden rounded-full border-[3px] border-ink-black bg-space-ink">
        <motion.div className="h-full bg-tank-orange" animate={{ width: `${pct}%` }} transition={{ duration: 0.15 }} />
      </div>
      <p className="relative mt-2 font-mono text-[11px] font-bold uppercase tracking-widest text-slate-300">
        {ready ? "Mission Control ready · tap to start" : "Contacting Mission Control…"}
      </p>
    </motion.div>
  );
}

export default BootSplash;
