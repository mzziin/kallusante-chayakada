import { z } from "zod";
import { Emotion, Gesture } from "./animations";

/**
 * Allowed emotion values per §7, §9
 */
export const ALLOWED_EMOTIONS: Emotion[] = [
  "neutral",
  "skeptical",
  "sarcastic",
  "annoyed",
  "worried",
  "laughing",
  "unimpressed",
  "thinking",
];

/**
 * Allowed gesture values per §7, §9
 */
export const ALLOWED_GESTURES: Gesture[] = [
  "idle",
  "head_shake",
  "nod",
  "shrug",
  "point",
  "facepalm",
  "laugh",
  "think",
  "cross_arms",
];

/**
 * Message turn in conversation history
 */
export const messageTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export type MessageTurn = z.infer<typeof messageTurnSchema>;

/**
 * Request payload schema for POST /api/roast per §12
 */
export const roastRequestSchema = z.object({
  sessionId: z.string().optional(),
  currentMessage: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(300, "Message exceeds 300 character cap"),
  currentTopic: z.string().optional().nullable(),
  historySummary: z.string().optional().nullable(),
  recentMessages: z.array(messageTurnSchema).optional().default([]),
});

export type RoastRequest = z.infer<typeof roastRequestSchema>;

/**
 * Internal raw schema parsed from LLM JSON output (§7, §9)
 */
export const rawLlmResponseSchema = z.object({
  response: z.string(),
  ttsText: z.string().optional(),
  related: z.boolean().optional().default(true),
  topic: z.string().optional().default("General"),
  emotion: z.string().optional(),
  gesture: z.string().optional(),
  skipRoast: z.boolean().optional().default(false),
});

export type RawLlmResponse = z.infer<typeof rawLlmResponseSchema>;

/**
 * Final validated and normalized API response schema (§9, §12)
 */
export const roastResponseSchema = z.object({
  response: z.string(),
  ttsText: z.string(),
  related: z.boolean(),
  topic: z.string(),
  emotion: z.enum([
    "neutral",
    "skeptical",
    "sarcastic",
    "annoyed",
    "worried",
    "laughing",
    "unimpressed",
    "thinking",
  ]),
  gesture: z.enum([
    "idle",
    "head_shake",
    "nod",
    "shrug",
    "point",
    "facepalm",
    "laugh",
    "think",
    "cross_arms",
  ]),
  skipRoast: z.boolean(),
  audio: z.string().nullable(),
  audioAvailable: z.boolean(),
});

export type RoastResponse = z.infer<typeof roastResponseSchema>;

/**
 * Normalize and coerce raw LLM output into a strict RoastResponse
 * Coerces unknown emotions to "neutral" and unknown gestures to "idle" (§9).
 */
export function normalizeLlmResponse(
  raw: RawLlmResponse,
  audio: string | null = null
): RoastResponse {
  const normalizedEmotion: Emotion = ALLOWED_EMOTIONS.includes(
    raw.emotion as Emotion
  )
    ? (raw.emotion as Emotion)
    : "neutral";

  const normalizedGesture: Gesture = ALLOWED_GESTURES.includes(
    raw.gesture as Gesture
  )
    ? (raw.gesture as Gesture)
    : "idle";

  return {
    response: raw.response.trim(),
    ttsText: (raw.ttsText || raw.response).trim(),
    related: typeof raw.related === "boolean" ? raw.related : true,
    topic: raw.topic?.trim() || "General",
    emotion: normalizedEmotion,
    gesture: normalizedGesture,
    skipRoast: Boolean(raw.skipRoast),
    audio: audio || null,
    audioAvailable: Boolean(audio),
  };
}
