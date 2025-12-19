import {
  BattleCharacter,
  BattleEnemy,
  BattleEffect,
  DamageResult,
  ElementType,
} from "@/types";

/**
 * Calculate damage using HSR damage formula
 */
export function calculateDamage(
  attacker: BattleCharacter,
  target: BattleEnemy,
  skillMultiplier: number,
  attackerLevel: number = 80,
  targetLevel: number = 90
): DamageResult {
  // Base damage = ATK * Skill Multiplier
  const attackStat = getEffectiveAtk(attacker);
  const baseDamage = attackStat * skillMultiplier;

  // Crit calculation
  const effectiveCritRate = Math.min(1, getEffectiveCritRate(attacker));
  const isCrit = Math.random() < effectiveCritRate;
  const critMultiplier = isCrit ? 1 + getEffectiveCritDmg(attacker) : 1;

  // Damage bonus (element DMG%, all DMG%)
  const dmgBonusMultiplier = 1 + getEffectiveDmgBonus(attacker);

  // DEF multiplier
  const defReduction = getDefReduction(target);
  const effectiveDef = target.def * (1 - defReduction);
  const defMultiplier =
    (attackerLevel + 20) / (targetLevel + 20 + effectiveDef);

  // Resistance multiplier
  const resistance = target.resistance[attacker.element] || 0;
  const resPen = getResPen(attacker);
  const effectiveRes = Math.max(-1, resistance - resPen);
  const resMultiplier = 1 - effectiveRes;

  // Vulnerability (damage taken increase)
  const vulnerabilityMultiplier = 1 + getVulnerability(target);

  // Weakness broken bonus
  const brokenMultiplier = target.isBroken ? 1.1 : 1;

  // Final damage
  const finalDamage = Math.floor(
    baseDamage *
      critMultiplier *
      dmgBonusMultiplier *
      defMultiplier *
      resMultiplier *
      vulnerabilityMultiplier *
      brokenMultiplier
  );

  return {
    baseDamage: Math.floor(baseDamage),
    finalDamage,
    isCrit,
    breakdown: {
      attackStat,
      skillMultiplier,
      critMultiplier,
      dmgBonusMultiplier,
      defMultiplier,
      resMultiplier,
      vulnerabilityMultiplier,
    },
  };
}

// Helper functions to get effective stats including buffs

function getEffectiveAtk(char: BattleCharacter): number {
  const atkBonus = getStatFromEffects(char.effects, "atk");
  const atkPercent = getStatFromEffects(char.effects, "atkPercent");
  return char.baseAtk * (1 + atkPercent) + atkBonus;
}

function getEffectiveCritRate(char: BattleCharacter): number {
  const bonus = getStatFromEffects(char.effects, "critRate");
  return char.critRate + bonus;
}

function getEffectiveCritDmg(char: BattleCharacter): number {
  const bonus = getStatFromEffects(char.effects, "critDmg");
  return char.critDmg + bonus;
}

function getEffectiveDmgBonus(char: BattleCharacter): number {
  const bonus = getStatFromEffects(char.effects, "dmgBonus");
  return char.dmgBonus + bonus;
}

function getResPen(char: BattleCharacter): number {
  return getStatFromEffects(char.effects, "resPen");
}

function getDefReduction(enemy: BattleEnemy): number {
  return getStatFromEffects(enemy.effects, "defReduction");
}

function getVulnerability(enemy: BattleEnemy): number {
  return getStatFromEffects(enemy.effects, "vulnerability");
}

function getStatFromEffects(effects: BattleEffect[], stat: string): number {
  return effects
    .filter((e) => e.stat === stat)
    .reduce((sum, e) => sum + e.value * e.stacks, 0);
}

/**
 * Apply damage to enemy and return updated enemy
 */
export function applyDamage(enemy: BattleEnemy, damage: number): BattleEnemy {
  const newHp = Math.max(0, enemy.currentHp - damage);
  return {
    ...enemy,
    currentHp: newHp,
  };
}

/**
 * Apply effect to character or enemy
 */
export function applyEffect<T extends { effects: BattleEffect[] }>(
  target: T,
  effect: Omit<BattleEffect, "id">
): T {
  const existingIndex = target.effects.findIndex(
    (e) => e.name === effect.name && e.source === effect.source
  );

  if (existingIndex >= 0) {
    // Stack or refresh existing effect
    const existing = target.effects[existingIndex];
    const newStacks = Math.min(existing.stacks + 1, effect.maxStacks);
    const newEffects = [...target.effects];
    newEffects[existingIndex] = {
      ...existing,
      stacks: newStacks,
      duration: effect.duration, // Refresh duration
    };
    return { ...target, effects: newEffects };
  }

  // Add new effect
  const newEffect: BattleEffect = {
    ...effect,
    id: `${effect.name}-${Date.now()}`,
    stacks: 1,
  };
  return { ...target, effects: [...target.effects, newEffect] };
}

/**
 * Tick down effect durations at end of turn
 */
export function tickEffects<T extends { effects: BattleEffect[] }>(
  target: T
): T {
  const newEffects = target.effects
    .map((e) => ({ ...e, duration: e.duration - 1 }))
    .filter((e) => e.duration > 0);
  return { ...target, effects: newEffects };
}

/**
 * Add energy to character
 */
export function addEnergy(
  char: BattleCharacter,
  amount: number
): BattleCharacter {
  const newEnergy = Math.min(char.maxEnergy, char.currentEnergy + amount);
  return { ...char, currentEnergy: newEnergy };
}

/**
 * Use ultimate (consume energy)
 */
export function consumeUltimateEnergy(char: BattleCharacter): BattleCharacter {
  return { ...char, currentEnergy: 0 };
}

/**
 * Check if character can use ultimate
 */
export function canUseUltimate(char: BattleCharacter): boolean {
  return char.currentEnergy >= char.maxEnergy;
}

/**
 * Format damage number for display
 */
export function formatDamage(damage: number): string {
  if (damage >= 1000000) {
    return (damage / 1000000).toFixed(2) + "M";
  }
  if (damage >= 1000) {
    return (damage / 1000).toFixed(1) + "K";
  }
  return damage.toString();
}

/**
 * Calculate HP percentage
 */
export function getHpPercent(current: number, max: number): number {
  return Math.round((current / max) * 100);
}

// ==================== BREAK MECHANICS ====================

/**
 * Toughness damage values by element (when hitting weakness)
 */
const TOUGHNESS_DAMAGE: Record<string, number> = {
  basic: 30,
  skill: 60,
  ultimate: 90,
};

/**
 * Base break damage multipliers by element (Level 80)
 */
const BREAK_BASE_DAMAGE: Record<ElementType, number> = {
  Physical: 2000,
  Fire: 2000,
  Ice: 1000,
  Lightning: 1000,
  Wind: 1500,
  Quantum: 1200,
  Imaginary: 1200,
};

/**
 * DoT multipliers for break effects
 */
const DOT_MULTIPLIERS: Record<
  ElementType,
  { multiplier: number; turns: number; maxStacks: number }
> = {
  Physical: { multiplier: 0.5, turns: 2, maxStacks: 1 }, // Bleed
  Fire: { multiplier: 1.0, turns: 2, maxStacks: 1 }, // Burn
  Ice: { multiplier: 0.5, turns: 1, maxStacks: 1 }, // Frozen
  Lightning: { multiplier: 1.0, turns: 2, maxStacks: 1 }, // Shock
  Wind: { multiplier: 0.25, turns: 2, maxStacks: 5 }, // Wind Shear (stacks)
  Quantum: { multiplier: 0.5, turns: 1, maxStacks: 1 }, // Entanglement
  Imaginary: { multiplier: 0, turns: 1, maxStacks: 1 }, // Imprisonment (no damage)
};

/**
 * Calculate toughness damage based on action type and weakness
 */
export function calculateToughnessDamage(
  actionType: "basic" | "skill" | "ultimate",
  attackerElement: ElementType,
  enemyWeakness: ElementType[]
): number {
  const isWeakness = enemyWeakness.includes(attackerElement);
  if (!isWeakness) return 0;
  return TOUGHNESS_DAMAGE[actionType] || 30;
}

/**
 * Apply toughness damage and check for break
 */
export function applyToughnessDamage(
  enemy: BattleEnemy,
  toughnessDmg: number
): { enemy: BattleEnemy; brokeThisTurn: boolean } {
  if (enemy.isBroken || toughnessDmg === 0) {
    return { enemy, brokeThisTurn: false };
  }

  const newToughness = Math.max(0, enemy.toughness - toughnessDmg);
  const brokeThisTurn = newToughness === 0 && enemy.toughness > 0;

  return {
    enemy: {
      ...enemy,
      toughness: newToughness,
      isBroken: newToughness === 0,
      brokenTurnsRemaining: newToughness === 0 ? 2 : enemy.brokenTurnsRemaining,
    },
    brokeThisTurn,
  };
}

/**
 * Calculate break damage (when enemy toughness reaches 0)
 * Formula: Base × (1 + Break Effect) × DEF Mult × RES Mult × Toughness Mult
 */
export function calculateBreakDamage(
  attacker: BattleCharacter,
  target: BattleEnemy,
  attackerLevel: number = 80,
  targetLevel: number = 90
): number {
  const baseDamage = BREAK_BASE_DAMAGE[attacker.element] || 1000;

  // Break Effect multiplier (0% to 200%+)
  const breakEffectMult = 1 + (attacker.breakEffect || 0);

  // DEF multiplier
  const defMultiplier = (attackerLevel + 20) / (targetLevel + 20 + target.def);

  // Resistance multiplier (broken enemies have 0 res to break damage)
  const resistance = target.resistance[attacker.element] || 0;
  const resMultiplier = 1 - Math.max(-1, resistance);

  // Toughness scaling (higher max toughness = more break damage)
  const toughnessMult = 0.5 + (target.maxToughness / 120) * 0.5;

  const breakDamage = Math.floor(
    baseDamage * breakEffectMult * defMultiplier * resMultiplier * toughnessMult
  );

  return breakDamage;
}

/**
 * Create elemental DoT effect for break
 */
export function createBreakDoT(
  attacker: BattleCharacter,
  target: BattleEnemy
): BattleEffect | null {
  const config = DOT_MULTIPLIERS[attacker.element];
  if (!config || config.multiplier === 0) return null;

  // DoT damage scales with ATK and Break Effect
  const dotBaseDamage =
    attacker.baseAtk *
    config.multiplier *
    (1 + (attacker.breakEffect || 0) * 0.5);

  // Apply enemy DEF reduction for DoT
  const defMult = 80 / (90 + target.def * 0.5);
  const dotDamage = Math.floor(dotBaseDamage * defMult);

  const dotNames: Record<ElementType, string> = {
    Physical: "Bleed",
    Fire: "Burn",
    Ice: "Frozen",
    Lightning: "Shock",
    Wind: "Wind Shear",
    Quantum: "Entanglement",
    Imaginary: "Imprisonment",
  };

  return {
    id: `${dotNames[attacker.element]}-${Date.now()}`,
    name: dotNames[attacker.element],
    type: "dot",
    stat: "dot",
    value: 0,
    duration: config.turns,
    stacks: 1,
    maxStacks: config.maxStacks,
    source: attacker.id,
    dotDamage,
    dotElement: attacker.element,
  };
}

/**
 * Apply break effect to enemy (DoT and/or debuffs)
 */
export function applyBreakEffect(
  enemy: BattleEnemy,
  attacker: BattleCharacter
): { enemy: BattleEnemy; appliedEffect: string | null } {
  const dotEffect = createBreakDoT(attacker, enemy);

  if (!dotEffect) {
    // Imaginary: Apply SPD debuff instead
    if (attacker.element === "Imaginary") {
      const spdDebuff: BattleEffect = {
        id: `Imprisonment-${Date.now()}`,
        name: "Imprisonment",
        type: "debuff",
        stat: "speed",
        value: -0.1, // -10% SPD
        duration: 1,
        stacks: 1,
        maxStacks: 1,
        source: attacker.id,
      };
      return {
        enemy: { ...enemy, effects: [...enemy.effects, spdDebuff] },
        appliedEffect: "Imprisonment (-10% SPD)",
      };
    }
    return { enemy, appliedEffect: null };
  }

  // Check for existing stacking DoT (Wind Shear)
  const existingDotIndex = enemy.effects.findIndex(
    (e) => e.name === dotEffect.name && e.type === "dot"
  );

  if (existingDotIndex >= 0) {
    const existing = enemy.effects[existingDotIndex];
    if (existing.stacks < dotEffect.maxStacks) {
      // Add stack
      const newEffects = [...enemy.effects];
      newEffects[existingDotIndex] = {
        ...existing,
        stacks: existing.stacks + 1,
        duration: dotEffect.duration, // Refresh duration
        dotDamage: (existing.dotDamage || 0) + (dotEffect.dotDamage || 0),
      };
      return {
        enemy: { ...enemy, effects: newEffects },
        appliedEffect: `${dotEffect.name} (${existing.stacks + 1} stacks)`,
      };
    }
    // Max stacks, just refresh duration
    const newEffects = [...enemy.effects];
    newEffects[existingDotIndex] = {
      ...existing,
      duration: dotEffect.duration,
    };
    return {
      enemy: { ...enemy, effects: newEffects },
      appliedEffect: `${dotEffect.name} refreshed`,
    };
  }

  // Apply new DoT
  return {
    enemy: { ...enemy, effects: [...enemy.effects, dotEffect] },
    appliedEffect: `${dotEffect.name} applied (${dotEffect.dotDamage} DMG/turn)`,
  };
}

/**
 * Process DoT damage at start/end of turn
 */
export function processDoTDamage(enemy: BattleEnemy): {
  enemy: BattleEnemy;
  totalDotDamage: number;
  dotLog: string[];
} {
  let totalDotDamage = 0;
  const dotLog: string[] = [];

  for (const effect of enemy.effects) {
    if (effect.type === "dot" && effect.dotDamage) {
      const damage = effect.dotDamage * effect.stacks;
      totalDotDamage += damage;
      dotLog.push(`${effect.name}: ${damage} DMG`);
    }
  }

  const newHp = Math.max(0, enemy.currentHp - totalDotDamage);

  return {
    enemy: { ...enemy, currentHp: newHp },
    totalDotDamage,
    dotLog,
  };
}

/**
 * Recover from broken state (called at end of turn cycle)
 */
export function recoverFromBreak(enemy: BattleEnemy): BattleEnemy {
  if (!enemy.isBroken) return enemy;

  const newTurnsRemaining = enemy.brokenTurnsRemaining - 1;

  if (newTurnsRemaining <= 0) {
    // Recover from break
    return {
      ...enemy,
      isBroken: false,
      toughness: enemy.maxToughness,
      brokenTurnsRemaining: 0,
    };
  }

  return { ...enemy, brokenTurnsRemaining: newTurnsRemaining };
}

/**
 * Calculate Super Break damage (damage to already broken enemy)
 */
export function calculateSuperBreakDamage(
  attacker: BattleCharacter,
  target: BattleEnemy,
  actionType: "basic" | "skill" | "ultimate"
): number {
  if (!target.isBroken) return 0;

  // Super Break scales with Break Effect and toughness reduction
  const baseToughnessDmg = TOUGHNESS_DAMAGE[actionType] || 30;
  const superBreakMult = 1 + (attacker.breakEffect || 0);

  // Super Break damage formula (simplified)
  const superBreakDamage = Math.floor(baseToughnessDmg * 10 * superBreakMult);

  return superBreakDamage;
}
