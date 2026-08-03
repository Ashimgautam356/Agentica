import nodemailer from "nodemailer";
import { ApiError } from "../errors/api-error";
import type { SendEmailInput } from "../schemas/email.schema";

const publicSiteUrl = "https://agentica-admin.vercel.app";
const logoUrl = `${publicSiteUrl}/assets/agentica-D0llcc3U.svg`;

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] ?? char,
  );
}

function textBlocks(value: string) {
  return value
    .split(/\n{2,}/)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#4B4438;">${escapeHtml(block).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

function emailHtml(data: SendEmailInput) {
  const heading = escapeHtml(data.heading ?? data.subject);
  const previewText = escapeHtml(data.previewText ?? data.subject);
  const footerText = escapeHtml(data.footerText ?? "Agentica team");
  const cta =
    data.ctaLabel && data.ctaUrl
      ? `<a href="${escapeHtml(data.ctaUrl)}" style="display:inline-block;border-radius:10px;background:#34A85B;color:#ffffff;font-size:15px;font-weight:800;line-height:1.2;text-decoration:none;padding:15px 22px;margin-top:8px;box-shadow:0 10px 24px rgba(52,168,91,0.22);">${escapeHtml(data.ctaLabel)}</a>`
      : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(data.subject)}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .agentica-shell { padding: 22px 12px !important; }
        .agentica-card { border-radius: 18px !important; }
        .agentica-header, .agentica-body, .agentica-footer { padding-left: 22px !important; padding-right: 22px !important; }
        .agentica-title { font-size: 26px !important; }
      }
    </style>
  </head>
  <body style="margin:0;background:#FBF8F2;font-family:Arial,Helvetica,sans-serif;color:#241F14;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FBF8F2;">
      <tr>
        <td class="agentica-shell" align="center" style="padding:38px 16px;">
          <table class="agentica-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #EFE7D8;border-radius:24px;overflow:hidden;box-shadow:0 24px 70px rgba(36,31,20,0.10);">
            <tr>
              <td style="height:7px;background:#34A85B;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td class="agentica-header" style="padding:30px 34px 22px;background:#ffffff;">
                <a href="${publicSiteUrl}" style="display:inline-block;text-decoration:none;">
                  <img src="${logoUrl}" width="170" alt="Agentica" style="display:block;width:170px;max-width:100%;height:auto;border:0;" />
                </a>
                <div style="margin-top:24px;display:inline-block;border-radius:999px;background:#EFFAF2;border:1px solid #D8F1DE;padding:7px 12px;color:#2F9852;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;">
                  Admin verification
                </div>
                <h1 class="agentica-title" style="margin:16px 0 0;font-size:32px;line-height:1.16;font-weight:900;color:#241F14;">${heading}</h1>
              </td>
            </tr>
            <tr>
              <td class="agentica-body" style="padding:4px 34px 30px;background:#ffffff;">
                ${textBlocks(data.message)}
                ${cta}
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px;background:#FBF8F2;border:1px solid #EFE7D8;border-radius:14px;">
                  <tr>
                    <td style="padding:16px 18px;font-size:14px;line-height:1.55;color:#5F574A;">
                      Open the Agentica admin portal at
                      <a href="${publicSiteUrl}" style="color:#2F9852;font-weight:800;text-decoration:none;">${publicSiteUrl}</a>.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="agentica-footer" style="padding:22px 34px;background:#241F14;border-top:1px solid #241F14;font-size:13px;line-height:1.55;color:#D8D1C5;">
                ${footerText}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendEmail(data: SendEmailInput) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM_EMAIL ?? user;

  if (!host || !user || !pass || !from) {
    throw new ApiError("INTERNAL_SERVER_ERROR", "SMTP email configuration is missing.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    return await transporter.sendMail({
      from,
      to: data.to,
      subject: data.subject,
      html: emailHtml(data),
      text: data.message,
    });
  } catch (error) {
    throw new ApiError(
      "BAD_REQUEST",
      error instanceof Error ? error.message : "Email could not be sent.",
    );
  }
}
