// Shared TypeScript type definitions

export type Plan = "FREE" | "CREATOR" | "PRO" | "TEAM";

export type ProjectStatus =
  | "UPLOADING"
  | "TRANSCRIBING"
  | "ANALYZING"
  | "GENERATING"
  | "READY"
  | "FAILED";

export type InputType = "TEXT" | "AUDIO" | "VIDEO";

export type Platform =
  | "TWITTER"
  | "LINKEDIN"
  | "INSTAGRAM"
  | "BLOG"
  | "NEWSLETTER"
  | "SHORT_VIDEO"
  | "THREADS"
  | "QUOTE_CARD";

export type ApiErrorResponse = {
  error: string;
  code: string;
  status: number;
};
