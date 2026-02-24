import { string, z } from "zod";
import { PayoutStatusValues } from "../enums/payoutStatus.enum.ts";

export const payoutStatusSchema = z.object({
  partnerPayoutId: string().min(1, "partnerPayoutId is required"),
  status: z.enum(PayoutStatusValues, "Invalid payout status"),
});

export type payoutStatusSchema = z.infer<typeof payoutStatusSchema>;
