import type { Request, Response } from "express";
import { createTransferSchema } from "../validations/createTransfer.ts";
import { PayoutMethods } from "../enums/payoutMethods.enum.ts";
import { errorMonitor } from "node:events";
import { Transfer } from "../models/transfer.ts";
import { TransferStatus } from "../enums/transferStatus.enum.ts";
import axios from "axios";
import { quoteResponseSchema } from "../validations/quote.ts";

const createTransfer = async (req: Request, res: Response) => {
  try {
    const transfer = createTransferSchema.parse(req.body);
    const {
      recipient,
      recipient: { payoutDetails, payoutMethod },
    } = transfer;

    const bankInfoNotOk =
      payoutMethod == PayoutMethods.Bank &&
      payoutDetails.accountNumber == undefined;

    const cashInfoNotOk =
      payoutMethod === PayoutMethods.Cash &&
      (payoutDetails.personalIDNumber === undefined ||
        payoutDetails.personalIDType === undefined);

    if (bankInfoNotOk || cashInfoNotOk)
      throw Error("You must specify recipient details correctly");

    const dbTransfer = new Transfer({
      ...transfer,
      status: TransferStatus.CREATED,
    });

    const quoteResponse = await axios.post("http://localhost:8001/quote", {
      sendAmount: transfer.sendAmount,
      sendCurrency: transfer.sendCurrency,
      payoutCurrency: transfer.payoutCurrency,
      destinationCountry: recipient.country,
      payoutMethod: recipient.payoutMethod,
    });

    const quote = quoteResponseSchema.parse(quoteResponse.data);
    
    dbTransfer.quote = {
      rate: quote.fxRate,
      fee: quote.feeAmount,
      payoutAmount: quote.payoutAmount,
      expiry: quote.quoteExpiry,
    };


    await dbTransfer.save();
    res.status(200).json(dbTransfer);
  } catch (err: any) {
    res.status(400).json(err.message);
  }
};

const getTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);
    if (!transfer) throw Error("Transfer not found");
    res.status(200).json({ transfer });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export { createTransfer, getTransfer };
