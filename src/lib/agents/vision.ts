import { anthropic, MODEL } from "@/lib/anthropic";
import { ObjectAnalysisSchema, type ObjectAnalysis } from "@/lib/schemas";
import { VISION_SYSTEM_PROMPT } from "./prompts";

export async function analyzeObject(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
): Promise<{ data: ObjectAnalysis; tokensUsed: number; durationMs: number }> {
  const start = Date.now();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: VISION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          {
            type: "text",
            text: "Analyze this object and generate the structured JSON response.",
          },
        ],
      },
    ],
  });

  const durationMs = Date.now() - start;
  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";
  const tokensUsed =
    (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

  const text = rawText.replace(/^```json?\s*\n?/, "").replace(/\n?```\s*$/, "");
  const parsed = ObjectAnalysisSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error(`Vision agent returned invalid JSON: ${parsed.error.message}`);
  }

  return { data: parsed.data, tokensUsed, durationMs };
}
