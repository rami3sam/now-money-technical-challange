import { z } from "zod";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.ts";
import { isValidCurrency, isValidMoney } from "../utils/validatorFunctions.ts";
import { CountryCodesValues } from "../enums/countryCodes.enum.ts";
import { PayoutMethodsValues } from "../enums/payoutMethods.enum.ts";

export const generateQuoteSchema = z.object({
  destinationCountry: z
    .string()
    .optional()
    .refine(
      (country) =>
        country?.length === 3 && CountryCodesValues.includes(country),
      "Country should be 3 letter ISO Code",
    ),
  sendAmount: z
    .string()
    .refine(
      isValidMoney,
      "sendAmount should be a valid money format (e.g., 100.00)",
    ),
  sendCurrency: z
    .string()
    .refine(isValidCurrency, "Currency should be 3 letter ISO Code"),
  payoutCurrency: z
    .string()
    .refine(isValidCurrency, "Currency should be 3 letter ISO Code"),
  payoutMethod: z
    .string()
    .optional()
    .refine(
      (method) => method === undefined || PayoutMethodsValues.includes(method),
      "Payout method should be either 'BANK' or 'CASH'",
    ),
});

export type generateQuoteSchema = z.infer<typeof generateQuoteSchema>;
