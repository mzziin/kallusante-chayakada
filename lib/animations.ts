import { Variants } from "framer-motion";

/**
 * Character animation states per §3, §4, §10
 */
export type CharacterState =
  | "IDLE_PEEKING"
  | "TYPING_WATCHING"
  | "THINKING"
  | "REACTING"
  | "ROAST_TALKING"
  | "LAUGHING";

/**
 * Allowed LLM emotions per §7, §9
 */
export type Emotion =
  | "neutral"
  | "skeptical"
  | "sarcastic"
  | "annoyed"
  | "worried"
  | "laughing"
  | "unimpressed"
  | "thinking";

/**
 * Allowed LLM gestures per §7, §9
 */
export type Gesture =
  | "idle"
  | "head_shake"
  | "nod"
  | "shrug"
  | "point"
  | "facepalm"
  | "laugh"
  | "think"
  | "cross_arms";

/**
 * Gesture to Arm Layer Mapping verbatim per §4
 */
export const GESTURE_TO_ARMS: Record<Gesture, string> = {
  idle: "arms-neutral",
  head_shake: "arms-neutral", // animated via head-layer rotation, not a distinct arm image
  nod: "arms-neutral", // animated via head-layer translation
  think: "arms-neutral", // scratching motion via transform on arms-neutral
  shrug: "arms-shrug",
  facepalm: "arms-facepalm",
  point: "arms-point",
  cross_arms: "arms-cross",
  laugh: "arms-neutral",
};

/**
 * Layer composition for each character state per §4
 */
export interface CharacterLayers {
  body: string | null;
  head: string;
  eyes: string;
  eyebrows: string;
  mouth: string | null;
  arms: string;
  accessories?: string | null;
}

/**
 * Calculate smooth continuous eye tracking translation per §3 & §10:
 * Smoothly scans back and forth between -8px and +8px as user types,
 * avoiding sudden teleportation jumps when crossing modulo boundaries.
 */
export function calculateEyeX(textLength: number): number {
  if (textLength <= 0) return 0;
  return Math.round(Math.sin(textLength * 0.45) * 8);
}

/**
 * Map emotion to eye and eyebrow layer variants
 */
export function getFacialLayersForEmotion(emotion: Emotion = "neutral"): {
  eyes: string;
  eyebrows: string;
} {
  switch (emotion) {
    case "skeptical":
    case "unimpressed":
    case "thinking":
      return { eyes: "eyes-narrow", eyebrows: "eyebrows-furrowed" };
    case "annoyed":
    case "sarcastic":
      return { eyes: "eyes-narrow", eyebrows: "eyebrows-furrowed" };
    case "worried":
      return { eyes: "eyes-open", eyebrows: "eyebrows-raised" };
    case "laughing":
      return { eyes: "eyes-closed", eyebrows: "eyebrows-neutral" };
    case "neutral":
    default:
      return { eyes: "eyes-open", eyebrows: "eyebrows-neutral" };
  }
}

/**
 * Resolve exact layer files for any animation state per §4
 */
export function resolveCharacterLayers(
  state: CharacterState,
  emotion: Emotion = "neutral",
  gesture: Gesture = "idle",
  isBlinking: boolean = false
): CharacterLayers {
  switch (state) {
    case "IDLE_PEEKING":
      return {
        body: null,
        head: "head-peeking",
        eyes: isBlinking ? "eyes-closed" : "eyes-open",
        eyebrows: "eyebrows-neutral",
        mouth: null, // Hidden behind chatbox
        arms: "arms-cross", // Peeking hands resting on input box border
        accessories: null,
      };

    case "TYPING_WATCHING":
      return {
        body: null,
        head: "head-peeking",
        eyes: isBlinking ? "eyes-closed" : "eyes-open",
        eyebrows: "eyebrows-raised",
        mouth: null,
        arms: "arms-cross", // Peeking hands resting on input box border
        accessories: null,
      };

    case "THINKING":
      return {
        body: null,
        head: "head-peeking",
        eyes: "eyes-narrow",
        eyebrows: "eyebrows-furrowed",
        mouth: null,
        arms: "arms-cross", // Peeking hands resting on input box border
        accessories: null,
      };

    case "REACTING": {
      const facial = getFacialLayersForEmotion(emotion);
      return {
        body: "body-standing",
        head: "head-full",
        eyes: isBlinking ? "eyes-closed" : facial.eyes,
        eyebrows: facial.eyebrows,
        mouth: "mouth-smirk",
        arms: GESTURE_TO_ARMS[gesture] || "arms-neutral",
        accessories: "moustache",
      };
    }

    case "ROAST_TALKING":
      return {
        body: "body-standing",
        head: "head-full",
        eyes: isBlinking ? "eyes-closed" : "eyes-open",
        eyebrows: "eyebrows-neutral",
        mouth: "mouth-open", // Toggled with mouth-closed in talking loop
        arms: GESTURE_TO_ARMS[gesture] || "arms-neutral",
        accessories: "moustache",
      };

    case "LAUGHING":
      return {
        body: "body-standing",
        head: "head-full",
        eyes: "eyes-closed",
        eyebrows: "eyebrows-neutral",
        mouth: "mouth-laugh",
        arms: "arms-neutral",
        accessories: "moustache",
      };
  }
}

/**
 * Framer Motion Variants for Character Animations (§4, §10, §17)
 */

// Character rig container ducking variants for peeking behind chatbox vs standing
export const characterRigVariants: Variants = {
  peeking: {
    y: 86,
    transition: { type: "spring", stiffness: 220, damping: 24 },
  },
  watching: {
    y: 84,
    transition: { type: "spring", stiffness: 220, damping: 24 },
  },
  thinking: {
    y: 94,
    transition: { type: "spring", stiffness: 220, damping: 24 },
  },
  standing: {
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 20 },
  },
  reduced: {
    y: 0,
  },
};

// Subtle breathing loop on the body layer during idle
export const bodyBreathingVariants: Variants = {
  idle: {
    y: [0, -3, 0],
    transition: {
      duration: 3.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  thinking: {
    y: 4,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
  standing: {
    y: -24,
    transition: {
      duration: 0.45,
      ease: "backOut",
    },
  },
  reduced: {
    y: 0,
    transition: { duration: 0.1 },
  },
};

// Head variants for peeking, ducking, shaking, or wobbling
export const headVariants: Variants = {
  idle: {
    y: [0, -2, 0],
    rotate: 0,
    transition: {
      duration: 3.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  watching: {
    y: -4,
    rotate: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  thinking: {
    y: 4,
    rotate: -3,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  standing: {
    y: -24,
    rotate: 0,
    transition: {
      duration: 0.45,
      ease: "backOut",
    },
  },
  head_shake: {
    y: -24,
    rotate: [-6, 6, -5, 5, 0],
    transition: {
      duration: 0.7,
      ease: "easeInOut",
    },
  },
  nod: {
    y: [-24, -16, -24, -18, -24],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
  roastWobble: {
    y: [-26, -23, -26],
    rotate: [-2, 2, -2],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  reduced: {
    y: 0,
    rotate: 0,
    transition: { duration: 0.1 },
  },
};

// Arms scratching / thinking / gesture variants
export const armsVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.2 },
  },
  peeking: {
    opacity: 1,
    y: -30,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  thinking: {
    opacity: 1,
    y: [-25, -30, -25],
    rotate: [-2, 2, -2],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  standing: {
    opacity: 1,
    y: -20,
    transition: { duration: 0.3 },
  },
  reduced: {
    opacity: 1,
    y: 0,
    rotate: 0,
  },
};
