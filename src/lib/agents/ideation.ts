import { anthropic, MODEL } from "@/lib/anthropic";
import {
  StartupConceptSchema,
  type ObjectAnalysis,
  type StartupConcept,
} from "@/lib/schemas";
import { IDEATION_SYSTEM_PROMPT } from "./prompts";

export async function generateStartupConcept(
  analysis: ObjectAnalysis
): Promise<{ data: StartupConcept; tokensUsed: number; durationMs: number }> {
  const start = Date.now();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: IDEATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a startup concept inspired by this object analysis:\n\n${JSON.stringify(analysis, null, 2)}`,
      },
    ],
  });

  const durationMs = Date.now() - start;
  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const tokensUsed =
    (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

  const parsed = StartupConceptSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error(
      `Ideation agent returned invalid JSON: ${parsed.error.message}`
    );
  }

  return { data: parsed.data, tokensUsed, durationMs };
}
