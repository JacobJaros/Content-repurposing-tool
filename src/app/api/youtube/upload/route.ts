import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { isYouTubeConfigured } from "@/lib/youtube/config";
import { getValidAccessToken } from "@/lib/youtube/token-refresh";
import { uploadShort } from "@/lib/youtube/upload";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const VALID_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isYouTubeConfigured()) {
    return NextResponse.json(
      {
        error: "YouTube integration not configured",
        code: "YOUTUBE_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  // Check YouTube connection exists
  const connection = await prisma.youTubeConnection.findUnique({
    where: { userId: user.id },
  });

  if (!connection) {
    return NextResponse.json(
      { error: "YouTube not connected. Connect your account in Settings." },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const tagsRaw = formData.get("tags") as string | null;
    const privacyStatus = (formData.get("privacyStatus") as string) || "public";

    if (!videoFile) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!VALID_TYPES.includes(videoFile.type)) {
      return NextResponse.json(
        {
          error: `Invalid video format. Supported: MP4, MOV, WEBM. Got: ${videoFile.type}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (videoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 100MB." },
        { status: 400 }
      );
    }

    // Get valid access token (auto-refreshes if expired)
    const accessToken = await getValidAccessToken(user.id);

    // Parse tags
    let tags: string[] = [];
    if (tagsRaw) {
      try {
        tags = JSON.parse(tagsRaw);
      } catch {
        tags = tagsRaw.split(",").map((t) => t.trim());
      }
    }

    // Convert file to Uint8Array
    const arrayBuffer = await videoFile.arrayBuffer();
    const videoBuffer = new Uint8Array(arrayBuffer);

    // Upload to YouTube
    const result = await uploadShort(accessToken, videoBuffer, {
      title: title || "Untitled Short",
      description: description || "",
      tags,
      privacyStatus:
        privacyStatus === "unlisted" ? "unlisted" : "public",
    });

    return NextResponse.json({
      videoId: result.videoId,
      videoUrl: result.videoUrl,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upload failed";
    console.error("YouTube upload error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
