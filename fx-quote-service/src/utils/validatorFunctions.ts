import { CurrencyCodesValues } from "../enums/currencyCodes.enum.js";

export function isValidMoney(value: string): boolean {
  const moneyRegex = /^\d+(\.\d{1,2})?$/;
  return moneyRegex.test(value);
}

export function isValidCurrency(currency: string): boolean {
  return CurrencyCodesValues.includes(currency);
}
