import {
  BattleCharacter,
  BattleEnemy,
  BattleEffect,
  DamageResult,
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
