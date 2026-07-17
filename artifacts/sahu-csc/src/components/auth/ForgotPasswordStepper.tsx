import React from "react";

interface Props {
  /** 0 = identifier, 1 = otp, 2 = password */
  stepIndex: number;
}

export function ForgotPasswordStepper({ stepIndex }: Props) {
  return (
    <div className="flex items-center gap-2 mt-3">
      {["identifier", "otp", "password"].map((s, i) => (
        <React.Fragment key={s}>
          <div
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: stepIndex >= i ? "#f97316" : "rgba(255,255,255,0.25)",
              transform: stepIndex === i ? "scale(1.3)" : "scale(1)",
            }}
          />
          {i < 2 && (
            <div
              className="h-0.5 w-6 rounded-full transition-all duration-300"
              style={{ background: stepIndex > i ? "#f97316" : "rgba(255,255,255,0.2)" }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
