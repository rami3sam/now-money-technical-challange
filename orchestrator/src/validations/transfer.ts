
import { z } from "zod";

export const transferSchema = z.object({
  sender: z.object({
    senderId: z.string().min(1, "senderId is required"),
    name: z.string().min(1, "sender name is required"),
  }),
  recipient: z.object({
    name: z.string().min(1, "recipient name is required"),
    country: z.string().min(2, "country code is required"),
    payoutMethod: z.enum(["bank", "cash"]),
    payoutDetails: z.object({
      accountNumber: z.string().optional(),
      cashLocation: z.string().optional()
    }),
  }),
  sendAmount: z.number().positive("Amount must be positive"),
  sendCurrency: z.string().length(3, "Use ISO currency code"),
  payoutCurrency: z.string().length(3, "Use ISO currency code"),
});