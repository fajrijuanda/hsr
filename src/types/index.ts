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

// Dashboard Types
export interface Banner {
  id: string;
  phase: string;
  name: string;
  characters: string[];
  lightCones: string[];
  startDate: string;
  endDate: string;
  type: "limited" | "standard" | "weapon";
  imageUrl: string;
}

export interface RedemptionCode {
  code: string;
  rewards: string;
  source: string;
  addedAt: string;
  expiresAt: string | null;
  status: "active" | "expired" | "new";
}

export interface GameEvent {
  id: string;
  name: string;
  type: "story" | "farming" | "permanent" | "recurring";
  startDate: string;
  endDate: string | null;
  rewards: string[];
  description: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Battle Simulator Types
export interface Enemy {
  id: string;
  name: string;
  type: "boss" | "elite" | "custom";
  hp: number;
  speed: number;
  weakness: ElementType[];
  resistance: Record<ElementType, number>;
  def: number;
  imageUrl: string;
}

export interface BattleCharacter {
  id: string;
  name: string;
  element: ElementType;
  path: PathType;
  baseAtk: number;
  currentHp: number;
  maxHp: number;
  currentEnergy: number;
  maxEnergy: number;
  speed: number;
  critRate: number;
  critDmg: number;
  dmgBonus: number;
  effects: BattleEffect[];
}

export interface BattleEnemy {
  id: string;
  name: string;
  currentHp: number;
  maxHp: number;
  speed: number;
  weakness: ElementType[];
  resistance: Record<ElementType, number>;
  def: number;
  effects: BattleEffect[];
  toughness: number;
  maxToughness: number;
  isBroken: boolean;
}

export interface BattleEffect {
  id: string;
  name: string;
  type: "buff" | "debuff";
  stat: string;
  value: number;
  duration: number;
  stacks: number;
  maxStacks: number;
  source: string;
}

export interface BattleAction {
  type: "basic" | "skill" | "ultimate";
  characterId: string;
  targetId?: string;
}

export interface BattleLogEntry {
  turn: number;
  characterName: string;
  action: string;
  damage?: number;
  isCrit?: boolean;
  effects?: string[];
  timestamp: number;
}

export interface BattleState {
  turn: number;
  phase: "setup" | "battle" | "victory" | "defeat";
  team: BattleCharacter[];
  enemy: BattleEnemy;
  turnOrder: string[];
  currentActorId: string;
  battleLog: BattleLogEntry[];
  totalDamage: number;
}

export interface DamageResult {
  baseDamage: number;
  finalDamage: number;
  isCrit: boolean;
  breakdown: {
    attackStat: number;
    skillMultiplier: number;
    critMultiplier: number;
    dmgBonusMultiplier: number;
    defMultiplier: number;
    resMultiplier: number;
    vulnerabilityMultiplier: number;
  };
}
