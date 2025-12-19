import pityRates from "@/data/pity-rates.json";

export interface PullResult {
  pullsNeeded: number;
  stellarJadeNeeded: number;
  probability: number;
}

export interface ResourceSummary {
  totalPulls: number;
  stellarJade: number;
  passes: number;
}

/**
 * Calculate the probability of getting a 5★ at a specific pity count
 */
export function getPullProbability(
  pity: number,
  bannerType: "standard" | "lightCone" = "standard"
): number {
  const rates = pityRates[bannerType];

  if (pity < rates.softPityStart) {
    return rates.baseRate;
  }

  // Soft pity increases rate linearly
  const softPityProgress = pity - rates.softPityStart + 1;
  const rate = rates.baseRate + rates.softPityRateIncrease * softPityProgress;

  return Math.min(rate, 1); // Cap at 100%
}

/**
 * Calculate expected pulls needed from current pity to get 5★
 */
export function calculatePullsToFiveStar(
  currentPity: number,
  isGuaranteed: boolean,
  bannerType: "standard" | "lightCone" = "standard"
): PullResult {
  const rates = pityRates[bannerType];

  // Monte Carlo simulation for expected pulls
  const simulations = 10000;
  let totalPulls = 0;

  for (let i = 0; i < simulations; i++) {
    let pity = currentPity;
    let got5Star = false;
    let pullCount = 0;

    while (!got5Star) {
      pity++;
      pullCount++;

      const prob = getPullProbability(pity, bannerType);
      if (Math.random() < prob || pity >= rates.hardPity) {
        got5Star = true;
      }
    }

    totalPulls += pullCount;
  }

  const avgPulls = Math.round(totalPulls / simulations);

  // If not guaranteed (50/50), factor in average for losing
  const finalPulls = isGuaranteed ? avgPulls : Math.round(avgPulls * 1.5);

  return {
    pullsNeeded: finalPulls,
    stellarJadeNeeded: finalPulls * rates.costPerPull,
    probability: 0.5, // Base probability, refined by simulation
  };
}

/**
 * Quick estimate without simulation
 */
export function quickEstimatePulls(
  currentPity: number,
  isGuaranteed: boolean
): { min: number; avg: number; max: number } {
  const toSoftPity = Math.max(0, 74 - currentPity);
  const toHardPity = 90 - currentPity;

  // Average is usually around 62 pulls from 0 pity
  const avgFromZero = 62;
  const avgFromCurrent = Math.max(1, avgFromZero - currentPity * 0.7);

  if (isGuaranteed) {
    return {
      min: 1,
      avg: Math.round(avgFromCurrent),
      max: toHardPity,
    };
  }

  // 50/50 worst case: lose + full pity again
  return {
    min: 1,
    avg: Math.round(avgFromCurrent * 1.5),
    max: toHardPity + 90,
  };
}

/**
 * Convert resources to total pulls
 */
export function calculateTotalPulls(
  stellarJade: number,
  passes: number
): ResourceSummary {
  const pullsFromJade = Math.floor(stellarJade / 160);
  return {
    totalPulls: pullsFromJade + passes,
    stellarJade,
    passes,
  };
}

/**
 * Calculate Stellar Jade income estimate
 */
export function estimateDailyIncome(): number {
  // Daily sources estimate:
  // - Daily missions: 60
  // - Rail Pass: varies
  // - Events: varies (~500/week = ~71/day)
  // - Abyss/MoC: varies (~800/2weeks = ~57/day)

  return 60 + 71 + 57; // ~188 SJ per day average
}

/**
 * Calculate days until enough resources
 */
export function daysUntilEnough(
  currentJade: number,
  currentPasses: number,
  pullsNeeded: number,
  dailyIncome: number = estimateDailyIncome()
): number {
  const currentPulls = calculateTotalPulls(
    currentJade,
    currentPasses
  ).totalPulls;

  if (currentPulls >= pullsNeeded) {
    return 0;
  }

  const jadeNeeded = (pullsNeeded - currentPulls) * 160;
  return Math.ceil(jadeNeeded / dailyIncome);
}

/**
 * Get pity zone color
 */
export function getPityZone(pity: number): "safe" | "soft" | "hot" {
  if (pity < 60) return "safe";
  if (pity < 74) return "soft";
  return "hot";
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Run Monte Carlo simulation for probability distribution
 */
export function simulatePulls(
  currentPity: number,
  isGuaranteed: boolean,
  availablePulls: number,
  simulations: number = 10000
): { successRate: number; avgPulls: number; distribution: number[] } {
  let successes = 0;
  let totalPulls = 0;
  const distribution: number[] = new Array(181).fill(0); // 0-180 pulls

  for (let i = 0; i < simulations; i++) {
    let pity = currentPity;
    let pullCount = 0;
    let got5Star = false;
    let wonFiftyFifty = isGuaranteed;

    while (pullCount < availablePulls && !got5Star) {
      pity++;
      pullCount++;

      const prob = getPullProbability(pity, "standard");

      if (Math.random() < prob || pity >= 90) {
        if (wonFiftyFifty) {
          got5Star = true;
        } else {
          // 50/50
          if (Math.random() < 0.5) {
            got5Star = true;
          } else {
            // Lost 50/50, reset pity, now guaranteed
            pity = 0;
            wonFiftyFifty = true;
          }
        }
      }
    }

    if (got5Star) {
      successes++;
      totalPulls += pullCount;
      distribution[Math.min(pullCount, 180)]++;
    }
  }

  return {
    successRate: successes / simulations,
    avgPulls: successes > 0 ? Math.round(totalPulls / successes) : 0,
    distribution,
  };
}
