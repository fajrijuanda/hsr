import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user/team-presets?uid=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json(
      { success: false, error: "UID required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { uid } });
    if (!user)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );

    const presets = await prisma.teamPreset.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: presets });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch presets" },
      { status: 500 }
    );
  }
}

// POST /api/user/team-presets
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, name, characters } = body;

    if (!uid || !name || !characters) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { uid } });
    if (!user)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );

    const preset = await prisma.teamPreset.create({
      data: {
        userId: user.id,
        name,
        characters,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "speed_tuner_save_preset",
        data: { presetId: preset.id, name },
      },
    });

    return NextResponse.json({ success: true, data: preset });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save preset" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/team-presets?id=...&uid=...
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const uid = searchParams.get("uid");

  if (!id || !uid) {
    return NextResponse.json(
      { success: false, error: "ID and UID required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { uid } });
    if (!user)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );

    // Ensure preset belongs to user
    const preset = await prisma.teamPreset.findFirst({
      where: { id, userId: user.id },
    });

    if (!preset)
      return NextResponse.json(
        { success: false, error: "Preset not found" },
        { status: 404 }
      );

    await prisma.teamPreset.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete preset" },
      { status: 500 }
    );
  }
}
