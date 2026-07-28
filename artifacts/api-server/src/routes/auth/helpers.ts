import crypto from "node:crypto";

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
  // b2: prefixed keys are legacy storage references; treat them as null since
  // B2 has been removed — the user will need to re-upload their avatar.
  const profilePicture = user.profilePicture?.startsWith("b2:")
    ? null
    : (user.profilePicture ?? null);

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
