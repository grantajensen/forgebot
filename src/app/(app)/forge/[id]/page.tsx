"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSupabase } from "@/providers/supabase-provider";
import { LandingPagePreview } from "@/components/landing-page-preview";
import { MarketingContent } from "@/components/marketing-tabs";
import type { Project } from "@/lib/schemas";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = useSupabase();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"concept" | "landing" | "marketing" | "analysis">("concept");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      setProject(data as unknown as Project);
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const tabs = [
    { key: "concept", label: "Startup Brief" },
    { key: "landing", label: "Landing Page" },
    { key: "marketing", label: "Marketing" },
    { key: "analysis", label: "Analysis" },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.startup_concept && (
            <p className="text-muted-foreground">
              {project.startup_concept.tagline}
            </p>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "concept" && project.startup_concept && (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold">
              {project.startup_concept.company_name}
            </h2>
            <p className="text-lg italic text-muted-foreground">
              &ldquo;{project.startup_concept.tagline}&rdquo;
            </p>
            <p>{project.startup_concept.elevator_pitch}</p>

            <div className="grid gap-4 pt-2">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Value Proposition
                </h3>
                <p>{project.startup_concept.value_proposition}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Target Customer
                </h3>
                <p>{project.startup_concept.target_customer_persona}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Pricing Model
                </h3>
                <p>{project.startup_concept.pricing_model}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Competitive Advantage
                </h3>
                <p>{project.startup_concept.competitive_advantage}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Brand Personality
                </h3>
                <p>{project.startup_concept.brand_personality}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "landing" && project.landing_page_html && (
        <LandingPagePreview html={project.landing_page_html} />
      )}

      {activeTab === "marketing" && project.marketing_campaign && (
        <MarketingContent campaign={project.marketing_campaign} />
      )}

      {activeTab === "analysis" && project.object_analysis && (
        <div className="bg-muted/50 rounded-lg p-6">
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify(project.object_analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
