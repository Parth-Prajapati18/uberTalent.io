import { z } from "zod";

export const SignupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email format" })
    .trim()
    .toLowerCase(),
  password: z.string().trim().min(1, { message: "Password is required" }),
  acceptTerms: z.coerce.boolean().refine((val) => !!val, {
    message: "You must accept the terms in order to proceed",
  }),
});

export type SignupType = z.infer<typeof SignupSchema>;