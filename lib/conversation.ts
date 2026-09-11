import { v4 as uuidv4 } from "uuid";
import { MessageTurn } from "./validation";

export const SLIDING_WINDOW_SIZE = 10;

/**
 * Generate a new random session UUID held strictly in-memory per §5
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Extract sliding window of recent messages for LLM context (§5)
 */
export function getSlidingWindowMessages(
  messages: MessageTurn[],
  windowSize: number = SLIDING_WINDOW_SIZE
): MessageTurn[] {
  if (messages.length <= windowSize) {
    return messages;
  }
  return messages.slice(-windowSize);
}

/**
 * Extract messages that have moved past the sliding window threshold
 */
export function getOlderMessagesForSummarization(
  messages: MessageTurn[],
  windowSize: number = SLIDING_WINDOW_SIZE
): MessageTurn[] {
  if (messages.length <= windowSize) {
    return [];
  }
  return messages.slice(0, messages.length - windowSize);
}

/**
 * Create a lightweight client-side summary roll-up when needed (§5, §8)
 */
export function rollupConversationSummary(
  existingSummary: string | null,
  currentTopic: string | null,
  olderMessages: MessageTurn[]
): string {
  if (olderMessages.length === 0) {
    return existingSummary || "";
  }

  const topicsMentioned = olderMessages
    .filter((m) => m.role === "user")
    .map((m) => m.content.slice(0, 40))
    .slice(-3)
    .join("; ");

  const base = existingSummary ? `${existingSummary} | ` : "";
  const topicPart = currentTopic ? `Topic: ${currentTopic}. ` : "";
  const recentBrief = `User previously discussed: ${topicsMentioned}`;

  const combined = `${base}${topicPart}${recentBrief}`.trim();
  // Bound summary length to under 250 chars per §8
  return combined.length > 250 ? combined.slice(-250) : combined;
}
