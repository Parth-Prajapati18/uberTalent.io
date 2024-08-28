import { z } from "zod";

export const SendJobInviteSchema = z.object({
  selectedJob: z.string().min(1, "Please select a job before submitting."),
  message: z.string().min(1, "Message is required"),
});

export type SendJobInviteType = z.infer<typeof SendJobInviteSchema>;
