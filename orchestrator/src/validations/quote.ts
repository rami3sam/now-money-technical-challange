import { z } from "zod";
import { PayoutMethods } from "../enums/payoutMethods.enum.ts";
import { PersonalIDTypesValues } from "../enums/personalIDTypes.enum.ts";
import { CountryCodesValues } from "../enums/countryCodes.enum.ts";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.ts";
import { isValidMoney, validateDate } from "../utils/validatorFunctions.ts";

export const quoteResponseSchema = z.object({
  fxRate: z
    .string()
    .refine(
      isValidMoney,
      "sendAmount should be a valid money format (e.g., 100.00)",
    ),
  feeAmount: z
    .string()
    .refine(
      isValidMoney,
      "sendAmount should be a valid money format (e.g., 100.00)",
    ),
  payoutAmount: z
    .string()
    .refine(
      isValidMoney,
      "sendAmount should be a valid money format (e.g., 100.00)",
    ),
  quoteExpiry: z
    .string()
    .refine(validateDate, "quoteExpiry should be a valid date string")
    .transform((str) => new Date(str)),
});

export type quoteResponseSchema = z.infer<typeof quoteResponseSchema>;
