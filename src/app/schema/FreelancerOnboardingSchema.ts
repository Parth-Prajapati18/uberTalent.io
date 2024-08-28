import { array, object, z } from "zod";
import { countries } from "../constants";

export const FreelancerOnboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  country: z.string().min(1, "Country is required").default(countries[0].id),
  title: z
    .string()
    .min(1, "Profile Title is required")
    .refine(
      (value) => {
        const wordCount = value.trim().length;
        return wordCount < 76;
      },
      {
        message: "Title cannot exceed 70 characters.",
      }
    ),
  profileSummary: z.string().optional(),
  categories: array(z.string())
    .min(1, { message: "At least one category is required" })
    .default([]),
  skills: array(z.string()).default([]),
  hourlyRate: z.coerce
    .number()
    .min(1, "Minimum hourly rate is $1")
    .max(250, "Maximum hourly rate is $250"),
  hoursPerWeek: z.string({
    invalid_type_error: "Hours per week selection is required",
  }),
});

export type FreelancerType = z.infer<typeof FreelancerOnboardingSchema>;

export type JobInviteType = {
  clientId: string;
  jobId: string;
};

export interface FreelancerTypeExtended extends FreelancerType {
  email: string;
  imageUrl: string;
  userId?: string;
  jobInvites?: JobInviteType[];
  contract?: any[];
  languages?: any[];
}
