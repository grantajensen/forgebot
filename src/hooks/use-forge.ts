"use client";

import { useCallback, useRef, useState } from "react";
import { useSupabase } from "@/providers/supabase-provider";
import type { ObjectAnalysis, StartupConcept, MarketingCampaign } from "@/lib/schemas";

export type ForgeStep =
  | "idle"
  | "uploading"
  | "analyzing"
  | "ideating"
  | "generating_landing"
  | "generating_marketing"
  | "complete"
  | "error";

interface ForgeState {
  step: ForgeStep;
  projectId: string | null;
  objectAnalysis: ObjectAnalysis | null;
  startupConcept: StartupConcept | null;
  landingPageHtml: string;
  marketingCampaign: MarketingCampaign | null;
  error: string | null;
}

export function useForge() {
  const supabase = useSupabase();
  const [state, setState] = useState<ForgeState>({
    step: "idle",
    projectId: null,
    objectAnalysis: null,
    startupConcept: null,
    landingPageHtml: "",
    marketingCampaign: null,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const setError = (error: string) =>
    setState((s) => ({ ...s, step: "error", error }));

  const startForge = useCallback(
    async (file: File) => {
      try {
        abortRef.current = new AbortController();

        // 1. Upload image
        setState((s) => ({ ...s, step: "uploading", error: null }));

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Create project row
        const { data: project, error: projErr } = await supabase
          .from("projects")
          .insert({ user_id: user.id, status: "uploading" })
          .select("id")
          .single();

        if (projErr || !project) throw new Error("Failed to create project");

        const projectId = project.id;
        setState((s) => ({ ...s, projectId }));

        // Upload to storage
        const filePath = `${user.id}/${projectId}/${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("project-images")
          .upload(filePath, file);

        if (uploadErr) throw new Error("Image upload failed");

        const {
          data: { publicUrl },
        } = supabase.storage.from("project-images").getPublicUrl(filePath);

        await supabase
          .from("projects")
          .update({ original_image_url: publicUrl })
          .eq("id", projectId);

        // Convert to base64
        const base64 = await fileToBase64(file);

        // 2. Analyze
        setState((s) => ({ ...s, step: "analyzing" }));
        const analyzeRes = await fetch("/api/forge/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            image_base64: base64,
            media_type: file.type,
          }),
          signal: abortRef.current.signal,
        });

        if (!analyzeRes.ok) {
          const err = await analyzeRes.json();
          throw new Error(err.error || "Analysis failed");
        }

        const { data: objectAnalysis } = await analyzeRes.json();
        setState((s) => ({ ...s, objectAnalysis }));

        // 3. Ideate
        setState((s) => ({ ...s, step: "ideating" }));
        const ideateRes = await fetch("/api/forge/ideate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: projectId }),
          signal: abortRef.current.signal,
        });

        if (!ideateRes.ok) {
          const err = await ideateRes.json();
          throw new Error(err.error || "Ideation failed");
        }

        const { data: startupConcept } = await ideateRes.json();
        setState((s) => ({ ...s, startupConcept }));

        // 4. Landing page (streaming)
        setState((s) => ({ ...s, step: "generating_landing", landingPageHtml: "" }));
        const lpRes = await fetch("/api/forge/landing-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: projectId }),
          signal: abortRef.current.signal,
        });

        if (!lpRes.ok) {
          throw new Error("Landing page generation failed");
        }

        const reader = lpRes.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let html = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            html += decoder.decode(value, { stream: true });
            setState((s) => ({ ...s, landingPageHtml: html }));
          }
        }

        // 5. Marketing
        setState((s) => ({ ...s, step: "generating_marketing" }));
        const marketingRes = await fetch("/api/forge/marketing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: projectId }),
          signal: abortRef.current.signal,
        });

        if (!marketingRes.ok) {
          const err = await marketingRes.json();
          throw new Error(err.error || "Marketing generation failed");
        }

        const { data: marketingCampaign } = await marketingRes.json();
        setState((s) => ({
          ...s,
          step: "complete",
          marketingCampaign,
        }));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [supabase]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({
      step: "idle",
      projectId: null,
      objectAnalysis: null,
      startupConcept: null,
      landingPageHtml: "",
      marketingCampaign: null,
      error: null,
    });
  }, []);

  return { ...state, startForge, reset };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/...;base64, prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
