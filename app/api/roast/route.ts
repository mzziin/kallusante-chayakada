import { NextRequest, NextResponse } from "next/server";
import { roastRequestSchema } from "@/lib/validation";
import { generateRoast } from "@/lib/llm";
import { generateTtsAudio } from "@/lib/tts";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json().catch(() => null);

    // 1. Input validation per §12, §15
    const validation = roastRequestSchema.safeParse(body);
    if (!validation.success) {
      const issue = validation.error.issues[0]?.message || "Invalid request payload";
      return NextResponse.json(
        {
          error: "invalid_request",
          message: issue,
        },
        { status: 400 }
      );
    }

    const roastPayload = validation.data;

    // 2. Generate roast via Gemini LLM pipeline
    const roastResult = await generateRoast(roastPayload);

    // 3. Generate Malayalam voice audio via Sarvam TTS (§11, §11.1)
    if (roastResult.ttsText) {
      const audio = await generateTtsAudio(roastResult.ttsText);
      roastResult.audio = audio;
      roastResult.audioAvailable = Boolean(audio);
    }

    // 4. Structured observability log per §18 (privacy-conscious: no full message logged)
    const duration = Date.now() - startTime;
    console.log(
      JSON.stringify({
        tag: "ROAST_REQUEST_SUCCESS",
        sessionId: roastPayload.sessionId || "anonymous",
        topic: roastResult.topic,
        emotion: roastResult.emotion,
        gesture: roastResult.gesture,
        skipRoast: roastResult.skipRoast,
        audioAvailable: roastResult.audioAvailable,
        durationMs: duration,
      })
    );

    return NextResponse.json(roastResult, { status: 200 });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errMsg = error instanceof Error ? error.message : "Internal error";

    console.error(
      JSON.stringify({
        tag: "ROAST_REQUEST_UNEXPECTED_ERROR",
        error: errMsg,
        durationMs: duration,
      })
    );

    return NextResponse.json(
      {
        error: "internal_error",
        message: "An unexpected error occurred while processing the roast.",
      },
      { status: 500 }
    );
  }
}
