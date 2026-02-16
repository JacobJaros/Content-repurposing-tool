import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { isYouTubeConfigured } from "@/lib/youtube/config";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = isYouTubeConfigured();

  const connection = await prisma.youTubeConnection.findUnique({
    where: { userId: user.id },
    select: { channelTitle: true, channelId: true },
  });

  return NextResponse.json({
    configured,
    connected: !!connection,
    channelTitle: connection?.channelTitle || null,
    channelId: connection?.channelId || null,
  });
}
