import { writeFile, mkdir } from "fs/promises";
import path from "path";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "tmp", "uploads");

function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return `${id}${ext}`;
}

export async function uploadFile(
  file: File
): Promise<{ url: string; path: string }> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // TODO: implement Supabase Storage upload
    console.warn("[Storage] Supabase upload not implemented yet, using local storage");
  }

  // Local file storage fallback
  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });

  const filename = generateFilename(file.name);
  const filepath = path.join(LOCAL_UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return {
    url: `/tmp/uploads/${filename}`,
    path: filepath,
  };
}
