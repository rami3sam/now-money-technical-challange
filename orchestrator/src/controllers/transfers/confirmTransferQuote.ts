import type { Request, Response } from "express";
import { Transfer } from "../../models/transfer.ts";
import { assertTransferStatusTransition, TransferStatus } from "../../enums/transferStatus.enum.ts";
import { addToTaskQueue } from "../../queues/taskQueue.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";


export const confirmTransferQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);
    if (!transfer) throw Error("Transfer not found");

    if (transfer.status !== TransferStatus.QUOTED)
      throw Error("Transfer status is not quoted");

    if (
      transfer.quote?.expiry &&
      new Date(transfer.quote.expiry) > new Date()
    ) {
      transfer.immutableQuoteSnapshot = { ...transfer.quote };
      assertTransferStatusTransition(transfer.status, TransferStatus.CONFIRMED);
      transfer.status = TransferStatus.CONFIRMED;
      transfer.stateHistory.push({ state: TransferStatus.CONFIRMED });

      const newTransfer = await Transfer.findOneAndUpdate(
        { _id: id, status: TransferStatus.QUOTED },
        { $set: transfer },
        { returnDocument: "after" },
      ).exec();

      if (newTransfer)
        addToTaskQueue({
          taskHandler: TaskHandlers.CHECK_COMPLIANCE,
          payload: newTransfer.id
        });
      else throw Error("Failed to update transfer status to CONFIRMED");

      res.status(200).json({ newTransfer });
    } else {
      assertTransferStatusTransition(
        transfer.status,
        TransferStatus.QUOTE_EXPIRED,
      );
      transfer.status = TransferStatus.QUOTE_EXPIRED;
      transfer.stateHistory.push({ state: TransferStatus.QUOTE_EXPIRED });
      transfer.quote = null;
      const newTransfer = await Transfer.findOneAndUpdate(
        { _id: id, status: TransferStatus.QUOTED },
        { $set: transfer },
        { returnDocument: "after" },
      ).exec();

      if (newTransfer)
        addToTaskQueue({
          taskHandler: TaskHandlers.QUOTE_TRANSFER,
          payload: newTransfer.id
        });
      else throw Error("Failed to update transfer status to QUOTE_EXPIRED");

      throw Error("Quote has expired");
    }
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};