import { createClient } from "@/lib/supabase/server";
import { generateMarketingCampaign } from "@/lib/agents/marketing";
import { ProjectIdRequestSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ProjectIdRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { project_id } = parsed.data;

    const { data: project } = await supabase
      .from("projects")
      .select("id, startup_concept")
      .eq("id", project_id)
      .eq("user_id", user.id)
      .single();

    if (!project?.startup_concept) {
      return NextResponse.json(
        { error: "Project not found or concept missing" },
        { status: 404 }
      );
    }

    const { data, tokensUsed, durationMs } = await generateMarketingCampaign(
      project.startup_concept
    );

    // Mark project complete and save marketing data
    await supabase
      .from("projects")
      .update({
        marketing_campaign: data as unknown as Record<string, unknown>,
        status: "complete",
      })
      .eq("id", project_id);

    // Decrement generations for free tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier, generations_remaining")
      .eq("user_id", user.id)
      .single();

    if (profile && profile.subscription_tier === "free") {
      await supabase
        .from("profiles")
        .update({ generations_remaining: profile.generations_remaining - 1 })
        .eq("user_id", user.id);
    }

    await supabase.from("generations").insert({
      project_id,
      agent_type: "marketing",
      prompt: JSON.stringify(project.startup_concept),
      response: data as unknown as Record<string, unknown>,
      tokens_used: tokensUsed,
      duration_ms: durationMs,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Marketing error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Marketing generation failed",
      },
      { status: 500 }
    );
  }
}
