import { TeamMember, TimelineEntry, CycleBoundary } from "@/types";

// Action Value = 10000 / Speed
// Lower AV = acts first

/**
 * Calculate total speed for a team member including all bonuses
 */
export function calculateTotalSpeed(member: TeamMember): number {
  const baseSpeed = member.character.baseSpeed;
  const flatBonus =
    member.speedBonus + member.relicSpeedBonus + member.lightConeSpeed;
  const percentBonus = member.speedPercent / 100;

  return Math.floor(baseSpeed * (1 + percentBonus) + flatBonus);
}

/**
 * Calculate Action Value from speed
 */
export function calculateAV(speed: number): number {
  return 10000 / speed;
}

/**
 * Calculate initial AV at battle start (50% of normal AV)
 */
export function calculateInitialAV(speed: number): number {
  return (10000 / speed) * 0.5;
}

/**
 * Generate timeline entries for a team over multiple cycles
 */
export function generateTimeline(
  team: TeamMember[],
  cycles: number = 3,
  bossSpeed: number = 80
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  // Initialize AV for each character (first turn is 50% AV)
  const characterAVs: {
    id: string;
    name: string;
    av: number;
    speed: number;
    element: string;
  }[] = team.map((member) => {
    const speed = calculateTotalSpeed(member);
    return {
      id: member.character.id,
      name: member.character.name,
      av: calculateInitialAV(speed),
      speed: speed,
      element: member.character.element,
    };
  });

  // Add boss
  const bossAV = calculateInitialAV(bossSpeed);
  characterAVs.push({
    id: "boss",
    name: "Boss",
    av: bossAV,
    speed: bossSpeed,
    element: "None",
  });

  // Cycle boundaries (each cycle is 150 AV)
  const maxAV = 150 * cycles;
  let turnCounter = 0;

  // Generate turns until we exceed max AV
  while (turnCounter < 100) {
    // Safety limit
    // Find character with lowest AV
    characterAVs.sort((a, b) => a.av - b.av);
    const current = characterAVs[0];

    if (current.av > maxAV) break;

    turnCounter++;
    entries.push({
      characterId: current.id,
      characterName: current.name,
      actionValue: current.av,
      turnNumber: turnCounter,
      element: current.element,
      isEnemy: current.id === "boss",
    });

    // Add next action AV
    current.av += calculateAV(current.speed);
  }

  return entries;
}

/**
 * Get cycle boundaries for visualization
 */
export function getCycleBoundaries(cycles: number): CycleBoundary[] {
  const boundaries: CycleBoundary[] = [];

  for (let i = 0; i < cycles; i++) {
    boundaries.push({
      cycle: i,
      startAV: i * 150,
      endAV: (i + 1) * 150,
    });
  }

  return boundaries;
}

/**
 * Calculate how many actions a character takes per cycle
 */
export function getActionsPerCycle(speed: number): number {
  const av = calculateAV(speed);
  return Math.floor(150 / av);
}

/**
 * Get speed breakpoints for different action counts per cycle
 */
export function getSpeedBreakpoints(): { actions: number; minSpeed: number }[] {
  return [
    { actions: 1, minSpeed: 67 }, // 10000/67 ≈ 149 AV
    { actions: 2, minSpeed: 134 }, // 10000/134 ≈ 75 AV
    { actions: 3, minSpeed: 200 }, // Theoretical
  ];
}

/**
 * Format AV for display
 */
export function formatAV(av: number): string {
  return av.toFixed(1);
}
