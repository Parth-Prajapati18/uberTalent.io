import { z } from "zod";

export const DeclineOfferSchema = z.object({
  rejectedReasonCode: z.string().min(1, "Reason is required for decline the offer."),
});

export type DeclineOfferType = z.infer<typeof DeclineOfferSchema>;
