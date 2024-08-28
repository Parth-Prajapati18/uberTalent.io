import { z } from "zod";

export const ClientOnboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  country: z.string().min(1, "Country is required"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required").default(""),
});

export type ClientOnbordingType = z.infer<typeof ClientOnboardingSchema>;
