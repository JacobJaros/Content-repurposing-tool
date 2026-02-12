import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, brandVoice } = body as {
      name?: string;
      brandVoice?: string;
    };

    const data: Record<string, string> = {};
    if (name !== undefined) data.name = name.trim();
    if (brandVoice !== undefined) data.brandVoice = brandVoice.trim();

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update", code: "VALIDATION_ERROR", status: 400 },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({
      user: {
        name: updated.name,
        brandVoice: updated.brandVoice,
      },
    });
  } catch (error) {
    console.error("[API] Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings", code: "UPDATE_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
