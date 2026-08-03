import crypto from "node:crypto";
import { getB2SignedUrl, isB2Configured } from "../../lib/b2";

/** Generate a 6-digit numeric OTP. */
export function generateNumericOtp(): string {
  const n = 100000 + crypto.randomInt(900000);
  return String(n);
}

/** SHA-256 hash of a raw OTP string (used for DB storage and comparison). */
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/** Mask an email address for safe display in responses. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(Math.min(local.length - 2, 4))}@${domain}`;
}

/** Formats a user DB row into the public-safe shape returned by auth endpoints. */
export async function fmtUser(user: any) {
  let profilePicture = user.profilePicture ?? null;

  // Resolve B2 key to a 1-hour pre-signed URL (same logic as fmtProfile in profile.ts)
  if (profilePicture?.startsWith("b2:") && isB2Configured()) {
    try {
      profilePicture = await getB2SignedUrl(profilePicture.slice(3), 3600);
    } catch {
      profilePicture = null; // B2 key missing or B2 down — show initials
    }
  } else if (profilePicture?.startsWith("b2:") && !isB2Configured()) {
    // B2 not configured — cannot resolve key, show initials
    profilePicture = null;
  }
  // Legacy base64 data:image/... rows pass through unchanged

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    mobile: user.mobile ?? null,
    role: user.role,
    fullName: user.fullName ?? null,
    profilePicture,
    bio: user.bio ?? null,
    address: user.address ?? null,
    status: user.status ?? "ACTIVE",
    firstLoginCompleted: user.firstLoginCompleted ?? false,
    twoFaEnabled: user.twoFaEnabled ?? false,
    twoFaMethod: user.twoFaMethod ?? "otp",
  };
}
