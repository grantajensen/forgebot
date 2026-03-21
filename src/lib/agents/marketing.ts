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
    max_tokens: 4096,
    system: MARKETING_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a marketing campaign for this startup:\n\nCompany: ${concept.company_name}\nTagline: ${concept.tagline}\nPitch: ${concept.elevator_pitch}\nValue Prop: ${concept.value_proposition}\nTarget Customer: ${concept.target_customer_persona}\nPricing: ${concept.pricing_model}\nBrand Personality: ${concept.brand_personality}`,
      },
    ],
  });

  const durationMs = Date.now() - start;
  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const tokensUsed =
    (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

  const parsed = MarketingCampaignSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error(
      `Marketing agent returned invalid JSON: ${parsed.error.message}`
    );
  }

  return { data: parsed.data, tokensUsed, durationMs };
}
