import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { transcribe } from "@/lib/ai/transcribe";
import { analyze } from "@/lib/ai/analyze";
import { generateAll } from "@/lib/ai/generate";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id, deletedAt: null },
      include: { outputs: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[API] Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects", code: "FETCH_ERROR", status: 500 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { title, inputType, inputText, inputFileUrl, platforms } = body as {
      title: string;
      inputType: string;
      inputText?: string;
      inputFileUrl?: string;
      platforms: string[];
    };

    // Create project
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        title: title || "Untitled Project",
        inputType,
        inputText,
        inputFileUrl,
        status: "TRANSCRIBING",
      },
    });

    // Process in background-like fashion (inline for simplicity)
    try {
      // Step 1: Transcribe (if audio/video) or use input text
      let transcript = inputText || "";
      if (inputType === "AUDIO" || inputType === "VIDEO") {
        await prisma.project.update({
          where: { id: project.id },
          data: { status: "TRANSCRIBING" },
        });
        transcript = await transcribe(inputFileUrl || "");
      }

      // Step 2: Analyze
      await prisma.project.update({
        where: { id: project.id },
        data: { status: "ANALYZING", transcript },
      });
      const analysis = await analyze(transcript);

      // Step 3: Generate for all platforms
      await prisma.project.update({
        where: { id: project.id },
        data: {
          status: "GENERATING",
          masterAnalysis: JSON.stringify(analysis),
        },
      });

      const results = await generateAll(platforms, analysis, transcript);

      // Save outputs
      for (const result of results) {
        if (!result.error) {
          await prisma.output.create({
            data: {
              projectId: project.id,
              platform: result.platform,
              content: result.content,
            },
          });
        } else {
          await prisma.output.create({
            data: {
              projectId: project.id,
              platform: result.platform,
              content: "",
              metadata: JSON.stringify({ error: result.error }),
            },
          });
        }
      }

      // Update usage count
      await prisma.user.update({
        where: { id: user.id },
        data: { usageCount: { increment: 1 } },
      });

      // Mark as ready
      await prisma.project.update({
        where: { id: project.id },
        data: { status: "READY" },
      });

      const finalProject = await prisma.project.findUnique({
        where: { id: project.id },
        include: { outputs: true },
      });

      return NextResponse.json({ project: finalProject });
    } catch (error) {
      await prisma.project.update({
        where: { id: project.id },
        data: { status: "FAILED" },
      });
      console.error("[API] Project processing failed:", error);
      return NextResponse.json(
        { error: "Processing failed", code: "PROCESSING_ERROR", status: 500, projectId: project.id },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API] Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project", code: "CREATE_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
