// Owner: Leonardo (Task EXT-01) — 100% Web Audio API Synthesizer + Generative Lyria-style Ambient Pad
import { useEffect, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";

import { t } from "../../i18n";
const MUTE_STORAGE_KEY = "astro_sound_muted";

export type VerdictType = "FULL_SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";

interface AmbientNodes {
  oscLow: OscillatorNode;
  oscMid: OscillatorNode;
  oscFifth: OscillatorNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
  masterGain: GainNode;
  pulseTimer: number;
}

class AstroSoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted: boolean = false;
  private ambientNodes: AmbientNodes | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.muted = window.localStorage.getItem(MUTE_STORAGE_KEY) === "1";
      } catch {
        this.muted = false;
      }
    }
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public isAmbientPlaying(): boolean {
    return this.ambientNodes !== null;
  }

  public setMuted(next: boolean): void {
    this.muted = next;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(MUTE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Ignore storage restrictions
      }
    }
    if (next) {
      this.stopAmbientPad();
    }
    this.notify();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === "undefined") return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const length = Math.floor(ctx.sampleRate * 0.5);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  private scheduleTone(
    ctx: AudioContext,
    startTime: number,
    duration: number,
    freqStart: number,
    freqEnd: number,
    type: OscillatorType,
    peakGain: number,
    filterHz?: number,
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freqStart), startTime);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), startTime + duration);
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + Math.min(0.015, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    if (filterHz) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(filterHz, startTime);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  /** Tactile paper-arcade click (`800Hz -> 320Hz` triangle). */
  public playClick(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.scheduleTone(ctx, now, 0.065, 800, 320, "triangle", 0.14, 2400);
  }

  /** Crisp light HUD hover tick. */
  public playHover(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.scheduleTone(ctx, now, 0.028, 1150, 980, "sine", 0.045);
  }

  /** Triumphant rising arpeggio (`C5 -> E5 -> G5 -> C6`) on station lock or PASS gate. */
  public playComplete(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.068;
      this.scheduleTone(ctx, t, 0.18, freq, freq * 1.01, "triangle", 0.13, 3600);
      this.scheduleTone(ctx, t, 0.14, freq * 2, freq * 2, "sine", 0.04);
    });
  }

  /** Dual sawtooth warning buzz + filtered noise burst for errors, DEGRADED, or CRITICAL. */
  public playError(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.scheduleTone(ctx, now, 0.24, 165, 118, "sawtooth", 0.13, 720);
    this.scheduleTone(ctx, now + 0.04, 0.26, 110, 82, "sawtooth", 0.13, 620);

    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(900, now);
    filter.Q.value = 1.6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.18);
  }

  /** FM telemetry ping when a teammate triggers `mutacion_en_vivo`. */
  public playMutationToast(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const carrier = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const gain = ctx.createGain();

    carrier.type = "sine";
    carrier.frequency.setValueAtTime(880, now);
    carrier.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

    mod.type = "sine";
    mod.frequency.setValueAtTime(110, now);
    modGain.gain.setValueAtTime(220, now);
    modGain.gain.exponentialRampToValueAtTime(15, now + 0.18);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    mod.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(gain);
    gain.connect(ctx.destination);

    mod.start(now);
    carrier.start(now);
    mod.stop(now + 0.24);
    carrier.stop(now + 0.24);
  }

  /** Countdown tick for the final 5s of a 30s station or 15s logbook round. */
  public playCountdownTick(urgent = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const base = urgent ? 1240 : 880;
    this.scheduleTone(ctx, now, urgent ? 0.075 : 0.05, base, base * 0.9, "square", urgent ? 0.085 : 0.055, 2200);
  }

  /** 60-Seconds-style logbook page flip / airlock scene-jump sweep + sub thump. */
  public playSceneJump(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(2600, now + 0.22);
    filter.Q.value = 1.4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.3);

    this.scheduleTone(ctx, now + 0.02, 0.2, 130, 58, "sine", 0.14);
  }

  /** Final Mission Report fanfare matched to outcome severity. */
  public playVerdictFanfare(verdict: VerdictType): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (verdict === "FULL_SUCCESS") {
      // Bright C major victory fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((f, idx) => {
        const t = now + idx * 0.095;
        this.scheduleTone(ctx, t, idx === notes.length - 1 ? 0.45 : 0.22, f, f, "triangle", 0.13, 4200);
      });
      return;
    }

    if (verdict === "PARTIAL_SUCCESS") {
      // Cautious suspended progression
      const notes = [440, 523.25, 659.25, 587.33];
      notes.forEach((f, idx) => {
        const t = now + idx * 0.11;
        this.scheduleTone(ctx, t, 0.26, f, f * 0.995, "triangle", 0.11, 2800);
      });
      return;
    }

    // FAILED: descending emergency klaxon
    const notes = [329.63, 277.18, 220, 146.83];
    notes.forEach((f, idx) => {
      const t = now + idx * 0.13;
      this.scheduleTone(ctx, t, 0.28, f, f * 0.92, "sawtooth", 0.11, 950);
    });
  }

  /** Soft Lyria-inspired procedural deep-space harmonic drone + faint telemetry pings. */
  public startAmbientPad(): boolean {
    if (this.muted) {
      this.setMuted(false);
    }
    if (this.ambientNodes) return true;

    const ctx = this.ensureContext();
    if (!ctx) return false;
    const now = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(360, now);
    filter.Q.value = 2.2;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.06, now + 1.1);

    const oscLow = ctx.createOscillator();
    oscLow.type = "sine";
    oscLow.frequency.setValueAtTime(55, now); // A1

    const oscMid = ctx.createOscillator();
    oscMid.type = "triangle";
    oscMid.frequency.setValueAtTime(110.4, now); // slightly detuned A2

    const oscFifth = ctx.createOscillator();
    oscFifth.type = "sine";
    oscFifth.frequency.setValueAtTime(164.8, now); // E3 shimmer

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.14, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(190, now);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    oscLow.connect(filter);
    oscMid.connect(filter);
    oscFifth.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    oscLow.start(now);
    oscMid.start(now);
    oscFifth.start(now);
    lfo.start(now);

    const pulseNotes = [440, 523.25, 659.25, 783.99];
    const pulseTimer = window.setInterval(() => {
      if (this.muted || !this.ctx || !this.ambientNodes) return;
      const t = this.ctx.currentTime;
      const note = pulseNotes[Math.floor(Math.random() * pulseNotes.length)];
      this.scheduleTone(this.ctx, t, 0.45, note, note, "sine", 0.018);
    }, 3200);

    this.ambientNodes = {
      oscLow,
      oscMid,
      oscFifth,
      lfo,
      lfoGain,
      masterGain,
      pulseTimer,
    };
    this.notify();
    return true;
  }

  public stopAmbientPad(): void {
    const nodes = this.ambientNodes;
    if (!nodes) return;
    this.ambientNodes = null;
    window.clearInterval(nodes.pulseTimer);

    const ctx = this.ctx;
    if (ctx) {
      const now = ctx.currentTime;
      try {
        nodes.masterGain.gain.cancelScheduledValues(now);
        nodes.masterGain.gain.setValueAtTime(Math.max(0.0001, nodes.masterGain.gain.value), now);
        nodes.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        window.setTimeout(() => {
          try {
            nodes.oscLow.stop();
            nodes.oscMid.stop();
            nodes.oscFifth.stop();
            nodes.lfo.stop();
            nodes.masterGain.disconnect();
          } catch {
            // Already stopped
          }
        }, 280);
      } catch {
        // Ignore teardown issues
      }
    }
    this.notify();
  }

  public toggleAmbientPad(): boolean {
    if (this.ambientNodes) {
      this.stopAmbientPad();
      return false;
    }
    return this.startAmbientPad();
  }
}

export const soundEngine = new AstroSoundEngine();

/** Floating top-right arcade audio control bar (EXT-01). */
export function SoundControlPill() {
  const [muted, setMuted] = useState(() => soundEngine.isMuted());
  const [ambientOn, setAmbientOn] = useState(() => soundEngine.isAmbientPlaying());

  useEffect(() => {
    const sync = () => {
      setMuted(soundEngine.isMuted());
      setAmbientOn(soundEngine.isAmbientPlaying());
    };
    sync();
    return soundEngine.subscribe(sync);
  }, []);

  return (
    <div
      className="pointer-events-auto fixed right-3 top-3 z-50 flex items-center gap-1.5"
      aria-label="Audio synthesizer controls"
    >
      <button
        type="button"
        onClick={() => {
          const nextMuted = soundEngine.toggleMute();
          if (!nextMuted) soundEngine.playClick();
        }}
        aria-label={muted ? t("Unmute game sound effects") : t("Mute game sound effects")}
        aria-pressed={muted}
        className={`paper-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase text-ink-black sm:text-[11px] ${
          muted ? "bg-status-warn" : "bg-paper-cream"
        }`}
      >
        {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-status-ok" />}
        <span>{muted ? t("SFX MUTE") : t("SFX ON")}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          soundEngine.toggleAmbientPad();
          soundEngine.playClick();
        }}
        aria-label={ambientOn ? t("Stop space ambient synth") : t("Play space ambient synth")}
        aria-pressed={ambientOn}
        className={`paper-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase sm:text-[11px] ${
          ambientOn ? "bg-role-spacecraft text-ink-black" : "bg-space-ink text-paper-cream"
        }`}
      >
        <Music className={`h-3.5 w-3.5 ${ambientOn ? "animate-pulse" : "text-role-spacecraft"}`} />
        <span className="hidden sm:inline">{ambientOn ? t("AMBIENT SYNTH ON") : t("AMBIENT SYNTH")}</span>
        <span className="sm:hidden">{ambientOn ? t("SYNTH") : t("PAD")}</span>
      </button>
    </div>
  );
}

export default SoundControlPill;
