import substatValues from "@/data/substat-values.json";
import optimalBuilds from "@/data/optimal-builds.json";

export interface Substat {
  type: string;
  value: number;
  rolls: number;
}

export interface Relic {
  id: string;
  slot: "head" | "hands" | "body" | "feet" | "orb" | "rope";
  setName: string;
  level: number;
  mainStat: {
    type: string;
    value: number;
  };
  substats: Substat[];
}

export interface RelicRating {
  grade: "S" | "A" | "B" | "C" | "D" | "F";
  score: number;
  efficiency: number;
  message: string;
  substatRatings: {
    type: string;
    value: number;
    maxValue: number;
    efficiency: number;
    isUseful: boolean;
  }[];
}

const substatMax = substatValues as Record<
  string,
  { maxRoll: number; minRoll: number }
>;
const builds = optimalBuilds as Record<
  string,
  {
    name: string;
    substats: Record<string, number>;
    mainStats: Record<string, string>;
    sets: string[];
  }
>;

export function getCharacterWeights(
  characterId: string
): Record<string, number> {
  const build = builds[characterId] || builds["default"];
  return build.substats;
}

export function rateSubstat(
  substat: Substat,
  characterId: string
): { value: number; maxValue: number; efficiency: number; isUseful: boolean } {
  const weights = getCharacterWeights(characterId);
  const weight = weights[substat.type] || 0;
  const maxInfo = substatMax[substat.type];

  if (!maxInfo) {
    return { value: 0, maxValue: 0, efficiency: 0, isUseful: false };
  }

  const maxValue = maxInfo.maxRoll * substat.rolls;
  const efficiency = (substat.value / maxValue) * 100;

  return {
    value: substat.value,
    maxValue,
    efficiency,
    isUseful: weight >= 0.5,
  };
}

export function rateRelic(relic: Relic, characterId: string): RelicRating {
  const weights = getCharacterWeights(characterId);

  let totalWeightedScore = 0;
  let totalMaxScore = 0;

  const substatRatings = relic.substats.map((substat) => {
    const rating = rateSubstat(substat, characterId);
    const weight = weights[substat.type] || 0;

    totalWeightedScore += (rating.efficiency / 100) * weight * substat.rolls;
    totalMaxScore += weight * substat.rolls;

    return {
      type: substat.type,
      ...rating,
    };
  });

  // Calculate overall score (0-100)
  const score =
    totalMaxScore > 0
      ? Math.round((totalWeightedScore / totalMaxScore) * 100)
      : 0;

  // Count useful substats
  const usefulStats = substatRatings.filter((s) => s.isUseful).length;

  // Adjust score based on useful substat count
  const adjustedScore = Math.round(score * (0.5 + usefulStats * 0.125));

  return {
    grade: getGrade(adjustedScore),
    score: adjustedScore,
    efficiency: score,
    message: getBrutalMessage(adjustedScore, usefulStats),
    substatRatings,
  };
}

function getGrade(score: number): "S" | "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function getBrutalMessage(score: number, usefulStats: number): string {
  if (score >= 90) return "🔥 ABSOLUTELY CRACKED. Never touch this.";
  if (score >= 80) return "✨ Excellent piece. Lock this immediately.";
  if (score >= 70) return "👍 Solid. Worth the resin investment.";
  if (score >= 60) return "😐 Copium. Acceptable placeholder.";
  if (score >= 50) return "💀 Mid. Replace when possible.";
  if (score >= 40) return "🗑️ Fodder. Why is this still equipped?";
  if (usefulStats <= 1) return "☠️ WRONG STATS. Feed this to better relics.";
  return "☠️ DELETE THIS. Immediate action required.";
}

export function getOverallBuildRating(
  relics: Relic[],
  characterId: string
): {
  grade: "S" | "A" | "B" | "C" | "D" | "F";
  score: number;
  message: string;
} {
  if (relics.length === 0) {
    return { grade: "F", score: 0, message: "No relics equipped!" };
  }

  const ratings = relics.map((r) => rateRelic(r, characterId));
  const avgScore = Math.round(
    ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
  );

  const lowPieces = ratings.filter((r) => r.score < 60).length;
  const highPieces = ratings.filter((r) => r.score >= 80).length;

  let message = "";
  if (avgScore >= 85) {
    message = "🏆 God-tier build. Touch grass.";
  } else if (avgScore >= 75) {
    message = "💪 Strong build. Minor upgrades possible.";
  } else if (avgScore >= 65) {
    message = `⚠️ Decent build. ${lowPieces} piece(s) need work.`;
  } else if (avgScore >= 55) {
    message = `😬 Copium build. Focus on ${lowPieces} weak pieces.`;
  } else {
    message = "💔 Needs serious work. Keep farming.";
  }

  if (highPieces >= 4) {
    message += " (Nice S/A pieces!)";
  }

  return {
    grade: getGrade(avgScore),
    score: avgScore,
    message,
  };
}
