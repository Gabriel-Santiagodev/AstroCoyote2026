// Owner: Abraham (Task ABR-06) — Wave 2 Three.js 3D Rover Power Logistics minigame.
// Implements MinigameProps with N_max=3 carried packs, H2 spawn rate coupled to
// liveMetrics.funding_factor_F (5%-50%), verified nasa_catalog.json energy packs,
// WASD/Arrow + tactile D-Pad controls, and strict WebGL resource disposal.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BatteryCharging,
  HelpCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import nasaCatalog from "../../data/nasa_catalog.json";
import type { MinigameProps } from "../../types/game";
import { AnimatePresence, motion } from "framer-motion";
import { soundEngine } from "../paper/SoundEngine";
import { GameLayout, GoalList, LockButton, PanelCard, PlayBackdrop, Readout, type Goal } from "./kit/GameKit";

interface PowerPackDef {
  id: "chemical_pack" | "battery_pack" | "h2_fuel_cell";
  name: string;
  energy_mj: number;
  rover_speed_delta_pct: number;
  color: number;
  hex: string;
}

const CATALOG_PACKS = nasaCatalog.power_packs as Array<{
  id: string;
  name: string;
  energy_mj: number;
  rover_speed_delta_pct: number;
}>;

const PACK_COLORS: Record<string, { color: number; hex: string }> = {
  chemical_pack: { color: 0xf59e0b, hex: "#F59E0B" },
  battery_pack: { color: 0x06b6d4, hex: "#06B6D4" },
  h2_fuel_cell: { color: 0x3ddc84, hex: "#3DDC84" },
};

const PACK_DEFS: PowerPackDef[] = CATALOG_PACKS.map((p) => ({
  id: p.id as PowerPackDef["id"],
  name: p.name,
  energy_mj: p.energy_mj,
  rover_speed_delta_pct: p.rover_speed_delta_pct,
  color: PACK_COLORS[p.id]?.color ?? 0x3ddc84,
  hex: PACK_COLORS[p.id]?.hex ?? "#3DDC84",
}));

const MAX_CARGO = 3;
const ARENA_BOUND = 9.2;
const DROP_RADIUS = 2.3;

export function Rol3B_AstroLogistics3D({
  missionId,
  timeLeftSec,
  liveMetrics,
  onLiveMutation,
  onSubmitTake,
  isLocked,
}: MinigameProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const [powerSource, setPowerSource] = useState<"solar_arrays" | "fuel_cell" | "rtg_nuclear">(
    missionId === "mars_sample_return" ? "rtg_nuclear" : "fuel_cell"
  );
  const [cargo, setCargo] = useState<PowerPackDef[]>([]);
  const [totalEnergyMj, setTotalEnergyMj] = useState<number>(115);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [webglUnavailable, setWebglUnavailable] = useState<boolean>(false);

  const cargoRef = useRef<PowerPackDef[]>([]);
  const energyRef = useRef<number>(115);
  const isLockedRef = useRef<boolean>(isLocked);
  const fundingRef = useRef<number>(liveMetrics.funding_factor_F);
  const autoSubmitted = useRef<boolean>(false);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  useEffect(() => {
    fundingRef.current = liveMetrics.funding_factor_F;
  }, [liveMetrics.funding_factor_F]);

  const h2SpawnRatePct = useMemo(() => {
    const f = Math.max(0, Math.min(1, liveMetrics.funding_factor_F));
    return Math.round((0.05 + 0.45 * f) * 100);
  }, [liveMetrics.funding_factor_F]);

  const computePowerOutput = useCallback(
    (energyMj: number, src: typeof powerSource) => {
      const baseWatts = src === "rtg_nuclear" ? 560 : src === "fuel_cell" ? 510 : 460;
      const genW = Math.round(baseWatts + energyMj * 1.4);
      const reservePct = Math.min(95, Math.round(14 + energyMj * 0.12));
      return { genW, reservePct };
    },
    []
  );

  const buildPayload = useCallback(() => {
    const { genW, reservePct } = computePowerOutput(totalEnergyMj, powerSource);
    return {
      power_source: powerSource,
      total_energy_mj: Number(totalEnergyMj.toFixed(1)),
      power_generation_w: genW,
      battery_reserve_pct: reservePct,
    };
  }, [computePowerOutput, totalEnergyMj, powerSource]);

  useEffect(() => {
    if (timeLeftSec <= 0 && !isLocked && !autoSubmitted.current) {
      autoSubmitted.current = true;
      onSubmitTake(buildPayload());
    }
  }, [timeLeftSec, isLocked, onSubmitTake, buildPayload]);

  // Keyboard WASD / Arrow controls
  useEffect(() => {
    const setKey = (key: string, pressed: boolean) => {
      const k = key.toLowerCase();
      if (k === "w" || key === "ArrowUp".toLowerCase()) keysRef.current.up = pressed;
      if (k === "s" || key === "ArrowDown".toLowerCase()) keysRef.current.down = pressed;
      if (k === "a" || key === "ArrowLeft".toLowerCase()) keysRef.current.left = pressed;
      if (k === "d" || key === "ArrowRight".toLowerCase()) keysRef.current.right = pressed;
    };
    const downHandler = (e: KeyboardEvent) => setKey(e.key, true);
    const upHandler = (e: KeyboardEvent) => setKey(e.key, false);
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  // Three.js Scene + Strict Disposal Cleanup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 260;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1021);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 14, 13.5);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    const dirLight = new THREE.DirectionalLight(0xfef3c7, 0.9);
    dirLight.position.set(8, 16, 10);
    scene.add(ambient, dirLight);

    // Arena ground & subtle tactical grid
    const floorGeo = new THREE.PlaneGeometry(22, 22);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x162347, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const grid = new THREE.GridHelper(20, 12, 0x334155, 0x1e293b);
    grid.position.y = 0.02;
    scene.add(grid);

    // Central Holographic Delivery Ring
    const ringGeo = new THREE.RingGeometry(DROP_RADIUS - 0.35, DROP_RADIUS, 40);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x3ddc84,
      side: THREE.DoubleSide,
    });
    const dropRing = new THREE.Mesh(ringGeo, ringMat);
    dropRing.rotation.x = -Math.PI / 2;
    dropRing.position.y = 0.04;
    scene.add(dropRing);

    // Paper-Mario style Rover Group
    const rover = new THREE.Group();
    const chassisGeo = new THREE.BoxGeometry(1.5, 0.55, 2.0);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.45;
    rover.add(chassis);

    const cabGeo = new THREE.BoxGeometry(1.1, 0.4, 0.8);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 0.9, 0.4);
    rover.add(cab);

    // 3 visual cargo stack slots on rover back
    const stackMeshes: THREE.Mesh[] = [];
    const crateGeo = new THREE.BoxGeometry(0.75, 0.32, 0.75);
    for (let i = 0; i < MAX_CARGO; i++) {
      const m = new THREE.Mesh(
        crateGeo,
        new THREE.MeshStandardMaterial({ color: 0xf59e0b })
      );
      m.position.set(0, 0.9 + i * 0.36, -0.45);
      m.visible = false;
      rover.add(m);
      stackMeshes.push(m);
    }
    rover.position.set(0, 0, 4.5);
    scene.add(rover);

    // Spawned Energy Crates in arena
    interface CrateNode {
      def: PowerPackDef;
      mesh: THREE.Mesh;
      x: number;
      z: number;
    }
    const crates: CrateNode[] = [];
    const pickupGeo = new THREE.BoxGeometry(0.95, 0.95, 0.95);

    const pickPackDef = (): PowerPackDef => {
      const f = Math.max(0, Math.min(1, fundingRef.current));
      const pH2 = 0.05 + 0.45 * f;
      const roll = Math.random();
      if (roll < pH2) return PACK_DEFS[2]; // h2_fuel_cell
      if (roll < pH2 + (1 - pH2) * 0.52) return PACK_DEFS[1]; // battery_pack
      return PACK_DEFS[0]; // chemical_pack
    };

    const spawnCrate = () => {
      const def = pickPackDef();
      let sx = 0;
      let sz = 0;
      for (let tries = 0; tries < 10; tries++) {
        sx = (Math.random() * 2 - 1) * (ARENA_BOUND - 1.2);
        sz = (Math.random() * 2 - 1) * (ARENA_BOUND - 1.2);
        if (Math.hypot(sx, sz) > DROP_RADIUS + 1.5) break;
      }
      const mat = new THREE.MeshStandardMaterial({ color: def.color });
      const mesh = new THREE.Mesh(pickupGeo, mat);
      mesh.position.set(sx, 0.55, sz);
      scene.add(mesh);
      crates.push({ def, mesh, x: sx, z: sz });
    };

    for (let i = 0; i < 6; i++) spawnCrate();

    const syncStackVisual = (items: PowerPackDef[]) => {
      for (let i = 0; i < MAX_CARGO; i++) {
        if (i < items.length) {
          stackMeshes[i].visible = true;
          (stackMeshes[i].material as THREE.MeshStandardMaterial).color.setHex(items[i].color);
        } else {
          stackMeshes[i].visible = false;
        }
      }
    };

    let animId = 0;
    let lastTs = performance.now();

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      if (!isLockedRef.current) {
        let vx = 0;
        let vz = 0;
        if (keysRef.current.left) vx -= 1;
        if (keysRef.current.right) vx += 1;
        if (keysRef.current.up) vz -= 1;
        if (keysRef.current.down) vz += 1;

        if (vx !== 0 || vz !== 0) {
          const len = Math.hypot(vx, vz);
          const speedMod = cargoRef.current.reduce(
            (acc, item) => acc + item.rover_speed_delta_pct / 100,
            1.0
          );
          const speed = Math.max(3.6, 8.2 * speedMod);
          rover.position.x = Math.max(
            -ARENA_BOUND,
            Math.min(ARENA_BOUND, rover.position.x + (vx / len) * speed * dt)
          );
          rover.position.z = Math.max(
            -ARENA_BOUND,
            Math.min(ARENA_BOUND, rover.position.z + (vz / len) * speed * dt)
          );
          rover.rotation.y = Math.atan2(vx, vz);
        }

        // Collect nearby crates if cargo < 3
        if (cargoRef.current.length < MAX_CARGO) {
          for (let i = crates.length - 1; i >= 0; i--) {
            const c = crates[i];
            if (Math.hypot(rover.position.x - c.x, rover.position.z - c.z) < 1.35) {
              scene.remove(c.mesh);
              (c.mesh.material as THREE.Material).dispose();
              crates.splice(i, 1);

              const nextCargo = [...cargoRef.current, c.def];
              cargoRef.current = nextCargo;
              setCargo(nextCargo);
              syncStackVisual(nextCargo);
              spawnCrate();
              break;
            }
          }
        }

        // Deposit inside central glowing holographic ring
        if (
          cargoRef.current.length > 0 &&
          Math.hypot(rover.position.x, rover.position.z) <= DROP_RADIUS
        ) {
          const delivered = cargoRef.current.reduce((acc, item) => acc + item.energy_mj, 0);
          const nextTotal = energyRef.current + delivered;
          energyRef.current = nextTotal;
          cargoRef.current = [];
          setCargo([]);
          setTotalEnergyMj(nextTotal);
          syncStackVisual([]);

          const { genW } = computePowerOutput(nextTotal, powerSource);
          onLiveMutation({ available_power_w: genW });
        }
      }

      // Spin pickup cubes & pulse ring subtly
      dropRing.rotation.z += dt * 0.5;
      for (const c of crates) {
        c.mesh.rotation.y += dt * 1.4;
      }

      renderer.render(scene, camera);
      animId = window.requestAnimationFrame(animate);
    };

    animId = window.requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 560;
      const h = container.clientHeight || 260;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      floorGeo.dispose();
      floorMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      chassisGeo.dispose();
      chassisMat.dispose();
      cabGeo.dispose();
      cabMat.dispose();
      crateGeo.dispose();
      pickupGeo.dispose();
      for (const m of stackMeshes) (m.material as THREE.Material).dispose();
      for (const c of crates) (c.mesh.material as THREE.Material).dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [computePowerOutput, onLiveMutation, powerSource]);

  const { genW, reservePct } = computePowerOutput(totalEnergyMj, powerSource);

  const setHold = (dir: keyof typeof keysRef.current, active: boolean) => {
    keysRef.current[dir] = active;
  };

  // ---------------------------------------------------------------------------
  // Game window UI (2026-11-15): the 3D rover arena fills the play area; power source chips and
  // the D-pad sit on top of it; goals + readouts in the side panel. 3D game logic unchanged.
  // ---------------------------------------------------------------------------
  const missionCfg = nasaCatalog.missions[missionId] ?? nasaCatalog.missions.artemis_moon;
  const minBatteryPct = Number(
    (missionCfg as { min_battery_event_pct?: number }).min_battery_event_pct ??
      (missionCfg as { min_ufe_event_pct?: number }).min_ufe_event_pct ??
      0
  );
  const [startEnergy] = useState(totalEnergyMj);
  const [sourceTouched, setSourceTouched] = useState(false);
  const goals: Goal[] = [
    { label: "Power source chosen", done: sourceTouched },
    { label: "At least one delivery", done: totalEnergyMj > startEnergy },
    { label: `Battery reserve ${minBatteryPct}%+`, done: reservePct >= minBatteryPct },
  ];
  const dpad = (dir: "up" | "down" | "left" | "right", Icon: typeof ArrowUp) => (
    <button
      type="button"
      aria-label={`Drive ${dir}`}
      disabled={isLocked}
      onPointerDown={() => setHold(dir, true)}
      onPointerUp={() => setHold(dir, false)}
      onPointerLeave={() => setHold(dir, false)}
      className="paper-btn flex h-11 w-11 items-center justify-center bg-blueprint-navy/90 text-paper-cream"
    >
      <Icon className="h-5 w-5" />
    </button>
  );

  return (
    <GameLayout
      play={
        <div className="absolute inset-0">
          {webglUnavailable ? (
            <div className="flex h-full items-center justify-center p-4 text-center font-mono text-xs text-status-warn">
              3D view unavailable here. You can still lock your power plan.
            </div>
          ) : (
            <div ref={mountRef} className="h-full w-full" />
          )}
          {/* power source chips */}
          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
            {(
              [
                { id: "solar_arrays", label: "Solar" },
                { id: "fuel_cell", label: "Fuel cell" },
                { id: "rtg_nuclear", label: "Nuclear RTG" },
              ] as const
            ).map((src) => (
              <button
                key={src.id}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  soundEngine.playClick();
                  setSourceTouched(true);
                  setPowerSource(src.id);
                }}
                className={`paper-btn px-2.5 py-1 text-xs ${
                  powerSource === src.id ? "bg-role-orbit text-ink-black" : "bg-space-ink/90 text-slate-200"
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute right-2 top-2 rounded-lg border-2 border-ink-black bg-paper-cream px-2 py-1 font-mono text-xs font-bold text-ink-black">
            Cargo {cargo.length}/{MAX_CARGO}
          </div>
          <div className="pointer-events-none absolute bottom-2 left-2 max-w-[55%] rounded-lg border-2 border-ink-black bg-space-ink/90 px-2 py-1 text-[11px] font-bold text-slate-200">
            Grab crates, drive into the green ring.
          </div>
          {/* D-pad */}
          <div className="absolute bottom-2 right-2 grid grid-cols-3 gap-1">
            <div />
            {dpad("up", ArrowUp)}
            <div />
            {dpad("left", ArrowLeft)}
            {dpad("down", ArrowDown)}
            {dpad("right", ArrowRight)}
          </div>
        </div>
      }
      panel={
        <>
          <GoalList goals={goals} />
          <PanelCard title="Power">
            <div className="space-y-2">
              <Readout label="Energy stored" value={`${totalEnergyMj} MJ`} tone="info" />
              <Readout label="Ship power" value={`${genW} W`} tone="ok" />
              <Readout label="Battery reserve" value={`${reservePct}%`} pct={reservePct}
                tone={reservePct >= minBatteryPct ? "ok" : "warn"} />
              <Readout label="Fuel cell spawns" value={`${h2SpawnRatePct}%`} pct={h2SpawnRatePct} tone="info" />
            </div>
          </PanelCard>
          <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
            {PACK_DEFS.map((p) => (
              <span key={p.id} className="rounded border border-slate-600 px-1.5 py-0.5" style={{ color: p.hex }}>
                ■ {p.name} +{p.energy_mj} MJ
              </span>
            ))}
          </div>
          <LockButton isLocked={isLocked} ready={goals.every((g) => g.done)} label="Lock power" onLock={() => onSubmitTake(buildPayload())} />
        </>
      }
    />
  );
}

export default Rol3B_AstroLogistics3D;
