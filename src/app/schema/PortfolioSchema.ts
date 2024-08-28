import { z } from "zod";

const validFileExtensions = ["image/jpeg", "image/png", "application/pdf"];
const maxFileSize = 4.5 * 1024 * 1024; // 4.5MB

export const fileExtensionValidator = z.object({
  type: z.string().refine((type) => validFileExtensions.includes(type), {
    message: "Invalid file type. Only JPG, PNG, and PDF files are allowed.",
  }),
});

export const fileSizeValidator = z.object({
  size: z.number().refine((size) => size <= maxFileSize, {
    message: "File size should not exceed 4.5MB.",
  }),
});

export const PortfolioSchema = z.object({
  id: z.string().uuid().optional(),
  freelancerId: z.string().uuid().optional(),
  title: z.string().min(1, "Portfolio Title is required"),
  description: z.string().min(1, "Portfolio Description is required"),
  url: z
    .string()
    .nullable()
    .optional()
    .refine((value) => !value || z.string().url().safeParse(value).success, {
      message: "Invalid URL format",
    }),
  skills: z.array(z.string()),
  content: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["IMAGE", "PDF"]),
      content: z.string().url({ message: "Invalid URL." }),
      attachment: z.any().optional(),
      error: z.string().optional(),
    })
  ),
  createdAt: z
    .date()
    .default(() => new Date())
    .optional(),
});

export type PortfolioType = z.infer<typeof PortfolioSchema>;
