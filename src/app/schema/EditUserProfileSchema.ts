import { z } from "zod";
import { countries } from "../constants";

export const EditUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  country: z.string().min(1, "Country is required").default(countries[0].id),
  isPrivate: z.boolean().default(false).optional(),
});

export type EditUserProfileType = z.infer<typeof EditUserProfileSchema>;
