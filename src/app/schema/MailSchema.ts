import { z } from "zod";

export const MailSchema = z.object({
  to: z
    .string()
    .min(1, "Recipient email is required")
    .email({ message: "Invalid email format" })
    .trim()
    .toLowerCase(),
  subject: z
    .string()
    .min(1, "Email subject is required"),
  html: z
    .string()
    .min(1, "Email body is required"),
});

export type MailType = z.infer<typeof MailSchema>;