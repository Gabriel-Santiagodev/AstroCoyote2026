// Owner: Leonardo (Tasks LEO-01, LEO-08) — Top-level state machine, Socket.IO orchestration
// (docs/08-controles.md) and automatic offline/preview fallback when the backend on :8000 is
// not running, so the full HomeMenu -> Lobby -> Stations -> Flight -> Report loop always works.
import { useCallback, useEffect, useRef, useState } from "react";
import { Starfield } from "./components/paper/Starfield";
import { ROLE_META } from "./components/MinigameShell";
import { DevSandboxView } from "./views/DevSandboxView";
import { Flight60sView, type FlightQuestionUI } from "./views/Flight60sView";
import { HomeMenu } from "./views/HomeMenu";
import {
  ALL_ROLES,
  LAUNCH_LOADING_MS,
  LinearStationTrack,
  resolvePhoneConsole,
  SYNC_DELAY_SEC,
  useIsSmallViewport,
  WALK_DURATION_SEC,
  type StageViewOverride,
} from "./views/LinearStationTrack";
import { LobbyView } from "./views/LobbyView";
import { MissionReportDashboard } from "./views/MissionReportDashboard";
import {
  BACKEND_URL,
  connectWithTimeout,
  gameClient,
  onConnectionChange,
  onServerEvents,
  probeBackend,
  socket,
  type ConnectionStatus,
  type EstadoSalaActualizadoPayload,
  type JugadorBloqueoTomaPayload,
  type PreguntaVuelo60sPayload,
  type ReporteFinalMisionPayload,
  type ResultadoTurnoVueloPayload,
  type RoomPlayer,
} from "./socket";
import type {
  DifficultyType,
  LiveMetrics,
  MissionIdType,
  RoleType,
} from "./types/game";

type ScreenState = "home" | "lobby" | "stations" | "flight" | "report" | "sandbox";
type GameMode = "single" | "multi";

// ---------------------------------------------------------------------------
// Gameplay timing constants (docs/04-juego.md §Vuelo de 60 s; docs/08-controles.md)
// ---------------------------------------------------------------------------
/** Station duration (`iniciar_oleada_*.duration_sec`). */
const STATION_SEC = 30;
/** Flight: 4 rounds x 15 s = 60 s. */
const FLIGHT_ROUNDS = 4;
const FLIGHT_ROUND_SEC = 15;
const FLIGHT_TOTAL_SEC = FLIGHT_ROUNDS * FLIGHT_ROUND_SEC;
/** `resultado_turno_vuelo` feedback is shown ~2 s before the next question (docs/08 §2.B). */
const TURN_FEEDBACK_MS = 2000;

// UI-only timings for the offline preview simulation.
const PREVIEW_PIN = "PREVIEW";
const PREVIEW_PLAYER_NAME = "Commander";
const PREVIEW_AI_LOCK_DELAY_MS = 1200;
const PREVIEW_AI_LOCK_STAGGER_MS = 450;
/** If `sala_creada` does not arrive within this window we fall back to preview mode. */
const ROOM_CREATE_TIMEOUT_MS = 3000;
/** Grace period after t=0 before App force-locks a take the minigame failed to auto-submit. */
const AUTO_LOCK_GRACE_MS = 1500;
/** Launchpad walk + wave2_to_flight loading screen before Flight60sView mounts (UI-only). */
const LAUNCH_TRANSITION_MS = WALK_DURATION_SEC * 1000 + LAUNCH_LOADING_MS;

/** QA switch: `?view=stage` forces the Host Main Stage, `?view=phone` the Phone Crew Console. */
function readStageViewOverride(): StageViewOverride {
  if (typeof window === "undefined") return "auto";
  const view = new URLSearchParams(window.location.search).get("view");
  if (view === "stage" || view === "host") return "host";
  if (view === "phone" || view === "mobile") return "mobile";
  return "auto";
}

// Preview-only defaults (same mock values used by /dev-sandbox; the server overrides them
// with `iniciar_oleada_1.initial_constraints` when online).
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

const PREVIEW_REPORT: ReporteFinalMisionPayload = {
  outcome: "FULL_SUCCESS",
  completion_pct: 100,
  total_score: 910,
  failed_or_degraded_gate: null,
  causal_chain_explanation:
    "Preview report: the backend on :8000 was not reachable, so this run used local placeholder data. Connect Mission Control to get the real causal chain computed by the deterministic 4-node decision tree.",
  nasa_real_world_fact:
    "NASA Artemis I used a Free-Return Trajectory around the Moon and tested Orion's heat shield during 40,000 km/h Earth reentry.",
  role_contributions: ALL_ROLES.map((role) => ({
    role,
    summary: `${ROLE_META[role].label}: preview take locked.`,
    is_ai: false,
  })),
};

/** Qualitative preview questions, one per decision gate (docs/04-juego.md §Rondas 1–4). No NASA figures are invented here. */
const PREVIEW_FLIGHT_QUESTIONS: FlightQuestionUI[] = [
  {
    question_id: "PREVIEW_Q1",
    gate: "NODE_1_LAUNCH",
    assigned_role: "finance_launch",
    title: "Liftoff! Mass margin is tight on the pad.",
    scenario_context:
      "Telemetry shows the wet mass sitting close to the launcher's limit. How does the crew protect the launch?",
    nasa_concept_badge: "Launch mass margin & UFE",
    options: [
      { option_id: "opt_jettison", label: "Jettison non-critical ballast", engineering_tradeoff_hint: "Recovers margin, loses a secondary payload" },
      { option_id: "opt_ufe", label: "Spend UFE reserve on a lighter adapter", engineering_tradeoff_hint: "Keeps payload, burns budget reserve" },
      { option_id: "opt_go", label: "Launch as-is", engineering_tradeoff_hint: "No cost, highest structural risk" },
    ],
  },
  {
    question_id: "PREVIEW_Q2",
    gate: "NODE_2_PROPULSION",
    assigned_role: "orbit_power",
    title: "Orbital insertion burn: vibration alert.",
    scenario_context:
      "The engine reports vibration consistent with an off-center CG. Choose the insertion strategy.",
    nasa_concept_badge: "Tsiolkovsky Δv & CG balance",
    options: [
      { option_id: "opt_compensate", label: "Compensating gimbal burn", engineering_tradeoff_hint: "Steady insertion, extra propellant" },
      { option_id: "opt_aerobrake", label: "Emergency aerobraking passes", engineering_tradeoff_hint: "Saves propellant, needs thermal protection" },
    ],
  },
  {
    question_id: "PREVIEW_Q3",
    gate: "NODE_3_EVENT",
    assigned_role: "spacecraft_mass",
    title: "Space weather event in transit.",
    scenario_context:
      "A radiation storm is forecast across the cruise phase. How does the spacecraft ride it out?",
    nasa_concept_badge: "Safe mode & radiation shielding",
    options: [
      { option_id: "opt_safe", label: "Enter safe mode, pause science", engineering_tradeoff_hint: "Protects electronics, loses data window" },
      { option_id: "opt_battery", label: "Run on battery, keep instruments on", engineering_tradeoff_hint: "Keeps science, drains reserve" },
      { option_id: "opt_shield", label: "Rotate to shield sensitive side", engineering_tradeoff_hint: "Balanced option, needs attitude control" },
    ],
  },
  {
    question_id: "PREVIEW_Q4",
    gate: "NODE_4_DOWNLINK",
    assigned_role: "science_comms",
    title: "Deep Space Network window is closing.",
    scenario_context:
      "The downlink window is shorter than planned. Decide what reaches Earth before the link drops.",
    nasa_concept_badge: "DSN link budget & FSPL",
    options: [
      { option_id: "opt_compress", label: "Compress spectroscopy data", engineering_tradeoff_hint: "Everything fits, slight fidelity loss" },
      { option_id: "opt_prioritize", label: "Send science first, drop context images", engineering_tradeoff_hint: "Full-fidelity science, no imagery" },
      { option_id: "opt_boost", label: "Boost antenna power", engineering_tradeoff_hint: "Faster link, costs power budget" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Normalize roster entries: docs/08 uses `player_id/player_name/role_id`; backend/game_manager.py currently emits `id/name/role`. */
function normalizePlayers(raw: EstadoSalaActualizadoPayload["players"] | undefined): RoomPlayer[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p) => {
    const loose = p as unknown as Record<string, unknown>;
    return {
      player_id: String(loose.player_id ?? loose.id ?? ""),
      player_name: String(loose.player_name ?? loose.name ?? "Crewmate"),
      role_id: (loose.role_id ?? loose.role ?? null) as RoleType | null,
      is_host: Boolean(loose.is_host ?? loose.host ?? false),
    };
  });
}

function mergeMetrics(prev: LiveMetrics, delta: Partial<LiveMetrics> | Record<string, unknown>): LiveMetrics {
  const next: LiveMetrics = { ...prev };
  for (const key of Object.keys(prev) as Array<keyof LiveMetrics>) {
    const value = (delta as Record<string, unknown>)[key];
    if (value !== undefined && value !== null) {
      (next as unknown as Record<string, unknown>)[key] = value;
    }
  }
  return next;
}

export function App() {
  const isSandboxUrl =
    typeof window !== "undefined" && window.location.pathname.startsWith("/dev-sandbox");

  // --- Connection ------------------------------------------------------------
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("checking");
  const [notice, setNotice] = useState<string | null>(null);
  const isOnline = connectionStatus === "online";

  // --- Navigation & lobby ----------------------------------------------------
  const [screen, setScreen] = useState<ScreenState>(isSandboxUrl ? "sandbox" : "home");
  const [mode, setMode] = useState<GameMode>("single");
  const [role, setRole] = useState<RoleType>("finance_launch");
  const [mission, setMission] = useState<MissionIdType>("artemis_moon");
  const [difficulty, setDifficulty] = useState<DifficultyType>("easy");
  const [pin, setPin] = useState<string>(PREVIEW_PIN);
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>(PREVIEW_PLAYER_NAME);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [takenRoles, setTakenRoles] = useState<RoleType[]>([]);
  const [isHost, setIsHost] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // --- Stations --------------------------------------------------------------
  const [matchId, setMatchId] = useState(0);
  const [wave, setWave] = useState<1 | 2>(1);
  const [stationDuration, setStationDuration] = useState(STATION_SEC);
  const [syncDelay, setSyncDelay] = useState(SYNC_DELAY_SEC);
  const [stationTimeLeft, setStationTimeLeft] = useState(STATION_SEC);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedTakes, setLockedTakes] = useState<JugadorBloqueoTomaPayload[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>(DEFAULT_METRICS);
  const [toastAlert, setToastAlert] = useState<string | null>(null);
  const [spectralChallenge, setSpectralChallenge] = useState<unknown>(undefined);
  const [awaitingLaunch, setAwaitingLaunch] = useState(false);

  // --- Flight ----------------------------------------------------------------
  const [flightRound, setFlightRound] = useState(1);
  const [flightQuestion, setFlightQuestion] = useState<FlightQuestionUI | null>(null);
  const [flightTimeLeft, setFlightTimeLeft] = useState(FLIGHT_ROUND_SEC);
  const [globalFlightLeft, setGlobalFlightLeft] = useState(FLIGHT_TOTAL_SEC);
  const [activePlayerName, setActivePlayerName] = useState<string | undefined>(undefined);
  const [rocketHealthPct, setRocketHealthPct] = useState<number | undefined>(undefined);
  const [lastTurnResult, setLastTurnResult] = useState<ResultadoTurnoVueloPayload | null>(null);
  const [report, setReport] = useState<ReporteFinalMisionPayload | null>(null);

  // --- Refs for socket handlers / timers --------------------------------------
  const stationTimer = useRef<number | null>(null);
  const flightTimer = useRef<number | null>(null);
  const globalFlightTimer = useRef<number | null>(null);
  const previewTimers = useRef<number[]>([]);
  const roomCreateTimer = useRef<number | null>(null);
  // Online launch transition: hold the first flight question until the loading screen ends.
  const launchTimer = useRef<number | null>(null);
  const launchPending = useRef(false);
  const pendingFlightQuestion = useRef<PreguntaVuelo60sPayload | null>(null);
  const pendingFlightTotalSec = useRef<number>(FLIGHT_TOTAL_SEC);

  // --- Host Main Stage vs Phone Crew Console --------------------------------
  const [stageViewOverride] = useState<StageViewOverride>(readStageViewOverride);
  const isSmallViewport = useIsSmallViewport();
  const isPhoneConsole = resolvePhoneConsole({ isSmallViewport, mode, isHost, override: stageViewOverride });
  const latest = useRef({ role, mode, pin, playerId, playerName, wave, isLocked, mission, difficulty, isOnline, players, screen });
  latest.current = { role, mode, pin, playerId, playerName, wave, isLocked, mission, difficulty, isOnline, players, screen };

  const clearTimer = (ref: { current: number | null }) => {
    if (ref.current !== null) {
      window.clearInterval(ref.current);
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  };
  const clearPreviewTimers = () => {
    previewTimers.current.forEach((t) => window.clearTimeout(t));
    previewTimers.current = [];
  };
  const schedulePreview = (fn: () => void, delayMs: number) => {
    const id = window.setTimeout(fn, delayMs);
    previewTimers.current.push(id);
    return id;
  };

  const pushToast = useCallback((text: string) => {
    // Reset first so an identical message still re-triggers the MinigameShell toast effect.
    setToastAlert(null);
    window.setTimeout(() => setToastAlert(text), 0);
  }, []);

  const startStationTimer = useCallback((durationSec: number) => {
    clearTimer(stationTimer);
    setStationTimeLeft(durationSec);
    stationTimer.current = window.setInterval(() => {
      setStationTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer(stationTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startFlightRoundTimer = useCallback((durationSec: number) => {
    clearTimer(flightTimer);
    setFlightTimeLeft(durationSec);
    flightTimer.current = window.setInterval(() => {
      setFlightTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer(flightTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startGlobalFlightTimer = useCallback((totalSec: number) => {
    clearTimer(globalFlightTimer);
    setGlobalFlightLeft(totalSec);
    globalFlightTimer.current = window.setInterval(() => {
      setGlobalFlightLeft((prev) => {
        if (prev <= 1) {
          clearTimer(globalFlightTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const resetMatchState = useCallback(() => {
    clearTimer(stationTimer);
    clearTimer(flightTimer);
    clearTimer(globalFlightTimer);
    clearTimer(launchTimer);
    launchPending.current = false;
    pendingFlightQuestion.current = null;
    clearPreviewTimers();
    setWave(1);
    setStationDuration(STATION_SEC);
    setSyncDelay(SYNC_DELAY_SEC);
    setStationTimeLeft(STATION_SEC);
    setIsLocked(false);
    setLockedTakes([]);
    setLiveMetrics(DEFAULT_METRICS);
    setToastAlert(null);
    setSpectralChallenge(undefined);
    setAwaitingLaunch(false);
    setFlightRound(1);
    setFlightQuestion(null);
    setFlightTimeLeft(FLIGHT_ROUND_SEC);
    setGlobalFlightLeft(FLIGHT_TOTAL_SEC);
    setActivePlayerName(undefined);
    setRocketHealthPct(undefined);
    setLastTurnResult(null);
    setReport(null);
    setMatchId((m) => m + 1);
  }, []);

  // ---------------------------------------------------------------------------
  // Backend probe: `/health` + socket handshake -> online, otherwise preview mode.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const healthy = await probeBackend();
      if (cancelled) return;
      if (!healthy) {
        setConnectionStatus("offline");
        return;
      }
      const connected = await connectWithTimeout();
      if (!cancelled) setConnectionStatus(connected ? "online" : "offline");
    })();
    const off = onConnectionChange((status) => {
      setConnectionStatus((prev) => (prev === "checking" && status === "offline" ? prev : status));
    });
    return () => {
      cancelled = true;
      off();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Server -> Client events (docs/08-controles.md §2.B)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const off = onServerEvents({
      sala_creada: ({ pin: newPin, player_id }) => {
        clearTimer(roomCreateTimer);
        setIsCreatingRoom(false);
        setPin(newPin);
        setPlayerId(player_id);
        setIsHost(true);
        setScreen("lobby");
        const { role: r, mission: m, difficulty: d } = latest.current;
        gameClient.selectRoleMission({ pin: newPin, player_id, role_id: r, mission_id: m, difficulty: d });
      },
      estado_sala_actualizado: (payload) => {
        const roster = normalizePlayers(payload.players);
        setPlayers(roster);
        setTakenRoles(Array.isArray(payload.taken_roles) ? payload.taken_roles : []);
        if (payload.mission_id) setMission(payload.mission_id);
        if (payload.difficulty) setDifficulty(payload.difficulty);
        if (payload.pin) setPin(payload.pin);
        // Guests (`unirse_sala`) get no `sala_creada`; resolve our player_id by name and enter the lobby.
        const { playerId: myId, playerName: myName, screen: current } = latest.current;
        if (!myId) {
          const mine = [...roster].reverse().find((p) => p.player_name === myName);
          if (mine) setPlayerId(mine.player_id);
        }
        if (current === "home") {
          clearTimer(roomCreateTimer);
          setIsCreatingRoom(false);
          setScreen("lobby");
        }
      },
      iniciar_oleada_1: (payload) => {
        resetMatchState();
        setStationDuration(payload.duration_sec || STATION_SEC);
        setLiveMetrics((prev) => mergeMetrics(prev, payload.initial_constraints || {}));
        setSpectralChallenge(payload.spectral_challenge);
        setWave(1);
        setScreen("stations");
      },
      mutacion_en_vivo: ({ source_role, live_metrics, toast_alert }) => {
        setLiveMetrics((prev) => mergeMetrics(prev, live_metrics || {}));
        if (toast_alert) {
          pushToast(toast_alert);
        } else if (source_role && source_role !== latest.current.role && source_role in ROLE_META) {
          pushToast(`${ROLE_META[source_role as RoleType].label} updated the shared constraints`);
        }
      },
      jugador_bloqueo_toma: (payload) => {
        setLockedTakes((prev) =>
          prev.some((t) => t.role_id === payload.role_id && t.wave === payload.wave) ? prev : [...prev, payload]
        );
      },
      iniciar_oleada_2: (payload) => {
        clearTimer(stationTimer);
        setSyncDelay(payload.sync_delay_sec || SYNC_DELAY_SEC);
        setStationDuration(payload.duration_sec || STATION_SEC);
        setLiveMetrics((prev) => mergeMetrics(prev, payload.consolidated_wave1 || {}));
        setSpectralChallenge(payload.spectral_challenge);
        setIsLocked(false);
        setWave(2);
      },
      iniciar_vuelo_60s: (payload) => {
        clearTimer(stationTimer);
        setFlightQuestion(null);
        setFlightRound(1);
        const totalSec = payload.total_duration_sec || FLIGHT_TOTAL_SEC;
        if (latest.current.screen !== "stations") {
          setAwaitingLaunch(false);
          startGlobalFlightTimer(totalSec);
          setScreen("flight");
          return;
        }
        // From the station track: walk to the launchpad + wave2_to_flight loading screen first.
        // The first `pregunta_vuelo_60s` is buffered so its 15 s timer starts on the flight screen.
        launchPending.current = true;
        pendingFlightTotalSec.current = totalSec;
        setAwaitingLaunch(true);
        clearTimer(launchTimer);
        launchTimer.current = window.setTimeout(() => {
          launchTimer.current = null;
          launchPending.current = false;
          setAwaitingLaunch(false);
          startGlobalFlightTimer(pendingFlightTotalSec.current);
          const queued = pendingFlightQuestion.current;
          pendingFlightQuestion.current = null;
          if (queued) {
            setFlightRound(queued.round);
            setFlightQuestion(queued.question);
            setActivePlayerName(queued.active_player_name);
            setLastTurnResult(null);
            startFlightRoundTimer(queued.duration_sec || FLIGHT_ROUND_SEC);
          }
          setScreen("flight");
        }, LAUNCH_TRANSITION_MS);
      },
      pregunta_vuelo_60s: (payload) => {
        if (launchPending.current) {
          pendingFlightQuestion.current = payload;
          return;
        }
        setFlightRound(payload.round);
        setFlightQuestion(payload.question);
        setActivePlayerName(payload.active_player_name);
        setLastTurnResult(null);
        startFlightRoundTimer(payload.duration_sec || FLIGHT_ROUND_SEC);
        setScreen("flight");
      },
      resultado_turno_vuelo: (payload) => {
        setLastTurnResult(payload);
        if (typeof payload.rocket_health_pct === "number") setRocketHealthPct(payload.rocket_health_pct);
      },
      reporte_final_mision: (payload) => {
        clearTimer(flightTimer);
        clearTimer(globalFlightTimer);
        setReport(payload);
        setScreen("report");
      },
    });
    // Backend-only room error (emitted by backend/game_manager.py, pending addition to docs/08).
    const onRoomError = (payload: { message?: string }) => {
      clearTimer(roomCreateTimer);
      setIsCreatingRoom(false);
      setNotice(payload?.message || "Room error");
    };
    socket.on("error_sala", onRoomError);
    return () => {
      off();
      socket.off("error_sala", onRoomError);
    };
  }, [pushToast, resetMatchState, startFlightRoundTimer, startGlobalFlightTimer]);

  // Cleanup every timer on unmount.
  useEffect(
    () => () => {
      clearTimer(stationTimer);
      clearTimer(flightTimer);
      clearTimer(globalFlightTimer);
      clearTimer(roomCreateTimer);
      clearTimer(launchTimer);
      clearPreviewTimers();
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Preview (offline) simulation helpers
  // ---------------------------------------------------------------------------
  const enterPreviewLobby = useCallback(() => {
    const { role: r, playerName: name } = latest.current;
    setPin(PREVIEW_PIN);
    setPlayerId("preview-host");
    setIsHost(true);
    setPlayers([{ player_id: "preview-host", player_name: name, role_id: r, is_host: true }]);
    setTakenRoles([r]);
    setScreen("lobby");
  }, []);

  const showPreviewReport = useCallback(() => {
    clearTimer(flightTimer);
    clearTimer(globalFlightTimer);
    setReport(PREVIEW_REPORT);
    setScreen("report");
  }, []);

  const showPreviewQuestion = useCallback(
    (index: number) => {
      const base = PREVIEW_FLIGHT_QUESTIONS[index];
      if (!base) {
        showPreviewReport();
        return;
      }
      setFlightRound(index + 1);
      setLastTurnResult(null);
      // Singleplayer answers every round (docs/04-juego.md): assign each preview turn to the local role.
      setFlightQuestion({ ...base, assigned_role: latest.current.role });
      startFlightRoundTimer(FLIGHT_ROUND_SEC);
    },
    [showPreviewReport, startFlightRoundTimer]
  );

  const startPreviewFlight = useCallback(() => {
    setAwaitingLaunch(false);
    setScreen("flight");
    startGlobalFlightTimer(FLIGHT_TOTAL_SEC);
    showPreviewQuestion(0);
  }, [showPreviewQuestion, startGlobalFlightTimer]);

  const startPreviewMatch = useCallback(() => {
    resetMatchState();
    setScreen("stations");
  }, [resetMatchState]);

  // ---------------------------------------------------------------------------
  // Player actions
  // ---------------------------------------------------------------------------
  const armRoomTimeout = () => {
    clearTimer(roomCreateTimer);
    roomCreateTimer.current = window.setTimeout(() => {
      setIsCreatingRoom(false);
      setNotice("Mission Control did not answer. Continuing in preview mode.");
      setConnectionStatus("offline");
      enterPreviewLobby();
    }, ROOM_CREATE_TIMEOUT_MS);
  };

  /** `crear_sala` (host / singleplayer). Falls back to the preview lobby when offline. */
  const handleCreateRoom = (m: GameMode, hostName?: string) => {
    setMode(m);
    setNotice(null);
    if (hostName && hostName.trim()) setPlayerName(hostName.trim());
    if (!isOnline) {
      enterPreviewLobby();
      return;
    }
    setIsCreatingRoom(true);
    gameClient.createRoom({ mode: m, host_name: (hostName && hostName.trim()) || playerName });
    armRoomTimeout();
  };

  /** `unirse_sala` from a phone / second player. Guests never host the room. */
  const handleJoinWithPin = (joinPin: string, name: string) => {
    const cleanPin = joinPin.trim().toUpperCase();
    setMode("multi");
    setNotice(null);
    if (name && name.trim()) setPlayerName(name.trim());
    if (!isOnline) {
      enterPreviewLobby();
      return;
    }
    setPin(cleanPin);
    setIsHost(false);
    setIsCreatingRoom(true);
    gameClient.joinRoom({ pin: cleanPin, player_name: (name && name.trim()) || playerName });
    armRoomTimeout();
  };

  const handleChangeRole = (r: RoleType) => {
    setRole(r);
    setPlayers((prev) => prev.map((p) => (p.player_id === playerId ? { ...p, role_id: r } : p)));
    if (!isOnline) setTakenRoles([r]);
    if (isOnline && playerId) gameClient.selectRoleMission({ pin, player_id: playerId, role_id: r });
  };

  const handleBackToHome = () => {
    clearTimer(roomCreateTimer);
    setIsCreatingRoom(false);
    resetMatchState();
    setPlayers([]);
    setTakenRoles([]);
    setPlayerId("");
    setIsHost(true);
    setScreen("home");
  };
  const handleChangeMission = (m: MissionIdType) => {
    setMission(m);
    if (isOnline && playerId) gameClient.selectRoleMission({ pin, player_id: playerId, mission_id: m });
  };
  const handleChangeDifficulty = (d: DifficultyType) => {
    setDifficulty(d);
    if (isOnline && playerId) gameClient.selectRoleMission({ pin, player_id: playerId, difficulty: d });
  };

  const handleLaunchMission = () => {
    if (isOnline && playerId) {
      gameClient.selectRoleMission({ pin, player_id: playerId, role_id: role, mission_id: mission, difficulty });
      gameClient.startGame({ pin });
      return;
    }
    startPreviewMatch();
  };

  const handleStationOpened = useCallback(
    (openedWave: 1 | 2) => {
      setIsLocked(false);
      startStationTimer(openedWave === 1 ? stationDuration : stationDuration);
    },
    [startStationTimer, stationDuration]
  );

  const handleLiveMutation = useCallback((delta: Record<string, unknown>) => {
    setLiveMetrics((prev) => mergeMetrics(prev, delta));
    const { isOnline: online, pin: p, role: r, wave: w } = latest.current;
    if (online) gameClient.sendPartialAction({ pin: p, role_id: r, wave: w, partial_delta: delta });
  }, []);

  const handleSubmitTake = useCallback(
    (payload: Record<string, unknown>) => {
      const { isOnline: online, pin: p, role: r, wave: w, isLocked: locked } = latest.current;
      if (locked) return;
      setIsLocked(true);
      clearTimer(stationTimer);
      setLockedTakes((prev) =>
        prev.some((t) => t.role_id === r && t.wave === w) ? prev : [...prev, { role_id: r, wave: w }]
      );
      if (online) {
        gameClient.lockTake({ pin: p, role_id: r, wave: w, payload });
        return;
      }
      // Offline preview: AI Autopilot locks the other three roles, then the match advances.
      const others = ALL_ROLES.filter((x) => x !== r);
      others.forEach((aiRole, i) => {
        schedulePreview(() => {
          setLockedTakes((prev) => [...prev, { role_id: aiRole, wave: w }]);
          pushToast(`AI Autopilot locked ${ROLE_META[aiRole].label}`);
        }, PREVIEW_AI_LOCK_DELAY_MS + i * PREVIEW_AI_LOCK_STAGGER_MS);
      });
      const afterAi = PREVIEW_AI_LOCK_DELAY_MS + others.length * PREVIEW_AI_LOCK_STAGGER_MS;
      if (w === 1) {
        schedulePreview(() => {
          setIsLocked(false);
          setWave(2);
        }, afterAi);
      } else {
        schedulePreview(() => setAwaitingLaunch(true), afterAi);
        schedulePreview(() => startPreviewFlight(), afterAi + LAUNCH_TRANSITION_MS);
      }
    },
    [pushToast, startPreviewFlight]
  );

  // Safety net: if a minigame did not auto-submit at t=0 (or crashed), lock a fallback take.
  useEffect(() => {
    if (screen !== "stations" || isLocked || stationTimeLeft > 0 || awaitingLaunch) return;
    const t = window.setTimeout(() => handleSubmitTake({}), AUTO_LOCK_GRACE_MS);
    return () => window.clearTimeout(t);
  }, [screen, isLocked, stationTimeLeft, awaitingLaunch, handleSubmitTake]);

  const handleAnswerOption = useCallback(
    (questionId: string, optionId: string) => {
      clearTimer(flightTimer);
      const { isOnline: online, pin: p } = latest.current;
      if (online) {
        gameClient.answerFlightTurn({ pin: p, question_id: questionId, option_id: optionId });
        return;
      }
      const idx = PREVIEW_FLIGHT_QUESTIONS.findIndex((q) => q.question_id === questionId);
      const round = idx + 1;
      setLastTurnResult({
        round,
        chosen_option: optionId,
        immediate_feedback: "Decision logged (preview). Mission Control would apply the physics here.",
        rocket_health_pct: 100,
        gate_status: "PASS",
      });
      schedulePreview(() => {
        if (round >= FLIGHT_ROUNDS) showPreviewReport();
        else showPreviewQuestion(idx + 1);
      }, TURN_FEEDBACK_MS);
    },
    [showPreviewQuestion, showPreviewReport]
  );

  // Preview-only: when the 15 s round expires with no answer, auto-pick the first option.
  useEffect(() => {
    if (screen !== "flight" || isOnline || !flightQuestion || flightTimeLeft > 0) return;
    const first = flightQuestion.options[0];
    if (first) handleAnswerOption(flightQuestion.question_id, first.option_id);
  }, [screen, isOnline, flightQuestion, flightTimeLeft, handleAnswerOption]);

  const handleRetry = () => {
    if (isOnline && playerId) gameClient.restartGame({ pin });
    resetMatchState();
    setScreen("lobby");
  };

  // Singleplayer (or a lone human in the room) answers every flight round.
  const humanCount = players.filter((p) => p.player_id).length;
  const flightQuestionForMe: FlightQuestionUI | null =
    flightQuestion && (mode === "single" || humanCount <= 1)
      ? { ...flightQuestion, assigned_role: role }
      : flightQuestion;

  // Host Main Stage flag for Flight60sView (Codex adds `isHostStage?` per STATE.md contract).
  // Passed as a spread so this compiles both before and after that optional prop lands.
  const flightStageProps: { isHostStage?: boolean } = { isHostStage: !isPhoneConsole };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      <Starfield />

      {screen === "sandbox" && <DevSandboxView onExitSandbox={() => setScreen("home")} />}

      {screen === "home" && (
        <HomeMenu
          onSelectMode={(m) => handleCreateRoom(m)}
          onCreateRoom={handleCreateRoom}
          onJoinWithPin={handleJoinWithPin}
          onOpenSandbox={() => setScreen("sandbox")}
          isConnecting={isCreatingRoom}
          connectionError={notice}
          connectionStatus={connectionStatus}
        />
      )}

      {screen === "lobby" && (
        <LobbyView
          pin={pin}
          mode={mode}
          selectedRole={role}
          selectedMission={mission}
          difficulty={difficulty}
          onChangeRole={handleChangeRole}
          onChangeMission={handleChangeMission}
          onChangeDifficulty={handleChangeDifficulty}
          onLaunchMission={handleLaunchMission}
          players={players}
          takenRoles={takenRoles}
          isHost={isHost}
          playerName={playerName}
          onBackToHome={handleBackToHome}
        />
      )}

      {screen === "stations" && (
        <LinearStationTrack
          key={matchId}
          missionId={mission}
          difficulty={difficulty}
          roleId={role}
          wave={wave}
          timeLeftSec={stationTimeLeft}
          liveMetrics={liveMetrics}
          isLocked={isLocked}
          toastAlert={toastAlert}
          spectralChallenge={spectralChallenge}
          onLiveMutation={handleLiveMutation}
          onSubmitTake={handleSubmitTake}
          players={players}
          lockedTakes={lockedTakes}
          syncDelaySec={syncDelay}
          stationDurationSec={stationDuration}
          awaitingLaunch={awaitingLaunch}
          onStationOpened={handleStationOpened}
          connectionStatus={connectionStatus}
          playerName={playerName}
          isHost={isHost}
          mode={mode}
          stageViewOverride={stageViewOverride}
        />
      )}

      {screen === "flight" && (
        <Flight60sView
          {...flightStageProps}
          round={flightRound}
          timeLeftSec={flightTimeLeft}
          myRole={role}
          question={flightQuestionForMe}
          onAnswerOption={handleAnswerOption}
          activePlayerName={activePlayerName}
          globalTimeLeftSec={globalFlightLeft}
          rocketHealthPct={rocketHealthPct}
          lastTurnResult={lastTurnResult}
          missionId={mission}
        />
      )}

      {screen === "report" && report && (
        <MissionReportDashboard
          report={report}
          onRetry={handleRetry}
          roleContributions={report.role_contributions}
        />
      )}

      {/* Connection pill (all screens except the sandbox) */}
      {screen !== "sandbox" && (
        <div className="pointer-events-none fixed bottom-3 left-3 z-40 flex max-w-[92vw] flex-col gap-1">
          {notice && (
            <div className="pointer-events-auto rounded-lg border-2 border-ink-black bg-status-crit px-2.5 py-1 font-mono text-[11px] font-bold text-ink-black shadow-paper">
              {notice}
            </div>
          )}
          <div
            className={`rounded-lg border-2 border-ink-black px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider shadow-paper ${
              connectionStatus === "online"
                ? "bg-status-ok text-ink-black"
                : connectionStatus === "offline"
                ? "bg-status-warn text-ink-black"
                : "bg-blueprint-navy text-slate-200"
            }`}
            title={BACKEND_URL}
          >
            {isCreatingRoom
              ? "Creating room…"
              : connectionStatus === "online"
              ? "Mission Control online"
              : connectionStatus === "offline"
              ? "Preview mode · backend offline"
              : "Contacting Mission Control…"}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
