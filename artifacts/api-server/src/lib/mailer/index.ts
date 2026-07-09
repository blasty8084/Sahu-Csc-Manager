// Barrel re-export so existing `import { ... } from "../lib/mailer"` call sites
// keep working unchanged after splitting this file into transport + per-template modules.
export { isSmtpConfigured } from "./transport";
export { sendOtpEmail } from "./templates/otp";
export { sendApprovalEmail } from "./templates/approval";
export { sendRejectionEmail } from "./templates/rejection";
export {
  sendNewRegistrationAdminEmail,
  sendBroadcastEmail,
  sendAdminResetLinkEmail,
} from "./templates/adminAlerts";
