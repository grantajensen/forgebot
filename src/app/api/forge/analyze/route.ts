import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeObject } from "@/lib/agents/vision";
import { AnalyzeRequestSchema } from "@/lib/schemas";
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

    // Check quota (create profile if missing — trigger may not have fired)
    let { data: profile } = await supabase
      .from("profiles")
      .select("generations_remaining, subscription_tier")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      const admin = createAdminClient();
      const { data: newProfile, error: insertErr } = await admin
        .from("profiles")
        .insert({
          user_id: user.id,
          display_name: user.email,
          generations_remaining: 3,
          subscription_tier: "free",
        })
        .select("generations_remaining, subscription_tier")
        .single();

      if (insertErr || !newProfile) {
        console.error("Failed to create profile:", insertErr);
        return NextResponse.json(
          { error: "Failed to initialize account" },
          { status: 500 }
        );
      }
      profile = newProfile;
    }

    if (
      profile.subscription_tier === "free" &&
      profile.generations_remaining <= 0
    ) {
      return NextResponse.json(
        { error: "No generations remaining. Upgrade to Pro for unlimited." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { project_id, image_base64, media_type } = parsed.data;

    // Verify project belongs to user
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Update status
    await supabase
      .from("projects")
      .update({ status: "analyzing" })
      .eq("id", project_id);

    // Run vision agent
    const { data, tokensUsed, durationMs } = await analyzeObject(
      image_base64,
      media_type
    );

    // Save results
    await supabase
      .from("projects")
      .update({ object_analysis: data as unknown as Record<string, unknown> })
      .eq("id", project_id);

    // Log generation
    await supabase.from("generations").insert({
      project_id,
      agent_type: "vision",
      prompt: "[image analysis]",
      response: data as unknown as Record<string, unknown>,
      tokens_used: tokensUsed,
      duration_ms: durationMs,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
