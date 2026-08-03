import { z } from "zod";

export const sendEmailSchema = z
  .object({
    to: z.union([z.email().toLowerCase(), z.array(z.email().toLowerCase()).min(1).max(20)]),
    subject: z.string().trim().min(1).max(120),
    heading: z.string().trim().min(1).max(120).optional(),
    message: z.string().trim().min(1).max(4_000),
    previewText: z.string().trim().min(1).max(160).optional(),
    ctaLabel: z.string().trim().min(1).max(48).optional(),
    ctaUrl: z.url().optional(),
    footerText: z.string().trim().min(1).max(240).optional(),
  })
  .refine((data) => Boolean(data.ctaLabel) === Boolean(data.ctaUrl), {
    message: "CTA label and URL must be provided together.",
  });

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
