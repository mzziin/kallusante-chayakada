import { buildPrompt } from "./context";
import {
  RoastRequest,
  RoastResponse,
  rawLlmResponseSchema,
  normalizeLlmResponse,
} from "./validation";

/**
 * Hardcoded safe fallback roast verbatim per §15 in natural Malayalam script
 */
export const FALLBACK_ROAST: RoastResponse = {
  response: "എന്റെ പൊന്നേടാവേ, വേറെ പണിയുണ്ട്. ഒന്ന് പോയേ. ഹഹ്!",
  ttsText: "എന്റെ പൊന്നേടാവേ, വേറെ പണിയുണ്ട്. ഒന്ന് പോയേ. ഹഹ്!",
  related: true,
  topic: "General",
  emotion: "skeptical",
  gesture: "head_shake",
  skipRoast: false,
  audio: null,
  audioAvailable: false,
};

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

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
 * Perform single REST call to Groq Cloud Chat Completion API
 */
async function callGroqRest(
  promptText: string,
  apiKey: string,
  modelName: string = GROQ_MODEL
): Promise<{ text?: string }> {
  const requestBody = {
    model: modelName,
    messages: [
      {
        role: "user",
        content: promptText,
      },
    ],
    temperature: 0.85,
    max_tokens: 1024,
    response_format: { type: "json_object" },
  };

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Groq HTTP ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const partText = choice?.message?.content;

  return { text: partText };
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
 * Generate a comedic roast using Groq with retry-once and fallback policies (§15)
 */
export async function generateRoast(request: RoastRequest): Promise<RoastResponse> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn(
      JSON.stringify({
        tag: "LLM_CONFIG_WARNING",
        message: "GROQ_API_KEY is not set. Using fallback roast.",
      })
    );
    return FALLBACK_ROAST;
  }

  const prompt = buildPrompt(request);

  // Attempt 1: Main Groq Call
  try {
    const { text } = await callGroqRest(prompt, apiKey, GROQ_MODEL);

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

  // Attempt 2: Retry once per §15 with 300ms delay, failover model, and reinforced JSON instruction
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const reinforcedPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid, parseable JSON strictly matching the requested schema.`;
    const failoverModel =
      GROQ_MODEL === "llama-3.1-8b-instant"
        ? "llama-3.3-70b-versatile"
        : "llama-3.1-8b-instant";

    const { text } = await callGroqRest(
      reinforcedPrompt,
      apiKey,
      failoverModel
    );

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
