import { CurrencyCodes } from "../enums/currencyCodes.enum.ts";

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

export { getComplianceMaximum, checkForNameInList };
