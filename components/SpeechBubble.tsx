"use client";

import { div } from "framer-motion/client";
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
        <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-pulse">
          <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0" />
          <p className="font-malayalam text-sm sm:text-base text-amber-200/90 italic font-medium">
            കല്ലൂസൻ നെഗറ്റീവ് പോയിന്റ് തപ്പുന്നുണ്ട്... (Analyzing roast angle...)
          </p>
        </div>
      ) : response ? (
        <div
          className={`relative rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
            skipRoast
              ? "bg-blue-950/80 border-blue-600/70 text-blue-100 shadow-blue-950/40"
              : "bg-zinc-900/95 border-amber-500/50 text-zinc-100 shadow-amber-950/40"
          }`}
        >
          {/* Decorative speech bubble tail pointer */}
          <div
            aria-hidden="true"
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-zinc-900 border-t border-l border-amber-500/50 rotate-45"
          />

          {/* Header pill: Current Topic or Status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-malayalam text-xs font-bold tracking-wider text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                {skipRoast ? (
                  <>
                    <span>❤️</span> സമാധാനം
                  </>
                ) : (
                  <>
                    <span className="text-amber-400">🔥</span> കല്ലൂസൻ പറയുന്നു
                  </>
                )}
              </span>
              {topic && (
                <span className="text-[11px] text-amber-400/80 font-mono hidden sm:inline-block px-2 py-0.5 rounded-md bg-amber-950/50 border border-amber-900/40">
                  #{topic}
                </span>
              )}
            </div>

            {/* Speaking / Audio replay indicator */}
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <span className="flex items-center gap-1.5 text-xs text-amber-400 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
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
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 shadow-sm transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3.5 h-3.5 text-amber-400"
                    aria-hidden="true"
                  >
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5a2.25 2.25 0 0 0 2.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 13.75 13.75 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                  </svg>
                  <span>{isSpeaking ? "കേൾക്കുന്നു..." : "ശബ്ദം"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Selectable Roast Text */}
          <blockquote className="font-malayalam text-base sm:text-lg font-semibold leading-relaxed text-zinc-100 selection:bg-amber-500/40">
            &ldquo;{response}&rdquo;
          </blockquote>

          {/* Autoplay blocked fallback callout */}
          {autoplayBlocked && audioAvailable && onReplayVoice && (
            <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2 animate-fadeIn">
              <span className="font-malayalam text-xs text-amber-300/90 flex items-center gap-1.5">
                <span aria-hidden="true">🔈</span> ബ്രൗസർ സൗണ്ട് തടഞ്ഞു (Tap to hear):
              </span>
              <button
                type="button"
                onClick={onReplayVoice}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-chai-500 hover:from-amber-400 hover:to-chai-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95 animate-pulse"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>ശബ്ദം കേൾക്കൂ</span>
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
