"use client";

import React, { useState, useEffect } from "react";
import { Controls } from "@/components/Controls";
import { CharacterStage } from "@/components/CharacterStage";
import { ChatInput } from "@/components/ChatInput";
import { SpeechBubble } from "@/components/SpeechBubble";
import { BackgroundGraphics } from "@/components/BackgroundGraphics";
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
    autoplayBlocked,
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
      {/* Animated Kerala Countryside Ambiance Background */}
      <BackgroundGraphics />

      {/* Top Navigation & Controls */}
      <Controls
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        onResetConversation={resetConversation}
        isGenerating={isGenerating}
      />

      {/* Hero Section: Centered Character + Input + Speech Bubble */}
      <section className="flex-1 flex flex-col justify-center items-center px-4 py-6 max-w-2xl mx-auto w-full z-10">
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
            className="w-full max-w-xl mx-auto mb-3 px-4 py-2.5 rounded-2xl bg-amber-950/90 border border-amber-500/60 text-amber-200 text-xs sm:text-sm flex items-center justify-between shadow-2xl backdrop-blur-xl animate-fadeIn z-30"
          >
            <div className="flex items-center gap-2 font-malayalam">
              <span className="text-base" aria-hidden="true">
                ⏳
              </span>
              <span>{rateLimitNotice}</span>
            </div>
            <button
              type="button"
              onClick={clearRateLimitNotice}
              aria-label="Dismiss notification"
              className="text-amber-400 hover:text-amber-100 text-xs font-bold px-2 py-1 rounded-lg bg-amber-900/50 hover:bg-amber-800/80 transition-colors"
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
          autoplayBlocked={autoplayBlocked}
        />
      </section>

      {/* Satire & Comedy Disclaimer (§20) */}
      <footer className="w-full max-w-xl mx-auto px-4 py-4 text-center z-10">
        <p className="font-malayalam text-[11px] sm:text-xs text-zinc-400 leading-relaxed border-t border-amber-900/30 pt-3">
          <span className="font-bold text-amber-400">തമാശ മാത്രം: </span>
          കല്ലൂസൻ ഒരു സാങ്കൽപ്പിക ഹാസ്യ കഥാപാത്രമാണ്. കാര്യങ്ങൾ തമാശയായി മാത്രം കാണുക.
        </p>
      </footer>
    </main>
  );
}
