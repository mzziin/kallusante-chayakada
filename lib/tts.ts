/**
 * Gemini Text-to-Speech client converting multimodal audio output to standard browser-compatible WAV.
 * Replaces Sarvam AI per user specification, unifying all AI services under GEMINI_API_KEY.
 */

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Prepend a standard 44-byte RIFF WAVE header to raw 16-bit linear PCM audio.
 * Gemini TTS returns raw PCM (audio/L16;codec=pcm;rate=24000).
 * Adding this header enables native playback in HTML5 <audio> across all web and mobile browsers.
 */
export function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1
): Buffer {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // Chunk ID "RIFF"
  header.write("RIFF", 0);
  // Chunk Size (36 + dataSize)
  header.writeUInt32LE(36 + dataSize, 4);
  // Format "WAVE"
  header.write("WAVE", 8);

  // Subchunk1 ID "fmt "
  header.write("fmt ", 12);
  // Subchunk1 Size (16 for PCM)
  header.writeUInt32LE(16, 16);
  // Audio Format (1 = PCM)
  header.writeUInt16LE(1, 20);
  // Number of Channels (1 = mono)
  header.writeUInt16LE(numChannels, 22);
  // Sample Rate (24000 Hz)
  header.writeUInt32LE(sampleRate, 24);
  // Byte Rate
  header.writeUInt32LE(byteRate, 28);
  // Block Align
  header.writeUInt16LE(blockAlign, 32);
  // Bits Per Sample (16 bits)
  header.writeUInt16LE(16, 34);

  // Subchunk2 ID "data"
  header.write("data", 36);
  // Subchunk2 Size
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

interface GeminiCandidatePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiCandidatePart[];
    };
    finishReason?: string;
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Execute single REST call to Gemini TTS API
 */
async function callGeminiTtsRest(
  ttsText: string,
  apiKey: string,
  model = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts",
  voiceName = process.env.GEMINI_VOICE || "Puck"
): Promise<string | null> {
  const endpoint = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: `Transcript to speak: ${ttsText}` }],
      },
    ],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName,
          },
        },
      },
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Gemini TTS HTTP ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini TTS Error ${data.error.code}: ${data.error.message}`);
  }

  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) {
    return null;
  }

  // Parse raw linear PCM (24kHz 16-bit mono) and package into RIFF WAVE
  const rawPcmBuffer = Buffer.from(part.inlineData.data, "base64");
  const wavBuffer = pcmToWav(rawPcmBuffer, 24000, 1);

  return wavBuffer.toString("base64");
}

/**
 * Generate speech audio via Gemini TTS with retry-once-then-fallback policy (§11, §15)
 * Returns base64 encoded WAV audio string, or null on failure.
 */
export async function generateTtsAudio(ttsText: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn(
      JSON.stringify({
        tag: "TTS_CONFIG_WARNING",
        message: "GEMINI_API_KEY is not set. Proceeding text-only.",
      })
    );
    return null;
  }

  const cleanText = ttsText.trim();
  if (!cleanText) return null;

  // Attempt 1: Primary Gemini Flash Preview TTS
  try {
    const audio = await callGeminiTtsRest(
      cleanText,
      apiKey,
      process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts",
      process.env.GEMINI_VOICE || "Puck"
    );
    if (audio) return audio;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(
      JSON.stringify({
        tag: "TTS_ATTEMPT_1_FAILED",
        error: errMsg,
      })
    );
  }

  // Attempt 2: Retry once with short backoff (§15) and secondary voice/model fallback
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const audio = await callGeminiTtsRest(
      cleanText,
      apiKey,
      "gemini-2.5-pro-preview-tts",
      "Fenrir"
    );
    if (audio) return audio;
  } catch (retryErr: unknown) {
    const errMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
    console.error(
      JSON.stringify({
        tag: "TTS_RETRY_FAILED",
        message: "Proceeding with text-only fallback.",
        error: errMsg,
      })
    );
  }

  // Resilient fallback: Return null to allow client to proceed with text and animation (§11, §15)
  return null;
}
