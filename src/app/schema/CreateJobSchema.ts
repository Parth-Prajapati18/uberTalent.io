import { z } from "zod";

export const SkillType = z.object({
  id: z.number(),
  value: z.string(),
});
export const CreateJobSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    categories: z.array(z.string()).min(1, "Category is required"),
    skills: z
      .array(z.string())
      .min(1, { message: "At least one skill is required" })
      .default([]),
    projectDuration: z.string({
      errorMap: () => ({ message: "Project duration is required" }),
    }),
    compensation: z.string({
      errorMap: () => ({ message: "Compensation is required" }),
    }),
    description: z.string().min(1, "Job description is required"),

    hourlyMinRate: z.optional(z.coerce.number()),
    hourlyMaxRate: z.optional(z.coerce.number()),
    projectCost: z.optional(z.coerce.number()),
  })
  .refine(
    (schema) =>
      schema.compensation === "HOURLY" ? !!schema.hourlyMinRate : true,
    {
      message: "Minimum hourly compensation range is required",
      path: ["hourlyMinRate"],
    }
  )
  .refine(
    (schema) =>
      schema.compensation === "HOURLY" ? !!schema.hourlyMaxRate : true,
    {
      message: "Maximum hourly compensation range is required",
      path: ["hourlyMaxRate"],
    }
  )
  .refine(
    (schema) => {
      if (schema.compensation === "HOURLY" && schema.hourlyMaxRate && schema.hourlyMinRate) {
        return schema.hourlyMaxRate > schema.hourlyMinRate;
      }
      return true
    },
    {
      message: "Maximum hourly compensation range should be greater than Minimum hourly compensation range",
      path: ["hourlyMaxRate"],
    }
  )
  .refine(
    (schema) =>
      schema.compensation === "FIXED" ? !!schema.projectCost : true,
    {
      message: "Project cost is required",
      path: ["projectCost"],
    }
  );

export type CreateJobType = z.infer<typeof CreateJobSchema>;
