import type { UsersPageState } from "./useUsersPage";

const b = () => import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export function useResetLinkActions(s: UsersPageState) {
  const openResetLink = (user: any) => {
    s.setResetLinkUser(user); s.setResetLinkToken(null); s.setResetLinkExpiry(null);
    s.setResetLinkCopied(false); s.setResetLinkEmailSent(false);
  };

  const closeResetLink = () => {
    s.setResetLinkUser(null); s.setResetLinkToken(null); s.setResetLinkExpiry(null);
    s.setResetLinkCopied(false); s.setResetLinkEmailSent(false);
  };

  const generateResetLink = async () => {
    if (!s.resetLinkUser) return;
    s.setResetLinkLoading(true);
    try {
      const res  = await fetch(`${b()}/api/admin/users/${s.resetLinkUser.id}/generate-reset-link`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate link");
      s.setResetLinkToken(data.resetToken); s.setResetLinkExpiry(data.expiresAt);
    } catch (err: any) { s.toast({ title: err.message ?? "Failed to generate link", variant: "destructive" }); }
    finally             { s.setResetLinkLoading(false); }
  };

  const copyResetLink = async () => {
    if (!s.resetLinkUrl) return;
    try {
      await navigator.clipboard.writeText(s.resetLinkUrl);
      s.setResetLinkCopied(true); setTimeout(() => s.setResetLinkCopied(false), 2500);
    } catch { s.toast({ title: "Copy failed — select the link manually", variant: "destructive" }); }
  };

  const sendResetLinkEmail = async () => {
    if (!s.resetLinkUser || !s.resetLinkToken || !s.resetLinkExpiry || !s.resetLinkUrl) return;
    s.setResetLinkEmailLoading(true);
    try {
      const res  = await fetch(`${b()}/api/admin/users/${s.resetLinkUser.id}/email-reset-link`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken: s.resetLinkToken, expiresAt: s.resetLinkExpiry, resetUrl: s.resetLinkUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send email");
      s.setResetLinkEmailSent(true); s.toast({ title: `Email sent to ${data.sentTo}` });
    } catch (err: any) { s.toast({ title: err.message ?? "Failed to send email", variant: "destructive" }); }
    finally             { s.setResetLinkEmailLoading(false); }
  };

  return { openResetLink, closeResetLink, generateResetLink, copyResetLink, sendResetLinkEmail };
}
