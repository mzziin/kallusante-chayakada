"use client";

import React from "react";
import { KalloosanCharacter } from "./KalloosanCharacter";
import { CharacterState, Emotion, Gesture } from "@/lib/animations";

interface CharacterStageProps {
  state?: CharacterState;
  emotion?: Emotion;
  gesture?: Gesture;
  isInputFocused?: boolean;
  inputTextLength?: number;
  isSpeaking?: boolean;
}

/**
 * CharacterStage positions the 2D layered composite character
 * directly behind the vertically centered input box per §3, §4, §19.
 * Marked aria-hidden="true" per §17 so screen readers focus on speech bubbles.
 */
export const CharacterStage: React.FC<CharacterStageProps> = ({
  state = "IDLE_PEEKING",
  emotion = "neutral",
  gesture = "idle",
  isInputFocused = false,
  inputTextLength = 0,
  isSpeaking = false,
}) => {
  // Human-readable status label in Malayalam/English
  const statusLabel =
    state === "THINKING"
      ? "ചിന്തിക്കുന്നു... (Thinking)"
      : state === "TYPING_WATCHING"
      ? "നോക്കുന്നു... (Watching)"
      : isSpeaking || state === "ROAST_TALKING"
      ? "സംസാരിക്കുന്നു... (Roasting)"
      : state === "LAUGHING"
      ? "ചിരിക്കുന്നു (Laughing)"
      : state === "REACTING"
      ? "പ്രതികരിക്കുന്നു (Reacting)"
      : "ഒളിച്ചിരിക്കുന്നു (Idle Peeking)";

  return (
    <div
      aria-hidden="true"
      className="relative w-full max-w-md mx-auto flex flex-col items-center justify-end pointer-events-none select-none overflow-visible"
      style={{ height: "200px", marginBottom: "-14px" }}
    >
      {/* Warm ambient chai-shop backlight */}
      <div className="absolute w-44 h-44 bg-gradient-to-t from-chai-500/15 via-amber-600/8 to-transparent rounded-full blur-2xl -top-2 pointer-events-none" />

      {/* Layered 2D Composite Character Rig */}
      <div className="relative w-full flex items-end justify-center">
        <KalloosanCharacter
          state={state}
          emotion={emotion}
          gesture={gesture}
          isInputFocused={isInputFocused}
          inputTextLength={inputTextLength}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* Live State Badge Pill */}
      <div className="z-30 -mt-1 mb-1 px-2.5 py-0.5 bg-zinc-950/90 border border-zinc-800/90 rounded-full text-[10px] font-medium text-chai-400 shadow-md flex items-center gap-1.5 backdrop-blur-sm">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            state === "THINKING"
              ? "bg-amber-400 animate-ping"
              : state === "TYPING_WATCHING"
              ? "bg-emerald-400 animate-pulse"
              : isSpeaking || state === "ROAST_TALKING"
              ? "bg-red-400 animate-bounce"
              : "bg-zinc-500"
          }`}
        />
        <span>{statusLabel}</span>
      </div>
    </div>
  );
};
