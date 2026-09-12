"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CharacterState,
  Emotion,
  Gesture,
  calculateEyeX,
  resolveCharacterLayers,
  characterRigVariants,
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
  isSpeaking?: boolean;
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

  useEffect(() => {
    setHasError(false);
  }, [src]);

  // If the image fails to load or hasn't been dropped into public/ yet,
  // fail gracefully so UI stays rock solid.
  if (hasError) {
    return null;
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
  isSpeaking = false,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isBlinking, setIsBlinking] = useState(false);
  const [talkingMouthOpen, setTalkingMouthOpen] = useState(false);

  // Periodic blinking loop per §3, §10
  useEffect(() => {
    if (state === "THINKING" || state === "LAUGHING") {
      setIsBlinking(false);
      return;
    }

    // When typing-watching, blink interval increases (intense watching per §3)
    const blinkIntervalMs = isInputFocused ? 5500 : 3600;
    let blinkTimeout: NodeJS.Timeout | null = null;

    const interval = setInterval(() => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);
      }, 150); // Natural human blink duration
    }, blinkIntervalMs);

    return () => {
      clearInterval(interval);
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, [state, isInputFocused]);

  // Lip-sync talking mouth loop during ROAST_TALKING or when isSpeaking is true (§10, §11)
  useEffect(() => {
    if (state !== "ROAST_TALKING" && !isSpeaking) {
      setTalkingMouthOpen(false);
      return;
    }

    // Toggle mouth-open and mouth-closed at natural speech rhythm (~160ms)
    const mouthInterval = setInterval(() => {
      setTalkingMouthOpen((prev) => !prev);
    }, 160);

    return () => clearInterval(mouthInterval);
  }, [state, isSpeaking]);

  // Eye tracking calculation per §3 & §10: smooth continuous eye scanning
  const eyeX = useMemo(() => {
    if (shouldReduceMotion) return 0;
    return calculateEyeX(inputTextLength);
  }, [inputTextLength, shouldReduceMotion]);

  // Resolve layer filenames matching §4's state composition table
  const layers = useMemo(() => {
    const baseLayers = resolveCharacterLayers(state, emotion, gesture, isBlinking);

    // Apply active talking mouth loop in ROAST_TALKING
    if (state === "ROAST_TALKING" || isSpeaking) {
      baseLayers.mouth = talkingMouthOpen ? "mouth-open" : "mouth-closed";
    }

    return baseLayers;
  }, [state, emotion, gesture, isBlinking, isSpeaking, talkingMouthOpen]);

  // Determine motion variant keys
  const rigVariantKey = shouldReduceMotion
    ? "reduced"
    : state === "THINKING"
    ? "thinking"
    : state === "TYPING_WATCHING"
    ? "watching"
    : state === "IDLE_PEEKING"
    ? "peeking"
    : "standing";

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
    : state === "ROAST_TALKING" || isSpeaking
    ? "roastWobble"
    : gesture === "head_shake"
    ? "head_shake"
    : gesture === "nod"
    ? "nod"
    : state === "REACTING" || state === "LAUGHING"
    ? "standing"
    : "idle";

  const armsVariantKey = shouldReduceMotion
    ? "reduced"
    : layers.arms === "arms-hidden"
    ? "hidden"
    : state === "IDLE_PEEKING" || state === "TYPING_WATCHING"
    ? "peeking"
    : state === "THINKING"
    ? "thinking"
    : "standing";

  return (
    <motion.div
      variants={characterRigVariants}
      animate={rigVariantKey}
      aria-hidden="true"
      className={`relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/3] mx-auto pointer-events-none select-none flex items-end justify-center overflow-visible ${className}`}
    >
      {/* 1. Body Layer (z-10) */}
      {layers.body && (
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
      )}

      {/* 2. Head Layer (z-10, behind input box z-20) */}
      {layers.head && (
        <motion.div
          variants={headVariants}
          animate={headVariantKey}
          className="absolute inset-0 z-10 w-full h-full"
        >
          <CharacterLayerImage
            src={`/character/head/${layers.head}.webp`}
            alt="Kalloosan Head"
            zIndexClass="z-10"
          />

          {/* 3. Accessories Layer (Moustache) (z-10) */}
          {layers.accessories && (
            <div className="absolute inset-0 z-10 w-full h-full">
              <CharacterLayerImage
                src={`/character/accessories/${layers.accessories}.webp`}
                alt="Kalloosan Moustache"
                zIndexClass="z-10"
              />
            </div>
          )}

          {/* 4. Mouth Layer (z-10) with lip-sync talking loop */}
          {layers.mouth && (
            <div className="absolute inset-0 z-10 w-full h-full">
              <CharacterLayerImage
                src={`/character/mouth/${layers.mouth}.webp`}
                alt="Kalloosan Mouth"
                zIndexClass="z-10"
              />
            </div>
          )}

          {/* 5. Eyes Layer with eye tracking (z-10) */}
          {layers.eyes && (
            <motion.div
              animate={
                shouldReduceMotion
                  ? { x: 0 }
                  : {
                      x: eyeX,
                      transition: { type: "spring", stiffness: 300, damping: 25 },
                    }
              }
              className="absolute inset-0 z-10 w-full h-full"
            >
              <CharacterLayerImage
                src={`/character/eyes/${layers.eyes}.webp`}
                alt="Kalloosan Eyes"
                zIndexClass="z-10"
              />
            </motion.div>
          )}

          {/* 6. Eyebrows Layer (z-10) */}
          {layers.eyebrows && (
            <div className="absolute inset-0 z-10 w-full h-full">
              <CharacterLayerImage
                src={`/character/eyebrows/${layers.eyebrows}.webp`}
                alt="Kalloosan Eyebrows"
                zIndexClass="z-10"
              />
            </div>
          )}
        </motion.div>
      )}

      {/* 7. Arms Layer (z-30, hands rest in front of top border of input box z-20) */}
      {layers.arms && layers.arms !== "arms-hidden" && (
        <motion.div
          variants={armsVariants}
          animate={armsVariantKey}
          className="absolute inset-0 z-30 w-full h-full"
        >
          <CharacterLayerImage
            src={`/character/arms/${layers.arms}.webp`}
            alt="Kalloosan Arms"
            zIndexClass="z-30"
          />
        </motion.div>
      )}
    </motion.div>
  );
};
