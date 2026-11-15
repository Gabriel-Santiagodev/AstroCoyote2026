// Owner: Leonardo (Tasks LEO-05, LEO-08, LEO-09) — Linear station track (Station 1 -> Sync -> Station 2)
import type { ComponentType } from "react";
import { MinigameShell } from "../components/MinigameShell";
import { CrewmateAvatar } from "../components/paper/CrewmateAvatar";
import { ResourceHUD } from "../components/paper/ResourceHUD";
import { Rol1A_BudgetTable } from "../components/minigames/Rol1A_BudgetTable";
import { Rol1B_LauncherAuction } from "../components/minigames/Rol1B_LauncherAuction";
import { Rol2A_TopologicalAssembly } from "../components/minigames/Rol2A_TopologicalAssembly";
import { Rol2B_MassBalanceTask } from "../components/minigames/Rol2B_MassBalanceTask";
import { Rol3A_OrbitalSniper } from "../components/minigames/Rol3A_OrbitalSniper";
import { Rol3B_AstroLogistics3D } from "../components/minigames/Rol3B_AstroLogistics3D";
import { Rol4A_SpectralLabTask } from "../components/minigames/Rol4A_SpectralLabTask";
import { Rol4B_CommsSpectralHacker } from "../components/minigames/Rol4B_CommsSpectralHacker";
import type {
  DifficultyType,
  LiveMetrics,
  MinigameProps,
  MissionIdType,
  RoleType,
} from "../types/game";

interface LinearStationTrackProps {
  missionId: MissionIdType;
  difficulty: DifficultyType;
  roleId: RoleType;
  wave: 1 | 2;
  timeLeftSec: number;
  liveMetrics: LiveMetrics;
  isLocked: boolean;
  toastAlert?: string | null;
  onLiveMutation: (partialDelta: Record<string, unknown>) => void;
  onSubmitTake: (finalPayload: Record<string, unknown>) => void;
}

const WAVE1_MAP: Record<RoleType, ComponentType<MinigameProps>> = {
  finance_launch: Rol1A_BudgetTable,
  spacecraft_mass: Rol2A_TopologicalAssembly,
  orbit_power: Rol3A_OrbitalSniper,
  science_comms: Rol4A_SpectralLabTask,
};

const WAVE2_MAP: Record<RoleType, ComponentType<MinigameProps>> = {
  finance_launch: Rol1B_LauncherAuction,
  spacecraft_mass: Rol2B_MassBalanceTask,
  orbit_power: Rol3B_AstroLogistics3D,
  science_comms: Rol4B_CommsSpectralHacker,
};

export function LinearStationTrack(props: LinearStationTrackProps) {
  const ActiveMinigame =
    props.wave === 1 ? WAVE1_MAP[props.roleId] : WAVE2_MAP[props.roleId];

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
      <ResourceHUD liveMetrics={props.liveMetrics} />

      <div className="paper-card flex items-center justify-between gap-2 overflow-x-auto px-5 py-3 font-mono text-xs">
        <span className="text-slate-400">[BASE]</span>
        <span className="text-slate-500">───▶</span>
        <span className={props.wave === 1 ? "font-bold text-status-ok" : "text-slate-400"}>
          [STATION 1: DESIGN]
        </span>
        <span className="text-slate-500">───▶</span>
        <CrewmateAvatar role={props.roleId} state="walk" size={44} />
        <span className="text-slate-500">───▶</span>
        <span className={props.wave === 2 ? "font-bold text-status-ok" : "text-slate-400"}>
          [STATION 2: INTEGRATION]
        </span>
        <span className="text-slate-500">───▶</span>
        <span className="text-slate-400">[60S FLIGHT]</span>
      </div>

      <MinigameShell
        roleId={props.roleId}
        wave={props.wave}
        timeLeftSec={props.timeLeftSec}
        isLocked={props.isLocked}
        toastAlert={props.toastAlert}
      >
        <ActiveMinigame
          missionId={props.missionId}
          difficulty={props.difficulty}
          roleId={props.roleId}
          wave={props.wave}
          timeLeftSec={props.timeLeftSec}
          liveMetrics={props.liveMetrics}
          onLiveMutation={props.onLiveMutation}
          onSubmitTake={props.onSubmitTake}
          isLocked={props.isLocked}
        />
      </MinigameShell>
    </main>
  );
}

export default LinearStationTrack;
