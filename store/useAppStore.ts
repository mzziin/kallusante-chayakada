import { create } from "zustand";
import { CharacterState, Emotion, Gesture } from "@/lib/animations";
import { MessageTurn, RoastResponse } from "@/lib/validation";
import {
  generateSessionId,
  getSlidingWindowMessages,
  getOlderMessagesForSummarization,
  rollupConversationSummary,
} from "@/lib/conversation";

export interface AppState {
  // Session & In-Memory Conversation (§5)
  sessionId: string;
  messages: MessageTurn[];
  currentTopic: string | null;
  historySummary: string | null;
  lastRoast: RoastResponse | null;

  // UI & Character State (§3, §10)
  characterState: CharacterState;
  emotion: Emotion;
  gesture: Gesture;
  isGenerating: boolean;
  voiceEnabled: boolean;
  rateLimitNotice: string | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  resetConversation: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setCharacterState: (state: CharacterState) => void;
  clearRateLimitNotice: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initialize with a fresh in-memory session UUID (§5)
  sessionId: generateSessionId(),
  messages: [],
  currentTopic: null,
  historySummary: null,
  lastRoast: null,

  characterState: "IDLE_PEEKING",
  emotion: "neutral",
  gesture: "idle",
  isGenerating: false,
  voiceEnabled: true,
  rateLimitNotice: null,

  sendMessage: async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || get().isGenerating) return;

    const currentSessionId = get().sessionId;
    const currentMessages = get().messages;
    const currentTopic = get().currentTopic;
    const existingSummary = get().historySummary;

    // 1. Enter THINKING state while LLM processes (§10)
    set({
      isGenerating: true,
      characterState: "THINKING",
      rateLimitNotice: null,
    });

    // 2. Prepare in-memory conversation history & sliding window (§5, §8)
    const newUserTurn: MessageTurn = { role: "user", content: trimmed };
    const updatedMessages = [...currentMessages, newUserTurn];

    // Compute bounded context
    const recentMessages = getSlidingWindowMessages(currentMessages);
    const olderMessages = getOlderMessagesForSummarization(updatedMessages);
    const newSummary = rollupConversationSummary(existingSummary, currentTopic, olderMessages);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          currentMessage: trimmed,
          currentTopic,
          historySummary: newSummary || null,
          recentMessages,
        }),
      });

      // Handle Rate Limiting HTTP 429 per §12, §13
      if (response.status === 429) {
        const rateLimitData = await response.json().catch(() => ({}));
        const retrySec = rateLimitData.retryAfterSeconds || 30;

        set({
          isGenerating: false,
          characterState: "IDLE_PEEKING",
          rateLimitNotice: `ശ്വാസം വിടാൻ ഇച്ചിരി സമയം താ! Kalloosan is catching his breath. Please wait ${retrySec}s before sending again.`,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: RoastResponse = await response.json();

      // Add assistant response to in-memory conversation
      const newAssistantTurn: MessageTurn = {
        role: "assistant",
        content: data.response,
      };

      set({
        messages: [...updatedMessages, newAssistantTurn],
        currentTopic: data.topic,
        historySummary: newSummary || null,
        lastRoast: data,
        emotion: data.emotion,
        gesture: data.gesture,
        isGenerating: false,
      });

      // Character State Lifecycle transitions (§10)
      set({ characterState: "REACTING" });

      setTimeout(() => {
        set({ characterState: "ROAST_TALKING" });

        setTimeout(() => {
          set({ characterState: "LAUGHING" });

          setTimeout(() => {
            // Return to IDLE_PEEKING
            set({
              characterState: "IDLE_PEEKING",
              emotion: "neutral",
              gesture: "idle",
            });
          }, 1800);
        }, 2200);
      }, 700);
    } catch (err: unknown) {
      console.error("Failed to send message to /api/roast:", err);

      // Safe fallback state on unexpected fetch errors
      set({
        isGenerating: false,
        characterState: "IDLE_PEEKING",
        rateLimitNotice: "എന്തോ തകരാറ് പോലെ! Try sending again in a moment.",
      });
    }
  },

  resetConversation: () => {
    // Reset control clears in-memory conversation state per §5, §19
    set({
      sessionId: generateSessionId(),
      messages: [],
      currentTopic: null,
      historySummary: null,
      lastRoast: null,
      characterState: "IDLE_PEEKING",
      emotion: "neutral",
      gesture: "idle",
      isGenerating: false,
      rateLimitNotice: null,
    });
  },

  setVoiceEnabled: (enabled: boolean) => set({ voiceEnabled: enabled }),
  setCharacterState: (state: CharacterState) => set({ characterState: state }),
  clearRateLimitNotice: () => set({ rateLimitNotice: null }),
}));
