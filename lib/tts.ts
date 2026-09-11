/**
 * Sarvam AI Text-to-Speech client implementing the exact contract per §11.1
 */

const SARVAM_TTS_ENDPOINT = "https://api.sarvam.ai/text-to-speech";

export interface SarvamTtsRequest {
  inputs: string[];
  target_language_code: string;
  speaker: string;
  model: string;
  pitch: number;
  pace: number;
  loudness: number;
  speech_sample_rate: number;
  enable_preprocessing: boolean;
}

export interface SarvamTtsResponse {
  audios: string[];
}

/**
 * Execute single REST call to Sarvam AI TTS API
 */
async function callSarvamRest(
  ttsText: string,
  apiKey: string,
  speaker: string = process.env.SARVAM_SPEAKER || "gokul"
): Promise<string | null> {
  const requestBody: SarvamTtsRequest = {
    inputs: [ttsText],
    target_language_code: "ml-IN",
    speaker,
    model: process.env.SARVAM_MODEL || "bulbul:v3",
    pitch: 0,
    pace: 1.0,
    loudness: 1.0,
    speech_sample_rate: 22050,
    enable_preprocessing: true,
  };

  const response = await fetch(SARVAM_TTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "API-Subscription-Key": apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Sarvam HTTP ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data: SarvamTtsResponse = await response.json();
  const base64Audio = data.audios?.[0];

  return base64Audio || null;
}

/**
 * Generate Malayalam speech audio with retry-once-then-fallback policy (§11, §15)
 * Returns base64 encoded audio string, or null on failure.
 */
export async function generateTtsAudio(ttsText: string): Promise<string | null> {
  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey) {
    console.warn(
      JSON.stringify({
        tag: "TTS_CONFIG_WARNING",
        message: "SARVAM_API_KEY is not set. Proceeding text-only.",
      })
    );
    return null;
  }

  const cleanText = ttsText.trim();
  if (!cleanText) return null;

  // Attempt 1: Main TTS Call
  try {
    const audio = await callSarvamRest(cleanText, apiKey);
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

  // Attempt 2: Retry once with short backoff (§15) and speaker fallback
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const audio = await callSarvamRest(cleanText, apiKey, "vijay");
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

  // Fallback: Return null to allow client to proceed with text and animation (§11, §15)
  return null;
}
