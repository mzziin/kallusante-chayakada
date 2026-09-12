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
    <header className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between border-b border-amber-900/30 bg-zinc-950/75 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-black/40">
      {/* Brand Header with Small Kalloosan Character Face Logo */}
      <div className="flex items-center gap-3">
        {/* Kalloosan Character Face Avatar Logo */}
        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-chai-500 to-amber-700 p-0.5 shadow-md shadow-amber-950/50 flex-shrink-0 group transition-transform duration-200 hover:scale-105">
          <div className="w-full h-full bg-zinc-950 rounded-[14px] overflow-hidden relative flex items-center justify-center">
            {/* Peeking Head Layer */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/character/head/head-peeking.webp"
              alt="Kalloosan Face Logo"
              className="absolute inset-0 w-full h-full object-contain scale-125 translate-y-1"
            />
            {/* Eyes Layer */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/character/eyes/eyes-open.webp"
              alt="Kalloosan Eyes"
              className="absolute inset-0 w-full h-full object-contain scale-125 translate-y-1"
            />
          </div>
          {/* Chai Cup Mini Badge */}
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[9px] font-black flex items-center justify-center shadow-sm">
            ☕
          </span>
        </div>

        {/* Malayalam Title & Tagline */}
        <div>
          <h1 className="font-malayalam text-lg sm:text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-chai-400 to-amber-500 flex items-center gap-2 leading-tight drop-shadow-sm">
            കല്ലൂസന്റെ ചായക്കട
            <span className="text-[10px] font-sans uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 hidden sm:inline-block">
              ROAST BOT
            </span>
          </h1>
          <p className="font-malayalam text-[11px] text-zinc-400 leading-none">
            കോട്ടയത്തെ നൊസ്റ്റാൾജിക് റോസ്റ്റ് ബോട്ട് ⚡
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        {/* Voice Toggle (conditional) */}
        {showVoiceToggle && (
          <button
            type="button"
            onClick={onToggleVoice}
            disabled={isGenerating}
            aria-label={voiceEnabled ? "Mute voice (ശബ്ദം ഓഫാക്കുക)" : "Unmute voice (ശബ്ദം ഓണാക്കുക)"}
            title={voiceEnabled ? "Voice is ON (click to mute)" : "Voice is OFF (click to unmute)"}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all duration-200 shadow-sm ${
              voiceEnabled
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 shadow-amber-950/40"
                : "bg-zinc-900/90 border-zinc-700/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            } focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95`}
          >
            {voiceEnabled ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-amber-400 animate-pulse"
                aria-hidden="true"
              >
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5a2.25 2.25 0 0 0 2.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 13.75 13.75 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-zinc-500"
                aria-hidden="true"
              >
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5a2.25 2.25 0 0 0 2.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM17.25 12a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z" />
              </svg>
            )}
            <span className="hidden sm:inline">
              {voiceEnabled ? "Voice On" : "Voice Off"}
            </span>
          </button>
        )}

        {/* Reset / New Chat Creative Button */}
        <button
          type="button"
          onClick={onResetConversation}
          disabled={isGenerating}
          aria-label="Start new conversation (പുതിയ സംഭാഷണം)"
          title="Start fresh conversation"
          className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-500/40 bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 text-amber-200 hover:text-white hover:border-amber-400/80 hover:from-amber-900/40 hover:to-amber-950/60 shadow-md shadow-amber-950/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition-transform duration-500"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903-1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V.55a.75.75 0 0 0-1.5 0v3.181L18.359 1.83A9 9 0 0 0 3.32 6.13a.75.75 0 0 0 1.435.393Zm14.49 3.882a7.5 7.5 0 0 1-12.548 3.364l-1.902 1.903h3.183a.75.75 0 1 0 0-1.5H2.99a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.181l1.903 1.903a9 9 0 0 0 15.039-4.301.75.75 0 0 0-1.435-.393Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-malayalam sm:font-sans font-semibold">New Chat</span>
        </button>
      </div>
    </header>
  );
};
