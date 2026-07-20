// BiometricPrompt — fingerprint / Face ID login via WebAuthn (passkeys).
// Renders a prompt to authenticate with a platform authenticator when the
// browser supports it and a credential is already enrolled for this device.
// Falls back gracefully to nothing when WebAuthn is unavailable.
//
// Usage (not yet wired into the login form — add below <PasswordField> once
// backend passkey endpoints are ready):
//   <BiometricPrompt onSuccess={handleBiometricLogin} />

import { useState } from "react";
import { Fingerprint, Loader2, ShieldAlert } from "lucide-react";

interface BiometricPromptProps {
  /** Called with the raw PublicKeyCredential after a successful assertion. */
  onSuccess: (credential: PublicKeyCredential) => void;
  /** Called when the user cancels or the authenticator rejects the prompt. */
  onError?: (err: Error) => void;
}

/** True when the browser exposes the WebAuthn API and a platform authenticator. */
async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function BiometricPrompt({ onSuccess, onError }: BiometricPromptProps) {
  const [status, setStatus] = useState<"idle" | "requesting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTap = async () => {
    if (!(await isBiometricAvailable())) {
      const err = new Error("Biometric authentication is not available on this device.");
      setErrorMsg(err.message);
      setStatus("error");
      onError?.(err);
      return;
    }

    setStatus("requesting");
    setErrorMsg(null);

    // NOTE: The challenge and allowCredentials must come from the server.
    // Replace this placeholder with a real /api/auth/passkey/begin response.
    const fakeChallenge = new Uint8Array(32);
    crypto.getRandomValues(fakeChallenge);

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: fakeChallenge,
          timeout: 60000,
          userVerification: "required",
          // allowCredentials is populated by the server based on the username.
        },
      }) as PublicKeyCredential;
      setStatus("idle");
      onSuccess(credential);
    } catch (err: any) {
      const message =
        err?.name === "NotAllowedError"
          ? "Biometric verification was cancelled."
          : "Biometric verification failed. Please use your password.";
      setStatus("error");
      setErrorMsg(message);
      onError?.(err instanceof Error ? err : new Error(message));
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleTap}
        disabled={status === "requesting"}
        aria-label="Sign in with biometrics"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors active:opacity-70 disabled:opacity-50"
        style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
      >
        {status === "requesting" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Fingerprint className="w-4 h-4" style={{ color: "#4F46E5" }} />
        )}
        {status === "requesting" ? "Verifying…" : "Use Fingerprint / Face ID"}
      </button>

      {status === "error" && errorMsg && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}
