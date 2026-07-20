import React from "react";
import { ArrowLeft } from "lucide-react";
import type { ResetStep } from "../loginTypes";

interface ForgotStepHeaderProps {
  step: ResetStep;
  stepIndex: number;
  onBack: () => void;
}

/** Back-to-login link + 3-dot progress indicator (hidden on success step). */
export function ForgotStepHeader({ step, stepIndex, onBack }: ForgotStepHeaderProps) {
  if (step === "success") return null;

  return (
    <div className="flex flex-col items-center mb-5">
      <button
        type="button"
        onClick={onBack}
        className="self-start flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to login
      </button>

      <div className="flex items-center gap-2 mb-4">
        {["identifier", "otp", "password"].map((s, i) => (
          <React.Fragment key={s}>
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: stepIndex >= i ? "#f97316" : "rgba(0,0,0,0.15)",
                transform: stepIndex === i ? "scale(1.35)" : "scale(1)",
              }}
            />
            {i < 2 && (
              <div
                className="h-0.5 w-8 rounded-full transition-all duration-300"
                style={{ background: stepIndex > i ? "#f97316" : "rgba(0,0,0,0.12)" }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
