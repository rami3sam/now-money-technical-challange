import { Transfer } from "../../models/transfer.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import type { Request, Response } from "express";
import axios from "axios";
import { quoteResponseSchema } from "../../validations/quote.ts";

export const quoteTransfer = async (req: Request, res: Response) => {
  try {
    const transferId = req.params.id;
    const transfer = await Transfer.findById(transferId);
    if (!transfer) throw Error(`Transfer with id ${transferId} not found`);

    const { recipient } = transfer;
    const quoteResponse = await axios.post("http://localhost:8001/quote", {
      sendAmount: transfer.sendAmount,
      sendCurrency: transfer.sendCurrency,
      payoutCurrency: transfer.payoutCurrency,
      destinationCountry: recipient!.country,
      payoutMethod: recipient!.payoutMethod,
    });

    const quote = quoteResponseSchema.parse(quoteResponse.data);

    transfer.quote = {
      rate: quote.fxRate,
      fee: quote.feeAmount,
      payoutAmount: quote.payoutAmount,
      expiry: quote.quoteExpiry,
    };

    assertTransferStatusTransition(transfer.status, TransferStatus.QUOTED);
    transfer.status = TransferStatus.QUOTED;
    transfer.stateHistory.push({ state: TransferStatus.QUOTED });

    const updatedTransfer = await Transfer.findOneAndUpdate(
      {
        _id: transfer.id,
        status: { $in: [TransferStatus.CREATED, TransferStatus.QUOTED] },
      },
      transfer,
      { returnDocument: "after" },
    ).exec();

    if (!updatedTransfer)
      throw Error(
        `Failed to update transfer with id ${transferId} to QUOTED status`,
      );

    res.status(200).json({ updatedTransfer });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
