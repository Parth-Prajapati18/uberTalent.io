import { z } from "zod";

export const CreateContractSchema = z
  .object({
    attachments: z.any().optional(),
    // endDate: z.coerce.date().optional(),
    endDate: z
      .string()
      .transform((val) => (val === "" ? undefined : new Date(val)))
      .optional(),
    weeklyLimit: z.coerce.number().default(40),
    title: z.string().optional(),
    description: z.string().optional(),
    type: z
      .enum(["HOURLY", "FIXED"], {
        required_error: "Compensation type is required",
        invalid_type_error: "Compensation type provided is invalid",
      })
      .default("HOURLY"),

    hourlyRate: z.optional(z.coerce.number()),
    projectCost: z.optional(z.coerce.number()),
    paymentService: z.optional(z.coerce.boolean()),
  })
  .refine((schema) => (schema.type === "HOURLY" ? !!schema.hourlyRate : true), {
    message: "Hourly compensation rate is required",
    path: ["hourlyRate"],
  })
  .refine((schema) => (schema.type === "FIXED" ? !!schema.projectCost : true), {
    message: "Project cost is required",
    path: ["projectCost"],
  });

export type CreateContractType = z.infer<typeof CreateContractSchema>;
