"use client";

import React from "react";

interface SpeechBubbleProps {
  response?: string | null;
  isGenerating?: boolean;
  topic?: string | null;
  skipRoast?: boolean;
  isSpeaking?: boolean;
  onReplayVoice?: () => void;
  audioAvailable?: boolean;
  autoplayBlocked?: boolean;
}

/**
 * SpeechBubble renders only the CURRENT roast response as selectable DOM text.
 * Accessibility (§17):
 * - Container is marked aria-live="polite" so screen readers announce incoming roasts.
 * - Text maintains high contrast against its backdrop.
 */
export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  response,
  isGenerating = false,
  topic,
  skipRoast = false,
  isSpeaking = false,
  onReplayVoice,
  audioAvailable = false,
  autoplayBlocked = false,
}) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="w-full max-w-xl mx-auto px-4 mt-4 z-20"
    >
      {isGenerating ? (
        <div className="bg-zinc-900/85 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md flex items-center gap-3 animate-pulse">
          <div className="w-6 h-6 rounded-full border-2 border-chai-500 border-t-transparent animate-spin flex-shrink-0" />
          <p className="text-sm sm:text-base text-zinc-300 italic font-medium">
            കല്ലൂസൻ നെഗറ്റീവ് പോയിന്റ് തപ്പുന്നുണ്ട്... (Analyzing roast angle...)
          </p>
        </div>
      ) : response ? (
        <div
          className={`relative rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md border transition-all duration-300 ${
            skipRoast
              ? "bg-blue-950/70 border-blue-800/80 text-blue-100"
              : "bg-zinc-900/95 border-amber-500/40 text-zinc-100 shadow-amber-950/20"
          }`}
        >
          {/* Decorative speech bubble tail pointer */}
          <div
            aria-hidden="true"
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-zinc-900 border-t border-l border-amber-500/40 rotate-45"
          />

          {/* Header pill: Current Topic or Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-chai-400 bg-chai-500/15 border border-chai-500/30 px-2 py-0.5 rounded-full">
                {skipRoast ? "❤️ സമാധാനം" : "🔥 കല്ലൂസൻ പറയുന്നു"}
              </span>
              {topic && (
                <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                  #{topic}
                </span>
              )}
            </div>

            {/* Speaking / Audio replay indicator */}
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  സംസാരിക്കുന്നു...
                </span>
              )}
              {audioAvailable && onReplayVoice && (
                <button
                  type="button"
                  onClick={onReplayVoice}
                  disabled={isSpeaking}
                  aria-label="Play or replay roast voice"
                  title="Play or replay roast voice"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-100 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-chai-400"
                >
                  <span aria-hidden="true">🔊</span>
                  <span>{isSpeaking ? "കേൾക്കുന്നു..." : "ശബ്ദം"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Selectable Roast Text */}
          <blockquote className="text-base sm:text-lg font-medium leading-relaxed text-zinc-100 selection:bg-chai-500/40">
            &ldquo;{response}&rdquo;
          </blockquote>

          {/* Autoplay blocked fallback callout */}
          {autoplayBlocked && audioAvailable && onReplayVoice && (
            <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2 animate-fadeIn">
              <span className="text-xs text-amber-300/90 flex items-center gap-1.5">
                <span aria-hidden="true">🔈</span> ബ്രൗസർ സൗണ്ട് തടഞ്ഞു (Tap to hear):
              </span>
              <button
                type="button"
                onClick={onReplayVoice}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-chai-500 hover:from-amber-400 hover:to-chai-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95 animate-pulse"
              >
                <span aria-hidden="true">▶️</span> ശബ്ദം കേൾക്കൂ
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Welcome / Initial Prompt */
        <div className="text-center py-2 px-4 rounded-xl bg-zinc-950/40 border border-zinc-800/40 text-zinc-400 text-xs sm:text-sm">
          <p className="font-medium text-zinc-300">
            എന്ത് നല്ല വാർത്തയും പറഞ്ഞോളൂ, അതിലെ ദോഷം കല്ലൂസൻ പറഞ്ഞുതരും!
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            (Tell me any good news, plan, or idea above...)
          </p>
        </div>
      )}
    </div>
  );
};
