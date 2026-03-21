import { createClient } from "@/lib/supabase/server";
import { generateStartupConcept } from "@/lib/agents/ideation";
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

    // Fetch project with analysis
    const { data: project } = await supabase
      .from("projects")
      .select("id, object_analysis")
      .eq("id", project_id)
      .eq("user_id", user.id)
      .single();

    if (!project?.object_analysis) {
      return NextResponse.json(
        { error: "Project not found or analysis missing" },
        { status: 404 }
      );
    }

    await supabase
      .from("projects")
      .update({ status: "ideating" })
      .eq("id", project_id);

    const { data, tokensUsed, durationMs } = await generateStartupConcept(
      project.object_analysis
    );

    // Save concept and update project name
    await supabase
      .from("projects")
      .update({
        startup_concept: data as unknown as Record<string, unknown>,
        name: data.company_name,
      })
      .eq("id", project_id);

    await supabase.from("generations").insert({
      project_id,
      agent_type: "ideation",
      prompt: JSON.stringify(project.object_analysis),
      response: data as unknown as Record<string, unknown>,
      tokens_used: tokensUsed,
      duration_ms: durationMs,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Ideate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ideation failed" },
      { status: 500 }
    );
  }
}
