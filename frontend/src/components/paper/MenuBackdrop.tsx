// Owner: Leonardo (2026-11-15) — Main-menu backdrop: AI-art nebula with slow parallax and floating
// sprites (spaceship, planet, astronaut). Images come from the Python art pipeline
// (herramientas/arte/procesar_arte.py); each layer hides itself if its file is missing.
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { t } from "../../i18n";
export interface FloatingSprite {
  src: string;
  alt: string;
  className: string;
  drift: { x: Array<number | string>; y: Array<number | string>; rotate?: number[] };
  durationSec: number;
}

function SafeImg({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return <img src={src} alt={alt} className={className} draggable={false} onError={() => setOk(false)} />;
}

export function MenuBackdrop({
  backgroundSrc = "/assets/art/bg/nebula.webp",
  sprites = [],
}: {
  backgroundSrc?: string;
  sprites?: FloatingSprite[];
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -inset-[6%]"
        animate={reduce ? undefined : { scale: [1, 1.06, 1], x: ["0%", "-2%", "0%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      >
        <SafeImg src={backgroundSrc} alt="" className="h-full w-full object-cover" />
      </motion.div>
      {/* readability vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.15),rgba(15,23,42,0.75))]" />
      {sprites.map((s) => (
        <motion.div
          key={s.src}
          className={`absolute ${s.className}`}
          animate={reduce ? undefined : s.drift}
          transition={{ duration: s.durationSec, repeat: Infinity, ease: "easeInOut" }}
        >
          <SafeImg src={s.src} alt={s.alt} className="h-full w-full object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.6)]" />
        </motion.div>
      ))}
      <span className="absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-widest text-slate-400/80">
        {t("AI-generated art")}
      </span>
    </div>
  );
}

export default MenuBackdrop;
