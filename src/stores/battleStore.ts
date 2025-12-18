import { create } from "zustand";
import {
  BattleState,
  BattleCharacter,
  BattleEnemy,
  BattleLogEntry,
  Character,
  ElementType,
  PathType,
} from "@/types";
import {
  calculateDamage,
  applyDamage,
  addEnergy,
  consumeUltimateEnergy,
  canUseUltimate,
  applyEffect,
  tickEffects,
} from "@/lib/battle-engine";
import charactersData from "@/data/characters.json";
import skillsData from "@/data/skills.json";

interface BattleStore extends BattleState {
  // Setup actions
  initBattle: (
    characterIds: string[],
    enemyConfig: Partial<BattleEnemy>
  ) => void;

  // Battle actions
  performAction: (action: "basic" | "skill" | "ultimate") => void;
  endTurn: () => void;

  // Utility
  resetBattle: () => void;
  getActiveCharacter: () => BattleCharacter | null;
}

const characters = charactersData as Character[];
const skills = skillsData as Record<
  string,
  {
    basicMultiplier: number;
    skillMultiplier: number;
    ultMultiplier: number;
    basicEnergy: number;
    skillEnergy: number;
    ultCost: number;
    baseAtk: number;
    baseCritRate: number;
    baseCritDmg: number;
    skillBuff?: { stat: string; value: number; duration: number };
    skillDebuff?: { stat: string; value: number; duration: number };
    ultDebuff?: { stat: string; value: number; duration: number };
  }
>;

function createBattleCharacter(charId: string): BattleCharacter | null {
  const charData = characters.find((c) => c.id === charId);
  const skillData = skills[charId];

  if (!charData || !skillData) return null;

  return {
    id: charData.id,
    name: charData.name,
    element: charData.element as ElementType,
    path: charData.path as PathType,
    baseAtk: skillData.baseAtk + 1500, // Base + weapon + artifacts approximation
    currentHp: 10000,
    maxHp: 10000,
    currentEnergy: 0,
    maxEnergy: skillData.ultCost,
    speed: charData.baseSpeed + 30, // With some speed bonus
    critRate: skillData.baseCritRate + 0.6, // With gear
    critDmg: skillData.baseCritDmg + 1.5, // With gear
    dmgBonus: 0.46, // Element goblet
    effects: [],
  };
}

function createDefaultEnemy(): BattleEnemy {
  return {
    id: "default_boss",
    name: "Training Dummy",
    currentHp: 1000000,
    maxHp: 1000000,
    speed: 80,
    weakness: ["Lightning"] as ElementType[],
    resistance: {
      Physical: 0.2,
      Fire: 0.2,
      Ice: 0.2,
      Lightning: 0,
      Wind: 0.2,
      Quantum: 0.2,
      Imaginary: 0.2,
    },
    def: 1000,
    effects: [],
    toughness: 120,
    maxToughness: 120,
    isBroken: false,
  };
}

function calculateTurnOrder(
  team: BattleCharacter[],
  enemy: BattleEnemy
): string[] {
  const all = [
    ...team.map((c) => ({ id: c.id, speed: c.speed })),
    { id: enemy.id, speed: enemy.speed },
  ];
  return all.sort((a, b) => b.speed - a.speed).map((x) => x.id);
}

const initialState: Omit<BattleState, "enemy"> & { enemy: BattleEnemy | null } =
  {
    turn: 0,
    phase: "setup",
    team: [],
    enemy: null,
    turnOrder: [],
    currentActorId: "",
    battleLog: [],
    totalDamage: 0,
  };

export const useBattleStore = create<BattleStore>((set, get) => ({
  ...initialState,
  enemy: createDefaultEnemy(),

  initBattle: (characterIds, enemyConfig) => {
    const team = characterIds
      .slice(0, 4)
      .map(createBattleCharacter)
      .filter((c): c is BattleCharacter => c !== null);

    if (team.length === 0) return;

    const baseEnemy = createDefaultEnemy();
    const enemy: BattleEnemy = {
      ...baseEnemy,
      ...enemyConfig,
      currentHp: enemyConfig.maxHp || baseEnemy.maxHp,
    };

    const turnOrder = calculateTurnOrder(team, enemy);

    set({
      turn: 1,
      phase: "battle",
      team,
      enemy,
      turnOrder,
      currentActorId: turnOrder[0],
      battleLog: [],
      totalDamage: 0,
    });
  },

  performAction: (actionType) => {
    const state = get();
    if (state.phase !== "battle" || !state.enemy) return;

    const charIndex = state.team.findIndex(
      (c) => c.id === state.currentActorId
    );
    if (charIndex === -1) {
      // Enemy turn - skip for now
      get().endTurn();
      return;
    }

    const char = state.team[charIndex];
    const skillData = skills[char.id];
    if (!skillData) return;

    let damage = 0;
    let isCrit = false;
    let logMessage = "";
    let newChar = { ...char };
    let newEnemy = { ...state.enemy };
    const effects: string[] = [];

    switch (actionType) {
      case "basic": {
        const result = calculateDamage(
          char,
          state.enemy,
          skillData.basicMultiplier
        );
        damage = result.finalDamage;
        isCrit = result.isCrit;
        newEnemy = applyDamage(newEnemy, damage);
        newChar = addEnergy(newChar, skillData.basicEnergy);
        logMessage = `${char.name} uses Basic ATK`;
        break;
      }
      case "skill": {
        if (skillData.skillMultiplier > 0) {
          const result = calculateDamage(
            char,
            state.enemy,
            skillData.skillMultiplier
          );
          damage = result.finalDamage;
          isCrit = result.isCrit;
          newEnemy = applyDamage(newEnemy, damage);
          logMessage = `${char.name} uses Skill`;
        } else {
          // Support skill (Sparkle, Ruan Mei, etc.)
          logMessage = `${char.name} uses Skill (Support)`;
        }
        newChar = addEnergy(newChar, skillData.skillEnergy);

        // Apply skill debuff if exists
        if (skillData.skillDebuff) {
          newEnemy = applyEffect(newEnemy, {
            name: `${char.name} Debuff`,
            type: "debuff",
            stat: skillData.skillDebuff.stat,
            value: skillData.skillDebuff.value,
            duration: skillData.skillDebuff.duration,
            stacks: 1,
            maxStacks: 3,
            source: char.id,
          });
          effects.push(`Applied ${skillData.skillDebuff.stat} debuff`);
        }
        break;
      }
      case "ultimate": {
        if (!canUseUltimate(char)) return;

        if (skillData.ultMultiplier > 0) {
          const result = calculateDamage(
            char,
            state.enemy,
            skillData.ultMultiplier
          );
          damage = result.finalDamage;
          isCrit = result.isCrit;
          newEnemy = applyDamage(newEnemy, damage);
          logMessage = `${char.name} uses Ultimate!`;
        } else {
          logMessage = `${char.name} uses Ultimate (Support)!`;
        }
        newChar = consumeUltimateEnergy(newChar);

        // Apply ult debuff if exists
        if (skillData.ultDebuff) {
          newEnemy = applyEffect(newEnemy, {
            name: `${char.name} Ult Debuff`,
            type: "debuff",
            stat: skillData.ultDebuff.stat,
            value: skillData.ultDebuff.value,
            duration: skillData.ultDebuff.duration,
            stacks: 1,
            maxStacks: 5,
            source: char.id,
          });
          effects.push(`Applied ${skillData.ultDebuff.stat} debuff`);
        }
        break;
      }
    }

    // Create log entry
    const logEntry: BattleLogEntry = {
      turn: state.turn,
      characterName: char.name,
      action: logMessage,
      damage: damage > 0 ? damage : undefined,
      isCrit,
      effects: effects.length > 0 ? effects : undefined,
      timestamp: Date.now(),
    };

    // Update team
    const newTeam = [...state.team];
    newTeam[charIndex] = newChar;

    // Check victory
    const phase = newEnemy.currentHp <= 0 ? "victory" : state.phase;

    set({
      team: newTeam,
      enemy: newEnemy,
      battleLog: [logEntry, ...state.battleLog],
      totalDamage: state.totalDamage + damage,
      phase,
    });

    // Auto end turn after action
    if (phase === "battle") {
      setTimeout(() => get().endTurn(), 300);
    }
  },

  endTurn: () => {
    const state = get();
    if (state.phase !== "battle" || !state.enemy) return;

    // Find next actor
    const currentIndex = state.turnOrder.indexOf(state.currentActorId);
    const nextIndex = (currentIndex + 1) % state.turnOrder.length;
    const nextActorId = state.turnOrder[nextIndex];

    // New turn if we wrapped around
    const newTurn = nextIndex === 0 ? state.turn + 1 : state.turn;

    // Tick effects if new turn
    let newEnemy = state.enemy;
    let newTeam = state.team;
    if (nextIndex === 0) {
      newEnemy = tickEffects(newEnemy);
      newTeam = newTeam.map((c) => tickEffects(c));
    }

    set({
      currentActorId: nextActorId,
      turn: newTurn,
      enemy: newEnemy,
      team: newTeam,
    });

    // If enemy turn, auto-skip after delay
    if (nextActorId === state.enemy.id) {
      const logEntry: BattleLogEntry = {
        turn: newTurn,
        characterName: state.enemy.name,
        action: `${state.enemy.name} attacks!`,
        timestamp: Date.now(),
      };
      setTimeout(() => {
        set((s) => ({
          battleLog: [logEntry, ...s.battleLog],
        }));
        get().endTurn();
      }, 500);
    }
  },

  resetBattle: () => {
    set({
      ...initialState,
      enemy: createDefaultEnemy(),
    });
  },

  getActiveCharacter: () => {
    const state = get();
    return state.team.find((c) => c.id === state.currentActorId) || null;
  },
}));
