import { CurrencyCodesValues } from "../enums/currencyCodes.enum.ts";

export function isValidCurrency(currency: string) {
  CurrencyCodesValues.includes(currency);
}
