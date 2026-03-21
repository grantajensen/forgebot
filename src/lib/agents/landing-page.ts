import { anthropic, MODEL } from "@/lib/anthropic";
import type { StartupConcept } from "@/lib/schemas";
import { LANDING_PAGE_SYSTEM_PROMPT } from "./prompts";

export async function generateLandingPage(
  concept: StartupConcept
): Promise<ReadableStream<Uint8Array>> {
  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    system: LANDING_PAGE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a landing page for this startup:\n\nCompany: ${concept.company_name}\nTagline: ${concept.tagline}\nPitch: ${concept.elevator_pitch}\nValue Prop: ${concept.value_proposition}\nTarget Customer: ${concept.target_customer_persona}\nPricing: ${concept.pricing_model}\nBrand Personality: ${concept.brand_personality}`,
      },
    ],
  });

  const encoder = new TextEncoder();
  let buffer = "";
  let started = false;

  return new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          buffer += event.delta.text;

          // Strip leading markdown code fence if present
          if (!started) {
            buffer = buffer.replace(/^```html?\s*\n?/, "");
            if (buffer.includes("<!") || buffer.includes("<html")) {
              started = true;
            }
            if (started && buffer.length > 0) {
              controller.enqueue(encoder.encode(buffer));
              buffer = "";
            }
          } else {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      }
      // Strip trailing code fence
      if (buffer.length > 0) {
        buffer = buffer.replace(/\n?```\s*$/, "");
        if (buffer.length > 0) {
          controller.enqueue(encoder.encode(buffer));
        }
      }
      controller.close();
    },
  });
}

export async function generateLandingPageFull(
  concept: StartupConcept
): Promise<{ html: string; tokensUsed: number; durationMs: number }> {
  const start = Date.now();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 64000,
    system: LANDING_PAGE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a landing page for this startup:\n\nCompany: ${concept.company_name}\nTagline: ${concept.tagline}\nPitch: ${concept.elevator_pitch}\nValue Prop: ${concept.value_proposition}\nTarget Customer: ${concept.target_customer_persona}\nPricing: ${concept.pricing_model}\nBrand Personality: ${concept.brand_personality}`,
      },
    ],
  });

  const durationMs = Date.now() - start;
  const html =
    response.content[0].type === "text" ? response.content[0].text : "";
  const tokensUsed =
    (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

  return { html, tokensUsed, durationMs };
}
