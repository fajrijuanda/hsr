import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user/activity?uid=123456789
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
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const activities = await prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to last 50 activities
    });

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

// POST /api/user/activity
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, type, data } = body;

    if (!uid || !type) {
      return NextResponse.json(
        { success: false, error: "UID and type are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { uid },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        type,
        data,
      },
    });

    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    console.error("Failed to log activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
