"use client";

import { useCallback, useRef, useState } from "react";
import { useSupabase } from "@/providers/supabase-provider";
import type { ObjectAnalysis, StartupConcept, MarketingCampaign } from "@/lib/schemas";
import { ensureVisionCompatibleImage } from "@/lib/heic-to-jpeg";

export type ForgeStep =
  | "idle"
  | "uploading"
  | "analyzing"
  | "ideating"
  | "generating_landing"
  | "generating_marketing"
  | "complete"
  | "error";

type ForgeErrorReason = "quota" | null;

interface ForgeState {
  step: ForgeStep;
  projectId: string | null;
  objectAnalysis: ObjectAnalysis | null;
  startupConcept: StartupConcept | null;
  landingPageHtml: string;
  marketingCampaign: MarketingCampaign | null;
  error: string | null;
  errorReason: ForgeErrorReason;
}

class ForgeQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForgeQuotaError";
  }
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
    errorReason: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const setForgeError = (error: string, errorReason: ForgeErrorReason = null) =>
    setState((s) => ({ ...s, step: "error", error, errorReason }));

  const startForge = useCallback(
    async (file: File) => {
      try {
        abortRef.current = new AbortController();

        // 1. Upload image
        setState((s) => ({
          ...s,
          step: "uploading",
          error: null,
          errorReason: null,
        }));

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: profile } = await supabase
          .from("profiles")
          .select("generations_remaining, subscription_tier")
          .eq("user_id", user.id)
          .maybeSingle();

        if (
          profile?.subscription_tier === "free" &&
          profile.generations_remaining <= 0
        ) {
          throw new ForgeQuotaError(
            "You've run out of tokens on the free plan."
          );
        }

        const imageFile = await ensureVisionCompatibleImage(file);

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
        const filePath = `${user.id}/${projectId}/${imageFile.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("project-images")
          .upload(filePath, imageFile);

        if (uploadErr) throw new Error("Image upload failed");

        const {
          data: { publicUrl },
        } = supabase.storage.from("project-images").getPublicUrl(filePath);

        await supabase
          .from("projects")
          .update({ original_image_url: publicUrl })
          .eq("id", projectId);

        // Convert to base64
        const base64 = await fileToBase64(imageFile);

        // 2. Analyze
        setState((s) => ({ ...s, step: "analyzing" }));
        const analyzeRes = await fetch("/api/forge/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            image_base64: base64,
            media_type: imageFile.type || "image/jpeg",
          }),
          signal: abortRef.current.signal,
        });

        if (!analyzeRes.ok) {
          let errBody: { error?: string; code?: string } = {};
          try {
            errBody = await analyzeRes.json();
          } catch {
            /* non-JSON error body */
          }
          if (
            errBody.code === "QUOTA_EXHAUSTED" ||
            analyzeRes.status === 403
          ) {
            throw new ForgeQuotaError(
              "You've run out of tokens on the free plan."
            );
          }
          throw new Error(errBody.error || "Analysis failed");
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
          let lastFlush = 0;
          let timer: ReturnType<typeof setTimeout> | null = null;
          const THROTTLE_MS = 500;

          const flush = () => {
            if (timer) { clearTimeout(timer); timer = null; }
            lastFlush = Date.now();
            setState((s) => ({ ...s, landingPageHtml: html }));
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            html += decoder.decode(value, { stream: true });

            const elapsed = Date.now() - lastFlush;
            if (elapsed >= THROTTLE_MS) {
              flush();
            } else if (!timer) {
              timer = setTimeout(flush, THROTTLE_MS - elapsed);
            }
          }

          if (timer) clearTimeout(timer);
          flush();
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
        if (err instanceof ForgeQuotaError) {
          setForgeError(err.message, "quota");
          return;
        }
        setForgeError(
          err instanceof Error ? err.message : "Something went wrong"
        );
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
      errorReason: null,
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
