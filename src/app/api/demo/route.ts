import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  DEMO_TRANSCRIPT,
  DEMO_MASTER_ANALYSIS,
  DEMO_OUTPUTS,
} from "@/lib/demo/sample-content";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        title: "Sample: AI & The Future of Creative Work",
        status: "READY",
        inputType: "TEXT",
        inputText: DEMO_TRANSCRIPT,
        masterAnalysis: DEMO_MASTER_ANALYSIS,
        outputs: {
          create: Object.entries(DEMO_OUTPUTS).map(([platform, content]) => ({
            platform,
            content,
          })),
        },
      },
      include: { outputs: true },
    });

    return NextResponse.json({ projectId: project.id });
  } catch (error) {
    console.error("[API] Failed to create demo project:", error);
    return NextResponse.json(
      { error: "Failed to create demo project", code: "DEMO_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
