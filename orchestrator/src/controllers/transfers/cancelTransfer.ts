import type { Request, Response } from "express";
import { Transfer } from "../../models/transfer.ts";
import { assertTransferStatusTransition, TransferStatus } from "../../enums/transferStatus.enum.ts";
import { addToTaskQueue } from "../../queues/taskQueue.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";


export const cancelTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);
    if (!transfer) throw Error("Transfer not found");

    assertTransferStatusTransition(transfer.status, TransferStatus.CANCELLED);
    transfer.stateHistory.push({ state: TransferStatus.CANCELLED });
    transfer.status = TransferStatus.CANCELLED;
    const newTransfer = await Transfer.findOneAndUpdate(
      {
        _id: id,
        status: {
          $in: [
            TransferStatus.CREATED,
            TransferStatus.QUOTED,
            TransferStatus.CONFIRMED,
          ],
        },
      },
      { $set: transfer },
      { returnDocument: "after" },
    ).exec();
    if (newTransfer)
      addToTaskQueue({
        taskHandler: TaskHandlers.CANCEL_TRANSFER,
        payload: newTransfer.id
      });
    else throw new Error("Failed to update transfer status to CANCELLED");

    res.status(200).json({ newTransfer });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};