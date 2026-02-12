import { mockAnalyze } from "./mock";
import type { AnalysisResult } from "./mock";

export type { AnalysisResult };

export async function analyze(text: string): Promise<AnalysisResult> {
  if (process.env.MOCK_AI === "true") {
    return mockAnalyze();
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("[AI] ANTHROPIC_API_KEY not set — analysis unavailable");
    throw new Error("Analysis service not configured");
  }

  // TODO: implement real Claude API call
  throw new Error("Real analysis not implemented yet");
}
