
import { z } from "zod";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.ts";
import { isValidMoney } from "../utils/validatorFunctions.ts";
import { CountryCodesValues } from "../enums/countryCodes.enum.ts";


export const generateQuoteSchema = z.object({
  destinationCountry: z.string().optional().refine((country) => country?.length === 3 && CountryCodesValues.includes(country), "Country should be 3 letter ISO Code"),
  sendAmount: z.string().min(1, "sendAmount is required").refine(isValidMoney, "sendAmount should be a valid money format (e.g., 100.00)"),
  sendCurrency: z.string().length(3).refine((currency) => CurrencyCodesValues.includes(currency), "Currency should be 3 letter ISO Code"),
  payoutCurrency: z.string().length(3).refine((currency) => CurrencyCodesValues.includes(currency), "Currency should be 3 letter ISO Code"),
})

export type generateQuoteSchema = z.infer<typeof generateQuoteSchema>