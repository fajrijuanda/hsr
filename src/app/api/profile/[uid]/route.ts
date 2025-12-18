import { NextRequest, NextResponse } from "next/server";

const MIHOMO_API_URL = "https://api.mihomo.me/sr_info_parsed";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  if (!uid || !/^\d{9}$/.test(uid)) {
    return NextResponse.json({ error: "Invalid UID format" }, { status: 400 });
  }

  try {
    const response = await fetch(`${MIHOMO_API_URL}/${uid}?lang=en`, {
      headers: {
        "User-Agent": "HSR-Tools/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch profile from Mihomo API" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Mihomo API error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Mihomo API" },
      { status: 500 }
    );
  }
}
