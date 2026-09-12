"use client";

import React, { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFocusChange?: (focused: boolean) => void;
  onTextChange?: (text: string) => void;
  isGenerating?: boolean;
}

const MAX_CHARS = 300;

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFocusChange,
  onTextChange,
  isGenerating = false,
}) => {
  const [text, setText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount >= MAX_CHARS - 30;

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    // Hard client-side cap at MAX_CHARS per §12, §19
    if (val.length <= MAX_CHARS) {
      setText(val);
      if (errorMessage) setErrorMessage(null);
      if (onTextChange) onTextChange(val);
    } else {
      // Prevent further typing past 300
      const truncated = val.slice(0, MAX_CHARS);
      setText(truncated);
      setErrorMessage(`പരമാവധി ${MAX_CHARS} അക്ഷരങ്ങൾ മാത്രം (Max ${MAX_CHARS} characters).`);
      if (onTextChange) onTextChange(truncated);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();

    if (isGenerating) return;

    if (!trimmed) {
      setErrorMessage("എന്തെങ്കിലും ഒന്ന് ടൈപ്പ് ചെയ്യ് സുഹൃത്തേ! (Please enter a message).");
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setErrorMessage(`സന്ദേശം ${MAX_CHARS} അക്ഷരങ്ങളിൽ കൂടരുത്.`);
      return;
    }

    setErrorMessage(null);
    onSendMessage(trimmed);
    setText("");
    if (onTextChange) onTextChange("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 z-20">
      <form
        onSubmit={handleSubmit}
        className="relative bg-zinc-900/95 border border-amber-500/40 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/20 rounded-2xl shadow-2xl shadow-black/80 p-3 sm:p-4 backdrop-blur-xl transition-all duration-200"
      >
        <label htmlFor="kalloosan-chat-input" className="sr-only">
          Type your statement to get roasted by Kalloosan
        </label>

        <textarea
          id="kalloosan-chat-input"
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          disabled={isGenerating}
          rows={2}
          maxLength={MAX_CHARS}
          placeholder="എന്തെങ്കിലും ഒക്കെ നല്ല കാര്യം പറയൂ..."
          aria-describedby="char-counter input-error"
          className="font-malayalam w-full bg-transparent text-zinc-100 placeholder:text-zinc-500 text-sm sm:text-base resize-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none shadow-none pr-12 min-h-[52px] max-h-[140px] leading-relaxed"
        />

        {/* Action bar inside input box */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 mt-1">
          {/* Character counter & Helper hint */}
          <div className="flex items-center gap-2">
            <span
              id="char-counter"
              className={`text-xs font-mono px-2 py-0.5 rounded-full border transition-colors ${
                isOverLimit
                  ? "text-red-400 bg-red-950/60 border-red-800/80 font-bold"
                  : isNearLimit
                  ? "text-amber-300 bg-amber-950/50 border-amber-800/60 font-medium"
                  : "text-zinc-500 bg-zinc-950/50 border-zinc-800/60"
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
            <span className="hidden sm:inline text-[11px] text-zinc-400 font-malayalam">
              (Press Enter to send ⏎)
            </span>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isGenerating || text.trim().length === 0}
            aria-label="Send message to Kalloosan"
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 via-chai-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-950/50 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-300 group"
          >
            {isGenerating ? (
              <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 translate-x-0.5 -translate-y-0.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200"
                aria-hidden="true"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 1 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Inline validation error message */}
      {errorMessage && (
        <div
          id="input-error"
          role="alert"
          className="mt-2 px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs font-malayalam flex items-center gap-2 animate-fadeIn shadow-lg"
        >
          <span aria-hidden="true">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
