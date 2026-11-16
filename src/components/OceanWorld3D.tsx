import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { DiveRef } from '../types/dive';
import { Submarine3D } from './Submarine3D';
import { DeepSeafloorReef } from './DeepSeafloorReef';

// Depth Color Constants: scientifically calibrated oceanic light absorption palette (Beer-Lambert Law)
const C_SURFACE_ZENITH = new THREE.Color('#7DD3FC'); // Brilliant sunlit tropical surface ceiling
const C_SURFACE_WATER  = new THREE.Color('#0284C7'); // Vibrant deep open-ocean azure (Rayleigh scatter)
const C_SURFACE_DEEP   = new THREE.Color('#0369A1'); // Epipelagic lower depth blue

const C_COBALT_TOP     = new THREE.Color('#075985'); // Mesopelagic twilight upper
const C_COBALT_MID     = new THREE.Color('#033868'); // Mesopelagic twilight core (deep oceanic indigo)
const C_COBALT_BOT     = new THREE.Color('#021D3A'); // Mesopelagic lower depth

const C_NAVY_TOP       = new THREE.Color('#021D3A'); // Bathypelagic midnight upper
const C_NAVY_MID       = new THREE.Color('#010E24'); // Bathypelagic midnight core
const C_NAVY_BOT       = new THREE.Color('#010614'); // Bathypelagic lower depth

const C_TRENCH_COL     = new THREE.Color('#000308'); // Abyssal & Hadal trench pitch darkness

/**
 * Procedural circular soft particle texture with smooth feathered falloff
 * (Guarantees zero square/blocky pixel artifacts)
 */
function createSoftParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 31);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.2, 'rgba(224, 242, 254, 0.7)');
  grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.25)');
  grad.addColorStop(0.85, 'rgba(6, 182, 212, 0.05)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 31, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Soft feathered volumetric sunbeams (God Rays) with zero hard rectangular borders
 */
const SoftSunbeamShader = {
  uniforms: {
    uColor: { value: new THREE.Color('#BAE6FD') },
    uOpacity: { value: 0.28 },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      // Smooth sinusoidal edge falloff (0 at left/right edges, 1 at center)
      float xFade = sin(vUv.x * 3.14159265);
      xFade = pow(xFade, 2.2);

      // Vertical falloff: bright at surface, exponential extinction downward (Beer's Law)
      float yFade = pow(vUv.y, 1.35) * exp(-1.2 * (1.0 - vUv.y));

      // Animated wave pulsation from surface swells
      float waveRipple = 0.90 + 0.10 * sin(vUv.x * 14.0 + vUv.y * 6.0 - uTime * 2.2);

      float alpha = xFade * yFade * uOpacity * waveRipple;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};

/**
 * Photorealistic Spherical Ocean Water Backdrop
 * Simulates genuine 3D oceanic light physics:
 * 1. Beer-Lambert vertical absorption gradient (Surface azure -> Deep sapphire -> Midnight trench).
 * 2. Mie forward solar scattering (radiant sunlit diffused glow when looking towards sun in upper ocean).
 * 3. Dynamic volumetric caustic curtains shimmering across the distant water column.
 * 4. Thermocline fluid density stratification layers undulating with ocean currents.
 * 5. Organic suspended phytoplankton & marine silt turbidity haze (eliminates CGI empty void look).
 */
function OceanWaterBackdrop({ diveRef }: { diveRef: DiveRef }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const backdropMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uSurfaceColor: { value: new THREE.Color('#7DD3FC') },
        uMidColor:     { value: new THREE.Color('#0284C7') },
        uDeepColor:    { value: new THREE.Color('#0369A1') },
        uSunDir:       { value: new THREE.Vector3(0.35, 0.85, 0.38).normalize() },
        uCameraPos:    { value: new THREE.Vector3(0, 0.25, 6.2) },
        uTime:         { value: 0 },
        uDepth:        { value: 0 },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uSurfaceColor;
        uniform vec3 uMidColor;
        uniform vec3 uDeepColor;
        uniform vec3 uSunDir;
        uniform vec3 uCameraPos;
        uniform float uTime;
        uniform float uDepth;
        varying vec3 vWorldPos;

        void main() {
          // 1. Normalized viewing ray from camera to world position on celestial sphere
          vec3 viewDir = normalize(vWorldPos - uCameraPos);
          float pitch = viewDir.y;

          // 2. Dynamic oceanic current waves & thermocline density stratification
          // Creates authentic horizontal fluid density bands that drift with ocean currents
          float wave1 = sin(viewDir.y * 6.5 - uTime * 0.45 + sin(viewDir.x * 3.5)) * 0.045;
          float wave2 = cos(viewDir.y * 12.0 + viewDir.z * 4.0 - uTime * 0.3) * 0.025;
          float wave3 = sin(viewDir.x * 2.0 + viewDir.z * 2.0 + uTime * 0.2) * 0.02;
          float fluidPitch = pitch + (wave1 + wave2 + wave3) * (1.0 - uDepth * 0.7);

          // 3. Physical Oceanic Vertical Absorption Gradient (Beer-Lambert law)
          vec3 waterCol;
          if (fluidPitch > 0.0) {
            // Looking upwards towards sunlit surface / Snell's window
            float t = pow(fluidPitch, 0.75);
            waterCol = mix(uMidColor, uSurfaceColor, t);
          } else {
            // Looking downwards into deep twilight / abyss
            float t = pow(abs(fluidPitch), 0.85);
            waterCol = mix(uMidColor, uDeepColor, t);
          }

          // 4. Volumetric Sunlight Forward Scattering (Mie Scattering)
          // Water glows with radiant diffused daylight when looking towards the sun in the upper ocean
          float sunAlignment = max(0.0, dot(viewDir, uSunDir));
          float miePhase = pow(sunAlignment, 3.5) * 0.55 + pow(sunAlignment, 14.0) * 0.35;
          float sunPenetration = max(0.0, 1.0 - uDepth * 2.8);
          vec3 sunScatterColor = vec3(0.55, 0.88, 1.0);
          vec3 volumetricSunScatter = sunScatterColor * miePhase * 0.60 * sunPenetration;

          // 5. Volumetric Caustic Light Curtains in the distance (Upper ocean 0% - 25% depth)
          // Sunlight refracting through surface waves creates shimmering 3D sheets of light in the water
          if (sunPenetration > 0.01) {
            vec3 cCoord = viewDir * 14.0 + vec3(uTime * 0.18, -uTime * 0.35, uTime * 0.14);
            float caust1 = sin(cCoord.x * 2.0 + sin(cCoord.z * 1.8)) * cos(cCoord.y * 1.6);
            float caust2 = sin(cCoord.x * 3.2 - cCoord.z * 2.6 + uTime * 0.9);
            float caustSheet = pow(clamp((caust1 + caust2 * 0.8) * 0.45 + 0.55, 0.0, 1.0), 2.5);
            
            float causticFade = smoothstep(-0.4, 0.5, pitch) * sunPenetration;
            vec3 causticColor = vec3(0.35, 0.82, 0.98);
            waterCol += causticColor * caustSheet * 0.22 * causticFade;
          }

          // 6. Microscopic Phytoplankton / Marine Silt Turbidity Haze
          float siltTurbidity = (sin(viewDir.x * 8.0 + uTime * 0.15) * cos(viewDir.z * 8.0 - uTime * 0.12)) * 0.018;
          waterCol += vec3(0.02, 0.05, 0.08) * siltTurbidity * (1.0 - uDepth * 0.8);

          // 7. Benthic / Abyssal Bioluminescent Micro-Backscatter in deep water (progress > 0.60)
          float deepAtmosphere = smoothstep(0.60, 1.0, uDepth);
          vec3 deepNavyGlow = vec3(0.005, 0.018, 0.042) * (1.0 - abs(pitch) * 0.5) * deepAtmosphere;

          gl_FragColor = vec4(waterCol + volumetricSunScatter + deepNavyGlow, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    if (!matRef.current) return;
    const p = diveRef.current.progress;
    const t = state.clock.getElapsedTime();

    matRef.current.uniforms.uTime.value = t;
    matRef.current.uniforms.uDepth.value = p;

    if (p <= 0.22) {
      const t = p / 0.22;
      matRef.current.uniforms.uSurfaceColor.value.copy(C_SURFACE_ZENITH).lerp(C_COBALT_TOP, t);
      matRef.current.uniforms.uMidColor.value.copy(C_SURFACE_WATER).lerp(C_COBALT_MID, t);
      matRef.current.uniforms.uDeepColor.value.copy(C_SURFACE_DEEP).lerp(C_COBALT_BOT, t);
    } else if (p <= 0.60) {
      const t = (p - 0.22) / 0.38;
      matRef.current.uniforms.uSurfaceColor.value.copy(C_COBALT_TOP).lerp(C_NAVY_TOP, t);
      matRef.current.uniforms.uMidColor.value.copy(C_COBALT_MID).lerp(C_NAVY_MID, t);
      matRef.current.uniforms.uDeepColor.value.copy(C_COBALT_BOT).lerp(C_NAVY_BOT, t);
    } else {
      const t = THREE.MathUtils.clamp((p - 0.60) / 0.40, 0, 1);
      matRef.current.uniforms.uSurfaceColor.value.copy(C_NAVY_TOP).lerp(C_TRENCH_COL, t);
      matRef.current.uniforms.uMidColor.value.copy(C_NAVY_MID).lerp(C_TRENCH_COL, t);
      matRef.current.uniforms.uDeepColor.value.copy(C_NAVY_BOT).lerp(C_TRENCH_COL, t);
    }
  });

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[52, 48, 36]} />
      <primitive ref={matRef} object={backdropMaterial} attach="material" />
    </mesh>
  );
}

/**
 * Sunlit Water Surface Membrane / Snell's Window (Active near surface, 0% to 28% scroll)
 * Positioned above the submarine to give an authentic optical sense of being just beneath
 * the sunlit waves: Snell's window circular optical aperture, liquid mercury total internal
 * reflection rim, and dynamic undulating caustic refraction networks!
 */
function SurfaceWaterCeiling({ diveRef }: { diveRef: DiveRef }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const surfaceMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.42 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          vec2 centered = vUv - vec2(0.5);
          float dist = length(centered);
          if (dist > 0.5) discard;

          // Snell's Window circular optical aperture
          float snellAperture = smoothstep(0.50, 0.12, dist);
          float tirRim = smoothstep(0.38, 0.49, dist) * (1.0 - smoothstep(0.49, 0.50, dist));

          // Multi-frequency ocean wave caustics
          float w1 = sin((vUv.x * 14.0) + uTime * 1.8) * cos((vUv.y * 14.0) + uTime * 1.4);
          float w2 = sin((vUv.x * 26.0 - vUv.y * 22.0) + uTime * 2.5);
          float w3 = cos((vUv.x * 38.0 + vUv.y * 30.0) - uTime * 1.9) * 0.5;
          float caustics = clamp((w1 + w2 + w3) * 0.45 + 0.55, 0.0, 1.0);
          caustics = pow(caustics, 2.0);

          // Zenith sky glow through Snell's window
          vec3 sunZenith = vec3(0.96, 0.99, 1.0);
          vec3 waterEdge = vec3(0.08, 0.52, 0.82);
          vec3 rimReflect = vec3(0.04, 0.28, 0.52);

          vec3 color = mix(waterEdge, sunZenith, snellAperture) + rimReflect * tirRim * 1.5 + caustics * 0.35;
          float alpha = snellAperture * uOpacity * (0.65 + caustics * 0.45);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    if (!matRef.current) return;
    const p = diveRef.current.progress;
    const time = state.clock.getElapsedTime();

    matRef.current.uniforms.uTime.value = time;
    // Strictly active at the surface; smoothly dissolves to zero as submarine dives into mesopelagic (p = 0.28)
    const fade = THREE.MathUtils.clamp(1.0 - (p / 0.28), 0, 1);
    matRef.current.uniforms.uOpacity.value = 0.45 * Math.pow(fade, 1.3);
  });

  return (
    <mesh position={[0, 4.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[32, 32, 1, 1]} />
      <primitive ref={matRef} object={surfaceMaterial} attach="material" />
    </mesh>
  );
}

/**
 * Depth Fog & Atmospheric Background Controller
 * Vibrant tropical open-ocean azure at the surface (p = 0), fading through
 * luminous oceanic cobalt into midnight trench blackness.
 */
function DepthAtmosphereController({ diveRef }: { diveRef: DiveRef }) {
  const { scene } = useThree();
  const currentColor = useMemo(() => new THREE.Color('#0284C7'), []);

  useEffect(() => {
    scene.background = new THREE.Color('#0284C7');
    scene.fog = new THREE.FogExp2('#0284C7', 0.0075);
  }, [scene]);

  useFrame(() => {
    const p = diveRef.current.progress;

    if (p <= 0.22) {
      const t = p / 0.22;
      currentColor.copy(C_SURFACE_WATER).lerp(C_COBALT_MID, t);
    } else if (p <= 0.60) {
      const t = (p - 0.22) / 0.38;
      currentColor.copy(C_COBALT_MID).lerp(C_NAVY_MID, t);
    } else {
      const t = THREE.MathUtils.clamp((p - 0.60) / 0.40, 0, 1);
      currentColor.copy(C_NAVY_MID).lerp(C_TRENCH_COL, t);
    }

    if (scene.background instanceof THREE.Color) {
      scene.background.copy(currentColor);
    }

    // Clear open ocean visibility at surface (0.0075), thickening to dark benthic abyss (0.030)
    const fogDensity = THREE.MathUtils.lerp(0.0075, 0.030, p);
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(currentColor);
      scene.fog.density = fogDensity;
    }
  });

  return null;
}

/**
 * Dynamic Ocean Lighting Controller with Dynamic Surface Caustic Light Waves
 * Projects shimmering refracted caustic sunlight ripples across the submarine's hull
 * and surrounding water column when near the surface, fading out naturally in the abyss.
 */
function DynamicOceanLighting({ diveRef }: { diveRef: DiveRef }) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    const p = diveRef.current.progress;
    const t = state.clock.getElapsedTime();

    // Surface sunlight factor: 1.0 at surface, fades to 0.0 by p = 0.28
    const surfaceFactor = THREE.MathUtils.clamp(1.0 - (p / 0.28), 0, 1);

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.55, 1.95, surfaceFactor);
      const surfaceAmb = new THREE.Color('#0284C7');
      const deepAmb = new THREE.Color('#021124');
      ambientRef.current.color.copy(deepAmb).lerp(surfaceAmb, surfaceFactor);
    }

    if (hemiRef.current) {
      hemiRef.current.intensity = 2.4 * Math.pow(surfaceFactor, 1.25);
    }

    if (fillLightRef.current) {
      // Dynamic multi-frequency caustic sunlight shimmer playing across the vessel hull
      const causticPulse =
        1.0 +
        Math.sin(t * 3.6) * 0.18 +
        Math.cos(t * 5.2) * 0.12 +
        Math.sin(t * 2.1 + 1.2) * 0.14;
      fillLightRef.current.intensity = 2.2 * Math.pow(surfaceFactor, 1.2) * causticPulse;
    }
  });

  return (
    <>
      {/* Dynamic Ambient Fill Light */}
      <ambientLight ref={ambientRef} color="#0284C7" intensity={1.95} />

      {/* Surface Sky/Water Bounce Hemisphere Light (active strictly near surface) */}
      <hemisphereLight
        ref={hemiRef}
        color="#7DD3FC"
        groundColor="#0369A1"
        intensity={2.4}
        position={[0, 8, 0]}
      />

      {/* Upper-front sunlit water caustic key fill */}
      <directionalLight
        ref={fillLightRef}
        position={[1.5, 5.0, 4.5]}
        color="#BAE6FD"
        intensity={2.2}
      />
    </>
  );
}

/**
 * Feathered Volumetric Sunlight Shafts (God Rays, 0% – 28% Scroll)
 * Provides organic crepuscular rays of sunlight piercing down into the water.
 */
function SurfaceSunlightRays({ diveRef }: { diveRef: DiveRef }) {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const raysGroupRef = useRef<THREE.Group>(null);
  const rayMaterialsRef = useRef<THREE.ShaderMaterial[]>([]);

  const rayPlanes = useMemo(() => {
    const planes = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 0.36 - 0.18;
      const x = (i - 3.5) * 1.65;
      const z = -1.5 + Math.sin(i * 1.6) * 1.8;
      planes.push({ id: i, angle, x, z });
    }
    return planes;
  }, []);

  const baseRayMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(SoftSunbeamShader.uniforms),
      vertexShader: SoftSunbeamShader.vertexShader,
      fragmentShader: SoftSunbeamShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    const p = diveRef.current.progress;
    const t = state.clock.getElapsedTime();

    // Natural sun penetration depth: active through upper ocean, smoothly dissolving by p = 0.28
    const sunFade = THREE.MathUtils.clamp(1.0 - (p / 0.28), 0, 1);

    if (dirLightRef.current) {
      const causticWave =
        1.0 +
        Math.sin(t * 3.8) * 0.16 +
        Math.cos(t * 5.4) * 0.12 +
        Math.sin(t * 2.4 + 0.8) * 0.10;
      dirLightRef.current.intensity = 6.2 * causticWave * Math.pow(sunFade, 1.25);
    }

    if (raysGroupRef.current) {
      raysGroupRef.current.rotation.z = Math.sin(t * 0.35) * 0.035 - 0.1;
      raysGroupRef.current.rotation.x = Math.cos(t * 0.25) * 0.02;

      rayMaterialsRef.current.forEach((mat, idx) => {
        if (mat) {
          mat.uniforms.uTime.value = t;
          const pulse = 0.26 + Math.sin(t * 1.5 + idx * 0.9) * 0.08;
          mat.uniforms.uOpacity.value = pulse * Math.pow(sunFade, 1.25);
        }
      });
    }
  });

  return (
    <>
      <directionalLight
        ref={dirLightRef}
        position={[2.5, 8.5, 3.5]}
        color="#E0F2FE"
        intensity={6.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      <group ref={raysGroupRef} position={[0, 4.8, 0]}>
        {rayPlanes.map((ray, i) => (
          <mesh
            key={ray.id}
            position={[ray.x, 0, ray.z]}
            rotation={[0.06, 0, ray.angle - 0.18]}
          >
            <planeGeometry args={[2.8, 11]} />
            <primitive
              ref={(el: THREE.ShaderMaterial | null) => { if (el) rayMaterialsRef.current[i] = el; }}
              object={baseRayMaterial.clone()}
              attach="material"
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

/**
 * Photorealistic Forward-Cruising Ocean Marine Snow (Organic Floating Particulate)
 * Streams continuously past the submarine from front-right to rear-left,
 * giving the clear, tangible sensation of the submarine cruising forward through water
 * even when not actively scrolling!
 */
function RealisticMarineSnow({ diveRef }: { diveRef: DiveRef }) {
  const pointsRef = useRef<THREE.Points>(null);
  const pointsMatRef = useRef<THREE.PointsMaterial>(null);

  const softTexture = useMemo(() => createSoftParticleTexture(), []);

  // 550 sparse organic motes distributed across a deep 3D volume
  const { positions, speeds, phases } = useMemo(() => {
    const count = 550;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 20;     // X width
      pos[i3 + 1] = (Math.random() - 0.5) * 15; // Y height
      pos[i3 + 2] = (Math.random() - 0.5) * 16; // Z depth

      // Individual particle speed variation
      spd[i] = 0.75 + Math.random() * 0.7;
      phs[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, speeds: spd, phases: phs };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const pos = geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    const velocity = diveRef.current.velocity;
    // Scroll Dive vs Idle Cruise factor:
    // When scrolling down, divingFactor -> 1.0 (pure vertical descent rush, zero horizontal forward drift)
    // When not scrolling, divingFactor -> 0.0 (smooth forward horizontal cruise stream)
    const divingFactor = THREE.MathUtils.clamp(Math.abs(velocity) / 120.0, 0, 1);
    const cruiseFactor = 1.0 - divingFactor;

    // Horizontal forward stream active during cruise; calm, serene drift at the seafloor
    const p = diveRef.current.progress;
    const seafloorCalmFactor = THREE.MathUtils.clamp((p - 0.70) / 0.25, 0, 1);
    const baseCruiseSpeed = THREE.MathUtils.lerp(1.25, 0.25, seafloorCalmFactor) * cruiseFactor;

    // Vertical rush active when plunging down into the depths (or ascending)
    const scrollDir = velocity >= 0 ? 1.0 : -1.0;
    const verticalDescentRate = (0.06 * cruiseFactor) + (4.5 * divingFactor * scrollDir);

    // Submarine live instantaneous forward heading derived from rotation.y (defaults to SIDE_YAW = -0.06):
    const liveYaw = diveRef.current.headingAngle ?? -0.06;
    const fwdX = Math.cos(liveYaw);
    const fwdZ = -Math.sin(liveYaw);

    // Particles stream backward in the exact opposite direction of heading:
    const streamX = -fwdX;
    const streamZ = -fwdZ;

    for (let i = 0; i < pos.length / 3; i++) {
      const i3 = i * 3;
      const pSpeed = speeds[i];

      // Horizontal flow (streams backward strictly when cruising forward)
      pos[i3] += streamX * baseCruiseSpeed * pSpeed * delta;
      pos[i3 + 2] += streamZ * baseCruiseSpeed * pSpeed * delta;

      // Vertical flow (particulate rushes straight UPWARD when diving down!)
      pos[i3 + 1] += verticalDescentRate * pSpeed * delta * 7.5;

      // Micro water turbulence sway
      pos[i3 + 1] += Math.sin(time * 1.8 + phases[i]) * 0.0018;

      // Seamless volume boundary wrapping in all directions:
      if (pos[i3] < -10.0) {
        pos[i3] += 20.0;
      } else if (pos[i3] > 10.0) {
        pos[i3] -= 20.0;
      }

      if (pos[i3 + 2] < -8.0) {
        pos[i3 + 2] += 16.0;
      } else if (pos[i3 + 2] > 8.0) {
        pos[i3 + 2] -= 16.0;
      }

      if (pos[i3 + 1] > 7.5) {
        pos[i3 + 1] -= 15.0;
      } else if (pos[i3 + 1] < -7.5) {
        pos[i3 + 1] += 15.0;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    if (pointsMatRef.current) {
      // Near surface: glistening sunlit plankton motes (#E0F2FE)
      // In deep water: benthic marine snow (#93C5FD)
      const sunlitMote = new THREE.Color('#E0F2FE');
      const abyssalSnow = new THREE.Color('#93C5FD');
      const surfaceZone = Math.max(0, 1.0 - p * 3.2);
      pointsMatRef.current.color.copy(abyssalSnow).lerp(sunlitMote, surfaceZone);
      pointsMatRef.current.opacity = THREE.MathUtils.lerp(0.38, 0.58, surfaceZone);
    }
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
        ref={pointsMatRef}
        map={softTexture}
        size={0.042}
        sizeAttenuation={true}
        color="#D0EDFC"
        transparent={true}
        opacity={0.48}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function ResponsiveCameraController() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const isPortrait = size.width < size.height;
      if (isPortrait) {
        camera.position.set(0, 0.35, 7.2);
        camera.fov = 44;
      } else {
        camera.position.set(0, 0.25, 6.2);
        camera.fov = 42;
      }
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height]);

  return null;
}

export interface OceanWorld3DProps {
  diveRef: DiveRef;
}

export const OceanWorld3D: React.FC<OceanWorld3DProps> = ({ diveRef }) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.25, 6.2], fov: 42 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          powerPreference: 'high-performance',
        }}
      >
        {/* Dynamic responsive mobile portrait camera framing */}
        <ResponsiveCameraController />

        {/* Dynamic Fog & Depth Lighting Atmosphere */}
        <DepthAtmosphereController diveRef={diveRef} />

        {/* Surrounding Ocean Column Gradient Backdrop */}
        <OceanWaterBackdrop diveRef={diveRef} />

        {/* Sunlit Water Surface Membrane / Skylight (Active ONLY near surface) */}
        <SurfaceWaterCeiling diveRef={diveRef} />

        {/* Dynamic Depth & Surface Lighting */}
        <DynamicOceanLighting diveRef={diveRef} />

        {/* Soft Feathered Surface Sunlight Shafts */}
        <SurfaceSunlightRays diveRef={diveRef} />

        {/* Specular Environment Reflections for Wet Submarine Hull */}
        <Environment>
          <Lightformer
            form="ring"
            intensity={2}
            color="#38BDF8"
            position={[0, 5, 2]}
            scale={[10, 10, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.5}
            color="#0A89AD"
            position={[-5, 2, -2]}
            scale={[5, 10, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.2}
            color="#0284C7"
            position={[5, 2, -2]}
            scale={[5, 10, 1]}
          />
        </Environment>

        {/* Photorealistic Sparse Marine Snow Particle Field */}
        <RealisticMarineSnow diveRef={diveRef} />

        {/* 3D Normalized Submarine with Dynamic Physics & Floodlights */}
        <Submarine3D diveRef={diveRef} />

        {/* Photorealistic Deep Seafloor with Natural Basalt Rocks & Geological Bathymetry */}
        <DeepSeafloorReef diveRef={diveRef} />
      </Canvas>
    </div>
  );
};
