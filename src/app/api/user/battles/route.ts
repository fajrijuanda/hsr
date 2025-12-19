import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user/battles?uid=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid)
    return NextResponse.json(
      { success: false, error: "UID required" },
      { status: 400 }
    );

  try {
    const user = await prisma.user.findUnique({ where: { uid } });
    if (!user)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );

    const battles = await prisma.battle.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, data: battles });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch battles" },
      { status: 500 }
    );
  }
}

// POST /api/user/battles
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, team, enemy, result, totalDamage, turns, duration } = body;

    const user = await prisma.user.findUnique({ where: { uid } });
    if (!user)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );

    const battle = await prisma.battle.create({
      data: {
        userId: user.id,
        team,
        enemy,
        result,
        totalDamage,
        turns,
        duration,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "battle_complete",
        data: { battleId: battle.id, result, totalDamage },
      },
    });

    return NextResponse.json({ success: true, data: battle });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save battle" },
      { status: 500 }
    );
  }
}
