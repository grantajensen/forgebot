"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/providers/supabase-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, User, CreditCard, LogOut } from "lucide-react";
import { toast } from "sonner";

const FREE_GENERATION_LIMIT = 3;

export default function SettingsPage() {
  const supabase = useSupabase();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tier, setTier] = useState<"free" | "pro">("free");
  const [generationsRemaining, setGenerationsRemaining] = useState(3);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, subscription_tier, generations_remaining")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name ?? "");
        setTier(profile.subscription_tier);
        setGenerationsRemaining(profile.generations_remaining);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
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

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setUpgradeLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const generationsUsed = FREE_GENERATION_LIMIT - generationsRemaining;
  const usagePercent = Math.min(
    (generationsUsed / FREE_GENERATION_LIMIT) * 100,
    100
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="text-sm mt-1">{email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Display Name
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your name"
              />
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan & Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Plan & Usage
          </CardTitle>
          <CardDescription>
            Your current subscription and generation usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Plan:</span>
            <Badge variant={tier === "pro" ? "default" : "secondary"}>
              {tier === "pro" ? "Pro" : "Free"}
            </Badge>
          </div>

          {tier === "free" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generations used</span>
                <span className="font-medium">
                  {generationsUsed} / {FREE_GENERATION_LIMIT}
                </span>
              </div>
              <Progress value={usagePercent} />
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="w-full mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {upgradeLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Upgrade to Pro — $9.99/mo"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Unlimited generations
              </p>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="pt-6">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
