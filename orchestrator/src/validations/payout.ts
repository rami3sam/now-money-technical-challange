import z from "zod";
import { CountryCodesValues } from "../enums/countryCodes.enum.ts";
import { PayoutMethodsValues } from "../enums/payoutMethods.enum.ts";
import { isValidMoney } from "../utils/validatorFunctions.ts";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.ts";
import { PayoutStatusValues } from "../enums/payoutStatus.enum.ts";

export const payoutSchema = z.array(
  z.object({
    sender: z.object({
      name: z.string().min(1),
    }),

    recipient: z.object({
      name: z.string().min(1),

      country: z.enum(CountryCodesValues),
      payoutMethod: z.enum(PayoutMethodsValues),

      payoutDetails: z
        .object({
          accountNumber: z.string().optional(),
          personalIDNumber: z.string().optional(),
          personalIDType: z.string().optional(),
        })
        .optional(),
    }),

    sendAmount: z.string().refine(isValidMoney, {
      message: "sendAmount must be a valid money string eg 100.00",
    }),

    payoutAmount: z.string().refine(isValidMoney, {
      message: "payoutAmount must be a valid money string eg 100.00",
    }),

    sendCurrency: z.enum(CurrencyCodesValues),

    payoutCurrency: z.enum(CurrencyCodesValues),

    payoutIdFromPartner: z.string().optional(),

    partnerPayoutId: z.string().optional(),

    payoutStatus: z.enum(PayoutStatusValues),
  }),
);

export type PayoutZodType = z.infer<typeof payoutSchema>;
