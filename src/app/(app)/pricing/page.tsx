"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/providers/supabase-provider";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PricingPage() {
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [tier, setTier] = useState<"free" | "pro" | null>(null);
  const [generationsRemaining, setGenerationsRemaining] = useState(3);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, generations_remaining")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setTier(profile.subscription_tier);
        setGenerationsRemaining(profile.generations_remaining);
      } else {
        setTier("free");
      }
    }
    load();
  }, [supabase]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        toast.error(error || "Failed to open billing portal");
        setPortalLoading(false);
      }
    } catch {
      toast.error("Failed to open billing portal");
      setPortalLoading(false);
    }
  };

  const isPro = tier === "pro";
  const generationsUsed = 3 - generationsRemaining;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="text-muted-foreground">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free Tier */}
        <div
          className={`rounded-lg p-6 space-y-4 relative ${
            !isPro ? "border-2 border-primary" : "border"
          }`}
        >
          {!isPro && tier !== null && (
            <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
              Current
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">Free</h2>
            <p className="text-3xl font-bold mt-2">
              $0
              <span className="text-base font-normal text-muted-foreground">
                /mo
              </span>
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> 3 startup generations
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> AI vision analysis
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Landing page
              generation
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Marketing campaigns
            </li>
          </ul>
          <div className="pt-2">
            {!isPro && tier !== null ? (
              <div className="space-y-2">
                <div className="w-full border rounded-md px-4 py-2 text-center text-sm text-muted-foreground">
                  Current Plan
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {generationsUsed} / 3 generations used
                </p>
              </div>
            ) : (
              <div className="w-full border rounded-md px-4 py-2 text-center text-sm text-muted-foreground">
                Free
              </div>
            )}
          </div>
        </div>

        {/* Pro Tier */}
        <div
          className={`rounded-lg p-6 space-y-4 relative ${
            isPro ? "border-2 border-primary" : "border-2 border-primary"
          }`}
        >
          <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
            {isPro ? "Current" : "Popular"}
          </div>
          <div>
            <h2 className="text-xl font-bold">Pro</h2>
            <p className="text-3xl font-bold mt-2">
              $9.99
              <span className="text-base font-normal text-muted-foreground">
                /mo
              </span>
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Unlimited generations
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> AI vision analysis
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Landing page
              generation
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Marketing campaigns
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Export to ZIP
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Remove ForgeBot
              branding
            </li>
          </ul>
          <div className="pt-2">
            {isPro ? (
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="w-full border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Manage Subscription"
                )}
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Upgrade to Pro"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
