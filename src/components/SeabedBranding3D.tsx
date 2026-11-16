import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { DiveRef } from '../types/dive';

export interface SeabedBranding3DProps {
  diveRef: DiveRef;
}

interface LetterDef {
  key: string;
  char: 'i' | 'e' | 'u' | 'c' | 's';
  width: number;
  minY: number;
}

// Letter definitions matching bounds extracted from public/models/*.glb
const LETTER_DEFS: LetterDef[] = [
  // IEEE
  { key: 'i-1', char: 'i', width: 0.7852, minY: -1.7557 },
  { key: 'e-1', char: 'e', width: 2.6344, minY: -1.8348 },
  { key: 'e-2', char: 'e', width: 2.6344, minY: -1.8348 },
  { key: 'e-3', char: 'e', width: 2.6344, minY: -1.8348 },
  // UCSC
  { key: 'u-1', char: 'u', width: 3.1441, minY: -2.1576 },
  { key: 'c-1', char: 'c', width: 3.5716, minY: -1.8513 },
  { key: 's-1', char: 's', width: 2.8391, minY: -1.9220 },
  { key: 'c-2', char: 'c', width: 3.5716, minY: -1.8513 },
];

interface LetterInstanceProps {
  scene: THREE.Group;
  minY: number;
  position: [number, number, number];
  scale: number;
  tilt?: number;
}

/**
 * Renders an instanced 3D letter model styled to match the oceanic sediment & basalt rock
 * of the seafloor (deep marine slate-blue with natural mineral texture).
 */
const LetterInstance: React.FC<LetterInstanceProps> = ({
  scene,
  minY,
  position,
  scale,
  tilt = -0.06,
}) => {
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
          if (mat && mat.isMeshStandardMaterial) {
            // Seafloor sediment mineral color (matches basalt strata & oceanic sand tone #1c3d5e / #20486a)
            mat.color = new THREE.Color('#224b73');
            mat.roughness = 0.72; // Organic matte rock/sand texture
            mat.metalness = 0.18; // Subtle oceanic mineral sheen
            // Deep ambient benthic glow so stone letters remain legible in trench darkness
            mat.emissive = new THREE.Color('#0d2033');
            mat.emissiveIntensity = 0.22;
            mat.needsUpdate = true;
          }
        }
      }
    });
    return clone;
  }, [scene]);

  return (
    <group position={position} rotation={[tilt, 0, 0]} scale={scale}>
      {/* Offsetting model by -minY ensures local Y=0 is exactly the bottom baseline of the letter */}
      <primitive object={clonedScene} position={[0, -minY, 0]} />
    </group>
  );
};

export const SeabedBranding3D: React.FC<SeabedBranding3DProps> = ({ diveRef }) => {
  const { viewport } = useThree();
  const brandGroupRef = useRef<THREE.Group>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const fillLightRef = useRef<THREE.PointLight>(null);
  const spotTargetRef = useRef<THREE.Object3D>(new THREE.Object3D());

  // 1. Load the 3D letter models from public/models/*.glb
  const gltfI = useGLTF('/models/i.glb');
  const gltfE = useGLTF('/models/e.glb');
  const gltfU = useGLTF('/models/u.glb');
  const gltfC = useGLTF('/models/c.glb');
  const gltfS = useGLTF('/models/s.glb');

  const modelMap = useMemo(
    () => ({
      i: gltfI.scene,
      e: gltfE.scene,
      u: gltfU.scene,
      c: gltfC.scene,
      s: gltfS.scene,
    }),
    [gltfI.scene, gltfE.scene, gltfU.scene, gltfC.scene, gltfS.scene]
  );

  // 2. Responsive letter dimensions & positioning
  // Lowered slightly (local Y = +7.55 inside seafloorGroupRef) so at site bottom
  // (seafloorGroupRef.y = -9.6) the letters sit at world Y = -2.05 (NDC Y ≈ -0.68),
  // resting right on the ocean floor contour.
  const isMobile = viewport.width < 5.5;
  const scale = isMobile ? 0.125 : 0.165;
  const charGap = isMobile ? 0.055 : 0.075;
  const wordGap = isMobile ? 0.22 : 0.32;
  const centerX = 0.0;

  // 3. Compute continuous positions for all 8 letters of IEEE UCSC
  const letters = useMemo(() => {
    const totalW =
      LETTER_DEFS.reduce((sum, def) => sum + def.width * scale, 0) +
      6 * charGap +
      wordGap;
    const startX = centerX - totalW / 2;

    let currX = startX;
    return LETTER_DEFS.map((def, idx) => {
      const w = def.width * scale;
      const x = currX + w / 2;
      const item = {
        ...def,
        position: [x, 0, 0] as [number, number, number],
        scale,
      };
      currX += w + (idx === 3 ? wordGap : charGap);
      return item;
    });
  }, [scale, charGap, wordGap, centerX]);

  // 4. Illumination dynamics: lights smoothly power on as the submarine reaches seabed (70% – 100%)
  useFrame((state) => {
    const p = diveRef.current.progress;
    const lightT = THREE.MathUtils.clamp((p - 0.70) / 0.25, 0, 1);
    const shimmer = 1.0 + Math.sin(state.clock.elapsedTime * 2.2) * 0.06;

    if (pointLightRef.current) {
      pointLightRef.current.intensity = 4.2 * Math.pow(lightT, 1.4) * shimmer;
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = 2.4 * Math.pow(lightT, 1.4) * shimmer;
    }
    if (spotLightRef.current) {
      spotLightRef.current.intensity = 7.5 * Math.pow(lightT, 1.5) * shimmer;
    }
  });

  return (
    // Lowered (local Y = +7.25, local Z = -1.6 inside seafloorGroupRef)
    // Directly resting along the seafloor contour without any basement box
    <group ref={brandGroupRef} position={[0, 6.00, -1.6]}>
      {/* Target for dedicated overhead spotlight */}
      <primitive object={spotTargetRef.current} position={[centerX, 0, 0]} />

      {/* Dedicated Subtle Ocean SpotLight illuminating the IEEE UCSC letters */}
      <spotLight
        ref={spotLightRef}
        target={spotTargetRef.current}
        position={[centerX, 3.6, 2.6]}
        color="#7dd3fc"
        intensity={0}
        angle={Math.PI * 0.35}
        penumbra={0.75}
        distance={18}
      />

      {/* Dedicated PointLight for natural sediment mineral gleam */}
      <pointLight
        ref={pointLightRef}
        position={[centerX, 0.9, 1.6]}
        color="#38bdf8"
        intensity={0}
        distance={12}
        decay={2}
      />

      {/* Subtle Fill Light for side contour */}
      <pointLight
        ref={fillLightRef}
        position={[centerX - 2.0, 1.0, 1.2]}
        color="#224b73"
        intensity={0}
        distance={10}
        decay={2}
      />

      {/* 3D Objects from public/models/ spelling (IEEE UCSC) */}
      {letters.map((letter) => (
        <LetterInstance
          key={letter.key}
          scene={modelMap[letter.char]}
          minY={letter.minY}
          position={letter.position}
          scale={letter.scale}
          tilt={-0.06}
        />
      ))}
    </group>
  );
};

// Preload all 3D letter models immediately for zero-lag reveal
useGLTF.preload('/models/i.glb');
useGLTF.preload('/models/e.glb');
useGLTF.preload('/models/u.glb');
useGLTF.preload('/models/c.glb');
useGLTF.preload('/models/s.glb');
