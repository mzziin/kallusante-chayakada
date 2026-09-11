"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CharacterState,
  Emotion,
  Gesture,
  calculateEyeX,
  resolveCharacterLayers,
  bodyBreathingVariants,
  headVariants,
  armsVariants,
} from "@/lib/animations";

export interface KalloosanCharacterProps {
  state?: CharacterState;
  emotion?: Emotion;
  gesture?: Gesture;
  inputTextLength?: number;
  isInputFocused?: boolean;
  className?: string;
}

/**
 * Individual layer image component with clean visual fallback
 * when the external asset is still being prepared by the artist.
 */
const CharacterLayerImage: React.FC<{
  src: string;
  alt: string;
  zIndexClass: string;
  className?: string;
}> = ({ src, alt, zIndexClass, className = "" }) => {
  const [hasError, setHasError] = useState(false);

  // If the image fails to load or hasn't been dropped into public/ yet,
  // fail gracefully into a clean transparent block so UI stays rock solid.
  if (hasError) {
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none ${zIndexClass} ${className}`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      aria-hidden="true"
      draggable={false}
      className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-150 ${zIndexClass} ${className}`}
    />
  );
};

export const KalloosanCharacter: React.FC<KalloosanCharacterProps> = ({
  state = "IDLE_PEEKING",
  emotion = "neutral",
  gesture = "idle",
  inputTextLength = 0,
  isInputFocused = false,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isBlinking, setIsBlinking] = useState(false);

  // Periodic blinking loop per §3, §10
  useEffect(() => {
    if (state === "THINKING" || state === "LAUGHING") {
      setIsBlinking(false);
      return;
    }

    // When typing-watching, blink interval increases (intense watching per §3)
    const blinkIntervalMs = isInputFocused ? 5500 : 3600;

    const interval = setInterval(() => {
      setIsBlinking(true);
      const timeout = setTimeout(() => {
        setIsBlinking(false);
      }, 150); // Natural human blink duration

      return () => clearTimeout(timeout);
    }, blinkIntervalMs);

    return () => clearInterval(interval);
  }, [state, isInputFocused]);

  // Fake eye tracking calculation per §3 & §10:
  // eyeX = (textLength % 20) - 10 -> -10px to +10px
  const eyeX = useMemo(() => {
    if (shouldReduceMotion) return 0;
    return calculateEyeX(inputTextLength);
  }, [inputTextLength, shouldReduceMotion]);

  // Resolve layer filenames matching §4's state composition table
  const layers = useMemo(() => {
    return resolveCharacterLayers(state, emotion, gesture, isBlinking);
  }, [state, emotion, gesture, isBlinking]);

  // Determine motion variant keys
  const bodyVariantKey = shouldReduceMotion
    ? "reduced"
    : state === "THINKING"
    ? "thinking"
    : state === "REACTING" || state === "ROAST_TALKING" || state === "LAUGHING"
    ? "standing"
    : "idle";

  const headVariantKey = shouldReduceMotion
    ? "reduced"
    : state === "THINKING"
    ? "thinking"
    : state === "TYPING_WATCHING"
    ? "watching"
    : state === "ROAST_TALKING"
    ? "roastWobble"
    : gesture === "head_shake"
    ? "head_shake"
    : gesture === "nod"
    ? "nod"
    : "idle";

  const armsVariantKey = shouldReduceMotion
    ? "reduced"
    : layers.arms === "arms-hidden"
    ? "hidden"
    : state === "THINKING"
    ? "thinking"
    : "standing";

  return (
    <div
      aria-hidden="true"
      className={`relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/3] mx-auto pointer-events-none select-none flex items-end justify-center overflow-visible ${className}`}
    >
      {/* 1. Body Layer (z-10) */}
      <motion.div
        variants={bodyBreathingVariants}
        animate={bodyVariantKey}
        className="absolute inset-0 z-10 w-full h-full"
      >
        <CharacterLayerImage
          src={`/character/body/${layers.body}.webp`}
          alt="Kalloosan Body"
          zIndexClass="z-10"
        />
      </motion.div>

      {/* 2. Head Layer (z-20) */}
      <motion.div
        variants={headVariants}
        animate={headVariantKey}
        className="absolute inset-0 z-20 w-full h-full"
      >
        <CharacterLayerImage
          src={`/character/head/${layers.head}.webp`}
          alt="Kalloosan Head"
          zIndexClass="z-20"
        />

        {/* 3. Accessories Layer (Moustache) (z-30) */}
        {layers.accessories && (
          <div className="absolute inset-0 z-30 w-full h-full">
            <CharacterLayerImage
              src={`/character/accessories/${layers.accessories}.webp`}
              alt="Kalloosan Moustache"
              zIndexClass="z-30"
            />
          </div>
        )}

        {/* 4. Mouth Layer (z-40) */}
        {layers.mouth && (
          <div className="absolute inset-0 z-40 w-full h-full">
            <CharacterLayerImage
              src={`/character/mouth/${layers.mouth}.webp`}
              alt="Kalloosan Mouth"
              zIndexClass="z-40"
            />
          </div>
        )}

        {/* 5. Eyes Layer with fake eye tracking (z-50) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { x: 0 }
              : {
                  x: eyeX,
                  transition: { type: "spring", stiffness: 300, damping: 25 },
                }
          }
          className="absolute inset-0 z-50 w-full h-full"
        >
          <CharacterLayerImage
            src={`/character/eyes/${layers.eyes}.webp`}
            alt="Kalloosan Eyes"
            zIndexClass="z-50"
          />
        </motion.div>

        {/* 6. Eyebrows Layer (z-60) */}
        <div className="absolute inset-0 z-60 w-full h-full">
          <CharacterLayerImage
            src={`/character/eyebrows/${layers.eyebrows}.webp`}
            alt="Kalloosan Eyebrows"
            zIndexClass="z-60"
          />
        </div>
      </motion.div>

      {/* 7. Arms Layer (z-70) */}
      <motion.div
        variants={armsVariants}
        animate={armsVariantKey}
        className="absolute inset-0 z-70 w-full h-full"
      >
        <CharacterLayerImage
          src={`/character/arms/${layers.arms}.webp`}
          alt="Kalloosan Arms"
          zIndexClass="z-70"
        />
      </motion.div>
    </div>
  );
};
