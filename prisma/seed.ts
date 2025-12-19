import { PrismaClient } from "@prisma/client";
import characters from "../src/data/characters.json";
import skills from "../src/data/skills.json";
import enemies from "../src/data/enemies.json";

// Lore data
import charactersLore from "../src/data/lore/characters-lore.json";
import factionsData from "../src/data/lore/factions.json";
import locationsData from "../src/data/lore/locations.json";
import timelineData from "../src/data/lore/timeline.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient() as unknown as any;

const ELEMENT_CONFIG: Record<string, string> = {
  Physical: "#808080",
  Fire: "#f43f5e",
  Ice: "#22d3ee",
  Lightning: "#a855f7",
  Wind: "#34d399",
  Quantum: "#6366f1",
  Imaginary: "#facc15",
};

const PATH_CONFIG = [
  "Destruction",
  "Hunt",
  "Erudition",
  "Harmony",
  "Nihility",
  "Preservation",
  "Abundance",
  "Remembrance",
];

async function main() {
  console.log("Seeding database...");

  const STAR_RAIL_RES =
    "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";

  // Seed Elements
  console.log("Seeding Elements...");
  for (const [name, color] of Object.entries(ELEMENT_CONFIG)) {
    const icon = `${STAR_RAIL_RES}/icon/element/${name}.png`;
    await prisma.element.upsert({
      where: { id: name },
      update: { color, icon },
      create: {
        id: name,
        name,
        color,
        icon,
      },
    });
  }

  // Seed Paths
  console.log("Seeding Paths...");
  for (const name of PATH_CONFIG) {
    const icon = `${STAR_RAIL_RES}/icon/path/${name}.png`;
    await prisma.path.upsert({
      where: { id: name },
      update: { icon },
      create: {
        id: name,
        name,
        icon,
      },
    });
  }

  // Seed Characters and Skills
  console.log("Seeding Characters & Skills...");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skillsData = skills as Record<string, any>;

  for (const char of characters) {
    await prisma.gameCharacter.upsert({
      where: { id: char.id },
      update: {
        charId: char.charId,
        name: char.name,
        rarity: char.rarity,
        path: char.path,
        element: char.element,
        baseSpeed: char.baseSpeed,
      },
      create: {
        id: char.id,
        charId: char.charId,
        name: char.name,
        rarity: char.rarity,
        path: char.path,
        element: char.element,
        baseSpeed: char.baseSpeed,
      },
    });

    const skill = skillsData[char.id];
    if (skill) {
      await prisma.gameCharacterSkill.upsert({
        where: { characterId: char.id },
        update: {
          basicMultiplier: skill.basicMultiplier || 0,
          skillMultiplier: skill.skillMultiplier || 0,
          ultMultiplier: skill.ultMultiplier || 0,
          basicEnergy: skill.basicEnergy || 20,
          skillEnergy: skill.skillEnergy || 30,
          ultCost: skill.ultCost || 100,
          ultType: skill.ultType || "normal",
          passive: skill.passive,
          skillSPCost: skill.skillSPCost ?? 1,
          ultSPChange: skill.ultSPChange ?? 0,
          skillBuff: skill.skillBuff ?? undefined,
          skillDebuff: skill.skillDebuff ?? undefined,
          ultBuff: skill.ultBuff ?? undefined,
          ultDebuff: skill.ultDebuff ?? undefined,
          baseAtk: skill.baseAtk || 500,
          baseCritRate: skill.baseCritRate || 0.05,
          baseCritDmg: skill.baseCritDmg || 0.5,
        },
        create: {
          characterId: char.id,
          basicMultiplier: skill.basicMultiplier || 0,
          skillMultiplier: skill.skillMultiplier || 0,
          ultMultiplier: skill.ultMultiplier || 0,
          basicEnergy: skill.basicEnergy || 20,
          skillEnergy: skill.skillEnergy || 30,
          ultCost: skill.ultCost || 100,
          ultType: skill.ultType || "normal",
          passive: skill.passive,
          skillSPCost: skill.skillSPCost ?? 1,
          ultSPChange: skill.ultSPChange ?? 0,
          skillBuff: skill.skillBuff ?? undefined,
          skillDebuff: skill.skillDebuff ?? undefined,
          ultBuff: skill.ultBuff ?? undefined,
          ultDebuff: skill.ultDebuff ?? undefined,
          baseAtk: skill.baseAtk || 500,
          baseCritRate: skill.baseCritRate || 0.05,
          baseCritDmg: skill.baseCritDmg || 0.5,
        },
      });
    }
  }

  // Seed Enemies (New)
  console.log("Seeding Enemies...");
  for (const enemy of enemies) {
    await prisma.enemy.upsert({
      where: { slug: enemy.id },
      update: {
        name: enemy.name,
        type: enemy.type,
        maxHp: enemy.hp,
        speed: enemy.speed,
        defense: enemy.def,
        weaknesses: enemy.weakness,
        resistances: enemy.resistance,
        imageUrl: enemy.imageUrl,
      },
      create: {
        slug: enemy.id,
        name: enemy.name,
        type: enemy.type,
        maxHp: enemy.hp,
        speed: enemy.speed,
        defense: enemy.def,
        toughness: enemy.type === "boss" ? 300 : 150, // basic logic
        weaknesses: enemy.weakness,
        resistances: enemy.resistance,
        imageUrl: enemy.imageUrl,
      },
    });
  }

  // Seed generic RelicSets
  const relicSets = [
    { name: "Passerby of Wandering Cloud", type: "Cavern" },
    { name: "Musketeer of Wild Wheat", type: "Cavern" },
    { name: "Knight of Purity Palace", type: "Cavern" },
    { name: "Space Sealing Station", type: "Planar" },
    { name: "Fleet of the Ageless", type: "Planar" },
  ];

  console.log("Seeding Relic Sets...");
  for (const relic of relicSets) {
    const slug = relic.name.toLowerCase().replace(/ /g, "_");
    await prisma.relicSet.upsert({
      where: { id: slug },
      update: {},
      create: {
        id: slug,
        name: relic.name,
        type: relic.type,
      },
    });
  }

  console.log("Seeding LightCones & Eidolons (Skipped - No Data Source)...");
  /* 
    // Example LightCone Seeding Logic... matches previous step
    */

  // ============ LORE DATA SEEDING ============

  console.log("Seeding Factions...");
  const factions = factionsData as Record<
    string,
    {
      id: string;
      name: string;
      type: string;
      description: string;
      leader: string;
      members: string[];
      color: string;
      icon: string;
    }
  >;

  for (const faction of Object.values(factions)) {
    await prisma.faction.upsert({
      where: { id: faction.id },
      update: {
        name: faction.name,
        type: faction.type,
        description: faction.description,
        leader: faction.leader,
        color: faction.color,
        icon: faction.icon,
      },
      create: {
        id: faction.id,
        name: faction.name,
        type: faction.type,
        description: faction.description,
        leader: faction.leader,
        color: faction.color,
        icon: faction.icon,
      },
    });
  }

  console.log("Seeding CharacterLore...");
  const charLore = charactersLore as Record<
    string,
    {
      id: string;
      name: string;
      title: string;
      faction: string;
      element: string;
      path: string;
      bio: string;
      relationships: { target: string; type: string; label: string }[];
    }
  >;

  for (const char of Object.values(charLore)) {
    await prisma.characterLore.upsert({
      where: { id: char.id },
      update: {
        name: char.name,
        title: char.title,
        bio: char.bio,
        element: char.element,
        path: char.path,
        factionId: char.faction || null,
      },
      create: {
        id: char.id,
        name: char.name,
        title: char.title,
        bio: char.bio,
        element: char.element,
        path: char.path,
        factionId: char.faction || null,
      },
    });
  }

  console.log("Seeding CharacterRelationships...");
  for (const char of Object.values(charLore)) {
    for (const rel of char.relationships) {
      // Only create if target exists in our data
      if (charLore[rel.target]) {
        try {
          await prisma.characterRelationship.upsert({
            where: {
              fromId_toId: {
                fromId: char.id,
                toId: rel.target,
              },
            },
            update: {
              type: rel.type,
              label: rel.label,
            },
            create: {
              fromId: char.id,
              toId: rel.target,
              type: rel.type,
              label: rel.label,
            },
          });
        } catch {
          // Ignore duplicate key errors
        }
      }
    }
  }

  console.log("Seeding Locations...");
  const locations = locationsData as Record<
    string,
    {
      id: string;
      name: string;
      type: string;
      description: string;
      areas: string[];
      connectedTo: string[];
    }
  >;

  for (const loc of Object.values(locations)) {
    await prisma.location.upsert({
      where: { id: loc.id },
      update: {
        name: loc.name,
        type: loc.type,
        description: loc.description,
        areas: loc.areas,
      },
      create: {
        id: loc.id,
        name: loc.name,
        type: loc.type,
        description: loc.description,
        areas: loc.areas,
      },
    });
  }

  console.log("Seeding LocationConnections...");
  for (const loc of Object.values(locations)) {
    for (const targetId of loc.connectedTo || []) {
      if (locations[targetId]) {
        try {
          await prisma.locationConnection.upsert({
            where: {
              fromId_toId: {
                fromId: loc.id,
                toId: targetId,
              },
            },
            update: {},
            create: {
              fromId: loc.id,
              toId: targetId,
            },
          });
        } catch {
          // Ignore duplicate
        }
      }
    }
  }

  console.log("Seeding TimelineEvents...");
  const timeline = timelineData as {
    id: string;
    title: string;
    location: string;
    chapter: string;
    description: string;
    characters: string[];
  }[];

  for (let i = 0; i < timeline.length; i++) {
    const event = timeline[i];
    await prisma.timelineEvent.upsert({
      where: { id: event.id },
      update: {
        title: event.title,
        chapter: event.chapter,
        description: event.description,
        locationId: locations[event.location] ? event.location : null,
        order: i,
      },
      create: {
        id: event.id,
        title: event.title,
        chapter: event.chapter,
        description: event.description,
        locationId: locations[event.location] ? event.location : null,
        order: i,
      },
    });

    // Link characters to timeline events
    for (const charId of event.characters) {
      if (charLore[charId]) {
        try {
          await prisma.timelineCharacter.upsert({
            where: {
              eventId_characterId: {
                eventId: event.id,
                characterId: charId,
              },
            },
            update: {},
            create: {
              eventId: event.id,
              characterId: charId,
            },
          });
        } catch {
          // Ignore duplicate
        }
      }
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
