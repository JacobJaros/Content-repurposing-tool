import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  step: z.number().int().min(0).max(3).optional(),
  completed: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", code: "VALIDATION_ERROR", status: 400 },
        { status: 400 }
      );
    }

    const data: { onboardingStep?: number; onboardingCompleted?: boolean } = {};
    if (parsed.data.step !== undefined) data.onboardingStep = parsed.data.step;
    if (parsed.data.completed !== undefined) data.onboardingCompleted = parsed.data.completed;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({
      onboardingStep: updated.onboardingStep,
      onboardingCompleted: updated.onboardingCompleted,
    });
  } catch (error) {
    console.error("[API] Failed to update onboarding:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding", code: "UPDATE_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
