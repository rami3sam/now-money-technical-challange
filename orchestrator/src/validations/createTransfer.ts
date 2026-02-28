import { z } from "zod";
import { PayoutMethods } from "../enums/payoutMethods.enum.js";
import { PersonalIDTypesValues } from "../enums/personalIDTypes.enum.js";
import { CountryCodesValues } from "../enums/countryCodes.enum.js";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.js";
import { isValidMoney } from "../utils/validatorFunctions.js";

export const createTransferSchema = z.object({
  sender: z.object({
    senderId: z.string().min(1, "senderId is required"),
    name: z.string().min(1, "sender name is required"),
  }),
  recipient: z.object({
    name: z.string().min(1, "recipient name is required"),
    country: z
      .string()
      .refine(
        (country) => CountryCodesValues.includes(country),
        "Country should be 3 letter ISO Code",
      ),
    payoutMethod: z.enum([PayoutMethods.Bank, PayoutMethods.Cash]),
    payoutDetails: z.object({
      accountNumber: z.string().optional(),
      personalIDNumber: z.string().optional(),
      personalIDType: z.enum(PersonalIDTypesValues).optional(),
    }),
  }),
  sendAmount: z
    .string()
    .refine(
      isValidMoney,
      "sendAmount should be a valid money format (e.g., 100.00)",
    ),
  sendCurrency: z
    .string()
    .refine(
      (currency) => CurrencyCodesValues.includes(currency),
      "Currency should be 3 letter ISO Code",
    ),
  payoutCurrency: z
    .string()
    .refine(
      (currency) => CurrencyCodesValues.includes(currency),
      "Currency should be 3 letter ISO Code",
    ),
});

export type createTransferSchema = z.infer<typeof createTransferSchema>;
