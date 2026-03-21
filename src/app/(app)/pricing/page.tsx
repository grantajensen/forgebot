"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

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
        <div className="border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold">Free</h2>
            <p className="text-3xl font-bold mt-2">
              $0<span className="text-base font-normal text-muted-foreground">/mo</span>
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
              <Check className="w-4 h-4 text-green-600" /> Landing page generation
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Marketing campaigns
            </li>
          </ul>
          <div className="pt-2">
            <div className="w-full border rounded-md px-4 py-2 text-center text-sm text-muted-foreground">
              Current Plan
            </div>
          </div>
        </div>

        {/* Pro Tier */}
        <div className="border-2 border-primary rounded-lg p-6 space-y-4 relative">
          <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
            Popular
          </div>
          <div>
            <h2 className="text-xl font-bold">Pro</h2>
            <p className="text-3xl font-bold mt-2">
              $9.99<span className="text-base font-normal text-muted-foreground">/mo</span>
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
              <Check className="w-4 h-4 text-green-600" /> Landing page generation
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Marketing campaigns
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Export to ZIP
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Remove ForgeBot branding
            </li>
          </ul>
          <div className="pt-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}
