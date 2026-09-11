"use client";

import React from "react";

interface CharacterStageProps {
  isInputFocused?: boolean;
  inputTextLength?: number;
  isGenerating?: boolean;
  children?: React.ReactNode;
}

/**
 * CharacterStage is the hero visual container positioned immediately behind
 * the vertically centered chat input box.
 * Per §17, the visual character is marked aria-hidden="true" to preserve
 * accessibility while allowing screen readers to focus on the speech bubble.
 */
export const CharacterStage: React.FC<CharacterStageProps> = ({
  isInputFocused = false,
  inputTextLength = 0,
  isGenerating = false,
  children,
}) => {
  // Eye tracking offset calculation per §3 & §10:
  // eyeX = (textLength % 20) - 10 -> -10px to +10px
  const eyeX = (inputTextLength % 20) - 10;

  return (
    <div
      aria-hidden="true"
      className="relative w-full max-w-md mx-auto flex flex-col items-center justify-end pointer-events-none select-none overflow-visible"
      style={{ height: "180px", marginBottom: "-18px" }}
    >
      {/* If children (full KalloosanCharacter from Task Group 2) are provided, render them */}
      {children ? (
        children
      ) : (
        /* UI Shell Peeking Character Silhouette for Task Group 1 */
        <div className="relative flex flex-col items-center justify-end w-full h-full">
          {/* Subtle tea shop / glowing rim behind character */}
          <div className="absolute w-40 h-40 bg-gradient-to-t from-chai-500/10 via-amber-600/5 to-transparent rounded-full blur-2xl -top-4 pointer-events-none" />

          {/* Peeking Head Container */}
          <div
            className={`relative flex flex-col items-center transition-transform duration-300 ${
              isGenerating ? "translate-y-8 scale-95" : isInputFocused ? "-translate-y-2" : "translate-y-0"
            }`}
          >
            {/* Achayan Hair / Top of Head */}
            <div className="relative w-28 h-20 bg-gradient-to-b from-stone-900 via-neutral-900 to-zinc-950 rounded-t-full border-t-2 border-x-2 border-stone-800/80 shadow-2xl flex flex-col items-center pt-2">
              {/* Forehead furrow/crease lines */}
              <div className="w-10 h-0.5 bg-stone-800/60 rounded-full mb-1" />
              <div className="w-6 h-0.5 bg-stone-800/40 rounded-full mb-2" />

              {/* Eyebrows */}
              <div className="flex items-center gap-4 mb-1">
                <div
                  className={`w-5 h-1.5 bg-stone-950 rounded-full transition-transform duration-200 ${
                    isInputFocused ? "-rotate-12 -translate-y-0.5" : "rotate-6"
                  }`}
                />
                <div
                  className={`w-5 h-1.5 bg-stone-950 rounded-full transition-transform duration-200 ${
                    isInputFocused ? "rotate-12 -translate-y-0.5" : "-rotate-6"
                  }`}
                />
              </div>

              {/* Eyes with fake eye tracking per §10 */}
              <div className="flex items-center gap-3">
                {/* Left Eye */}
                <div className="w-6 h-5 bg-amber-50 rounded-full border border-stone-900 flex items-center justify-center overflow-hidden shadow-inner">
                  <div
                    className="w-2.5 h-2.5 bg-stone-950 rounded-full transition-transform duration-100 ease-out"
                    style={{
                      transform: `translateX(${eyeX * 0.3}px) translateY(${
                        isInputFocused ? "1px" : "0px"
                      })`,
                    }}
                  />
                </div>
                {/* Right Eye */}
                <div className="w-6 h-5 bg-amber-50 rounded-full border border-stone-900 flex items-center justify-center overflow-hidden shadow-inner">
                  <div
                    className="w-2.5 h-2.5 bg-stone-950 rounded-full transition-transform duration-100 ease-out"
                    style={{
                      transform: `translateX(${eyeX * 0.3}px) translateY(${
                        isInputFocused ? "1px" : "0px"
                      })`,
                    }}
                  />
                </div>
              </div>

              {/* Classic Kerala Moustache peek */}
              <div className="w-14 h-4 bg-stone-950 rounded-b-xl mt-1 border-t border-stone-800 shadow-md flex items-center justify-center">
                <div className="w-2 h-1 bg-stone-800 rounded-full" />
              </div>
            </div>

            {/* Status indicator pill */}
            <div className="mt-1 px-2 py-0.5 bg-zinc-900/90 border border-zinc-800 rounded-full text-[10px] font-medium text-chai-400/90 shadow-sm flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isGenerating
                    ? "bg-amber-400 animate-ping"
                    : isInputFocused
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-zinc-500"
                }`}
              />
              <span>
                {isGenerating
                  ? "ചിന്തിക്കുന്നു..."
                  : isInputFocused
                  ? "നോക്കുന്നു..."
                  : "ഒളിച്ചിരിക്കുന്നു (Idle)"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
