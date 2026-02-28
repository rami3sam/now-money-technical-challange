import { CurrencyCodes } from "../enums/currencyCodes.enum.js";


// Mock data: Rates relative to 1 USD
const ratesToUSD: Record<string, number> = {
  // --- Majors ---
  [CurrencyCodes.USD]: 1.0,
  [CurrencyCodes.EUR]: 0.85,
  [CurrencyCodes.GBP]: 0.74,
  [CurrencyCodes.JPY]: 155.05,
  [CurrencyCodes.CAD]: 1.37,
  [CurrencyCodes.CHF]: 0.77,
  [CurrencyCodes.AUD]: 1.41,
  [CurrencyCodes.NZD]: 1.67,
  [CurrencyCodes.SEK]: 9.06,
  [CurrencyCodes.NOK]: 9.53,
  [CurrencyCodes.DKK]: 6.34,

  [CurrencyCodes.CNY]: 6.9,
  [CurrencyCodes.HKD]: 7.81,
  [CurrencyCodes.SGD]: 1.26,
  [CurrencyCodes.INR]: 90.73,
  [CurrencyCodes.KRW]: 1445.17,
  [CurrencyCodes.MYR]: 3.91,
  [CurrencyCodes.THB]: 31.1,
  [CurrencyCodes.IDR]: 15800.0,
  [CurrencyCodes.PHP]: 56.2,
  [CurrencyCodes.TWD]: 31.4,
  [CurrencyCodes.VND]: 25150.0,

  [CurrencyCodes.AED]: 3.67,
  [CurrencyCodes.SAR]: 3.75,
  [CurrencyCodes.QAR]: 3.64,
  [CurrencyCodes.ILS]: 3.12,
  [CurrencyCodes.EGP]: 49.2,
  [CurrencyCodes.ZAR]: 16.03,
  [CurrencyCodes.TRY]: 43.82,
  [CurrencyCodes.KWD]: 0.31,

  // --- Americas ---
  [CurrencyCodes.MXN]: 17.13,
  [CurrencyCodes.BRL]: 5.18,
  [CurrencyCodes.ARS]: 1243.37,
  [CurrencyCodes.CLP]: 866.9,
  [CurrencyCodes.COP]: 3920.0,
  [CurrencyCodes.PEN]: 3.72,
};

export function getFXRate(base: CurrencyCodes, counter: CurrencyCodes): number {
  const baseInUSD = ratesToUSD[base];
  const counterInUSD = ratesToUSD[counter];
  let rate: number
  
  if (!baseInUSD || !counterInUSD) {
    rate = 3; // Default FX rate for unsupported currencies
  }else{
    rate =  (1 / baseInUSD) * counterInUSD;
  }

  rate = rate * (Math.random() * (1.02 - 0.98) + 0.98);

   return parseFloat(rate.toFixed(2))
}

