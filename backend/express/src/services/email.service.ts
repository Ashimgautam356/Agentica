import { Resend } from "resend";
import { ApiError } from "../errors/api-error";
import type { SendEmailInput } from "../schemas/email.schema";

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
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function emailHtml(data: SendEmailInput) {
  const heading = escapeHtml(data.heading ?? data.subject);
  const previewText = escapeHtml(data.previewText ?? data.subject);
  const footerText = escapeHtml(data.footerText ?? "Agentica team");
  const cta =
    data.ctaLabel && data.ctaUrl
      ? `<a href="${escapeHtml(data.ctaUrl)}" style="display:inline-block;border-radius:8px;background:#111827;color:#ffffff;font-size:15px;font-weight:700;line-height:1.2;text-decoration:none;padding:14px 22px;margin-top:8px;">${escapeHtml(data.ctaLabel)}</a>`
      : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(data.subject)}</title>
  </head>
  <body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:#111827;color:#ffffff;">
                <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a7f3d0;">Agentica</div>
                <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;font-weight:800;">${heading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-size:16px;line-height:1.65;color:#374151;">
                ${textBlocks(data.message)}
                ${cta}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:13px;line-height:1.5;color:#6b7280;">
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
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new ApiError("INTERNAL_SERVER_ERROR", "Resend email configuration is missing.");
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: data.to,
    subject: data.subject,
    html: emailHtml(data),
    text: data.message,
  });

  if (result.error) {
    throw new ApiError("BAD_REQUEST", result.error.message);
  }

  return result.data;
}
