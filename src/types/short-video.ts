import { z } from "zod";

export const ShortVideoSegmentSchema = z.object({
  text: z.string(),
  duration: z.number(),
  visualNote: z.string(),
});

export const ShortVideoOutputSchema = z.object({
  hook: z.string(),
  script: z.array(ShortVideoSegmentSchema),
  cta: z.string(),
  totalDuration: z.number(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  hashtags: z.array(z.string()),
  visualDirection: z.string(),
});

export type ShortVideoSegment = z.infer<typeof ShortVideoSegmentSchema>;
export type ShortVideoOutput = z.infer<typeof ShortVideoOutputSchema>;
