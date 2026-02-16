import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { revokeAccess } from "@/lib/youtube/auth";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const connection = await prisma.youTubeConnection.findUnique({
      where: { userId: user.id },
    });

    if (connection) {
      // Attempt to revoke the token (non-blocking — OK if this fails)
      await revokeAccess(connection.accessToken).catch(() => {});

      await prisma.youTubeConnection.delete({
        where: { userId: user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
