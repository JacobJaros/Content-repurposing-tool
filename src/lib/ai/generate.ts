import { mockGenerate } from "./mock";
import type { AnalysisResult } from "./mock";

export type GenerationResult = {
  platform: string;
  content: string;
  error?: string;
};

export async function generateForPlatform(
  platform: string,
  analysis: AnalysisResult,
  transcript: string
): Promise<GenerationResult> {
  try {
    if (process.env.MOCK_AI === "true") {
      const content = await mockGenerate(platform);
      return { platform, content };
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("[AI] ANTHROPIC_API_KEY not set — generation unavailable");
      throw new Error("Generation service not configured");
    }

    // TODO: implement real Claude API call
    throw new Error("Real generation not implemented yet");
  } catch (error) {
    return {
      platform,
      content: "",
      error: error instanceof Error ? error.message : "Generation failed",
    };
  }
}

export async function generateAll(
  platforms: string[],
  analysis: AnalysisResult,
  transcript: string
): Promise<GenerationResult[]> {
  const results = await Promise.allSettled(
    platforms.map((p) => generateForPlatform(p, analysis, transcript))
  );

  return results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      platform: platforms[i],
      content: "",
      error: r.reason instanceof Error ? r.reason.message : "Generation failed",
    };
  });
}
