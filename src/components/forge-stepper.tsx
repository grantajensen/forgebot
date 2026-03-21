"use client";

import { Check, Loader2, AlertCircle, Upload, Eye, Lightbulb, Globe, Megaphone } from "lucide-react";
import type { ForgeStep } from "@/hooks/use-forge";

const STEPS = [
  { key: "uploading", label: "Upload", icon: Upload },
  { key: "analyzing", label: "Analyze", icon: Eye },
  { key: "ideating", label: "Ideate", icon: Lightbulb },
  { key: "generating_landing", label: "Landing Page", icon: Globe },
  { key: "generating_marketing", label: "Marketing", icon: Megaphone },
] as const;

const STEP_ORDER: ForgeStep[] = [
  "uploading",
  "analyzing",
  "ideating",
  "generating_landing",
  "generating_marketing",
  "complete",
];

function getStepIndex(step: ForgeStep): number {
  return STEP_ORDER.indexOf(step);
}

interface ForgeStepperProps {
  currentStep: ForgeStep;
}

export function ForgeStepper({ currentStep }: ForgeStepperProps) {
  const currentIndex = getStepIndex(currentStep);
  const isError = currentStep === "error";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const stepIndex = getStepIndex(step.key);
          const isComplete = currentIndex > stepIndex;
          const isActive = currentStep === step.key;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${
                      isComplete
                        ? "bg-primary text-primary-foreground"
                        : isActive
                        ? isError
                          ? "bg-destructive text-white"
                          : "bg-primary text-primary-foreground animate-pulse"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : isActive && isError ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isComplete || isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
                    currentIndex > stepIndex + 1 || (currentIndex > stepIndex)
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
