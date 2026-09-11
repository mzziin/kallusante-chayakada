import { buildPrompt } from "./context";
import {
  RoastRequest,
  RoastResponse,
  rawLlmResponseSchema,
  normalizeLlmResponse,
} from "./validation";

/**
 * Hardcoded safe fallback roast verbatim per §15
 */
export const FALLBACK_ROAST: RoastResponse = {
  response: "Ente ponnedave, thala vere pani ondu. Onnu pinnale nokkam. Hah!",
  ttsText: "എന്റെ പൊന്നേടാവേ, തല വേറെ പണി ഉണ്ട്. ഒന്ന് പിന്നാലെ നോക്കാം. ഹഹ്!",
  related: true,
  topic: "General",
  emotion: "skeptical",
  gesture: "head_shake",
  skipRoast: false,
  audio: null,
  audioAvailable: false,
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Strip potential markdown code fences from model text
 */
function cleanJsonText(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith("```json")) {
    text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (text.startsWith("```")) {
    text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return text.trim();
}

/**
 * Perform single REST call to Gemini 2.5 Flash API per §7.1
 */
async function callGeminiRest(
  promptText: string,
  apiKey: string
): Promise<{ text?: string; finishReason?: string }> {
  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  };

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Gemini HTTP ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const finishReason = candidate?.finishReason;
  const partText = candidate?.content?.parts?.[0]?.text;

  return { text: partText, finishReason };
}

/**
 * Parse and validate candidate text against schema
 */
function parseAndValidateLlmJson(rawText: string): RoastResponse | null {
  try {
    const cleaned = cleanJsonText(rawText);
    const parsed = JSON.parse(cleaned);
    const validation = rawLlmResponseSchema.safeParse(parsed);

    if (!validation.success) {
      console.warn(
        JSON.stringify({
          tag: "LLM_SCHEMA_VALIDATION_WARNING",
          errors: validation.error.flatten(),
        })
      );
      return null;
    }

    return normalizeLlmResponse(validation.data);
  } catch {
    return null;
  }
}

/**
 * Generate a comedic roast using Gemini 2.5 Flash with retry-once and fallback policies (§15)
 */
export async function generateRoast(request: RoastRequest): Promise<RoastResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn(
      JSON.stringify({
        tag: "LLM_CONFIG_WARNING",
        message: "GEMINI_API_KEY is not set. Using fallback roast.",
      })
    );
    return FALLBACK_ROAST;
  }

  const prompt = buildPrompt(request);

  // Attempt 1: Main Gemini Call
  try {
    const { text, finishReason } = await callGeminiRest(prompt, apiKey);

    // Check for safety block per §9, §14
    if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") {
      console.warn(
        JSON.stringify({
          tag: "LLM_SAFETY_BLOCK",
          finishReason,
          message: "Response blocked by safety filters. Using fallback roast.",
        })
      );
      return FALLBACK_ROAST;
    }

    if (text) {
      const parsedResponse = parseAndValidateLlmJson(text);
      if (parsedResponse) {
        return parsedResponse;
      }
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(
      JSON.stringify({
        tag: "LLM_ATTEMPT_1_FAILED",
        error: errMsg,
      })
    );
  }

  // Attempt 2: Retry once per §15 with 300ms delay and stricter JSON instruction
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const reinforcedPrompt = `${prompt}\n\nIMPORTANT REMINDER: You MUST return ONLY valid, parseable JSON. Do not include markdown code fences, comments, or additional text outside the JSON object.`;
    const { text, finishReason } = await callGeminiRest(reinforcedPrompt, apiKey);

    if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") {
      return FALLBACK_ROAST;
    }

    if (text) {
      const retryParsed = parseAndValidateLlmJson(text);
      if (retryParsed) {
        return retryParsed;
      }
    }
  } catch (retryErr: unknown) {
    const errMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
    console.error(
      JSON.stringify({
        tag: "LLM_RETRY_FAILED",
        error: errMsg,
      })
    );
  }

  // Fallback to hardcoded safe roast if retry also fails (§15)
  return FALLBACK_ROAST;
}
