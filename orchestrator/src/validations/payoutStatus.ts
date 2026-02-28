import { string, z } from "zod";
import { PayoutStatusValues } from "../enums/payoutStatus.enum.js";

export const PayoutStatusType = z.object({
  partnerPayoutId: string().min(1, "partnerPayoutId is required"),
  status: z.enum(PayoutStatusValues, "Invalid payout status"),
});

export type PayoutStatusType = z.infer<typeof PayoutStatusType>;
