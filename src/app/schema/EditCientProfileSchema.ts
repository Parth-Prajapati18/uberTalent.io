import { z } from "zod";
import { countries } from "../constants";

export const EditClientProfileSchema = z.object({
  country: z.string().min(1, "Country is required").default(countries[0].id),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required").default(""),
});

export type EditClientProfileType = z.infer<typeof EditClientProfileSchema>;
