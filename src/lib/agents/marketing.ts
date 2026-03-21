import { anthropic, MODEL } from "@/lib/anthropic";
import {
  MarketingCampaignSchema,
  type MarketingCampaign,
  type StartupConcept,
} from "@/lib/schemas";
import { MARKETING_SYSTEM_PROMPT } from "./prompts";

export async function generateMarketingCampaign(
  concept: StartupConcept
): Promise<{ data: MarketingCampaign; tokensUsed: number; durationMs: number }> {
  const start = Date.now();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: MARKETING_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a marketing campaign for this startup:\n\nCompany: ${concept.company_name}\nTagline: ${concept.tagline}\nPitch: ${concept.elevator_pitch}\nValue Prop: ${concept.value_proposition}\nTarget Customer: ${concept.target_customer_persona}\nPricing: ${concept.pricing_model}\nBrand Personality: ${concept.brand_personality}`,
      },
    ],
  });

  const durationMs = Date.now() - start;
  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";
  const tokensUsed =
    (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

  // Strip markdown code fences if present
  const text = rawText.replace(/^```json?\s*\n?/, "").replace(/\n?```\s*$/, "");

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    console.error("Marketing agent raw response:", rawText.slice(0, 500));
    throw new Error(
      `Marketing agent returned invalid JSON (response may have been truncated). stop_reason: ${response.stop_reason}`
    );
  }

  const parsed = MarketingCampaignSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(
      `Marketing agent returned invalid JSON: ${parsed.error.message}`
    );
  }

  return { data: parsed.data, tokensUsed, durationMs };
}
