import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DiveRef } from '../types/dive';
import { SeabedBranding3D } from './SeabedBranding3D';

/**
 * Generates photorealistic high-resolution PBR textures for Marine Sediment:
 * Crisp sand wave crests, tactile micro-grit, and tangent-space normal maps.
 * Uses 16x anisotropic filtering for razor-sharp clarity across oblique angles.
 */
function createSedimentTextures(): { diffuse: THREE.CanvasTexture; normal: THREE.CanvasTexture } {
  const size = 1024;
  const heightData = new Float32Array(size * size);

  // 1. High-contrast height map of oceanic sand ripples + fine micro-grit
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      // Primary sweeping sand current dunes
      const r1 = Math.sin(x * 0.048 + Math.cos(y * 0.016) * 2.2) * 0.48;
      // Secondary cross-current ripples
      const r2 = Math.sin((x * 0.028 + y * 0.038) * 1.5) * 0.28;
      // Fine tactile sand micro-grit
      const n = (Math.random() - 0.5) * 0.16;
      heightData[idx] = 0.5 + (r1 + r2 + n) * 0.42;
    }
  }

  // 2. Crisp Diffuse Map
  const dCanvas = document.createElement('canvas');
  dCanvas.width = size;
  dCanvas.height = size;
  const dCtx = dCanvas.getContext('2d')!;

  // Deep oceanic sediment base
  dCtx.fillStyle = '#081422';
  dCtx.fillRect(0, 0, size, size);

  // Soft organic silt clouds
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 25 + Math.random() * 80;
    const grad = dCtx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(4, 9, 15, 0.7)');
    grad.addColorStop(1, 'rgba(4, 9, 15, 0)');
    dCtx.fillStyle = grad;
    dCtx.beginPath();
    dCtx.arc(x, y, r, 0, Math.PI * 2);
    dCtx.fill();
  }

  // Lighter mineral sand drifts
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 18 + Math.random() * 65;
    const grad = dCtx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(32, 72, 106, 0.55)');
    grad.addColorStop(1, 'rgba(32, 72, 106, 0)');
    dCtx.fillStyle = grad;
    dCtx.beginPath();
    dCtx.arc(x, y, r, 0, Math.PI * 2);
    dCtx.fill();
  }

  // Sharp ripple crest highlights & shadowed troughs
  const dImg = dCtx.getImageData(0, 0, size, size);
  const dData = dImg.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const h = heightData[y * size + x];
      // High-contrast ripple shaping
      const factor = (h - 0.5) * 55;
      dData[idx] = Math.min(255, Math.max(0, dData[idx] + factor * 0.9));
      dData[idx + 1] = Math.min(255, Math.max(0, dData[idx + 1] + factor * 1.25));
      dData[idx + 2] = Math.min(255, Math.max(0, dData[idx + 2] + factor * 1.6));
    }
  }
  dCtx.putImageData(dImg, 0, 0);

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(8, 8);
  diffuse.anisotropy = 16;
  diffuse.minFilter = THREE.LinearMipmapLinearFilter;
  diffuse.magFilter = THREE.LinearFilter;

  // 3. Sharp High-Relief Tangent-Space Normal Map
  const nCanvas = document.createElement('canvas');
  nCanvas.width = size;
  nCanvas.height = size;
  const nCtx = nCanvas.getContext('2d')!;
  const nImg = nCtx.createImageData(size, size);
  const nData = nImg.data;

  const strength = 5.6; // Increased strength for razor-sharp ripple relief
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xL = (x - 1 + size) % size;
      const xR = (x + 1) % size;
      const yU = (y - 1 + size) % size;
      const yD = (y + 1) % size;

      const dX = (heightData[y * size + xR] - heightData[y * size + xL]) * strength;
      const dY = (heightData[yD * size + x] - heightData[yU * size + x]) * strength;

      const len = Math.sqrt(dX * dX + dY * dY + 1.0);
      const nx = -dX / len;
      const ny = -dY / len;
      const nz = 1.0 / len;

      const pIdx = (y * size + x) * 4;
      nData[pIdx] = Math.floor((nx * 0.5 + 0.5) * 255);
      nData[pIdx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      nData[pIdx + 2] = Math.floor(nz * 255);
      nData[pIdx + 3] = 255;
    }
  }
  nCtx.putImageData(nImg, 0, 0);

  const normal = new THREE.CanvasTexture(nCanvas);
  normal.wrapS = THREE.RepeatWrapping;
  normal.wrapT = THREE.RepeatWrapping;
  normal.repeat.set(8, 8);
  normal.anisotropy = 16;
  normal.minFilter = THREE.LinearMipmapLinearFilter;
  normal.magFilter = THREE.LinearFilter;

  return { diffuse, normal };
}

/**
 * Generates photorealistic PBR stone maps for Basalt / Granite Rock:
 * Crisp horizontal sedimentary strata, chiseled rock fissures, and polished wet mineral pores.
 */
function createRockTextures(): { diffuse: THREE.CanvasTexture; normal: THREE.CanvasTexture } {
  const size = 1024;
  const heightData = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      // Crisp sedimentary horizontal strata bands
      const strata1 = Math.sin(y * 0.08) * 0.32;
      const strata2 = Math.sin(y * 0.24 + Math.cos(x * 0.05) * 2.2) * 0.18;
      // Chiseled rock fissures & crystalline cleavage
      const fissure = Math.cos(x * 0.07 + Math.sin(y * 0.035) * 3.2) * 0.25;
      const grain = (Math.random() - 0.5) * 0.18;
      heightData[idx] = 0.5 + (strata1 + strata2 + fissure + grain) * 0.45;
    }
  }

  // Diffuse
  const dCanvas = document.createElement('canvas');
  dCanvas.width = size;
  dCanvas.height = size;
  const dCtx = dCanvas.getContext('2d')!;

  // Deep basalt slate base
  dCtx.fillStyle = '#0c1622';
  dCtx.fillRect(0, 0, size, size);

  // Basalt mineral veins and mottled stone texture
  for (let i = 0; i < 280; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 8 + Math.random() * 32;
    dCtx.fillStyle = Math.random() > 0.4 ? 'rgba(4, 8, 14, 0.7)' : 'rgba(32, 58, 84, 0.55)';
    dCtx.beginPath();
    dCtx.arc(x, y, r, 0, Math.PI * 2);
    dCtx.fill();
  }

  // Sharp mineral strata lines
  for (let y = 0; y < size; y += 22) {
    dCtx.beginPath();
    for (let x = 0; x < size; x += 16) {
      const off = Math.sin(x * 0.035) * 7;
      if (x === 0) dCtx.moveTo(x, y + off);
      else dCtx.lineTo(x, y + off);
    }
    dCtx.lineWidth = 4.5;
    dCtx.strokeStyle = 'rgba(42, 78, 112, 0.45)';
    dCtx.stroke();
  }

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(4, 4);
  diffuse.anisotropy = 16;
  diffuse.minFilter = THREE.LinearMipmapLinearFilter;
  diffuse.magFilter = THREE.LinearFilter;

  // Sharp Normal Map
  const nCanvas = document.createElement('canvas');
  nCanvas.width = size;
  nCanvas.height = size;
  const nCtx = nCanvas.getContext('2d')!;
  const nImg = nCtx.createImageData(size, size);
  const nData = nImg.data;

  const strength = 6.4; // High strength for chiseled rock relief
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xL = (x - 1 + size) % size;
      const xR = (x + 1) % size;
      const yU = (y - 1 + size) % size;
      const yD = (y + 1) % size;

      const dX = (heightData[y * size + xR] - heightData[y * size + xL]) * strength;
      const dY = (heightData[yD * size + x] - heightData[yU * size + x]) * strength;

      const len = Math.sqrt(dX * dX + dY * dY + 1.0);
      const nx = -dX / len;
      const ny = -dY / len;
      const nz = 1.0 / len;

      const pIdx = (y * size + x) * 4;
      nData[pIdx] = Math.floor((nx * 0.5 + 0.5) * 255);
      nData[pIdx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      nData[pIdx + 2] = Math.floor(nz * 255);
      nData[pIdx + 3] = 255;
    }
  }
  nCtx.putImageData(nImg, 0, 0);

  const normal = new THREE.CanvasTexture(nCanvas);
  normal.wrapS = THREE.RepeatWrapping;
  normal.wrapT = THREE.RepeatWrapping;
  normal.repeat.set(4, 4);
  normal.anisotropy = 16;
  normal.minFilter = THREE.LinearMipmapLinearFilter;
  normal.magFilter = THREE.LinearFilter;

  return { diffuse, normal };
}

/**
 * Evaluates the continuous bathymetric seafloor height at any (X, Z) coordinate in 3D space.
 * Allows 3D objects, boulders, and letters to attach precisely to the current floor surface!
 */
export function getSeafloorSurfaceY(x: number, z: number): number {
  const distFromCenter = Math.abs(x);
  const meshY = -z;

  // Central valley channel where the submarine navigates
  const centralValley = -Math.exp(-(x * x) / 32.0) * 0.75;

  // Natural rocky ridges rising on the left and right flanks
  const ridgeHeight = Math.pow(Math.min(distFromCenter / 16.0, 1.0), 1.6) * 2.4;

  // Geological strata terraces
  const strata =
    Math.sin(x * 0.22 + meshY * 0.14) * 0.65 +
    Math.cos(x * 0.38 - meshY * 0.25) * 0.35;

  // Rocky crags on the flanks
  const crags =
    (Math.sin(x * 0.75 + Math.cos(meshY * 0.5) * 1.6) * 0.35 +
      Math.cos(x * 1.2 - meshY * 0.8) * 0.18) *
    (distFromCenter > 4.5 ? 1.0 : 0.15);

  // Sand wave dunes in the valley
  const sandDunes =
    (Math.sin(x * 1.5 + meshY * 0.8) * 0.08 + Math.cos(x * 2.4 - meshY * 1.2) * 0.04) *
    (distFromCenter < 8.0 ? 1.0 : 0.3);

  return centralValley + ridgeHeight + strata * (distFromCenter > 3.5 ? 1.0 : 0.3) + crags + sandDunes;
}

/**
 * Creates sculpted organic boulders with natural cleavage planes and weathered facets.
 * High-detail subdivision (detail = 4) ensures zero visible polygon facets.
 */
function createSculptedOrganicBoulder(seed: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1.0, 4);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Flatten bottom naturally so boulder rests sunken in sand
    const bottomFactor = v.y < 0 ? 1.0 - Math.abs(v.y) * 0.42 : 1.0;

    // Organic rock cleavage noise
    const n1 = Math.sin(v.x * 2.2 + seed) * 0.16;
    const n2 = Math.cos(v.y * 2.6 + seed * 1.4) * 0.14;
    const n3 = Math.sin(v.z * 2.4 + seed * 0.8) * 0.15;
    const n4 = Math.sin((v.x + v.y + v.z) * 3.5) * 0.05;

    v.multiplyScalar((1.0 + n1 + n2 + n3 + n4) * bottomFactor);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Photorealistic Continuous Bathymetry Ocean Floor & Geological Rock Formations
 * Features:
 * - Smooth continuous ascent/descent: seafloor smoothly recedes into deep abyss fog without sudden pop-in or pop-out!
 * - 16x Anisotropic filtering for razor-sharp ripple and rock texture clarity.
 * - Slope-based material blending (sand on flat ground, polished stratified rock on cliffs).
 * - Sculpted organic boulders naturally dispersed across the landscape.
 */
export const DeepSeafloorReef: React.FC<{ diveRef: DiveRef }> = ({ diveRef }) => {
  const seafloorGroupRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);

  // 1. Procedural High-Res Sharp Textures
  const { diffuse: sandDiffuse, normal: sandNormal } = useMemo(() => createSedimentTextures(), []);
  const { diffuse: rockDiffuse, normal: rockNormal } = useMemo(() => createRockTextures(), []);

  // 2. Continuous Geological Bathymetry Terrain (75m x 75m with 110x110 resolution)
  const seabedGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(75, 75, 110, 110);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const meshY = pos.getY(i);
      // Local plane Y maps to 3D -Z, so 3D Z = -meshY
      pos.setZ(i, getSeafloorSurfaceY(x, -meshY));
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  // 3. Slope-Based PBR Terrain & Rock Material
  // Automatically renders Sand on flat areas and Polished Rock on steep slopes & cliffs!
  const geologicalMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: sandDiffuse,
      normalMap: sandNormal,
      normalScale: new THREE.Vector2(1.6, 1.6),
      roughness: 0.84,
      metalness: 0.12,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uRockMap = { value: rockDiffuse };
      shader.uniforms.uRockNormal = { value: rockNormal };
      shader.uniforms.uSandColor = { value: new THREE.Color('#16324e') };
      shader.uniforms.uRockColor = { value: new THREE.Color('#0a1622') };

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
         varying vec3 vWorldNormal;
         varying vec3 vWorldPos;
         varying vec2 vCustomUv;`
      ).replace(
        '#include <defaultnormal_vertex>',
        `#include <defaultnormal_vertex>
         vWorldNormal = normalize((modelMatrix * vec4(transformedNormal, 0.0)).xyz);`
      ).replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
         vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
         vCustomUv = uv;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
         varying vec3 vWorldNormal;
         varying vec3 vWorldPos;
         varying vec2 vCustomUv;
         uniform sampler2D uRockMap;
         uniform sampler2D uRockNormal;
         uniform vec3 uSandColor;
         uniform vec3 uRockColor;`
      ).replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         vec3 wNorm = normalize(vWorldNormal);
         float slope = 1.0 - abs(wNorm.y);

         float noiseBlend = sin(vWorldPos.x * 0.85) * cos(vWorldPos.z * 0.85) * 0.12;
         float rockFactor = smoothstep(0.22, 0.48, slope + noiseBlend);

         vec4 rockTex = texture2D(uRockMap, vCustomUv * 3.5);
         vec4 sandTex = diffuseColor;

         vec3 finalColor = mix(sandTex.rgb * uSandColor * 2.3, rockTex.rgb * uRockColor * 2.5, rockFactor);
         diffuseColor = vec4(finalColor, 1.0);`
      ).replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         // Polished wet rock has sharp specular highlights (0.58) vs matte sand (0.90)
         roughnessFactor = mix(0.90, 0.58, rockFactor);`
      );
    };

    return mat;
  }, [sandDiffuse, sandNormal, rockDiffuse, rockNormal]);

  // 4. Distinct Sculpted Boulder Geometries (Detail = 4, Silky Smooth)
  const boulderGeometries = useMemo(() => {
    return [
      createSculptedOrganicBoulder(111),
      createSculptedOrganicBoulder(222),
      createSculptedOrganicBoulder(333),
      createSculptedOrganicBoulder(444),
      createSculptedOrganicBoulder(555),
    ];
  }, []);

  // 5. Naturally Dispersed Boulder Placements (Spanning background, midground, and edges)
  const boulderPlacements = useMemo(() => {
    return [
      // Distant Horizon Boulders (z: -10 to -16m)
      { geoIdx: 0, pos: [-8.5, 0.4, -13.5] as [number, number, number], rot: [0.1, 0.5, -0.1] as [number, number, number], scale: [3.8, 1.8, 3.2] as [number, number, number] },
      { geoIdx: 1, pos: [9.0, 0.5, -12.8] as [number, number, number], rot: [-0.1, -0.6, 0.15] as [number, number, number], scale: [3.6, 1.7, 3.0] as [number, number, number] },
      { geoIdx: 4, pos: [0.5, 0.2, -15.0] as [number, number, number], rot: [0.2, 0.7, 0.0] as [number, number, number], scale: [4.2, 2.0, 3.6] as [number, number, number] },

      // Midground Flanking Boulders (z: -5 to -9m)
      { geoIdx: 2, pos: [-6.8, -0.1, -7.2] as [number, number, number], rot: [0.15, 0.4, 0.2] as [number, number, number], scale: [3.0, 1.4, 2.5] as [number, number, number] },
      { geoIdx: 3, pos: [7.2, -0.12, -6.8] as [number, number, number], rot: [-0.2, 0.7, -0.1] as [number, number, number], scale: [2.8, 1.35, 2.4] as [number, number, number] },
      { geoIdx: 1, pos: [-4.5, -0.25, -5.5] as [number, number, number], rot: [-0.15, 1.2, 0.1] as [number, number, number], scale: [2.5, 1.2, 2.1] as [number, number, number] },
      { geoIdx: 0, pos: [4.8, -0.28, -5.0] as [number, number, number], rot: [0.25, -0.8, -0.15] as [number, number, number], scale: [2.4, 1.15, 2.0] as [number, number, number] },

      // Submarine Exploration Midground (z: -2.5 to -4.0m)
      { geoIdx: 4, pos: [-3.2, -0.38, -3.2] as [number, number, number], rot: [0.1, 0.6, -0.12] as [number, number, number], scale: [2.2, 1.05, 1.8] as [number, number, number] },
      { geoIdx: 2, pos: [3.4, -0.4, -2.8] as [number, number, number], rot: [-0.12, -0.5, 0.1] as [number, number, number], scale: [2.1, 1.0, 1.7] as [number, number, number] },

      // Wide Foreground Edges (z: -0.5 to -1.5m, pushed wide to x = ±5.5m)
      { geoIdx: 1, pos: [-5.6, -0.42, -0.8] as [number, number, number], rot: [0.2, 0.3, 0.15] as [number, number, number], scale: [2.0, 0.95, 1.6] as [number, number, number] },
      { geoIdx: 3, pos: [5.8, -0.44, -0.6] as [number, number, number], rot: [-0.15, -0.7, 0.1] as [number, number, number], scale: [2.1, 1.0, 1.7] as [number, number, number] },

      // Small River Stones & Cobbles nestled in sand
      { geoIdx: 0, pos: [-1.8, -0.6, -1.8] as [number, number, number], rot: [0.3, 0.4, 0.2] as [number, number, number], scale: [0.85, 0.42, 0.7] as [number, number, number] },
      { geoIdx: 2, pos: [1.9, -0.62, -1.6] as [number, number, number], rot: [-0.2, 0.5, 0.1] as [number, number, number], scale: [0.9, 0.45, 0.75] as [number, number, number] },
      { geoIdx: 4, pos: [-0.8, -0.65, -0.2] as [number, number, number], rot: [0.25, -0.8, 0.15] as [number, number, number], scale: [0.75, 0.36, 0.6] as [number, number, number] },
      { geoIdx: 1, pos: [1.0, -0.64, 0.2] as [number, number, number], rot: [-0.15, 0.9, -0.2] as [number, number, number], scale: [0.8, 0.38, 0.65] as [number, number, number] },
    ];
  }, []);

  // Spotlight target positioned in the center of the illuminated sand channel
  const spotTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, -0.2, -2.5);
    return obj;
  }, []);

  // 60fps Frame Loop
  useFrame((state, delta) => {
    if (!seafloorGroupRef.current) return;
    const p = diveRef.current.progress;
    const t = state.clock.getElapsedTime();

    // Continuous forward cruising drift across the seabed aligned with live heading (defaults to SIDE_YAW = -0.06)
    const liveYaw = diveRef.current.headingAngle ?? -0.06;
    const fwdX = Math.cos(liveYaw);
    const fwdZ = -Math.sin(liveYaw);

    // Seafloor horizontal drift active during cruise; calm, serene, subtle travel glide across the seabed
    const divingFactor = THREE.MathUtils.clamp(Math.abs(diveRef.current.velocity) / 120.0, 0, 1);
    const cruiseFactor = 1.0 - divingFactor;
    const floorTravelFactor = THREE.MathUtils.clamp((p - 0.70) / 0.30, 0, 1);
    const cruiseGlide = (0.010 + 0.012 * floorTravelFactor) * cruiseFactor * delta;
    sandDiffuse.offset.x += cruiseGlide * fwdX;
    sandDiffuse.offset.y += cruiseGlide * fwdZ;
    sandNormal.offset.x += cruiseGlide * fwdX;
    sandNormal.offset.y += cruiseGlide * fwdZ;
    rockDiffuse.offset.x += cruiseGlide * fwdX;
    rockDiffuse.offset.y += cruiseGlide * fwdZ;
    rockNormal.offset.x += cruiseGlide * fwdX;
    rockNormal.offset.y += cruiseGlide * fwdZ;

    // COMPLETELY SMOOTH CONTINUOUS ASCENT & DESCENT (ZERO POPPING OR VANISHING)
    // As the user scrolls up, the submarine ascends and the seafloor smoothly sinks
    // deep into the bottom fog (down to -38m) where it naturally and seamlessly
    // dissolves into pitch-black deep water without ever blinking or popping off!
    if (p < 0.38) {
      seafloorGroupRef.current.visible = false;
      seafloorGroupRef.current.position.y = -45.0;
    } else {
      seafloorGroupRef.current.visible = true;
      // Smooth continuous ascent arriving precisely at the user's photo seafloor level (-9.6) at site bottom (p = 1.0)
      // Firmly locked at -9.6 so it cannot rise higher or obscure the submarine
      const seabedT = THREE.MathUtils.clamp((p - 0.38) / 0.58, 0, 1);
      const targetY = THREE.MathUtils.lerp(-38.0, -9.6, Math.pow(seabedT, 1.40));
      seafloorGroupRef.current.position.y = targetY;
    }

    // Direct spotlight illumination on the rocks and sand ripples with subtle water shimmer
    if (spotlightRef.current) {
      const lightT = THREE.MathUtils.clamp((p - 0.45) / 0.50, 0, 1);
      const shimmer = 1.0 + Math.sin(t * 2.2) * 0.04 + Math.cos(t * 3.7) * 0.03;
      spotlightRef.current.intensity = 9.5 * Math.pow(lightT, 1.5) * shimmer;
    }
  });

  return (
    <group ref={seafloorGroupRef} position={[0, -45, -1]}>
      {/* 1. Continuous Geological Bathymetry Terrain (Sand on flat ground, Basalt on cliffs) */}
      <mesh
        geometry={seabedGeometry}
        material={geologicalMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      />

      {/* 2. Naturally Sculpted & Dispersed Organic Boulders (Sharing Geological Material) */}
      <group>
        {boulderPlacements.map((boulder, i) => (
          <mesh
            key={i}
            geometry={boulderGeometries[boulder.geoIdx]}
            material={geologicalMaterial}
            position={boulder.pos}
            rotation={boulder.rot}
            scale={boulder.scale}
            castShadow
            receiveShadow
          />
        ))}
      </group>

      {/* 3. Submarine Downward Seafloor Illumination Beam (Over the open sediment channel) */}
      <primitive object={spotTarget} />
      <spotLight
        ref={spotlightRef}
        target={spotTarget}
        position={[0, 5.8, 1.5]}
        color="#E0F2FE"
        intensity={0}
        angle={Math.PI * 0.38}
        penumbra={0.8}
        distance={28}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* 4. Ambient Benthic Fill Light (Deep Oceanic Blue Fill) */}
      <pointLight
        position={[0, 2.0, -2.0]}
        color="#38BDF8"
        intensity={1.8}
        distance={20.0}
        decay={1.8}
      />

      {/* 5. 3D Seabed Organizer Branding Assembly (IEEE UCSC) */}
      <Suspense fallback={null}>
        <SeabedBranding3D diveRef={diveRef} />
      </Suspense>
    </group>
  );
};
