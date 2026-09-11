"use client";

import React, { useState, useEffect } from "react";
import { Controls } from "@/components/Controls";
import { CharacterStage } from "@/components/CharacterStage";
import { ChatInput } from "@/components/ChatInput";
import { SpeechBubble } from "@/components/SpeechBubble";
import { useAppStore } from "@/store/useAppStore";

export default function Home() {
  const {
    currentTopic,
    lastRoast,
    characterState,
    emotion,
    gesture,
    isGenerating,
    isSpeaking,
    voiceEnabled,
    rateLimitNotice,
    sendMessage,
    replayVoice,
    resetConversation,
    setVoiceEnabled,
    setCharacterState,
    clearRateLimitNotice,
  } = useAppStore();

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputText, setInputText] = useState("");

  // Manage dynamic transitions between IDLE_PEEKING and TYPING_WATCHING
  useEffect(() => {
    if (isGenerating || isSpeaking || characterState === "REACTING" || characterState === "ROAST_TALKING" || characterState === "LAUGHING") {
      return;
    }

    if (isInputFocused && inputText.length > 0) {
      setCharacterState("TYPING_WATCHING");
    } else if (!isInputFocused && characterState === "TYPING_WATCHING") {
      setCharacterState("IDLE_PEEKING");
    }
  }, [isInputFocused, inputText, isGenerating, isSpeaking, characterState, setCharacterState]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
    setInputText("");
  };

  return (
    <main className="min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      {/* Top Navigation & Controls */}
      <Controls
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        onResetConversation={resetConversation}
        isGenerating={isGenerating}
      />

      {/* Hero Section: Centered Character + Input + Speech Bubble */}
      <section className="flex-1 flex flex-col justify-center items-center px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Character Stage (Positioned behind & above the input box) */}
        <CharacterStage
          state={characterState}
          emotion={emotion}
          gesture={gesture}
          isInputFocused={isInputFocused}
          inputTextLength={inputText.length}
          isSpeaking={isSpeaking}
        />

        {/* Rate limit warning notification (§12, §13) */}
        {rateLimitNotice && (
          <div
            role="alert"
            className="w-full max-w-xl mx-auto mb-3 px-4 py-2.5 rounded-xl bg-amber-950/80 border border-amber-600/60 text-amber-200 text-xs sm:text-sm flex items-center justify-between shadow-lg backdrop-blur-md animate-fadeIn z-20"
          >
            <div className="flex items-center gap-2">
              <span className="text-base" aria-hidden="true">
                ⏳
              </span>
              <span>{rateLimitNotice}</span>
            </div>
            <button
              type="button"
              onClick={clearRateLimitNotice}
              aria-label="Dismiss notification"
              className="text-amber-400 hover:text-amber-100 text-xs font-bold px-1.5 py-0.5 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Vertically Centered Chat Input Box */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onFocusChange={setIsInputFocused}
          onTextChange={setInputText}
          isGenerating={isGenerating}
        />

        {/* Current Roast Speech Bubble */}
        <SpeechBubble
          response={lastRoast?.response}
          isGenerating={isGenerating}
          topic={currentTopic}
          skipRoast={lastRoast?.skipRoast}
          isSpeaking={isSpeaking}
          onReplayVoice={replayVoice}
          audioAvailable={Boolean(lastRoast?.audioAvailable)}
        />
      </section>

      {/* Satire & Comedy Disclaimer (§20) */}
      <footer className="w-full max-w-xl mx-auto px-4 py-4 text-center">
        <p className="text-[11px] sm:text-xs text-zinc-500 leading-relaxed border-t border-zinc-900 pt-3">
          <span className="font-semibold text-zinc-400">തമാശ മാത്രം: </span>
          Kalloosan is a fictional comedy character. His job is to find the worst
          possible side of your ideas. Don&apos;t take the negativity seriously.
        </p>
      </footer>
    </main>
  );
}
