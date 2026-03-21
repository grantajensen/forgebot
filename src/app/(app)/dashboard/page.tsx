"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabase } from "@/providers/supabase-provider";
import type { Project } from "@/lib/schemas";
import { Zap, Plus, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  uploading: "bg-yellow-100 text-yellow-800",
  analyzing: "bg-blue-100 text-blue-800",
  ideating: "bg-purple-100 text-purple-800",
  generating: "bg-indigo-100 text-indigo-800",
  complete: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
  const supabase = useSupabase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      setProjects((data as unknown as Project[]) || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <Link
          href="/forge"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Forge
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Zap className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-medium">No projects yet</h2>
          <p className="text-muted-foreground">
            Upload a photo of any object to forge your first startup.
          </p>
          <Link
            href="/forge"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Zap className="w-4 h-4" /> Start Forging
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={
                project.status === "complete"
                  ? `/forge/${project.id}`
                  : "/forge"
              }
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {project.original_image_url ? (
                <img
                  src={project.original_image_url}
                  alt={project.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-muted flex items-center justify-center">
                  <Zap className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">{project.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      STATUS_COLORS[project.status] || "bg-muted"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                {project.startup_concept && (
                  <p className="text-sm text-muted-foreground truncate">
                    {project.startup_concept.tagline}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
