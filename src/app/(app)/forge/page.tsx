"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForge } from "@/hooks/use-forge";
import { ImageUploader } from "@/components/image-uploader";
import { ForgeStepper } from "@/components/forge-stepper";
import { LandingPagePreview } from "@/components/landing-page-preview";
import { MarketingContent } from "@/components/marketing-tabs";
import { Zap, RotateCcw } from "lucide-react";

export default function ForgePage() {
  const router = useRouter();
  const forge = useForge();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleStart = useCallback(() => {
    if (selectedFile) {
      forge.startForge(selectedFile);
    }
  }, [selectedFile, forge]);

  // Idle state — show uploader
  if (forge.step === "idle") {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Forge a Startup</h1>
          <p className="text-muted-foreground">
            Upload a photo of any object and we&apos;ll turn it into a full startup.
          </p>
        </div>

        <ImageUploader onFileSelected={setSelectedFile} />

        {selectedFile && (
          <div className="text-center">
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-lg"
            >
              <Zap className="w-5 h-5" />
              Start Forging
            </button>
          </div>
        )}
      </div>
    );
  }

  // Processing / complete / error states
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <ForgeStepper currentStep={forge.step} />

      {/* Error state */}
      {forge.step === "error" && (
        <div className="text-center space-y-4 py-8 max-w-md mx-auto">
          <p className="text-destructive font-medium text-lg">{forge.error}</p>
          {forge.errorReason === "quota" && (
            <p className="text-muted-foreground text-sm">
              Upgrade to Pro for unlimited forges and keep building.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            {forge.errorReason === "quota" && (
              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
              >
                Get Pro
              </button>
            )}
            <button
              type="button"
              onClick={forge.reset}
              className="inline-flex items-center justify-center gap-2 border px-4 py-2 rounded-md hover:bg-muted transition-colors w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4" /> Start Over
            </button>
          </div>
        </div>
      )}

      {/* Object Analysis */}
      {forge.objectAnalysis && (
        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
          <h2 className="font-semibold text-lg">
            Object: {forge.objectAnalysis.object_name}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Category:</span>{" "}
              {forge.objectAnalysis.category}
            </div>
            <div>
              <span className="text-muted-foreground">Mood:</span>{" "}
              {forge.objectAnalysis.mood}
            </div>
            <div>
              <span className="text-muted-foreground">Aesthetic:</span>{" "}
              {forge.objectAnalysis.aesthetic}
            </div>
            <div>
              <span className="text-muted-foreground">Materials:</span>{" "}
              {forge.objectAnalysis.materials.join(", ")}
            </div>
          </div>
        </div>
      )}

      {/* Startup Concept */}
      {forge.startupConcept && (
        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
          <h2 className="text-2xl font-bold">{forge.startupConcept.company_name}</h2>
          <p className="text-lg text-muted-foreground italic">
            &ldquo;{forge.startupConcept.tagline}&rdquo;
          </p>
          <p>{forge.startupConcept.elevator_pitch}</p>
          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
            <div>
              <span className="font-medium">Target:</span>{" "}
              {forge.startupConcept.target_customer_persona}
            </div>
            <div>
              <span className="font-medium">Pricing:</span>{" "}
              {forge.startupConcept.pricing_model}
            </div>
          </div>
        </div>
      )}

      {/* Landing Page */}
      {(forge.step === "generating_landing" ||
        forge.step === "generating_marketing" ||
        forge.step === "complete") &&
        forge.landingPageHtml && (
          <div>
            <h2 className="font-semibold text-lg mb-3">Generated Landing Page</h2>
            <LandingPagePreview
              html={forge.landingPageHtml}
              streaming={forge.step === "generating_landing"}
            />
          </div>
        )}

      {/* Marketing Campaign */}
      {forge.marketingCampaign && (
        <div>
          <h2 className="font-semibold text-lg mb-3">Marketing Campaign</h2>
          <MarketingContent campaign={forge.marketingCampaign} />
        </div>
      )}

      {/* Complete actions */}
      {forge.step === "complete" && forge.projectId && (
        <div className="flex gap-3 justify-center pt-4">
          <button
            onClick={() => router.push(`/forge/${forge.projectId}`)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            View Project
          </button>
          <button
            onClick={forge.reset}
            className="border px-4 py-2 rounded-md hover:bg-muted transition-colors"
          >
            Forge Another
          </button>
        </div>
      )}
    </div>
  );
}
