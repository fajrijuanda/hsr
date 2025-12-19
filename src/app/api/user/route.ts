import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user?uid=123456789
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json(
      { success: false, error: "UID is required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { uid },
      include: {
        profile: true,
        ownedCharacters: {
          include: {
            character: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// POST /api/user - Create or Update User on Login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, nickname, level, avatar, signature, profileData } = body;

    if (!uid) {
      return NextResponse.json(
        { success: false, error: "UID is required" },
        { status: 400 }
      );
    }

    // Upsert User
    const user = await prisma.user.upsert({
      where: { uid },
      update: {
        nickname,
        level,
        avatar,
        lastLoginAt: new Date(),
        // Update profile if provided
        profile: profileData
          ? {
              upsert: {
                create: { data: profileData },
                update: { data: profileData },
              },
            }
          : undefined,
      },
      create: {
        uid,
        nickname,
        level,
        avatar,
        lastLoginAt: new Date(),
        profile: profileData
          ? {
              create: { data: profileData },
            }
          : undefined,
      },
      include: {
        profile: true,
      },
    });

    // Log login activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "login",
        data: { timestamp: new Date() },
      },
    });

    // Sync owned characters from profile to UserCharacter table
    if (profileData?.characters && Array.isArray(profileData.characters)) {
      for (const char of profileData.characters) {
        // Find matching GameCharacter by charId (4-digit ID)
        const gameChar = await prisma.gameCharacter.findFirst({
          where: { charId: char.id },
        });

        if (gameChar) {
          await prisma.userCharacter.upsert({
            where: {
              userId_characterId: {
                userId: user.id,
                characterId: gameChar.id,
              },
            },
            update: {
              eidolon: char.eidolon || 0,
              level: char.level || 1,
              lightConeId: char.lightCone?.id || null,
            },
            create: {
              userId: user.id,
              characterId: gameChar.id,
              eidolon: char.eidolon || 0,
              level: char.level || 1,
              lightConeId: char.lightCone?.id || null,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Failed to create/update user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create/update user" },
      { status: 500 }
    );
  }
}
