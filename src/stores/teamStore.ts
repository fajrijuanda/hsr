import { create } from "zustand";
import { Character, TeamMember, TimelineEntry } from "@/types";
import { generateTimeline, calculateTotalSpeed } from "@/lib/calculator";
import charactersData from "@/data/characters.json";

interface TeamState {
  team: TeamMember[];
  timeline: TimelineEntry[];
  cycles: number;
  bossSpeed: number;

  // Actions
  addCharacter: (characterId: string) => void;
  removeCharacter: (index: number) => void;
  updateMemberSpeed: (
    index: number,
    field: keyof TeamMember,
    value: number
  ) => void;
  setCycles: (cycles: number) => void;
  setBossSpeed: (speed: number) => void;
  regenerateTimeline: () => void;
  clearTeam: () => void;
  loadPreset: (characterIds: string[]) => void;
}

const getCharacterById = (id: string): Character | undefined => {
  return (charactersData as Character[]).find((c) => c.id === id);
};

export const useTeamStore = create<TeamState>((set, get) => ({
  team: [],
  timeline: [],
  cycles: 3,
  bossSpeed: 80,

  addCharacter: (characterId: string) => {
    const character = getCharacterById(characterId);
    if (!character) return;

    const { team } = get();
    if (team.length >= 4) return;
    if (team.some((m) => m.character.id === characterId)) return;

    const newMember: TeamMember = {
      character,
      speedBonus: 0,
      speedPercent: 0,
      relicSpeedBonus: 0,
      lightConeSpeed: 0,
    };

    set({ team: [...team, newMember] });
    get().regenerateTimeline();
  },

  removeCharacter: (index: number) => {
    const { team } = get();
    const newTeam = team.filter((_, i) => i !== index);
    set({ team: newTeam });
    get().regenerateTimeline();
  },

  updateMemberSpeed: (
    index: number,
    field: keyof TeamMember,
    value: number
  ) => {
    const { team } = get();
    const newTeam = [...team];
    if (newTeam[index] && field !== "character") {
      newTeam[index] = { ...newTeam[index], [field]: value };
    }
    set({ team: newTeam });
    get().regenerateTimeline();
  },

  setCycles: (cycles: number) => {
    set({ cycles });
    get().regenerateTimeline();
  },

  setBossSpeed: (speed: number) => {
    set({ bossSpeed: speed });
    get().regenerateTimeline();
  },

  regenerateTimeline: () => {
    const { team, cycles, bossSpeed } = get();
    if (team.length === 0) {
      set({ timeline: [] });
      return;
    }
    const timeline = generateTimeline(team, cycles, bossSpeed);
    set({ timeline });
  },

  clearTeam: () => {
    set({ team: [], timeline: [] });
  },

  loadPreset: (characterIds: string[]) => {
    const team: TeamMember[] = [];
    for (const id of characterIds.slice(0, 4)) {
      const character = getCharacterById(id);
      if (character) {
        team.push({
          character,
          speedBonus: 0,
          speedPercent: 0,
          relicSpeedBonus: 0,
          lightConeSpeed: 0,
        });
      }
    }
    set({ team });
    get().regenerateTimeline();
  },
}));

// Helper hook to get computed values
export const useTeamStats = () => {
  const team = useTeamStore((state) => state.team);

  return team.map((member) => ({
    ...member,
    totalSpeed: calculateTotalSpeed(member),
  }));
};
