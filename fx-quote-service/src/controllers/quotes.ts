import type { Request, Response } from "express";
import { generateQuoteSchema } from "../validations/genearteQuote.ts";
import currency from "currency.js";
import { getFXRate } from "../utils/provideFakeConversion.ts";
import type { CurrencyCodes } from "../enums/currencyCodes.enum.ts";

const generateQuote = (req: Request, res: Response) => {
  try {
    const fxInfo = generateQuoteSchema.parse(req.body);
    const fxRate: number = getFXRate(
      fxInfo.sendCurrency as CurrencyCodes,
      fxInfo.payoutCurrency as CurrencyCodes,
    );
    const feePercentage: number = 0.025;
    const feeAmount: currency = currency(fxInfo.sendAmount).multiply(
      feePercentage,
    );
    const payoutAmount: currency = currency(fxInfo.sendAmount)
      .subtract(feeAmount)
      .multiply(fxRate);
      
    const quoteExpiry = new Date(Date.now() + 60 * 1000);
    res.status(200).json({ fxRate, feeAmount, payoutAmount, quoteExpiry });
  } catch (err: any) {
    res.status(400).json(err.message);
  }
};

export { generateQuote };
