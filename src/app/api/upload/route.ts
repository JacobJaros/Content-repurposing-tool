import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile } from "@/lib/storage/upload";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "audio/ogg",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "text/plain",
  "text/markdown",
  "application/pdf",
];

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided", code: "NO_FILE", status: 400 },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          code: "FILE_TOO_LARGE",
          status: 400,
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      return NextResponse.json(
        { error: "File type not supported", code: "INVALID_TYPE", status: 400 },
        { status: 400 }
      );
    }

    const result = await uploadFile(file);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed", code: "UPLOAD_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
