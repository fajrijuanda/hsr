import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user/pull-plan?uid=...
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

    const plan = await prisma.pullPlan.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" }, // Get latest
    });

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

// PUT /api/user/pull-plan
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      uid,
      currentPity,
      isGuaranteed,
      stellarJade,
      passes,
      targetBanner,
    } = body;

    const user = await prisma.user.findUnique({ where: { uid } });
    if (!user)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );

    // Update existing or create new if not exists (singleton per user logic or history?)
    // This design allows multiple plans but maybe we just want the latest state.
    // Let's create a new entry for history tracking, or update if we only care about current state.
    // The implementation plan suggested 'saved state', so let's update a single active plan or create one.

    // Let's implement as "upsert" equivalent logic manually: find active, update, or create.
    // But since `PullPlan` table can store history, let's just find the most recent one or update it.
    // Actually, creating a new one every time saves history. But might bloat.
    // Let's update if exists for now to keep it simple as "Current State".

    // Check if user has a plan
    const existingPlan = await prisma.pullPlan.findFirst({
      where: { userId: user.id },
    });

    let plan;
    if (existingPlan) {
      plan = await prisma.pullPlan.update({
        where: { id: existingPlan.id },
        data: {
          currentPity,
          isGuaranteed,
          stellarJade,
          passes,
          targetBanner,
        },
      });
    } else {
      plan = await prisma.pullPlan.create({
        data: {
          userId: user.id,
          currentPity,
          isGuaranteed,
          stellarJade,
          passes,
          targetBanner,
        },
      });
    }

    // Log activity if detailed tracking is needed, but maybe overkill for every autosave.
    // Let's log it only if it's a significant update? Or just skip logging to avoid spam.

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save plan" },
      { status: 500 }
    );
  }
}
