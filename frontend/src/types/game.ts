/**
 * SACRED MINIGAME & LIVE CONCURRENCY CONTRACT
 * Owner: Leonardo (Task LEO-01) — Shared across Ismael, Abraham, Schoenstadt & Rubén.
 * Never alter field names here without updating docs/10-tecnico.md and running node herramientas/combinar.mjs.
 */

export type RoleType = "finance_launch" | "spacecraft_mass" | "orbit_power" | "science_comms";
export type DifficultyType = "easy" | "medium" | "hard";
export type MissionIdType = "artemis_moon" | "asteroid_hunter" | "mars_sample_return";

export interface LiveMetrics {
  estimated_wet_mass_kg: number;
  remaining_budget_usd: number;
  ufe_reserve_pct: number;
  funding_factor_F: number;       // 0.0 to 1.0 (controls H2 fuel cell spawn rate in Rol 3B)
  fspl_loss_db: number;           // Free-space path loss from orbit (affects Rol 4B)
  cg_balanced: boolean;
  fuel_burn_multiplier: number;   // 1.0 nominal | 1.5 unbalanced CG
  available_power_w: number;
  instruments_mass_kg: number;
  selected_instruments: Array<{ id: string; name: string; mass_kg: number }>;
  required_dv_ms: number;
  has_thermal_protection: boolean;
}

export interface MinigameProps {
  missionId: MissionIdType;
  difficulty: DifficultyType;
  roleId: RoleType;
  wave: 1 | 2;
  timeLeftSec: number;
  liveMetrics: LiveMetrics;
  spectralChallenge?: unknown;
  onLiveMutation: (partialDelta: Record<string, unknown>) => void;
  onSubmitTake: (finalPayload: Record<string, unknown>) => void;
  isLocked: boolean;
}
