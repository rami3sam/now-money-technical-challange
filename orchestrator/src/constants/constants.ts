import { CountryCodes } from "../enums/countryCodes.enum.ts";
import { CurrencyCodes } from "../enums/currencyCodes.enum.ts";

const bannedCountries: string[] = [
  CountryCodes.IRN,
  CountryCodes.PRK,
  CountryCodes.SYR,
  CountryCodes.SDN,
  CountryCodes.CUB,
];

export { bannedCountries };
