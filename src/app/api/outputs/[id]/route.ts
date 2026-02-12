import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const output = await prisma.output.findUnique({
      where: { id: params.id },
      include: { project: true },
    });

    if (!output || output.project.userId !== user.id) {
      return NextResponse.json(
        { error: "Output not found", code: "NOT_FOUND", status: 404 },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { editedContent } = body as { editedContent: string };

    const updated = await prisma.output.update({
      where: { id: params.id },
      data: { editedContent },
    });

    return NextResponse.json({ output: updated });
  } catch (error) {
    console.error("[API] Failed to update output:", error);
    return NextResponse.json(
      { error: "Failed to update output", code: "UPDATE_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
