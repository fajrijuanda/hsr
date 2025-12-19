import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { uid, skip } = await request.json();

    // Handle skip
    if (skip) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { hasSetUid: true },
      });

      return NextResponse.json({ success: true });
    }

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    // Validate UID format
    if (!/^\d{9}$/.test(uid)) {
      return NextResponse.json(
        { error: "Invalid UID format" },
        { status: 400 }
      );
    }

    // Check if UID is already taken
    const existingUser = await prisma.user.findUnique({
      where: { uid },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "This UID is already linked to another account" },
        { status: 400 }
      );
    }

    // Fetch profile from Mihomo API to verify and get nickname
    let nickname = null;
    try {
      const mihomoRes = await fetch(
        `https://api.mihomo.me/sr_info_parsed/${uid}?lang=en`
      );
      if (mihomoRes.ok) {
        const data = await mihomoRes.json();
        nickname = data?.player?.nickname || null;
      }
    } catch {
      // Silently fail - UID might still be valid
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        uid,
        nickname,
        hasSetUid: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "uid_linked",
        data: { uid, nickname },
      },
    });

    return NextResponse.json({
      success: true,
      nickname,
    });
  } catch (error) {
    console.error("Set UID error:", error);
    return NextResponse.json({ error: "Failed to set UID" }, { status: 500 });
  }
}
