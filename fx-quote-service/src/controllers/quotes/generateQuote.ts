import type { Request, Response } from "express";
import { generateQuoteSchema } from "../../validations/genearteQuote.js";
import currency from "currency.js";
import { getFXRate } from "../../utils/provideFakeConversion.js";
import type { CurrencyCodes } from "../../enums/currencyCodes.enum.js";
import { Quote } from "../../models/quotes.js";
import { quoteExpiryTimeInSeconds } from "../../constants/constants.js";

const generateQuote = async (req: Request, res: Response) => {
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

    const quoteExpiry = new Date(Date.now() + quoteExpiryTimeInSeconds);
    const returnQuote = {
      fxRate: fxRate.toString(),
      feeAmount: feeAmount.toString(),
      payoutAmount: payoutAmount.toString(),
      quoteExpiry,
    };
    const quote = new Quote({
      ...fxInfo,
      ...returnQuote,
    });

    await quote.save();
    res.status(200).json({ ...returnQuote });
  } catch (err: any) {
    res.status(400).json(err.message);
  }
};

export { generateQuote };
