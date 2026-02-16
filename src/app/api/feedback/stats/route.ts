import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get all feedback for user's outputs
    const feedbacks = await prisma.feedback.findMany({
      where: {
        output: {
          project: { userId: user.id },
        },
      },
      include: {
        output: { select: { platform: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = feedbacks.length;
    const thumbsUp = feedbacks.filter((f) => f.rating === "THUMBS_UP").length;
    const thumbsDown = feedbacks.filter((f) => f.rating === "THUMBS_DOWN").length;

    const byPlatform: Record<string, { thumbsUp: number; thumbsDown: number }> = {};
    for (const f of feedbacks) {
      const platform = f.output.platform;
      if (!byPlatform[platform]) {
        byPlatform[platform] = { thumbsUp: 0, thumbsDown: 0 };
      }
      if (f.rating === "THUMBS_UP") byPlatform[platform].thumbsUp++;
      else byPlatform[platform].thumbsDown++;
    }

    const recentComments = feedbacks
      .filter((f) => f.comment)
      .slice(0, 10)
      .map((f) => ({
        comment: f.comment,
        platform: f.output.platform,
        createdAt: f.createdAt.toISOString(),
      }));

    return NextResponse.json({
      total,
      thumbsUp,
      thumbsDown,
      byPlatform,
      recentComments,
    });
  } catch (error) {
    console.error("[API] Failed to fetch feedback stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback stats", code: "STATS_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
