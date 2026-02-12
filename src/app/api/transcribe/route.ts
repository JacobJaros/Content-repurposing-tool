import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { transcribe } from "@/lib/ai/transcribe";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { fileUrl } = body as { fileUrl: string };

    const transcript = await transcribe(fileUrl);
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("[API] Transcription failed:", error);
    return NextResponse.json(
      { error: "Transcription failed", code: "TRANSCRIBE_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
