import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { outputs: true },
    });

    if (!project || project.userId !== user.id) {
      return NextResponse.json(
        { error: "Project not found", code: "NOT_FOUND", status: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("[API] Failed to fetch project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project", code: "FETCH_ERROR", status: 500 },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project || project.userId !== user.id) {
      return NextResponse.json(
        { error: "Project not found", code: "NOT_FOUND", status: 404 },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.project.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project", code: "DELETE_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
