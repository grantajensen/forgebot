import { createClient } from "@/lib/supabase/server";
import { generateLandingPage } from "@/lib/agents/landing-page";
import { ProjectIdRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const parsed = ProjectIdRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { project_id } = parsed.data;

    const { data: project } = await supabase
      .from("projects")
      .select("id, startup_concept")
      .eq("id", project_id)
      .eq("user_id", user.id)
      .single();

    if (!project?.startup_concept) {
      return new Response(
        JSON.stringify({ error: "Project not found or concept missing" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("projects")
      .update({ status: "generating" })
      .eq("id", project_id);

    // Stream the landing page HTML and also accumulate it for DB storage
    const aiStream = await generateLandingPage(project.startup_concept);
    let fullHtml = "";
    const decoder = new TextDecoder();

    const { readable, writable } = new TransformStream({
      transform(chunk, controller) {
        fullHtml += decoder.decode(chunk, { stream: true });
        controller.enqueue(chunk);
      },
      async flush() {
        // Save complete HTML to database after stream ends
        const startTime = Date.now();
        await supabase
          .from("projects")
          .update({ landing_page_html: fullHtml })
          .eq("id", project_id);

        await supabase.from("generations").insert({
          project_id,
          agent_type: "landing_page",
          prompt: JSON.stringify(project.startup_concept),
          response: { html_length: fullHtml.length },
          tokens_used: null,
          duration_ms: Date.now() - startTime,
        });
      },
    });

    aiStream.pipeTo(writable);

    return new Response(readable, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Landing page error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Landing page generation failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
