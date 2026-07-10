import crypto from "node:crypto";

/** Formats a user DB row into the public-safe shape returned by auth endpoints. */
export function fmtUser(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    mobile: user.mobile ?? null,
    role: user.role,
    fullName: user.fullName ?? null,
    profilePicture: user.profilePicture ?? null,
    bio: user.bio ?? null,
    address: user.address ?? null,
    status: user.status ?? "ACTIVE",
  };
}

/** SHA-256 hash of a raw OTP string (used for DB storage and comparison). */
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
