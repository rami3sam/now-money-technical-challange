import { CountryCodes } from "../enums/countryCodes.enum.js";

const bannedCountries: string[] = [
  CountryCodes.IRN,
  CountryCodes.PRK,
  CountryCodes.SYR,
  CountryCodes.SDN,
  CountryCodes.CUB,
];

const bannedPeople: string[] = ["Osama Bin Laden", "Adolf Hitler"].map((name) =>
  name.toLowerCase().replace(/\s+/g, " ").trim(),
);

export { bannedCountries, bannedPeople };
