"use client";

import React, { useState, useEffect } from "react";
import { Controls } from "@/components/Controls";
import { CharacterStage } from "@/components/CharacterStage";
import { ChatInput } from "@/components/ChatInput";
import { SpeechBubble } from "@/components/SpeechBubble";
import { CharacterState, Emotion, Gesture } from "@/lib/animations";

export default function Home() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRoast, setCurrentRoast] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  // Character animation state machine per §3, §10
  const [characterState, setCharacterState] = useState<CharacterState>("IDLE_PEEKING");
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [gesture, setGesture] = useState<Gesture>("idle");

  // Manage dynamic transitions between IDLE_PEEKING and TYPING_WATCHING
  useEffect(() => {
    if (isGenerating) return;

    if (isInputFocused && inputText.length > 0) {
      setCharacterState("TYPING_WATCHING");
    } else {
      setCharacterState("IDLE_PEEKING");
    }
  }, [isInputFocused, inputText, isGenerating]);

  const handleSendMessage = (message: string) => {
    // 1. Enter THINKING state while waiting for LLM response (§10)
    setIsGenerating(true);
    setCharacterState("THINKING");

    // Client-side simulation of the state lifecycle (§10) for Task Group 2 verification
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentTopic("General");
      setCurrentRoast(
        `Ente ponnedave, "${message}" enn parayan thante kayyil enthaano ollath? Ithokke ketittu aarkkelum santhosham varumo? Ha!`
      );
      setEmotion("skeptical");
      setGesture("head_shake");

      // Transition to REACTING
      setCharacterState("REACTING");

      // Then transition to ROAST_TALKING
      setTimeout(() => {
        setCharacterState("ROAST_TALKING");

        // Then transition to LAUGHING
        setTimeout(() => {
          setCharacterState("LAUGHING");

          // Finally return to IDLE_PEEKING (§10)
          setTimeout(() => {
            setCharacterState("IDLE_PEEKING");
            setEmotion("neutral");
            setGesture("idle");
          }, 1800);
        }, 2200);
      }, 700);
    }, 1200);
  };

  const handleResetConversation = () => {
    setCurrentRoast(null);
    setCurrentTopic(null);
    setInputText("");
    setIsGenerating(false);
    setCharacterState("IDLE_PEEKING");
    setEmotion("neutral");
    setGesture("idle");
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
          state={characterState}
          emotion={emotion}
          gesture={gesture}
          isInputFocused={isInputFocused}
          inputTextLength={inputText.length}
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
