import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isYouTubeConfigured } from "@/lib/youtube/config";
import { getAuthUrl } from "@/lib/youtube/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isYouTubeConfigured()) {
    return NextResponse.json(
      { error: "YouTube API credentials not configured" },
      { status: 503 }
    );
  }

  const state = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64");
  const authUrl = getAuthUrl(state);

  return NextResponse.redirect(authUrl);
}
