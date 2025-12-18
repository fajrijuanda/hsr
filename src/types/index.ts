export interface Character {
  id: string;
  name: string;
  path: string;
  element: string;
  rarity: number;
  baseSpeed: number;
  imageUrl: string;
}

export interface TeamMember {
  character: Character;
  speedBonus: number; // Flat speed bonus
  speedPercent: number; // Percentage speed bonus
  relicSpeedBonus: number; // Speed from relic substats
  lightConeSpeed: number; // Speed from light cone
}

export interface TimelineEntry {
  characterId: string;
  characterName: string;
  actionValue: number;
  turnNumber: number;
  element: string;
  isEnemy?: boolean;
}

export interface CycleBoundary {
  cycle: number;
  startAV: number;
  endAV: number;
}

export interface TeamPreset {
  id: string;
  name: string;
  description: string;
  characterIds: string[];
}

export type ElementType =
  | "Physical"
  | "Fire"
  | "Ice"
  | "Lightning"
  | "Wind"
  | "Quantum"
  | "Imaginary";

export type PathType =
  | "Destruction"
  | "Hunt"
  | "Erudition"
  | "Harmony"
  | "Nihility"
  | "Preservation"
  | "Abundance";
