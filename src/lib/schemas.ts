import { z } from "zod";

// ─── Agent Output Schemas ────────────────────────────────────────────

export const ObjectAnalysisSchema = z.object({
  object_name: z.string(),
  category: z.string(),
  materials: z.array(z.string()),
  use_cases: z.array(z.string()),
  problems_it_solves: z.array(z.string()),
  target_demographics: z.array(z.string()),
  mood: z.string(),
  aesthetic: z.string(),
});
export type ObjectAnalysis = z.infer<typeof ObjectAnalysisSchema>;

export const StartupConceptSchema = z.object({
  company_name: z.string(),
  tagline: z.string(),
  elevator_pitch: z.string(),
  value_proposition: z.string(),
  target_customer_persona: z.string(),
  pricing_model: z.string(),
  competitive_advantage: z.string(),
  brand_personality: z.string(),
});
export type StartupConcept = z.infer<typeof StartupConceptSchema>;

export const EmailSequenceSchema = z.object({
  subject: z.string(),
  preview_text: z.string(),
  body: z.string(),
  send_day: z.number(),
});

export const GoogleAdSchema = z.object({
  headline: z.string(),
  description: z.string(),
});

export const MarketingCampaignSchema = z.object({
  email_sequences: z.array(EmailSequenceSchema),
  twitter_posts: z.array(z.string()),
  linkedin_posts: z.array(z.string()),
  instagram_captions: z.array(z.string()),
  google_ad_copy: z.array(GoogleAdSchema),
  press_release: z.string(),
});
export type MarketingCampaign = z.infer<typeof MarketingCampaignSchema>;

// ─── API Request Schemas ─────────────────────────────────────────────

export const AnalyzeRequestSchema = z.object({
  project_id: z.string().uuid(),
  image_base64: z.string().min(100),
  media_type: z.enum([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ]),
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const ProjectIdRequestSchema = z.object({
  project_id: z.string().uuid(),
});

// ─── Database Types ──────────────────────────────────────────────────

export type ProjectStatus =
  | "uploading"
  | "analyzing"
  | "ideating"
  | "generating"
  | "complete"
  | "failed";

export type AgentType = "vision" | "ideation" | "landing_page" | "marketing";
export type SubscriptionTier = "free" | "pro";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  stripe_customer_id: string | null;
  subscription_tier: SubscriptionTier;
  generations_remaining: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  original_image_url: string | null;
  object_analysis: ObjectAnalysis | null;
  startup_concept: StartupConcept | null;
  landing_page_html: string | null;
  marketing_campaign: MarketingCampaign | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  project_id: string;
  agent_type: AgentType;
  prompt: string;
  response: Record<string, unknown> | null;
  tokens_used: number | null;
  duration_ms: number | null;
  created_at: string;
}
