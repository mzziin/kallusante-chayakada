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
  isSpeaking: boolean;
  voiceEnabled: boolean;
  autoplayBlocked: boolean;
  rateLimitNotice: string | null;

  // Actions
  primeAudio: () => void;
  sendMessage: (content: string) => Promise<void>;
  replayVoice: () => void;
  resetConversation: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setCharacterState: (state: CharacterState) => void;
  clearRateLimitNotice: () => void;
}

// 0.05-second silent 16-bit PCM WAV for priming audio playback on user gesture
const SILENT_WAV_DATA_URI =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";

// Module-level audio element reference for autoplay priming (§11)
let primedAudioElement: HTMLAudioElement | null = null;

function getAudioElement(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!primedAudioElement) {
    primedAudioElement = new Audio();
  }
  return primedAudioElement;
}

export const useAppStore = create<AppState>((set, get) => ({
  // In-memory state only per §4, §5
  sessionId: generateSessionId(),
  messages: [],
  currentTopic: null,
  historySummary: null,
  lastRoast: null,

  characterState: "IDLE_PEEKING",
  emotion: "neutral",
  gesture: "idle",
  isGenerating: false,
  isSpeaking: false,
  voiceEnabled: true,
  autoplayBlocked: false,
  rateLimitNotice: null,

  /**
   * Prime browser audio element during user submit event to satisfy
   * Mobile Safari, Chrome, and Android autoplay restrictions (§11)
   */
  primeAudio: () => {
    try {
      const audio = getAudioElement();
      if (audio) {
        audio.src = SILENT_WAV_DATA_URI;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
            })
            .catch(() => {
              // Expected if browser requires direct user interaction or ignores priming
            });
        }
      }
    } catch {
      // Best-effort priming; fail silently
    }
  },

  sendMessage: async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || get().isGenerating) return;

    // 1. Prime audio on user gesture
    get().primeAudio();

    const currentSessionId = get().sessionId;
    const currentMessages = get().messages;
    const currentTopic = get().currentTopic;
    const existingSummary = get().historySummary;

    // 2. Enter THINKING state while LLM + TTS pipeline runs (§10)
    set({
      isGenerating: true,
      characterState: "THINKING",
      isSpeaking: false,
      autoplayBlocked: false,
      rateLimitNotice: null,
    });

    // 3. Prepare bounded conversation context
    const newUserTurn: MessageTurn = { role: "user", content: trimmed };
    const updatedMessages = [...currentMessages, newUserTurn];

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

      // Handle Rate Limiting HTTP 429 (§12, §13)
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

      // 4. State Lifecycle: REACTING beat (§10)
      set({ characterState: "REACTING" });

      const proceedToRoastTalking = () => {
        const voiceOn = get().voiceEnabled;
        const audioBase64 = data.audio;

        // If Voice is enabled and audio is present, play speech (§11)
        if (voiceOn && audioBase64) {
          try {
            const audio = getAudioElement();
            if (audio) {
              const audioSrc = audioBase64.startsWith("data:")
                ? audioBase64
                : `data:audio/wav;base64,${audioBase64}`;

              audio.src = audioSrc;

              audio.onplay = () => {
                set({
                  isSpeaking: true,
                  characterState: "ROAST_TALKING",
                  autoplayBlocked: false,
                });
              };

              audio.onended = () => {
                set({ isSpeaking: false, characterState: "LAUGHING" });

                // Small laugh beat, then transition to IDLE_PEEKING (§10)
                setTimeout(() => {
                  set({
                    characterState: "IDLE_PEEKING",
                    emotion: "neutral",
                    gesture: "idle",
                  });
                }, 1800);
              };

              audio.onerror = (e) => {
                console.warn("[Voice] Audio playback element error:", e);
                runTextFallbackTalkingLifecycle();
              };

              const playPromise = audio.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    set({ autoplayBlocked: false });
                  })
                  .catch((err) => {
                    console.warn("[Voice] Autoplay was blocked by browser policy:", err);
                    set({ autoplayBlocked: true });
                    runTextFallbackTalkingLifecycle();
                  });
              }
              return;
            }
          } catch (err) {
            console.warn("[Voice] Playback invocation failed:", err);
            set({ autoplayBlocked: true });
            runTextFallbackTalkingLifecycle();
            return;
          }
        }

        // Voice disabled or TTS failed: proceed with text-only animation loop (§11, §15)
        runTextFallbackTalkingLifecycle();
      };

      const runTextFallbackTalkingLifecycle = () => {
        set({
          isSpeaking: false,
          characterState: "ROAST_TALKING",
        });

        // Estimated reading duration ~2.6s (§15)
        setTimeout(() => {
          set({ characterState: "LAUGHING" });

          setTimeout(() => {
            set({
              characterState: "IDLE_PEEKING",
              emotion: "neutral",
              gesture: "idle",
            });
          }, 1800);
        }, 2600);
      };

      // Brief reaction beat before talking (600ms per §10)
      setTimeout(proceedToRoastTalking, 600);
    } catch (err: unknown) {
      console.error("Failed to send message to /api/roast:", err);

      set({
        isGenerating: false,
        isSpeaking: false,
        characterState: "IDLE_PEEKING",
        rateLimitNotice: "എന്തോ തകരാറ് പോലെ! Try sending again in a moment.",
      });
    }
  },

  replayVoice: () => {
    const last = get().lastRoast;
    if (!last?.audio) return;

    try {
      const audio = getAudioElement();
      if (!audio) return;

      const audioSrc = last.audio.startsWith("data:")
        ? last.audio
        : `data:audio/wav;base64,${last.audio}`;

      audio.src = audioSrc;
      set({
        autoplayBlocked: false,
        isSpeaking: true,
        characterState: "ROAST_TALKING",
        emotion: last.emotion,
        gesture: last.gesture,
      });

      audio.onended = () => {
        set({ isSpeaking: false, characterState: "LAUGHING" });
        setTimeout(() => {
          set({
            characterState: "IDLE_PEEKING",
            emotion: "neutral",
            gesture: "idle",
          });
        }, 1800);
      };

      audio.play().catch((err) => {
        console.warn("[Voice] Replay failed:", err);
        set({ isSpeaking: false, characterState: "IDLE_PEEKING" });
      });
    } catch {
      set({ isSpeaking: false, characterState: "IDLE_PEEKING" });
    }
  },

  resetConversation: () => {
    try {
      const audio = getAudioElement();
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch {
      // Ignore audio stop errors
    }

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
      isSpeaking: false,
      autoplayBlocked: false,
      rateLimitNotice: null,
    });
  },

  setVoiceEnabled: (enabled: boolean) => {
    if (!enabled) {
      try {
        const audio = getAudioElement();
        if (audio) audio.pause();
      } catch {
        // Ignore
      }
      set({ voiceEnabled: false, isSpeaking: false });
    } else {
      set({ voiceEnabled: true });
    }
  },

  setCharacterState: (state: CharacterState) => set({ characterState: state }),
  clearRateLimitNotice: () => set({ rateLimitNotice: null }),
}));
