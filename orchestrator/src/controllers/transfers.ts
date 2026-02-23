import type { Request, Response } from "express";
import { createTransferSchema } from "../validations/createTransfer.ts";
import { PayoutMethods } from "../enums/payoutMethods.enum.ts";
import { Transfer, type TransferType } from "../models/transfer.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../enums/transferStatus.enum.ts";
import axios from "axios";
import { quoteResponseSchema } from "../validations/quote.ts";
import { LinkedQueue } from "../utils/queue.ts";
import { addToTransferQueue } from "../queues/transferQueue.ts";

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

    await dbTransfer.save();

    addToTransferQueue(dbTransfer.id);

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

const confirmTransferQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);

    if (!transfer) throw Error("Transfer not found");

    if (transfer.status !== TransferStatus.QUOTED)
      throw Error("Transfer status is not quoted");

    if (transfer.quote?.expiry && new Date(transfer.quote.expiry) < new Date())
      throw Error("Quote has expired");

    transfer.immutableQuoteSnapshot = { ...transfer.quote };
    assertTransferStatusTransition(transfer.status, TransferStatus.CONFIRMED);
    transfer.status = TransferStatus.CONFIRMED;

    const newTransfer = await Transfer.findOneAndUpdate(
      { _id: id, status: TransferStatus.QUOTED },
      { $set: transfer },
      { returnDocument: "after" },
    ).exec();

    res.status(200).json({ newTransfer });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export { createTransfer, getTransfer, confirmTransferQuote };
