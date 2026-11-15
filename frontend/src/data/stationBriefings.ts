// Owner: Leonardo (2026-11-15) — Station briefings: the context a player needs before each minigame.
// Plain language, no numbers (numbers live in nasa_catalog.json and are shown live in each game).
import type { RoleType } from "../types/game";

export interface StationBriefing {
  /** Why this job matters for the mission, in one sentence. */
  why: string;
  /** What "done well" looks like; mirrored by the in-game goal checklist. */
  goals: string[];
  /** How to play, in a few words. */
  controls: string;
}

export const STATION_BRIEFINGS: Record<RoleType, Record<1 | 2, StationBriefing>> = {
  finance_launch: {
    1: {
      why: "Real NASA missions keep cash in reserve for surprises. No reserve = no rescue money later.",
      goals: ["Keep the safety vault in the green", "Fund engineering and science", "Answer the surprise requests"],
      controls: "Tap + / − to move coins between the three vaults.",
    },
    2: {
      why: "The rocket must lift your whole ship, and you still have to pay for it.",
      goals: ["Pick a rocket strong enough", "Stay inside the budget", "Seal the nose cone"],
      controls: "Tap a rocket in the hangar, then hold the seal button.",
    },
  },
  spacecraft_mass: {
    1: {
      why: "Ships are built in order: frame first, then power, heat shield and antenna.",
      goals: ["Mount the parts in the right order", "Add a heat shield if the mission needs one", "Tighten every bolt"],
      controls: "Pick a part, then tap the glowing slot on the ship.",
    },
    2: {
      why: "If the weight is off-center, the engines waste fuel fighting the spin.",
      goals: ["Place every module in a bay", "Keep the red dot inside the green circle", "Drop ballast if the ship is too heavy"],
      controls: "Pick a module, then tap a bay on the ship.",
    },
  },
  orbit_power: {
    1: {
      why: "Your route and engine decide how much fuel you burn and how far your signal must travel.",
      goals: ["Pick a route to the target", "Pick a parking orbit", "Pick an engine"],
      controls: "Tap a card in each row. Watch fuel and signal change live.",
    },
    2: {
      why: "Every system on the ship needs power. Bring energy home and keep a battery reserve.",
      goals: ["Drive the rover to power crates", "Deliver them to the base", "Lock with a battery reserve"],
      controls: "Use the arrows (or WASD) to drive.",
    },
  },
  science_comms: {
    1: {
      why: "Instruments bring the science back, but each one adds weight and uses power.",
      goals: ["Load the instruments you want", "Flatten the spectrum baseline", "Tap the peaks in the light"],
      controls: "Tap instruments to load them, then switch to the spectrum tab.",
    },
    2: {
      why: "Data is useless if it never reaches Earth. Aim the dish and send the signal code.",
      goals: ["Align the dish to full signal", "Repeat the signal code", "Send the data home"],
      controls: "Turn the dish, then tap the tones in the same order.",
    },
  },
};
