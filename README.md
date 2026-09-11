# ☕ Kalloosante Chayakkada (കല്ലൂസന്റെ ചായക്കട)

> **"A funny Malayali character who has made it his life's mission to explain why whatever you just said is probably a bad idea."**

A satirical web application featuring **Kalloosan**, an original fictional Kottayam tea-shop guy who finds the hilarious negative angle in ANY achievement, plan, or good news you share.

---

## 🌟 Features

- **Character-Centric UI Shell:** Snapchat-style vertically centered input with Kalloosan peeking from behind the chatbox.
- **Layered 2D Composite Character Rig:** Composed of independently animated layers (`body`, `head`, `eyes`, `eyebrows`, `mouth`, `arms`, `accessories`) animated using Framer Motion transforms.
- **Fake Eye-Tracking Engine:** Eyes track your typing horizontal length in real time (`eyeX = (textLength % 20) - 10`).
- **Comedic AI Roast Brain:** Powered by Gemini 2.5 Flash via direct REST `fetch` with Kottayam slang, Kerala cultural references, and prompt-level distress mitigation (`skipRoast`).
- **Malayalam Voice & Lip-Sync:** Sarvam AI Bulbul v2 Text-to-Speech with natural talking mouth loops and autoplay gesture priming for mobile devices.
- **Strict In-Memory Session Architecture:** Zero IndexedDB, zero databases, and zero cookies. Every session is fresh; conversation state resets cleanly on reload or New Chat.
- **Edge Rate Limiting:** Enforced via Next.js Edge Middleware ahead of API routes (10 req/min/IP backed by Upstash Redis with local memory fallback).
- **Accessible & Screen-Reader Ready:** High-contrast DOM text with `aria-live="polite"`, decorative graphics marked `aria-hidden="true"`, visible keyboard focus states, and native `prefers-reduced-motion` adaptability.

---

## 🏗️ Architecture & Philosophy

```text
[User Browser - Next.js 14 / React 18]
  │
  ├── In-memory Zustand Store (zero persistence / zero IndexedDB)
  ├── 2D Layered Composite Character (Framer Motion)
  ├── Eye-tracking + Gesture-primed Audio Player
  │
  │ POST /api/roast { currentMessage, currentTopic, historySummary, recentMessages }
  ▼
[Edge Middleware - middleware.ts]
  │
  ├── 10 requests / minute per IP rate limit (Upstash Redis)
  ▼
[Next.js API Route - app/api/roast/route.ts (Node.js runtime)]
  │
  ├── Client-side & Server-side 300-char input validation
  ├── Context Manager (sliding-window bounded context)
  ├── Gemini 2.5 Flash REST API (safety-configured, retry-once, fallback)
  └── Sarvam AI TTS REST API (Malayalam speech, retry-once, fallback)
```

---

## 🎨 2D Character Layer Guide for Artists

All layered WebP assets must be exported onto an **identical canvas dimension (matching aspect ratio)** with transparent backgrounds so they naturally align at `top: 0, left: 0`:

| Layer Directory | File Name | Description |
|---|---|---|
| `public/character/body/` | `body-idle.webp` | Peeking pose mostly hidden behind input |
| | `body-standing.webp` | Full stand-up pose for roasting/laughing |
| `public/character/head/` | `head-peeking.webp` | Only top of head and eyes visible |
| | `head-full.webp` | Full head used when standing |
| `public/character/eyes/` | `eyes-open.webp` | Open eyes (default) |
| | `eyes-closed.webp` | Closed eyes (blink loop / laugh) |
| | `eyes-narrow.webp` | Skeptical / thinking eyes |
| `public/character/eyebrows/` | `eyebrows-neutral.webp`| Neutral resting eyebrows |
| | `eyebrows-raised.webp` | Raised eyebrows for typing watching |
| | `eyebrows-furrowed.webp`| Annoyed / skeptical eyebrows |
| `public/character/mouth/` | `mouth-closed.webp` | Closed mouth |
| | `mouth-open.webp` | Open mouth frame for talking loop |
| | `mouth-smirk.webp` | Smirking idle / reacting frame |
| | `mouth-laugh.webp` | Laughing mouth frame |
| `public/character/arms/` | `arms-hidden.webp` | Not rendered while peeking |
| | `arms-neutral.webp` | Neutral arms position |
| | `arms-shrug.webp` | Shrugging gesture |
| | `arms-facepalm.webp` | Facepalm gesture |
| | `arms-point.webp` | Pointing gesture |
| | `arms-cross.webp` | Crossed arms |
| `public/character/accessories/` | `moustache.webp` | Kottayam-style moustache |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+ (Node v24 supported)
- npm 10+

### 2. Environment Variables
Copy `.env.example` to `.env.local` and add your API keys:
```bash
cp .env.example .env.local
```

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Sarvam AI TTS API
SARVAM_API_KEY=your_sarvam_api_key_here

# Upstash Redis for Edge Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token_here
```

*Note: If API keys are omitted in development, Kalloosan automatically uses safe hardcoded comedic fallbacks and local memory rate limiting without crashing.*

### 3. Install & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run verification suite
npm run typecheck
npm run lint
npm run build

# Start production server
npm run start
```

---

## 🧪 QA & Smoke-Test Checklist (§26)

- [x] Fresh page load shows `IDLE_PEEKING`, empty input, and zero residual state.
- [x] Typing triggers `TYPING_WATCHING`; submitting triggers `THINKING`.
- [x] On-topic messages produce comedic roasts, animations, and voice audio.
- [x] Off-topic tangents are roasted and redirected back to the topic.
- [x] 300-character input limit is strictly enforced client-side and server-side.
- [x] Rate limiting triggers HTTP 429 on the 11th rapid request per minute from one IP.
- [x] Missing API keys or network errors fall back to safe Malayalam roasts without 500 errors.
- [x] Missing TTS falls back to text-only talking animation smoothly.
- [x] Reset control clears conversation and returns character to `IDLE_PEEKING`.
- [x] `prefers-reduced-motion` suppresses continuous bounce and wobble loops.
- [x] Screen readers announce incoming roasts via `aria-live="polite"`.
- [x] Zero API keys or secrets exposed in client bundles.

---

## 📜 Disclaimer

> **Kalloosan is a fictional comedy character. His job is to find the worst possible side of your ideas. Don't take the negativity seriously.**
