import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let _transporter: Transporter | null = null;

export function isSmtpConfigured(): boolean {
  return !!(
    process.env["SMTP_HOST"] &&
    process.env["SMTP_USER"] &&
    (process.env["SMTP_PASSWORD"] ?? process.env["SMTP_PASS"])
  );
}

export function getTransporter(): Transporter {
  if (_transporter) return _transporter;
  if (!isSmtpConfigured()) throw new Error("SMTP not configured");
  _transporter = nodemailer.createTransport({
    host: process.env["SMTP_HOST"]!,
    port: Number(process.env["SMTP_PORT"] ?? 587),
    secure: false,
    auth: {
      user: process.env["SMTP_USER"]!,
      pass: (process.env["SMTP_PASSWORD"] ?? process.env["SMTP_PASS"])!,
    },
  });
  return _transporter;
}
