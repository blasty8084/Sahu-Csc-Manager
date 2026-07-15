import { createNotification } from "./notificationService";

export async function notifyLoginSuccess(userId: number, ip: string, device: string) {
  await createNotification({
    userId,
    title: "Login Successful",
    message: `You logged in from ${device} (${ip}).`,
    type: "security",
    priority: "MEDIUM",
    meta: { ip, device },
  });
}

export async function notifyLoginFailed(userId: number, ip: string, device: string, attemptCount: number, maxAttempts: number) {
  await createNotification({
    userId,
    title: "Failed Login Attempt",
    message: `Failed password attempt ${attemptCount}/${maxAttempts} from ${device} (${ip}).`,
    type: "security",
    priority: "HIGH",
    meta: { ip, device, attemptCount },
  });
}

export async function notifyAccountLocked(userId: number, ip: string, attempts: number) {
  await createNotification({
    userId,
    title: "Account Locked",
    message: `Your account was locked after ${attempts} failed attempts from ${ip}. It will unlock in 15 minutes.`,
    type: "security",
    priority: "CRITICAL",
    meta: { ip, attempts },
  });
}

export async function notifyPasswordChanged(userId: number, ip: string) {
  await createNotification({
    userId,
    title: "Password Changed",
    message: `Your account password was changed from ${ip}. If this was not you, contact admin immediately.`,
    type: "security",
    priority: "HIGH",
    meta: { ip },
  });
}

export async function notifyPasswordReset(userId: number, ip: string) {
  await createNotification({
    userId,
    title: "Password Reset",
    message: `Your password was reset via OTP from ${ip}.`,
    type: "security",
    priority: "HIGH",
    meta: { ip },
  });
}

export async function notifyLargeTransaction(userId: number, amount: number, entryId: number) {
  await createNotification({
    userId,
    title: "Large Transaction Recorded",
    message: `A transaction of ₹${amount.toLocaleString("en-IN")} was recorded in your ledger.`,
    type: "business",
    priority: "HIGH",
    link: `/ledger`,
    meta: { amount, entryId },
  });
}

export async function notifyLowBalance(userId: number, balance: number) {
  await createNotification({
    userId,
    title: "Low Balance Warning",
    message: `Your current balance is ₹${balance.toLocaleString("en-IN")}. Consider adding funds.`,
    type: "business",
    priority: "HIGH",
    link: `/ledger`,
    meta: { balance },
  });
}

export async function notifyLedgerEntry(userId: number, amount: number, entryId: number) {
  await createNotification({
    userId,
    title: "Ledger Entry Added",
    message: `₹${amount.toLocaleString("en-IN")} entry recorded successfully.`,
    type: "success",
    priority: "LOW",
    link: `/ledger`,
    meta: { amount, entryId },
  });
}

export async function notifyBackupCompleted(adminUserId: number) {
  await createNotification({
    userId: adminUserId,
    title: "Backup Completed",
    message: "Database backup was completed successfully.",
    type: "system",
    priority: "LOW",
    link: `/backups`,
  });
}

export async function notifyBackupFailed(adminUserId: number, error: string) {
  await createNotification({
    userId: adminUserId,
    title: "Backup Failed",
    message: `Database backup failed: ${error}`,
    type: "system",
    priority: "CRITICAL",
    link: `/backups`,
    meta: { error },
  });
}

export async function notifyNewRegistration(title: string, message: string) {
  const { db, usersTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  const admins = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, "admin"));
  await Promise.all(
    admins.map((a) =>
      createNotification({
        userId: a.id,
        title,
        message,
        type: "info",
        priority: "MEDIUM",
        link: `/users`,
      })
    )
  );
}

export async function notifyProfileUpdated(userId: number) {
  await createNotification({
    userId,
    title: "Profile Updated",
    message: "Your profile information was updated successfully.",
    type: "info",
    priority: "LOW",
    link: `/profile`,
  });
}

// ─── 2FA / device-security notifications ──────────────────────────────────────

export async function notify2faEnabled(userId: number, method: "otp" | "totp") {
  await createNotification({
    userId,
    title: "Two-Factor Authentication Enabled",
    message: `2FA via ${method === "totp" ? "Authenticator App" : "Email OTP"} was enabled on your account.`,
    type: "security",
    priority: "HIGH",
    link: `/profile`,
    meta: { method },
  });
}

export async function notify2faDisabled(userId: number) {
  await createNotification({
    userId,
    title: "Two-Factor Authentication Disabled",
    message: "2FA was turned off for your account. If this was not you, contact admin immediately.",
    type: "security",
    priority: "CRITICAL",
    link: `/profile`,
  });
}

export async function notifyNewDeviceLogin(userId: number, ip: string, device: string) {
  await createNotification({
    userId,
    title: "New Device Login",
    message: `Your account was verified and signed in from a new device: ${device} (${ip}).`,
    type: "security",
    priority: "HIGH",
    meta: { ip, device },
  });
}

export async function notifyDeviceTrusted(userId: number, device: string) {
  await createNotification({
    userId,
    title: "Device Trusted",
    message: `${device} was marked as trusted and will skip verification for 30 days.`,
    type: "security",
    priority: "MEDIUM",
    meta: { device },
  });
}

export async function notifyOtherSessionsSignedOut(userId: number, device: string) {
  await createNotification({
    userId,
    title: "Signed Out of Other Devices",
    message: `Logging in from ${device} signed you out everywhere else, since only one device can be active at a time.`,
    type: "security",
    priority: "MEDIUM",
    meta: { device },
  });
}
