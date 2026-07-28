/**
 * Mailer — SMTP removed. All send functions are no-ops.
 * Import sites continue to compile and call these without errors;
 * emails simply are not sent.
 */

export function isSmtpConfigured(): boolean {
  return false;
}

export async function sendOtpEmail(_to: string, _otp: string): Promise<void> {}
export async function sendApprovalEmail(_to: string, _name: string): Promise<void> {}
export async function sendRejectionEmail(_to: string, _name: string, _reason?: string): Promise<void> {}
export async function sendNewRegistrationAdminEmail(_adminEmails: string[], _username: string): Promise<void> {}
export async function sendBroadcastEmail(_to: string, _subject: string, _html: string, _text: string): Promise<void> {}
export async function sendAdminResetLinkEmail(_to: string, _link: string): Promise<void> {}

export function buildOtpMailOptions(_to: string, _otp: string): null { return null; }
export function buildApprovalMailOptions(_to: string, _name: string): null { return null; }
export function buildRejectionMailOptions(_to: string, _name: string, _reason?: string): null { return null; }
