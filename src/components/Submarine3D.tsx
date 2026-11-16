import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { DiveRef } from "../types/dive";

/**
 * Submarine Orientation & Framing Constants
 * Longest dimension is auto-normalized to 2.8 world units.
 * With nose at +X in local space:
 * SIDE_YAW = -0.06 keeps the submarine in a crisp side profile (facing right, nose at +X,
 * tail at -X, cockpit facing viewer) with subtle 3.5° depth cue.
 * During scroll-down descent, heading is strictly locked to SIDE_YAW so it NEVER faces
 * the desktop front.
 * Heading changes / steering (left-right sweep) are allowed ONLY at the surface or seafloor.
 */
export const SIDE_YAW = -0.06;
export const MODEL_YAW_OFFSET = SIDE_YAW;
export const MODEL_PITCH_OFFSET = 0.0;
export const MODEL_ROLL_OFFSET = 0.0;

// Custom GLSL Volumetric Beam Shader for Natural Oceanic Floodlights
const VolumetricBeamShader = {
  uniforms: {
    uColor: { value: new THREE.Color("#0284C7") }, // Deep ocean sapphire
    uCoreColor: { value: new THREE.Color("#38BDF8") }, // Gentle oceanic cyan mist
    uIntensity: { value: 0.0 },
    uTime: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPos;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPos = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uCoreColor;
    uniform float uIntensity;
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPos;

    void main() {
      if (uIntensity <= 0.001) {
        discard;
      }

      // vUv.y is 1.0 at emitter lens (apex) and 0.0 at distal end
      // 1. Natural underwater longitudinal scattering: soft decay into deep water
      float longitudinal = pow(vUv.y, 1.25);

      // Smooth, imperceptible terminal dissipation into the dark ocean
      float terminalFade = smoothstep(0.0, 0.28, vUv.y);

      // Soft feathering right at the root near the hull for seamless blending
      float rootFade = 1.0 - smoothstep(0.96, 1.0, vUv.y) * 0.35;

      // 2. Feathered radial profile: soft falloff with zero harsh boundaries, visible from all angles
      vec3 viewDir = normalize(vViewPos);
      float normalDotView = abs(dot(viewDir, normalize(vNormal)));
      float radialSoftness = 0.35 + 0.65 * pow(normalDotView, 0.85);

      // 3. Subtle organic particulate ocean shimmer
      float shimmer = 0.95 + 0.05 * sin(vUv.y * 16.0 - uTime * 2.2);

      // Natural, translucent atmospheric haze (delicate, soft, non-blinding oceanic glow)
      float alpha = longitudinal * terminalFade * rootFade * radialSoftness * shimmer * uIntensity * 0.22;

      // Color gradient: soft aqua near emitter smoothly blending into deep oceanic blue
      vec3 finalColor = mix(uColor, uCoreColor, pow(vUv.y, 1.4));

      // Standard AdditiveBlending blends srcRGB * srcAlpha + dstRGB
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

/**
 * Procedural Submarine Hull Normal Map (Titanium plates, panel seams, rivet rows)
 */
function createSubmarineNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  // Neutral tangent-space normal: RGB(128, 128, 255) -> (0, 0, 1)
  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, 1024, 1024);

  // Micro-brushed metal horizontal grain
  for (let y = 0; y < 1024; y += 4) {
    const grain = (Math.random() - 0.5) * 8;
    ctx.strokeStyle = `rgb(${128 + grain}, 128, ${255 - Math.abs(grain)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Large modular hull plate seams (every 128px)
  const seamSpacing = 128;
  for (let x = 0; x <= 1024; x += seamSpacing) {
    // Left bevel (light)
    ctx.strokeStyle = "rgb(155, 128, 235)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 1, 0);
    ctx.lineTo(x - 1, 1024);
    ctx.stroke();

    // Right bevel (shadow)
    ctx.strokeStyle = "rgb(100, 128, 235)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 1, 0);
    ctx.lineTo(x + 1, 1024);
    ctx.stroke();

    // Rivet rows along vertical seams
    for (let y = 16; y < 1024; y += 32) {
      const rGrad = ctx.createRadialGradient(x + 10, y, 0, x + 10, y, 5);
      rGrad.addColorStop(0, "rgb(165, 128, 240)");
      rGrad.addColorStop(0.7, "rgb(140, 128, 250)");
      rGrad.addColorStop(1, "rgb(128, 128, 255)");
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(x + 10, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let y = 0; y <= 1024; y += seamSpacing) {
    // Top bevel (light)
    ctx.strokeStyle = "rgb(128, 155, 235)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y - 1);
    ctx.lineTo(1024, y - 1);
    ctx.stroke();

    // Bottom bevel (shadow)
    ctx.strokeStyle = "rgb(128, 100, 235)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y + 1);
    ctx.lineTo(1024, y + 1);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = 16;
  return texture;
}

/**
 * Procedural Submarine Hull Roughness Map (Modular plate variation, seam oxidation)
 */
function createSubmarineRoughnessMap(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  // Base titanium sheen (0.28 roughness -> rgb 72)
  ctx.fillStyle = "rgb(72, 72, 72)";
  ctx.fillRect(0, 0, 1024, 1024);

  // Modular panel roughness variation
  const seamSpacing = 128;
  for (let x = 0; x < 1024; x += seamSpacing) {
    for (let y = 0; y < 1024; y += seamSpacing) {
      const panelRoughness = 65 + Math.floor(Math.random() * 25);
      ctx.fillStyle = `rgb(${panelRoughness}, ${panelRoughness}, ${panelRoughness})`;
      ctx.fillRect(x + 2, y + 2, seamSpacing - 4, seamSpacing - 4);
    }
  }

  // Welded seams have higher roughness (0.65 -> rgb 165)
  ctx.strokeStyle = "rgb(165, 165, 165)";
  ctx.lineWidth = 4;
  for (let x = 0; x <= 1024; x += seamSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += seamSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = 16;
  return texture;
}

/**
 * Cavitation Micro-Bubble Wake Particles Streaming Accurately From Thruster Nozzles
 * Perfectly aligned with the rear exhaust nozzles of the port and starboard thruster pods
 */
function ThrusterCavitationWake({ diveRef }: { diveRef: DiveRef }) {
  const pointsRef = useRef<THREE.Points>(null);

  const softBubbleTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.3, "rgba(224, 242, 254, 0.8)");
    grad.addColorStop(0.7, "rgba(56, 189, 248, 0.3)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Thruster exhaust nozzle centers:
  // Port: x = -1.36, y = -0.484, z = +0.315
  // Starboard: x = -1.36, y = -0.484, z = -0.315
  const { positions, velocities, origins, phases, count } = useMemo(() => {
    const total = 120;
    const pos = new Float32Array(total * 3);
    const vel = new Float32Array(total);
    const orig = new Float32Array(total * 3);
    const phs = new Float32Array(total);

    for (let i = 0; i < total; i++) {
      const i3 = i * 3;
      const isPort = i % 2 === 0;
      const zOffset = isPort ? 0.315 : -0.315;

      const x = -1.36 - Math.random() * 1.5;
      const y = -0.484 + (Math.random() - 0.5) * 0.08;
      const z = zOffset + (Math.random() - 0.5) * 0.08;

      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;

      orig[i3] = -1.36;
      orig[i3 + 1] = -0.484;
      orig[i3 + 2] = zOffset;

      vel[i] = 0.9 + Math.random() * 0.8;
      phs[i] = Math.random() * Math.PI * 2;
    }
    return {
      positions: pos,
      velocities: vel,
      origins: orig,
      phases: phs,
      count: total,
    };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const pos = geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    const vel = Math.abs(diveRef.current.velocity);
    // Calm, majestic cruising thruster jet stream
    const baseJetSpeed = 0.85;
    const speedBoost = THREE.MathUtils.clamp(vel * 0.0006, 0, 1.2);
    const streamSpeed = (baseJetSpeed + speedBoost) * delta * 1.4;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Stream backward along -X axis
      pos[i3] -= velocities[i] * streamSpeed;

      // Swirling hydrodynamic vortex
      const distFromNozzle = Math.abs(pos[i3] - origins[i3]);
      const swirlRadius = distFromNozzle * 0.055;
      pos[i3 + 1] =
        origins[i3 + 1] +
        Math.sin(time * 9.0 + phases[i]) * swirlRadius +
        distFromNozzle * 0.015;
      pos[i3 + 2] =
        origins[i3 + 2] + Math.cos(time * 9.0 + phases[i]) * swirlRadius;

      // Reset when particle drifts beyond wake limit
      if (pos[i3] < -3.6) {
        pos[i3] = origins[i3] - Math.random() * 0.08;
        pos[i3 + 1] = origins[i3 + 1] + (Math.random() - 0.5) * 0.04;
        pos[i3 + 2] = origins[i3 + 2] + (Math.random() - 0.5) * 0.04;
      }
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={softBubbleTexture}
        size={0.048}
        sizeAttenuation={true}
        color="#E0F2FE"
        transparent={true}
        opacity={0.52}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Smooth angle interpolation that takes the shortest circular path across +/- PI.
 * Completely eliminates gimbal wrap jitter and 180° spinning shudders.
 */
function lerpAngle(current: number, target: number, factor: number): number {
  let diff = (target - current) % (Math.PI * 2);
  if (diff < -Math.PI) diff += Math.PI * 2;
  if (diff > Math.PI) diff -= Math.PI * 2;
  let result = current + diff * factor;
  if (result > Math.PI) result -= Math.PI * 2;
  if (result < -Math.PI) result += Math.PI * 2;
  return result;
}

export const Submarine3D: React.FC<{ diveRef: DiveRef }> = ({ diveRef }) => {
  const { viewport, size } = useThree();
  const isMobile = size.width < 768 || viewport.width < 5.5;

  const rootGroupRef = useRef<THREE.Group>(null);
  const subGroupRef = useRef<THREE.Group>(null);
  const leftSpotRef = useRef<THREE.SpotLight>(null);
  const rightSpotRef = useRef<THREE.SpotLight>(null);
  const portBeamRef = useRef<THREE.Mesh>(null);
  const starboardBeamRef = useRef<THREE.Mesh>(null);
  const hullLight1Ref = useRef<THREE.PointLight>(null);
  const hullLight2Ref = useRef<THREE.PointLight>(null);
  const cockpitLightRef = useRef<THREE.PointLight>(null);

  // Procedural Textures
  const hullNormalMap = useMemo(() => createSubmarineNormalMap(), []);
  const hullRoughnessMap = useMemo(() => createSubmarineRoughnessMap(), []);

  // Load GLTF Model
  const gltf = useGLTF("/models/submarine.glb");

  // Compute auto-normalization scale & apply enhanced photorealistic materials
  const normalizedScene = useMemo(() => {
    const sceneClone = gltf.scene.clone(true);

    const box = new THREE.Box3().setFromObject(sceneClone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Longest dimension = 2.8 units
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 2.8 / (maxDim || 1);

    sceneClone.position.set(
      -center.x * scaleFactor,
      -center.y * scaleFactor,
      -center.z * scaleFactor,
    );
    sceneClone.scale.setScalar(scaleFactor);

    // PBR Material Differentiation across submarine components
    sceneClone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const mat = mesh.material as THREE.Material;
        const matName = (mat.name || "").toLowerCase();
        const meshName = (mesh.name || "").toLowerCase();

        // 1. Front Acrylic Observation Dome (Crystal-clear optical acrylic pressure dome)
        if (
          matName.includes("01_-_default") ||
          meshName.includes("object02") ||
          meshName.includes("glass") ||
          meshName.includes("dome")
        ) {
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color("#D8F2FE"),
            roughness: 0.05,
            metalness: 0.05,
            transmission: 0.88,
            ior: 1.49, // Acrylic pressure sphere
            transparent: true,
            opacity: 0.38,
            envMapIntensity: 3.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            depthWrite: false,
          });
        }
        // 2. Main Outer Titanium Hull Plates (Hull_09 - Default_0)
        else if (
          (matName.includes("09_-_default") || meshName.includes("hull")) &&
          !meshName.includes("propulsion")
        ) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#2C3C4E"), // Naval titanium slate
            metalness: 0.58,
            roughness: 0.32,
            normalMap: hullNormalMap,
            normalScale: new THREE.Vector2(0.85, 0.85),
            roughnessMap: hullRoughnessMap,
            envMapIntensity: 2.2,
          });
        }
        // 3. Propulsion Thruster Pods, Shrouds & Ducts
        else if (
          meshName.includes("propulsion") ||
          meshName.includes("engine") ||
          meshName.includes("object6")
        ) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#1B2636"), // Aerospace dark alloy
            metalness: 0.78,
            roughness: 0.24,
            envMapIntensity: 2.5,
          });
        }
        // 4. Cockpit Interior Machinery, Avionics Consoles & Structural Framing (04_-_Default)
        else {
          const isScreenOrGauge =
            meshName.includes("box13") ||
            meshName.includes("box14") ||
            meshName.includes("shape04") ||
            meshName.includes("console") ||
            meshName.includes("screen");

          mesh.material = new THREE.MeshStandardMaterial({
            color: isScreenOrGauge
              ? new THREE.Color("#0A233A")
              : new THREE.Color("#182230"),
            metalness: isScreenOrGauge ? 0.2 : 0.45,
            roughness: isScreenOrGauge ? 0.15 : 0.65,
            emissive: isScreenOrGauge
              ? new THREE.Color("#06B6D4")
              : new THREE.Color("#000000"),
            emissiveIntensity: isScreenOrGauge ? 0.95 : 0,
            envMapIntensity: 1.5,
          });
        }
      }
    });

    return sceneClone;
  }, [gltf.scene, hullNormalMap, hullRoughnessMap]);

  // Physical floodlight lamp geometry & materials
  const beamGeometry = useMemo(() => {
    const length = 8.5;
    // Volumetric beam originates precisely at the headlight lamp lens (radius 0.055)
    // and fans out into a wide, soft oceanic floodlight (radius 2.85) in deep water
    const geom = new THREE.CylinderGeometry(0.055, 2.85, length, 32, 20, true);
    // Shift so apex (radius 0.055) is centered at origin (0, 0, 0) right on the lamp lens
    geom.translate(0, -length / 2, 0);
    // Rotate +PI/2 around Z so cone projects forward along +X (direction of submarine nose)
    geom.rotateZ(Math.PI / 2);
    return geom;
  }, []);

  const lensMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#0A111E", // Dark optical glass lens casing when headlights are off
      emissive: new THREE.Color("#000000"),
      emissiveIntensity: 0,
      metalness: 0.45,
      roughness: 0.15,
      toneMapped: false,
    });
  }, []);

  // Guaranteed valid look-at targets for SpotLights (Wide, soft downward angle)
  const leftTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(1.32 + 6.5, -0.14 - 1.15, 0.25);
    return obj;
  }, []);

  const rightTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(1.32 + 6.5, -0.14 - 1.15, -0.25);
    return obj;
  }, []);

  // Custom shader materials for volumetric cones
  const beamMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(VolumetricBeamShader.uniforms),
      vertexShader: VolumetricBeamShader.vertexShader,
      fragmentShader: VolumetricBeamShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, []);

  // Persistent Seafloor Free Navigation & Exploration State (Strictly Non-Negative Forward Travel)
  const seafloorNavRef = useRef({
    heading: SIDE_YAW, // Instantaneous heading angle (rad)
    targetHeading: SIDE_YAW, // Target heading angle
    posX: 0.85, // Horizontal world position (right-half exploration zone)
    posY: -0.04, // Altitude above seafloor
    posZ: 0, // Depth position
    patrolTimer: 0, // Autonomous patrol timer
    patrolDir: 1, // +1: cruising right, -1: cruising left (180° turn around)
    depthDir: -1, // -1: cruising deep inside screen (-Z), +1: cruising to opposite depth towards camera (+Z)
    turnRightAt: 2.35, // Dynamic right-turn boundary for current pass (e.g. 2.10 to 2.65)
    turnLeftAt: 0.3, // Dynamic left-turn boundary for current pass (e.g. 0.22 to 0.48)
    depthAngle: 0.26, // Dynamic depth angle for varied trajectories (0.22 to 0.34 rad)
  });

  // 60fps Dive Motion & Dynamic Animation Loop
  useFrame((state, delta) => {
    if (!subGroupRef.current || !rootGroupRef.current) return;

    const { progress, velocity, pointer } = diveRef.current;
    const time = state.clock.getElapsedTime();

    // 1. Scroll Motion Dynamics (Descent vs. Ascent vs. Idle Cruise)
    const scrollDownFactor = THREE.MathUtils.clamp(velocity / 140.0, 0, 1);
    const scrollUpFactor = THREE.MathUtils.clamp(-velocity / 140.0, 0, 1);
    const motionFactor = Math.max(scrollDownFactor, scrollUpFactor);
    const cruiseFactor = 1.0 - motionFactor;

    // Scale submarine proportionally for mobile portrait viewports
    const targetScale = isMobile ? 0.72 : 1.0;
    subGroupRef.current.scale.setScalar(targetScale);

    // Roaming boundaries adapt to viewport width so vessel stays cleanly in view
    const maxBoundX = isMobile ? Math.min(viewport.width * 0.32, 1.05) : 2.75;
    const minBoundX = isMobile ? -Math.min(viewport.width * 0.22, 0.75) : 0.1;
    const defaultTurnRight = isMobile ? maxBoundX * 0.9 : 2.35;
    const defaultTurnLeft = isMobile ? minBoundX * 0.8 : 0.3;

    // 2. Seafloor Zone Detection & Free Exploration Control (STRICTLY FORWARD PROPULSION, NO BACKWARD MOTION)
    // During descent/ascent in water column: Submarine is locked to crisp side profile (facing right, nose at +X)
    // ON SEAFLOOR (progress >= 0.72): Submarine operates exclusively in the visible bounds,
    // performing natural 3D exploration across wide horizontal distances, varying altitudes, and screen depths.
    const floorZone = THREE.MathUtils.clamp((progress - 0.72) / 0.18, 0, 1);
    const nav = seafloorNavRef.current;

    if (floorZone <= 0.01) {
      // Locked in water column: reset navigation to right-half lane and lock side profile
      nav.heading = SIDE_YAW;
      nav.targetHeading = SIDE_YAW;
      nav.posX = isMobile ? 0 : 0.85;
      nav.posY = -0.04;
      nav.posZ = 0;
      nav.patrolTimer = 0;
      nav.patrolDir = 1;
      nav.depthDir = -1;
      nav.turnRightAt = defaultTurnRight;
      nav.turnLeftAt = defaultTurnLeft;
      nav.depthAngle = 0.26;
    } else {
      // Seafloor free exploration mode active!
      nav.patrolTimer += delta;
      const px = pointer?.x || 0;
      const py = pointer?.y || 0;

      // A. Dynamic Horizontal Roaming State Machine (NO STATIC LOOP)
      if (nav.posX > nav.turnRightAt && nav.patrolDir === 1) {
        nav.patrolDir = -1; // Cruise left towards screen center
        nav.turnLeftAt = isMobile
          ? minBoundX + Math.random() * Math.max(0.05, defaultTurnLeft - minBoundX)
          : 0.22 + Math.random() * 0.26;
        nav.depthAngle = 0.22 + Math.random() * 0.1;
      } else if (nav.posX < nav.turnLeftAt && nav.patrolDir === -1) {
        nav.patrolDir = 1; // Cruise right towards outer ocean
        nav.turnRightAt = isMobile
          ? defaultTurnRight + Math.random() * Math.max(0.05, maxBoundX - defaultTurnRight)
          : 2.1 + Math.random() * 0.55;
        nav.depthAngle = 0.22 + Math.random() * 0.1;
      } else if (Math.abs(px) > 0.35) {
        // User left-right steering overrides ONLY when safely inside bounds:
        if (px < -0.35 && nav.posX > minBoundX + 0.2) nav.patrolDir = -1;
        else if (px > 0.35 && nav.posX < maxBoundX - 0.2) nav.patrolDir = 1;
      }

      // B. Depth Navigation State Machine (Into Screen Depth -Z vs. Opposite Depth Toward Camera +Z)
      if (nav.posZ < -2.35) {
        nav.depthDir = 1; // Reached deep oceanic abyss: smoothly cruise towards camera (+Z)
      } else if (nav.posZ > 0.15) {
        nav.depthDir = -1; // Reached foreground: smoothly cruise deep into screen (-Z)
      } else if (Math.abs(py) > 0.3) {
        // Mouse vertical controls depth:
        if (py > 0.3 && nav.posZ > -1.95) nav.depthDir = -1;
        else if (py < -0.3 && nav.posZ < 0.1) nav.depthDir = 1;
      }

      // C. Target Heading (ROCK-SOLID CONTINUOUS HEADING - ZERO SHAKING, ZERO 180° AMBIGUITY!)
      const theta = nav.depthAngle;
      let desiredHeading = 0;
      if (nav.patrolDir === 1) {
        desiredHeading = nav.depthDir === -1 ? theta : -theta;
      } else {
        desiredHeading =
          nav.depthDir === -1 ? Math.PI - theta : -(Math.PI - theta);
      }
      nav.targetHeading = desiredHeading;

      // D. Smooth, Majestic Rudder Turning Interpolation
      let diff = (nav.targetHeading - nav.heading) % (Math.PI * 2);
      if (diff < -Math.PI) diff += Math.PI * 2;
      if (diff > Math.PI) diff -= Math.PI * 2;
      const turnRate = 1.15; // Confident naval turn rate (rad/s)
      nav.heading += THREE.MathUtils.clamp(
        diff,
        -turnRate * delta,
        turnRate * delta,
      );

      // Normalize nav.heading into [-Math.PI, Math.PI]
      if (nav.heading > Math.PI) nav.heading -= Math.PI * 2;
      if (nav.heading < -Math.PI) nav.heading += Math.PI * 2;

      // E. Propulsion: STRICTLY FORWARD ALONG NOSE (NEVER MOVES BACKWARD!)
      const baseCruisingSpeed = 0.22;
      const fwdSpeed =
        baseCruisingSpeed * (1.0 - motionFactor * 0.4) * floorZone;

      // Forward vector along nose:
      const fwdX = Math.cos(nav.heading);
      const fwdZ = -Math.sin(nav.heading);

      // Advance position strictly forward along heading:
      nav.posX += fwdX * fwdSpeed * delta;
      nav.posZ += fwdZ * fwdSpeed * delta;

      // Safety clamps (confined strictly to bounds and depth):
      nav.posX = THREE.MathUtils.clamp(nav.posX, minBoundX, maxBoundX);
      nav.posZ = THREE.MathUtils.clamp(nav.posZ, isMobile ? -2.0 : -2.6, 0.3);

      // F. Smooth Vertical Altitude Exploration within User's Outlined Box (Y in [-0.06, 0.20])
      const targetAltitude = -0.06 + (Math.sin(time * 0.22) * 0.5 + 0.5) * 0.24;
      nav.posY = THREE.MathUtils.lerp(nav.posY, targetAltitude, delta * 1.2);
    }

    // 3. Roll Banking & Dynamic Pitch (Subtle, Calm, Minimal Movement)
    let diffBanking = (nav.targetHeading - nav.heading) % (Math.PI * 2);
    if (diffBanking < -Math.PI) diffBanking += Math.PI * 2;
    if (diffBanking > Math.PI) diffBanking -= Math.PI * 2;
    const turnBanking =
      -THREE.MathUtils.clamp(diffBanking, -0.25, 0.25) * 0.08 * floorZone;

    const floorDampen = 1.0 - floorZone;
    const scrollDivePitch = -0.16 * scrollDownFactor;
    const scrollAscentPitch = 0.16 * scrollUpFactor;
    // Bow stays strictly level horizontally on the seafloor (does not tilt up or down into water column)
    const targetPitch = (scrollDivePitch + scrollAscentPitch) * floorDampen;

    // 4. Multi-Frequency Oceanic Buoyant Heave & Sway (Virtually zero at seafloor so it doesn't float or bob)
    const hoverAmp =
      THREE.MathUtils.lerp(0.035, 0.002, floorZone) *
      (0.35 + 0.65 * cruiseFactor);
    const hoverY =
      Math.sin(time * 0.8) * hoverAmp +
      Math.cos(time * 0.45) * (hoverAmp * 0.5);

    // 5. Crush-Depth Tremor (around 6,000m)
    let tremorX = 0;
    let tremorY = 0;
    let tremorZ = 0;
    if (progress >= 0.55 && progress <= 0.63) {
      const intensity = 0.02 * Math.sin(((progress - 0.55) / 0.08) * Math.PI);
      tremorX = (Math.random() - 0.5) * intensity;
      tremorY = (Math.random() - 0.5) * intensity;
      tremorZ = (Math.random() - 0.5) * intensity;
    }

    // 6. Fluid Inertia Lerping (lerpAngle guarantees zero angle-wrap flutter/shaking!)
    const lerpFactor = THREE.MathUtils.clamp(delta * 3.5, 0.01, 1);

    // Yaw: locked to SIDE_YAW (-0.06 rad) during descent, free to turn 180° at seafloor
    const finalTargetYaw = lerpAngle(SIDE_YAW, nav.heading, floorZone);
    subGroupRef.current.rotation.y = lerpAngle(
      subGroupRef.current.rotation.y,
      finalTargetYaw,
      lerpFactor,
    );

    // Pitch: Bow dipping down/up
    subGroupRef.current.rotation.z = THREE.MathUtils.lerp(
      subGroupRef.current.rotation.z,
      targetPitch,
      lerpFactor,
    );

    // Roll: Hydrodynamic banking
    subGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      subGroupRef.current.rotation.x,
      turnBanking,
      lerpFactor,
    );

    // Broadcast instantaneous heading angle to scene environment (seabed and particles drift accordingly)
    diveRef.current.headingAngle = subGroupRef.current.rotation.y;

    // Position updates: firmly grounded on the seafloor, exploring in X and deep into Z
    // Smoothly descends to baselineY = -0.06 and locks firmly in place
    const diveT = THREE.MathUtils.clamp(progress / 0.92, 0, 1);
    const baselineY = THREE.MathUtils.lerp(0.65, -0.06, Math.pow(diveT, 0.85));
    const verticalSurge =
      (scrollUpFactor * 0.08 - scrollDownFactor * 0.035) * floorDampen;
    const finalY =
      THREE.MathUtils.lerp(baselineY, nav.posY, floorZone) +
      verticalSurge +
      hoverY +
      tremorY;
    const finalX = THREE.MathUtils.lerp(0, nav.posX, floorZone) + tremorX;
    const finalZ = THREE.MathUtils.lerp(0, nav.posZ, floorZone) + tremorZ;

    subGroupRef.current.position.y = THREE.MathUtils.lerp(
      subGroupRef.current.position.y,
      finalY,
      lerpFactor,
    );
    subGroupRef.current.position.x = THREE.MathUtils.lerp(
      subGroupRef.current.position.x,
      finalX,
      lerpFactor,
    );
    subGroupRef.current.position.z = THREE.MathUtils.lerp(
      subGroupRef.current.position.z,
      finalZ,
      lerpFactor,
    );

    // 7. Floodlight Intensity Curve:
    // When ascending towards the surface or in the sunlit zone (progress <= 0.22):
    // Submarine headlights, floodlights and volumetric beams are COMPLETELY and STRICTLY OFF!
    // As the vessel enters the deep twilight & dark abyss (progress 0.22 -> 0.40),
    // they smoothly power on with rich, delicate oceanic luminescence.
    const lightT = THREE.MathUtils.clamp((progress - 0.22) / 0.18, 0, 1);
    const floodIntensity = THREE.MathUtils.smoothstep(lightT, 0, 1) * 0.85;

    if (leftSpotRef.current)
      leftSpotRef.current.intensity = floodIntensity * 5.2;
    if (rightSpotRef.current)
      rightSpotRef.current.intensity = floodIntensity * 5.2;

    beamMaterial.uniforms.uIntensity.value = floodIntensity;
    beamMaterial.uniforms.uTime.value = time;

    // Guaranteed zero-visibility for volumetric beams when lights are powered off
    const beamVisible = floodIntensity > 0.01;
    if (portBeamRef.current) portBeamRef.current.visible = beamVisible;
    if (starboardBeamRef.current)
      starboardBeamRef.current.visible = beamVisible;

    // Dark unlit glass at surface, radiant cyan emitter in deep sea
    lensMaterial.color.lerpColors(
      new THREE.Color("#0A111E"),
      new THREE.Color("#E0F2FE"),
      floodIntensity,
    );
    lensMaterial.emissive.lerpColors(
      new THREE.Color("#000000"),
      new THREE.Color("#38BDF8"),
      floodIntensity,
    );
    lensMaterial.emissiveIntensity = floodIntensity * 2.8;

    // Local Submersible Hull & Cockpit Lights power off at surface
    if (hullLight1Ref.current)
      hullLight1Ref.current.intensity = floodIntensity * 2.2;
    if (hullLight2Ref.current)
      hullLight2Ref.current.intensity = floodIntensity * 1.8;
    if (cockpitLightRef.current)
      cockpitLightRef.current.intensity = 0.35 + floodIntensity * 1.45;
  });

  return (
    <group ref={rootGroupRef} position={[0, 0, 0]}>
      {/* Dynamic Submarine Group */}
      <group ref={subGroupRef}>
        <primitive object={normalizedScene} />

        {/* Cavitation Micro-Bubble Wake Streaming Naturally From Exhaust Nozzles */}
        <ThrusterCavitationWake diveRef={diveRef} />

        {/* Interior Cockpit Cabin Light (Illuminates pilot seats & dashboard from within) */}
        <pointLight
          ref={cockpitLightRef}
          position={[0.35, 0.12, 0]}
          color="#38BDF8"
          intensity={0.35}
          distance={2.0}
          decay={1.8}
        />

        {/* Local Submersible Hull Illumination Lights (active in deep water) */}
        <pointLight
          ref={hullLight1Ref}
          position={[0.2, 1.2, 0.8]}
          color="#BAE6FD"
          intensity={0}
          distance={6}
          decay={1.2}
        />
        <pointLight
          ref={hullLight2Ref}
          position={[-0.6, -0.4, 0.7]}
          color="#38BDF8"
          intensity={0}
          distance={5}
          decay={1.4}
        />

        {/* SpotLight LookAt Target primitives in parent coordinate space */}
        <primitive object={leftTarget} />
        <primitive object={rightTarget} />

        {/* Port LED Floodlight Fixture, Spotlight & Dedicated Volumetric Oceanic Beam */}
        <group position={[1.32, -0.14, 0.2]}>
          <spotLight
            ref={leftSpotRef}
            target={leftTarget}
            color="#BAE6FD"
            angle={0.82}
            penumbra={0.95}
            distance={25}
            decay={1.3}
            castShadow
          />
          {/* Fixture Bezel Ring */}
          <mesh rotation={[0, 0, -Math.PI / 2 - 0.16]} position={[0, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.07, 0.05, 16]} />
            <meshStandardMaterial
              color="#0F172A"
              metalness={0.9}
              roughness={0.25}
            />
          </mesh>
          {/* Glowing Glass Emitter Lens */}
          <mesh
            rotation={[0, 0, -Math.PI / 2 - 0.16]}
            position={[0.02, -0.003, 0]}
          >
            <cylinderGeometry args={[0.055, 0.055, 0.015, 16]} />
            <primitive object={lensMaterial} attach="material" />
          </mesh>
          {/* Volumetric Beam Originating Directly at the Lamp Lens */}
          <mesh
            ref={portBeamRef}
            geometry={beamGeometry}
            position={[0.02, -0.003, 0]}
            rotation={[0, 0.04, -0.16]}
          >
            <primitive object={beamMaterial} attach="material" />
          </mesh>
        </group>

        {/* Starboard LED Floodlight Fixture, Spotlight & Dedicated Volumetric Oceanic Beam */}
        <group position={[1.32, -0.14, -0.2]}>
          <spotLight
            ref={rightSpotRef}
            target={rightTarget}
            color="#BAE6FD"
            angle={0.82}
            penumbra={0.95}
            distance={25}
            decay={1.3}
            castShadow
          />
          {/* Fixture Bezel Ring */}
          <mesh rotation={[0, 0, -Math.PI / 2 - 0.16]} position={[0, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.07, 0.05, 16]} />
            <meshStandardMaterial
              color="#0F172A"
              metalness={0.9}
              roughness={0.25}
            />
          </mesh>
          {/* Glowing Glass Emitter Lens */}
          <mesh
            rotation={[0, 0, -Math.PI / 2 - 0.16]}
            position={[0.02, -0.003, 0]}
          >
            <cylinderGeometry args={[0.055, 0.055, 0.015, 16]} />
            <primitive object={lensMaterial} attach="material" />
          </mesh>
          {/* Volumetric Beam Originating Directly at the Lamp Lens */}
          <mesh
            ref={starboardBeamRef}
            geometry={beamGeometry}
            position={[0.02, -0.003, 0]}
            rotation={[0, -0.04, -0.16]}
          >
            <primitive object={beamMaterial} attach="material" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// Preload GLTF model
useGLTF.preload("/models/submarine.glb");
