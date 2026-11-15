// Owner: Leonardo / Rubén (Task LEO-01) — Centralized, typed Socket.IO client.
// Event names and payloads mirror docs/08-controles.md exactly. Never rename an event here
// without updating that document first and running `node herramientas/combinar.mjs`.
import { io, Socket } from "socket.io-client";
import type {
  DifficultyType,
  LiveMetrics,
  MissionIdType,
  RoleType,
} from "./types/game";
import type { FlightQuestionUI } from "./views/Flight60sView";
import type { MissionOutcomeUI } from "./views/MissionReportDashboard";

// ---------------------------------------------------------------------------
// Connection URL — works on localhost and from phones on the same LAN.
// ---------------------------------------------------------------------------
const defaultHost =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

/** Backend FastAPI + python-socketio port (docs/10-tecnico.md). */
export const BACKEND_PORT = 8000;

/**
 * Default = same origin: the Vite dev/preview server proxies `/socket.io` and `/health` to the
 * backend (vite.config.ts), so phones on the LAN only need the frontend port. A separately
 * hosted backend (deploy) sets VITE_BACKEND_URL; `http://host:8000` stays as the no-window fallback.
 */
export const BACKEND_URL: string =
  (import.meta as { env?: Record<string, string> }).env?.VITE_BACKEND_URL ||
  (typeof window !== "undefined" ? window.location.origin : `http://${defaultHost}:${BACKEND_PORT}`);

/** How long we wait for `/health` or the socket handshake before declaring offline/preview mode. */
export const BACKEND_PROBE_TIMEOUT_MS = 2500;

export const socket: Socket = io(BACKEND_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: BACKEND_PROBE_TIMEOUT_MS,
});

// ---------------------------------------------------------------------------
// Shared payload fragments
// ---------------------------------------------------------------------------
export type GameMode = "single" | "multi";
export type WaveNumber = 1 | 2;
export type FlightGate =
  | "NODE_1_LAUNCH"
  | "NODE_2_PROPULSION"
  | "NODE_3_EVENT"
  | "NODE_4_DOWNLINK";
export type GateStatus = "PASS" | "DEGRADED" | "CRITICAL";

export interface RoomPlayer {
  player_id: string;
  player_name: string;
  role_id?: RoleType | null;
  is_host?: boolean;
}

export interface RoleContribution {
  role: RoleType;
  summary: string;
  is_ai?: boolean;
}

// ---------------------------------------------------------------------------
// A. Client -> Server payloads (`emit`)
// ---------------------------------------------------------------------------
export interface CrearSalaPayload {
  mode: GameMode;
  host_name: string;
}
export interface UnirseSalaPayload {
  pin: string;
  player_name: string;
}
export interface SeleccionarRolMisionPayload {
  pin: string;
  player_id: string;
  role_id?: RoleType;
  mission_id?: MissionIdType;
  difficulty?: DifficultyType;
}
export interface IniciarPartidaPayload {
  pin: string;
}
export interface AccionParcialMinijuegoPayload {
  pin: string;
  role_id: RoleType;
  wave: WaveNumber;
  partial_delta: Record<string, unknown>;
}
export interface BloquearTomaMinijuegoPayload {
  pin: string;
  role_id: RoleType;
  wave: WaveNumber;
  payload: Record<string, unknown>;
}
export interface RespuestaTurnoVueloPayload {
  pin: string;
  question_id: string;
  option_id: string;
}
export interface ReiniciarPartidaPayload {
  pin: string;
}

/** Exhaustive map of client -> server events (docs/08-controles.md §2.A). */
export interface ClientToServerEvents {
  crear_sala: CrearSalaPayload;
  unirse_sala: UnirseSalaPayload;
  seleccionar_rol_mision: SeleccionarRolMisionPayload;
  iniciar_partida: IniciarPartidaPayload;
  accion_parcial_minijuego: AccionParcialMinijuegoPayload;
  bloquear_toma_minijuego: BloquearTomaMinijuegoPayload;
  respuesta_turno_vuelo: RespuestaTurnoVueloPayload;
  reiniciar_partida: ReiniciarPartidaPayload;
}

// ---------------------------------------------------------------------------
// B. Server -> Client payloads (`on`)
// ---------------------------------------------------------------------------
export interface SalaCreadaPayload {
  pin: string;
  player_id: string;
}
export interface EstadoSalaActualizadoPayload {
  pin: string;
  players: RoomPlayer[];
  mission_id: MissionIdType;
  difficulty: DifficultyType;
  taken_roles: RoleType[];
}
export interface IniciarOleada1Payload {
  duration_sec: number;
  mission_config: Record<string, unknown>;
  ai_wave1_state: Record<string, unknown>;
  initial_constraints: Partial<LiveMetrics>;
  /** Emitted by backend/game_manager.py for Rol 4A; optional until documented in docs/08. */
  spectral_challenge?: unknown;
  /** Optional since 2026-11-15: starting forecast of the 4 flight gates. */
  gate_forecast?: GateForecast;
}
/** Live forecast of the 4 flight gates (backend decision_tree.evaluate_preliminary_gates). */
export type GateForecast = Partial<Record<"NODE_1_LAUNCH" | "NODE_2_PROPULSION" | "NODE_3_EVENT" | "NODE_4_DOWNLINK", GateStatus>>;
export interface MutacionEnVivoPayload {
  source_role: string;
  live_metrics: Partial<LiveMetrics>;
  toast_alert?: string;
  /** Optional since 2026-11-15 (docs/08). */
  gate_forecast?: GateForecast;
  /** True for the metrics refresh the server sends after a lock: update silently, no toast. */
  quiet?: boolean;
}
export interface JugadorBloqueoTomaPayload {
  role_id: RoleType;
  wave: WaveNumber;
}
export interface IniciarOleada2Payload {
  sync_delay_sec: number;
  duration_sec: number;
  consolidated_wave1: Record<string, unknown>;
  spectral_challenge?: unknown;
}
/** Random survival event applied at liftoff (optional since 2026-11-15, docs/08). */
export interface RandomEventSummary {
  event_id: string;
  title: string;
  description: string;
  mitigated: boolean;
  mitigation_text?: string | null;
  applied_effects: Record<string, number>;
  fuente?: string;
}
export interface IniciarVuelo60sPayload {
  total_duration_sec: number;
  consolidated_state: Record<string, unknown>;
  preliminary_gates: Record<string, unknown>;
  random_event?: RandomEventSummary | null;
  /** All survival events of the match (Hard missions get two). */
  random_events?: RandomEventSummary[];
}
export interface PreguntaVuelo60sPayload {
  round: 1 | 2 | 3 | 4;
  duration_sec: number;
  gate: FlightGate;
  active_role: RoleType;
  active_player_name: string;
  question: FlightQuestionUI;
}
export interface ResultadoTurnoVueloPayload {
  round: number;
  chosen_option: string;
  immediate_feedback: string;
  rocket_health_pct: number;
  gate_status: GateStatus;
}
export type ReporteFinalMisionPayload = MissionOutcomeUI & {
  role_contributions?: RoleContribution[];
  decision_history?: unknown[];
};

/** Exhaustive map of server -> client events (docs/08-controles.md §2.B). */
export interface ServerToClientEvents {
  sala_creada: SalaCreadaPayload;
  estado_sala_actualizado: EstadoSalaActualizadoPayload;
  iniciar_oleada_1: IniciarOleada1Payload;
  mutacion_en_vivo: MutacionEnVivoPayload;
  jugador_bloqueo_toma: JugadorBloqueoTomaPayload;
  iniciar_oleada_2: IniciarOleada2Payload;
  iniciar_vuelo_60s: IniciarVuelo60sPayload;
  pregunta_vuelo_60s: PreguntaVuelo60sPayload;
  resultado_turno_vuelo: ResultadoTurnoVueloPayload;
  reporte_final_mision: ReporteFinalMisionPayload;
}

export type ClientEventName = keyof ClientToServerEvents;
export type ServerEventName = keyof ServerToClientEvents;

// ---------------------------------------------------------------------------
// Typed emit / on helpers
// ---------------------------------------------------------------------------
export function emitEvent<E extends ClientEventName>(
  event: E,
  payload: ClientToServerEvents[E]
): void {
  socket.emit(event, payload);
}

/**
 * Subscribe to one server event. Returns an unsubscribe function so React
 * effects can clean up without leaking duplicate listeners.
 */
export function onServerEvent<E extends ServerEventName>(
  event: E,
  handler: (payload: ServerToClientEvents[E]) => void
): () => void {
  const wrapped = (payload: ServerToClientEvents[E]) => handler(payload);
  socket.on(event, wrapped as never);
  return () => {
    socket.off(event, wrapped as never);
  };
}

/** Convenience: subscribe to several events at once, returns a single unsubscribe. */
export function onServerEvents(
  handlers: { [E in ServerEventName]?: (payload: ServerToClientEvents[E]) => void }
): () => void {
  const offs = (Object.keys(handlers) as ServerEventName[]).map((name) => {
    const handler = handlers[name] as (payload: unknown) => void;
    return onServerEvent(name, handler as never);
  });
  return () => offs.forEach((off) => off());
}

// ---------------------------------------------------------------------------
// Semantic emit wrappers (one per client event)
// ---------------------------------------------------------------------------
export const gameClient = {
  createRoom: (payload: CrearSalaPayload) => emitEvent("crear_sala", payload),
  joinRoom: (payload: UnirseSalaPayload) => emitEvent("unirse_sala", payload),
  selectRoleMission: (payload: SeleccionarRolMisionPayload) =>
    emitEvent("seleccionar_rol_mision", payload),
  startGame: (payload: IniciarPartidaPayload) => emitEvent("iniciar_partida", payload),
  sendPartialAction: (payload: AccionParcialMinijuegoPayload) =>
    emitEvent("accion_parcial_minijuego", payload),
  lockTake: (payload: BloquearTomaMinijuegoPayload) =>
    emitEvent("bloquear_toma_minijuego", payload),
  answerFlightTurn: (payload: RespuestaTurnoVueloPayload) =>
    emitEvent("respuesta_turno_vuelo", payload),
  restartGame: (payload: ReiniciarPartidaPayload) => emitEvent("reiniciar_partida", payload),
};

// ---------------------------------------------------------------------------
// Connection lifecycle helpers
// ---------------------------------------------------------------------------
export type ConnectionStatus = "checking" | "online" | "offline";

export function connectSocket(): void {
  if (!socket.connected) socket.connect();
}

export function disconnectSocket(): void {
  if (socket.connected) socket.disconnect();
}

/**
 * Probe the backend quickly via `GET /health` (backend/main.py) so App.tsx can
 * switch to offline/preview mode without waiting for socket reconnection loops.
 */
export async function probeBackend(
  timeoutMs: number = BACKEND_PROBE_TIMEOUT_MS
): Promise<boolean> {
  if (typeof fetch !== "function") return false;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Connect and resolve `true` once the socket handshake succeeds, `false` on
 * `connect_error` or after `timeoutMs`. Safe to call multiple times.
 */
export function connectWithTimeout(
  timeoutMs: number = BACKEND_PROBE_TIMEOUT_MS
): Promise<boolean> {
  if (socket.connected) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
      window.clearTimeout(timer);
      resolve(ok);
    };
    const onConnect = () => finish(true);
    const onError = () => finish(false);
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    socket.once("connect", onConnect);
    socket.once("connect_error", onError);
    socket.connect();
  });
}

/** Subscribe to raw connection state changes (for the HUD connection badge). */
export function onConnectionChange(
  handler: (status: Exclude<ConnectionStatus, "checking">) => void
): () => void {
  const onConnect = () => handler("online");
  const onDisconnect = () => handler("offline");
  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  socket.on("connect_error", onDisconnect);
  return () => {
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
    socket.off("connect_error", onDisconnect);
  };
}

export default socket;
