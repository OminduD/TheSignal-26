export type DepthZone = 'EPIPELAGIC' | 'MESOPELAGIC' | 'BATHYPELAGIC' | 'ABYSSAL' | 'HADAL';

export interface DiveState {
  progress: number;       // 0.0 to 1.0
  velocity: number;       // px/frame or normalized scroll velocity
  depthMeters: number;    // 0 to 10,994m
  pressureAtm: number;    // 1 to 1,100 ATM
  zone: DepthZone;
  hullIntegrity: number;  // 100% to 74%
  o2Reserves: number;     // 100% down to 85%
  isAudioMuted: boolean;
  pointer: { x: number; y: number }; // normalized -1 to 1
  headingAngle?: number;  // Current submarine heading yaw in radians
}

export type DiveRef = React.MutableRefObject<DiveState>;

export interface SonarTrack {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  bounty: string;
  requirements: string[];
  angleDeg: number;
  radiusPercent: number;
}
