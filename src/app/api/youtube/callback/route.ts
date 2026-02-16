import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { exchangeCode, getChannelInfo } from "@/lib/youtube/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?youtube=error&reason=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?youtube=error&reason=missing_params`
    );
  }

  try {
    // Decode state to get userId
    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const userId = stateData.userId;

    if (!userId) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings?youtube=error&reason=invalid_state`
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCode(code);

    // Fetch channel info
    const channelInfo = await getChannelInfo(tokens.accessToken);

    // Upsert YouTubeConnection
    await prisma.youTubeConnection.upsert({
      where: { userId },
      update: {
        channelId: channelInfo.channelId,
        channelTitle: channelInfo.channelTitle,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: new Date(Date.now() + tokens.expiresIn * 1000),
        scope: tokens.scope,
      },
      create: {
        userId,
        channelId: channelInfo.channelId,
        channelTitle: channelInfo.channelTitle,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: new Date(Date.now() + tokens.expiresIn * 1000),
        scope: tokens.scope,
      },
    });

    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?youtube=connected`
    );
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown_error";
    console.error("YouTube OAuth callback error:", reason);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?youtube=error&reason=${encodeURIComponent(reason)}`
    );
  }
}
