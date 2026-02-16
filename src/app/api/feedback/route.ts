import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const postSchema = z.object({
  outputId: z.string().min(1),
  rating: z.enum(["THUMBS_UP", "THUMBS_DOWN"]),
  comment: z.string().optional(),
});

const deleteSchema = z.object({
  outputId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", code: "VALIDATION_ERROR", status: 400 },
        { status: 400 }
      );
    }

    // Verify the output belongs to the user
    const output = await prisma.output.findUnique({
      where: { id: parsed.data.outputId },
      include: { project: { select: { userId: true } } },
    });

    if (!output || output.project.userId !== user.id) {
      return NextResponse.json(
        { error: "Output not found", code: "NOT_FOUND", status: 404 },
        { status: 404 }
      );
    }

    const feedback = await prisma.feedback.upsert({
      where: {
        outputId_userId: {
          outputId: parsed.data.outputId,
          userId: user.id,
        },
      },
      update: {
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
      create: {
        outputId: parsed.data.outputId,
        userId: user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("[API] Failed to save feedback:", error);
    return NextResponse.json(
      { error: "Failed to save feedback", code: "FEEDBACK_ERROR", status: 500 },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", code: "VALIDATION_ERROR", status: 400 },
        { status: 400 }
      );
    }

    await prisma.feedback.deleteMany({
      where: {
        outputId: parsed.data.outputId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to delete feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback", code: "FEEDBACK_ERROR", status: 500 },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const outputId = req.nextUrl.searchParams.get("outputId");
    if (!outputId) {
      return NextResponse.json(
        { error: "outputId is required", code: "VALIDATION_ERROR", status: 400 },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.findUnique({
      where: {
        outputId_userId: {
          outputId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("[API] Failed to fetch feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback", code: "FEEDBACK_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
