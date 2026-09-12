"use client";

import React from "react";

interface ControlsProps {
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onResetConversation: () => void;
  isGenerating?: boolean;
  showVoiceToggle?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  voiceEnabled,
  onToggleVoice,
  onResetConversation,
  isGenerating = false,
  showVoiceToggle = false,
}) => {
  return (
    <header className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-chai-500 to-amber-700 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-amber-900/20 text-lg select-none">
          ☕
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-zinc-100 flex items-center gap-1.5 leading-tight">
            KALLOOSAN
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-chai-500/20 text-chai-400 border border-chai-500/30">
              ചായക്കട
            </span>
          </h1>
          <p className="text-[11px] text-zinc-400 leading-none">
            കോട്ടയം അച്ചായന്റെ സ്പെഷ്യൽ ട്രോൾ
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Voice Toggle (conditional) */}
        {showVoiceToggle && (
          <button
            type="button"
            onClick={onToggleVoice}
            disabled={isGenerating}
            aria-label={voiceEnabled ? "Mute voice (ശബ്ദം ഓഫാക്കുക)" : "Unmute voice (ശബ്ദം ഓണാക്കുക)"}
            title={voiceEnabled ? "Voice is ON (click to mute)" : "Voice is OFF (click to unmute)"}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all duration-200 ${
              voiceEnabled
                ? "bg-chai-500/15 border-chai-500/40 text-chai-300 hover:bg-chai-500/25"
                : "bg-zinc-900/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
            } focus-visible:ring-2 focus-visible:ring-chai-400`}
          >
            <span aria-hidden="true" className="text-sm">
              {voiceEnabled ? "🔊" : "🔇"}
            </span>
            <span className="hidden sm:inline">
              {voiceEnabled ? "Voice On" : "Voice Off"}
            </span>
          </button>
        )}

        {/* Reset / New Conversation */}
        <button
          type="button"
          onClick={onResetConversation}
          disabled={isGenerating}
          aria-label="Start new conversation (പുതിയ സംഭാഷണം)"
          title="Start fresh conversation"
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-zinc-700/60 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-chai-400"
        >
          <span aria-hidden="true" className="text-sm">
            🔄
          </span>
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
};
