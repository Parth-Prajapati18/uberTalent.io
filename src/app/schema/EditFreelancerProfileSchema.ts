import { array, object, z } from "zod";

export const EditFreelancerProfileSchema = z.object({
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
  profileSummary: z.string().refine(
    (value) => {
      const wordCount = value.trim().split(/\s+/).length;
      return wordCount >= 50;
    },
    (val) => {
      const wordCount = val ? val.trim().split(/\s+/).length : 0;
      return {
        message: `Profile Summary must be at least 50 words (${wordCount}/50).`,
      };
    }
  ),
  profileImg: z.string().optional(),
  category: z
    .array(z.string())
    .min(1, { message: "At least one category is required" })
    .default([]),
  skills: array(z.string())
    .min(1, { message: "At least one skill is required" })
    .default([]),
  languages: array(object({
    language: z.string().min(1, "A language must be selected"),
    proficiency: z.string(),
    id: z.string().optional(),
  }))
    .default([]),
  hourlyRate: z.coerce
    .number()
    .min(1, "Minimum hourly rate is $1")
    .max(250, "Maximum hourly rate is $250"),
  hoursPerWeek: z
    .string({
      invalid_type_error: "Hours per week selection is required",
    })
    .default("LESS_THAN_30")
    .optional(),
});

export type EditFreelancerProfileType = z.infer<
  typeof EditFreelancerProfileSchema
>;
