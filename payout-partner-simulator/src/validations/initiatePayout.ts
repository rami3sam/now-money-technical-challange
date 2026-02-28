import { z } from "zod";
import { PayoutMethods } from "../enums/payoutMethods.enum.js";
import { PersonalIDTypesValues } from "../enums/personalIDTypes.enum.js";
import { CountryCodesValues } from "../enums/countryCodes.enum.js";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.js";
import { isValidMoney } from "../utils/validatorFunctions.js";

export const InitatePayoutType = z.object({
  sender: z.object({
    name: z.string().min(1, "sender name is required"),
  }),
  recipient: z.object({
    name: z.string().min(1, "recipient name is required"),
    country: z
      .string()
      .length(3, "Country should be 3 letter ISO Code")
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
    .min(1, "sendAmount is required")
    .refine(
      isValidMoney,
      "sendAmount should be a valid money format (e.g., 100.00)",
    ),

  sendCurrency: z
    .string()
    .length(3, "Currency should be 3 letter ISO Code")
    .refine(
      (currency) => CurrencyCodesValues.includes(currency),
      "Currency should be 3 letter ISO Code",
    ),
  payoutCurrency: z
    .string()
    .length(3, "Currency should be 3 letter ISO Code")
    .refine(
      (currency) => CurrencyCodesValues.includes(currency),
      "Currency should be 3 letter ISO Code",
    ),

  payoutAmount: z
    .string()
    .min(1, "payoutAmount is required")
    .refine(
      isValidMoney,
      "payoutAmount should be a valid money format (e.g., 100.00)",
    ),
  payoutId: z.string().min(1, "payoutId is required"),
});

export type InitatePayoutType = z.infer<typeof InitatePayoutType>;
