import { NextResponse } from "next/server";

const MIHOMO_API = "https://api.mihomo.me/sr_info_parsed";
const STAR_RAIL_RES_CDN =
  "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";

// Helper to convert relative paths to full CDN URLs
function toFullImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STAR_RAIL_RES_CDN}/${path}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  // Validate UID format (9 digits)
  if (!uid || !/^\d{9}$/.test(uid)) {
    return NextResponse.json(
      { success: false, error: "Invalid UID format. Must be 9 digits." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${MIHOMO_API}/${uid}?lang=en`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "HSR-Tools-Hub/1.0",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: "Player not found. Check your UID." },
          { status: 404 }
        );
      }
      throw new Error(`Mihomo API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to our format
    const profile = {
      uid: uid,
      nickname: data.player?.nickname || "Trailblazer",
      level: data.player?.level || 0,
      worldLevel: data.player?.world_level || 0,
      signature: data.player?.signature || "",
      avatar: toFullImageUrl(data.player?.avatar?.icon),
      achievements: data.player?.space_info?.achievement_count || 0,
      characters: (data.characters || []).map((char: any) => ({
        id: char.id,
        name: char.name,
        rarity: char.rarity,
        level: char.level,
        rank: char.rank, // Eidolon level
        element: char.element?.id || "physical",
        path: char.path?.id || "unknown",
        icon: toFullImageUrl(char.icon),
        preview: toFullImageUrl(char.preview),
        portrait: toFullImageUrl(char.portrait),
        lightCone: char.light_cone
          ? {
              id: char.light_cone.id,
              name: char.light_cone.name,
              rarity: char.light_cone.rarity,
              rank: char.light_cone.rank,
              level: char.light_cone.level,
              icon: toFullImageUrl(char.light_cone.icon),
            }
          : null,
        relics: (char.relics || []).map((relic: any) => ({
          id: relic.id,
          name: relic.name,
          setId: relic.set_id,
          setName: relic.set_name,
          rarity: relic.rarity,
          level: relic.level,
          icon: toFullImageUrl(relic.icon),
          mainAffix: relic.main_affix,
          subAffixes: relic.sub_affix || [],
        })),
        attributes: (char.attributes || []).map((attr: any) => ({
          field: attr.field,
          name: attr.name,
          icon: toFullImageUrl(attr.icon),
          value: attr.value,
          display: attr.display,
        })),
        additions: (char.additions || []).map((add: any) => ({
          field: add.field,
          name: add.name,
          icon: toFullImageUrl(add.icon),
          value: add.value,
          display: add.display,
        })),
        skills: (char.skills || []).map((skill: any) => ({
          id: skill.id,
          name: skill.name,
          level: skill.level,
          maxLevel: skill.max_level,
          icon: toFullImageUrl(skill.icon),
          type: skill.type,
        })),
      })),
    };

    return NextResponse.json({
      success: true,
      data: profile,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching Mihomo data:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}
