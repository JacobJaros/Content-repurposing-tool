import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateForPlatform } from "@/lib/ai/generate";
import type { AnalysisResult } from "@/lib/ai/analyze";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, platform } = body as {
      projectId: string;
      platform: string;
    };

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== user.id) {
      return NextResponse.json(
        { error: "Project not found", code: "NOT_FOUND", status: 404 },
        { status: 404 }
      );
    }

    const analysis: AnalysisResult = project.masterAnalysis
      ? JSON.parse(project.masterAnalysis)
      : { topics: [], keyQuotes: [], coreArguments: [], narrativeArc: "", takeaways: [] };

    const result = await generateForPlatform(
      platform,
      analysis,
      project.transcript || project.inputText || ""
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error, code: "GENERATION_FAILED", status: 500 },
        { status: 500 }
      );
    }

    // Update or create the output
    const existingOutput = await prisma.output.findFirst({
      where: { projectId, platform },
    });

    let output;
    if (existingOutput) {
      output = await prisma.output.update({
        where: { id: existingOutput.id },
        data: { content: result.content, metadata: null },
      });
    } else {
      output = await prisma.output.create({
        data: {
          projectId,
          platform,
          content: result.content,
        },
      });
    }

    return NextResponse.json({ output });
  } catch (error) {
    console.error("[API] Regeneration failed:", error);
    return NextResponse.json(
      { error: "Regeneration failed", code: "REGENERATE_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
