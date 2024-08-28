import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email format" })
    .trim()
    .toLowerCase(),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

export type LoginType = z.infer<typeof LoginSchema>;