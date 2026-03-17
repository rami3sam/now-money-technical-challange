import { CurrencyCodes } from "../enums/currencyCodes.enum.js";

function getComplianceMaximum(currency: CurrencyCodes): number {
  switch (currency) {
    case CurrencyCodes.USD:
      return 1000;
    case CurrencyCodes.AED:
      return 3670;
    case CurrencyCodes.SAR:
      return 3750;
    case CurrencyCodes.EUR:
      return 920;
    case CurrencyCodes.GBP:
      return 800;
    case CurrencyCodes.JPY:
      return 150000;
    case CurrencyCodes.AUD:
      return 1450;
    case CurrencyCodes.CAD:
      return 1350;
    case CurrencyCodes.CHF:
      return 920;
    case CurrencyCodes.CNY:
      return 7000;
    default:
      return 1000; // default for any unknown or new currency
  }
}

function checkForNameInList(name: string, list: string[]): Boolean {
  const normalized = name.toLowerCase().replace(/\s+/g, " ").trim();
  return list.includes(normalized);
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export const getBackoffTime = (
  attempt: number = 1,
  baseDelay: number = 500,
  factor: number = 2,
  maxDelay: number = 10000,
) => {
  const exponential = baseDelay * Math.pow(factor, attempt - 1);
  const jitter = Math.random() * 100;
  return Math.min(exponential + jitter, maxDelay);
};



export { getComplianceMaximum, checkForNameInList };
