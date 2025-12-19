import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/user/characters - Add character to user's collection
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, characterId, eidolon = 0, level = 1 } = body;

    if (!uid || !characterId) {
      return NextResponse.json(
        { success: false, error: "UID and characterId are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { uid } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if GameCharacter exists, if not create a placeholder
    let gameChar = await prisma.gameCharacter.findUnique({
      where: { id: characterId },
    });

    if (!gameChar) {
      // Create a minimal placeholder for the character
      gameChar = await prisma.gameCharacter.create({
        data: {
          id: characterId,
          charId: characterId, // Will be updated if needed
          name: characterId,
          rarity: 5,
          path: "Unknown",
          element: "Unknown",
          baseSpeed: 100,
        },
      });
    }

    // Upsert ownership
    const userCharacter = await prisma.userCharacter.upsert({
      where: {
        userId_characterId: {
          userId: user.id,
          characterId: gameChar.id,
        },
      },
      update: {
        eidolon,
        level,
      },
      create: {
        userId: user.id,
        characterId: gameChar.id,
        eidolon,
        level,
      },
    });

    return NextResponse.json({ success: true, data: userCharacter });
  } catch (error) {
    console.error("Failed to add character:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add character" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/characters - Remove character from user's collection
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    const characterId = searchParams.get("characterId");

    if (!uid || !characterId) {
      return NextResponse.json(
        { success: false, error: "UID and characterId are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { uid } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Delete ownership record
    await prisma.userCharacter.deleteMany({
      where: {
        userId: user.id,
        characterId: characterId,
      },
    });

    return NextResponse.json({ success: true, message: "Character removed" });
  } catch (error) {
    console.error("Failed to remove character:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove character" },
      { status: 500 }
    );
  }
}

// GET /api/user/characters?uid=xxx - Get all owned characters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { success: false, error: "UID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { uid } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const ownedCharacters = await prisma.userCharacter.findMany({
      where: { userId: user.id },
      include: {
        character: true,
      },
    });

    return NextResponse.json({ success: true, data: ownedCharacters });
  } catch (error) {
    console.error("Failed to fetch characters:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
}
