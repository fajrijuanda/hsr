import {
  ShowcaseProfile,
  ShowcaseCharacter,
  ShowcaseRelic,
  ElementType,
} from "@/types";

// Element mapping from API to our types
const ELEMENT_MAP: Record<string, ElementType> = {
  Physical: "Physical",
  Fire: "Fire",
  Ice: "Ice",
  Thunder: "Lightning",
  Lightning: "Lightning",
  Wind: "Wind",
  Quantum: "Quantum",
  Imaginary: "Imaginary",
};

// Slot mapping from API
const SLOT_MAP: Record<number, ShowcaseRelic["slot"]> = {
  1: "head",
  2: "hands",
  3: "body",
  4: "feet",
  5: "orb",
  6: "rope",
};

interface MihomoResponse {
  player: {
    uid: string;
    nickname: string;
    level: number;
    signature?: string;
  };
  characters: MihomoCharacter[];
}

interface MihomoCharacter {
  id: string;
  name: string;
  element: { id: string; name: string };
  path: { id: string; name: string };
  level: number;
  rank: number; // Eidolon
  attributes: { field: string; name: string; value: number }[];
  light_cone?: {
    id: string;
    name: string;
    level: number;
    rank: number; // Superimposition
    attributes: { field: string; name: string; value: number }[];
  };
  relics: MihomoRelic[];
}

interface MihomoRelic {
  id: string;
  name: string;
  set_name: string;
  type: number; // Slot
  level: number;
  main_affix: { field: string; name: string; value: number; display: string };
  sub_affix: {
    field: string;
    name: string;
    value: number;
    display: string;
    count: number; // Roll count
  }[];
}

function parseAttributes(
  attrs: { field: string; name: string; value: number }[]
): {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  critDmg: number;
  effectHit?: number;
  effectRes?: number;
  breakEffect?: number;
} {
  const stats = {
    hp: 0,
    atk: 0,
    def: 0,
    spd: 0,
    critRate: 5.0,
    critDmg: 50.0,
  };

  for (const attr of attrs) {
    switch (attr.field) {
      case "hp":
        stats.hp = Math.round(attr.value);
        break;
      case "atk":
        stats.atk = Math.round(attr.value);
        break;
      case "def":
        stats.def = Math.round(attr.value);
        break;
      case "spd":
        stats.spd = Math.round(attr.value);
        break;
      case "crit_rate":
        stats.critRate = attr.value * 100;
        break;
      case "crit_dmg":
        stats.critDmg = attr.value * 100;
        break;
    }
  }

  return stats;
}

function parseRelic(relic: MihomoRelic): ShowcaseRelic {
  return {
    id: relic.id,
    slot: SLOT_MAP[relic.type] || "head",
    setName: relic.set_name,
    level: relic.level,
    mainStat: {
      type: relic.main_affix.name,
      value:
        parseFloat(relic.main_affix.display.replace("%", "")) ||
        relic.main_affix.value,
    },
    substats: relic.sub_affix.map((sub) => ({
      type: sub.name,
      value:
        sub.name.includes("%") || sub.field.includes("_")
          ? sub.value * 100
          : sub.value,
      rolls: sub.count || 1,
    })),
  };
}

function parseCharacter(char: MihomoCharacter): ShowcaseCharacter {
  const stats = parseAttributes(char.attributes);

  return {
    id: char.id,
    name: char.name,
    element: ELEMENT_MAP[char.element.name] || "Physical",
    path: char.path.name,
    level: char.level,
    eidolon: char.rank,
    stats,
    lightCone: char.light_cone
      ? {
          id: char.light_cone.id,
          name: char.light_cone.name,
          level: char.light_cone.level,
          superimposition: char.light_cone.rank,
          stats: {
            hp: 0,
            atk: 0,
            def: 0,
          },
        }
      : undefined,
    relics: char.relics.map(parseRelic),
  };
}

function parseResponse(data: MihomoResponse): ShowcaseProfile {
  return {
    uid: data.player.uid,
    nickname: data.player.nickname,
    level: data.player.level,
    signature: data.player.signature,
    characters: data.characters.map(parseCharacter),
  };
}

export async function fetchProfile(
  uid: string
): Promise<ShowcaseProfile | null> {
  try {
    // Use our own API route to bypass CORS
    const response = await fetch(`/api/profile/${uid}`);

    if (!response.ok) {
      console.error("API error:", response.status);
      return null;
    }

    const data: MihomoResponse = await response.json();

    return parseResponse(data);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
}
