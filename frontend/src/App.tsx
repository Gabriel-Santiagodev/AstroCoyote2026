// Owner: Leonardo (Task LEO-01) — Top-level state machine & /dev-sandbox router
import { useState } from "react";
import { Starfield } from "./components/paper/Starfield";
import { DevSandboxView } from "./views/DevSandboxView";
import { Flight60sView } from "./views/Flight60sView";
import { HomeMenu } from "./views/HomeMenu";
import { LinearStationTrack } from "./views/LinearStationTrack";
import { LobbyView } from "./views/LobbyView";
import {
  MissionReportDashboard,
  type MissionOutcomeUI,
} from "./views/MissionReportDashboard";
import type {
  DifficultyType,
  LiveMetrics,
  MissionIdType,
  RoleType,
} from "./types/game";

type ScreenState = "home" | "lobby" | "stations" | "flight" | "report" | "sandbox";

const DEFAULT_METRICS: LiveMetrics = {
  estimated_wet_mass_kg: 1850,
  remaining_budget_usd: 800_000_000,
  ufe_reserve_pct: 25,
  funding_factor_F: 0.65,
  fspl_loss_db: 166.0,
  cg_balanced: true,
  fuel_burn_multiplier: 1.0,
  available_power_w: 750,
  instruments_mass_kg: 68,
  selected_instruments: [],
  required_dv_ms: 1803.6,
  has_thermal_protection: true,
};

const SAMPLE_REPORT: MissionOutcomeUI = {
  outcome: "FULL_SUCCESS",
  completion_pct: 100,
  total_score: 910,
  failed_or_degraded_gate: null,
  causal_chain_explanation:
    "Stub report ready for Socket.IO connection. All 4 Decision Tree gates passed in preview mode.",
  nasa_real_world_fact:
    "NASA Artemis I used a Free-Return Trajectory around the Moon and tested Orion's heat shield during 40,000 km/h Earth reentry.",
};

export function App() {
  const isSandboxUrl =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/dev-sandbox");

  const [screen, setScreen] = useState<ScreenState>(
    isSandboxUrl ? "sandbox" : "home"
  );
  const [mode, setMode] = useState<"single" | "multi">("single");
  const [role, setRole] = useState<RoleType>("finance_launch");
  const [mission, setMission] = useState<MissionIdType>("artemis_moon");
  const [difficulty, setDifficulty] = useState<DifficultyType>("easy");
  const [wave, setWave] = useState<1 | 2>(1);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>(DEFAULT_METRICS);

  return (
    <>
      <Starfield />
      {screen === "sandbox" && (
        <DevSandboxView onExitSandbox={() => setScreen("home")} />
      )}
      {screen === "home" && (
        <HomeMenu
          onSelectMode={(m) => {
            setMode(m);
            setScreen("lobby");
          }}
          onOpenSandbox={() => setScreen("sandbox")}
        />
      )}
      {screen === "lobby" && (
        <LobbyView
          pin="MARS26"
          mode={mode}
          selectedRole={role}
          selectedMission={mission}
          difficulty={difficulty}
          onChangeRole={setRole}
          onChangeMission={setMission}
          onChangeDifficulty={setDifficulty}
          onLaunchMission={() => {
            setWave(1);
            setScreen("stations");
          }}
        />
      )}
      {screen === "stations" && (
        <LinearStationTrack
          missionId={mission}
          difficulty={difficulty}
          roleId={role}
          wave={wave}
          timeLeftSec={30}
          liveMetrics={liveMetrics}
          isLocked={false}
          onLiveMutation={(delta) =>
            setLiveMetrics((prev) => ({ ...prev, ...delta } as LiveMetrics))
          }
          onSubmitTake={() => {
            if (wave === 1) {
              setWave(2);
            } else {
              setScreen("flight");
            }
          }}
        />
      )}
      {screen === "flight" && (
        <Flight60sView
          round={1}
          timeLeftSec={15}
          myRole={role}
          question={{
            question_id: "PREVIEW_Q1",
            gate: "NODE_1_LAUNCH",
            assigned_role: role,
            title: "Nominal Liftoff! Rocket clears tower.",
            scenario_context:
              "How should second-stage burn optimize remaining propellant before orbital insertion?",
            nasa_concept_badge: "WGS84 & Tsiolkovsky Staging",
            options: [
              {
                option_id: "opt_a",
                label: "Optimal Burn Profile",
                engineering_tradeoff_hint: "Saves propellant margin",
              },
              {
                option_id: "opt_b",
                label: "Direct Fast Burn",
                engineering_tradeoff_hint: "Faster insertion, higher mass burn",
              },
            ],
          }}
          onAnswerOption={() => setScreen("report")}
        />
      )}
      {screen === "report" && (
        <MissionReportDashboard
          report={SAMPLE_REPORT}
          onRetry={() => setScreen("lobby")}
        />
      )}
    </>
  );
}

export default App;
