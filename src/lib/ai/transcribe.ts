import { mockTranscribe } from "./mock";

export async function transcribe(filePathOrUrl: string): Promise<string> {
  if (process.env.MOCK_AI === "true") {
    return mockTranscribe();
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn("[AI] OPENAI_API_KEY not set — transcription unavailable");
    throw new Error("Transcription service not configured");
  }

  // TODO: implement real Whisper API call
  throw new Error("Real transcription not implemented yet");
}
