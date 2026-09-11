"use client";

import React, { useState } from "react";
import { Controls } from "@/components/Controls";
import { CharacterStage } from "@/components/CharacterStage";
import { ChatInput } from "@/components/ChatInput";
import { SpeechBubble } from "@/components/SpeechBubble";

export default function Home() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRoast, setCurrentRoast] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const handleSendMessage = (message: string) => {
    // Task Group 1 interactive demonstration
    setIsGenerating(true);

    // Simulate short thinking response for shell verification
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentTopic("General");
      setCurrentRoast(
        `Ente ponnedave, "${message}" enn parayan thante kayyil enthaano ollath? Ithokke ketittu aarkkelum santhosham varumo? Ha!`
      );
    }, 800);
  };

  const handleResetConversation = () => {
    setCurrentRoast(null);
    setCurrentTopic(null);
    setInputText("");
    setIsGenerating(false);
  };

  return (
    <main className="min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      {/* Top Navigation & Controls */}
      <Controls
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled((prev) => !prev)}
        onResetConversation={handleResetConversation}
        isGenerating={isGenerating}
      />

      {/* Hero Section: Centered Character + Input + Speech Bubble */}
      <section className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-2xl mx-auto w-full">
        {/* Character Stage (Positioned behind & above the input box) */}
        <CharacterStage
          isInputFocused={isInputFocused}
          inputTextLength={inputText.length}
          isGenerating={isGenerating}
        />

        {/* Vertically Centered Chat Input Box */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onFocusChange={setIsInputFocused}
          onTextChange={setInputText}
          isGenerating={isGenerating}
        />

        {/* Current Roast Speech Bubble */}
        <SpeechBubble
          response={currentRoast}
          isGenerating={isGenerating}
          topic={currentTopic}
          audioAvailable={false}
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
