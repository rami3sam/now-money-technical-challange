
import { z } from "zod";
import { PayoutMethods } from "../enums/payoutMethods.enum.ts";
import PersonalIDTypes from "../enums/personalIDTypes.ts";
import countryCodesAlpha3 from "../constants/countryCodes.ts";
import currencyCodes from "../constants/currencyCodes.ts";

export const createTransferSchema = z.object({
  sender: z.object({
    senderId: z.string().min(1, "senderId is required"),
    name: z.string().min(1, "sender name is required"),
  }),
  recipient: z.object({
    name: z.string().min(1, "recipient name is required"),
    country: z.string().length(3).refine((country) => countryCodesAlpha3.includes(country), "Country should be 3 letter ISO Code"),
    payoutMethod: z.enum([PayoutMethods.Bank, PayoutMethods.Cash]),
    payoutDetails: z.object({
      accountNumber: z.string().optional(),
      personalIDNumber: z.string().optional(),
      personalIDType: z.enum([PersonalIDTypes.Passport, PersonalIDTypes.NationalID]).optional()
    }),
  }),
  sendAmount: z.int().positive("Amount must be positive"),
  sendCurrency: z.string().length(3).refine((currency) => currencyCodes.includes(currency), "Currency should be 3 letter ISO Code"),
  payoutCurrency: z.string().length(3).refine((currency) => currencyCodes.includes(currency), "Currency should be 3 letter ISO Code"),
});

export type createTransferSchema = z.infer<typeof createTransferSchema>