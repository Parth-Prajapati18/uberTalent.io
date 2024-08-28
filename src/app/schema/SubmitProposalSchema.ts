import { z } from "zod";

// Allowed file extensions
const allowedExtensions = ["png", "jpg", "jpeg", "doc", "pdf", "docx"];

// Max file size in bytes (4.5 MB)
const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

// Custom Zod validator for file extension
const fileExtensionValidator = (file: any) => {
  if (!file) return true; // Skip validation if file is not provided
  const extension = file.name.split(".").pop().toLowerCase();
  return allowedExtensions.includes(extension);
};

// Custom Zod validator for file size
const fileSizeValidator = (file: any) => {
  if (!file) return true; // Skip validation if file is not provided
  return file.size <= MAX_FILE_SIZE;
};

// Schema definition
export const SubmitProposalSchema = z.object({
  rate: z.coerce.number().refine((val) => val >= 1, {
    message: "Rate cannot be less than $1",
  }),
  coverletter: z.string().min(1, "Cover letter is required"),
  attachments: z
    .any()
    .optional()
    .refine(fileExtensionValidator, {
      message: "Unsupported file format",
    })
    .refine(fileSizeValidator, {
      message: "File size must not exceed 4.5 MB",
    }),
});

export type SubmitProposalType = z.infer<typeof SubmitProposalSchema>;
