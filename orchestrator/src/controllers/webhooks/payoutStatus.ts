import type { Request, Response } from "express";
import { Transfer } from "../../models/transfer.ts";
import { payoutStatusSchema } from "../../validations/payoutStatus.ts";
import { PayoutStatus } from "../../enums/payoutStatus.enum.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { addToTaskQueue } from "../../queues/taskQueue.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";

const payoutStatus = async (req: Request, res: Response) => {
  try {
    const payoutStatusRequest = payoutStatusSchema.parse(req.body);
    const transfer = await Transfer.findOne({
      partnerPayoutId: payoutStatusRequest.partnerPayoutId,
    }).exec();
    if (!transfer) throw Error("Transfer not found");

    if (payoutStatusRequest.status === PayoutStatus.PAID) {
      assertTransferStatusTransition(transfer.status, TransferStatus.PAID);
      transfer.status = TransferStatus.PAID;
      transfer.stateHistory.push({ state: TransferStatus.PAID });

      const newTransfer = await Transfer.findOneAndUpdate(
        { _id: transfer._id, status: TransferStatus.PAYOUT_PENDING },
        {
          status: TransferStatus.PAID,
          stateHistory: transfer.stateHistory,
        },
      ).exec();

      if (!newTransfer)
        throw new Error("Failed to update transfer status to PAID");
    } else if (payoutStatusRequest.status === PayoutStatus.FAILED) {
      assertTransferStatusTransition(transfer.status, TransferStatus.FAILED);
      transfer.status = TransferStatus.FAILED;
      transfer.stateHistory.push({ state: TransferStatus.FAILED });

      const updateTransfer = await Transfer.findOneAndUpdate(
        { _id: transfer._id, status: TransferStatus.PAYOUT_PENDING },
        {
          status: TransferStatus.FAILED,
          stateHistory: transfer.stateHistory,
        },
      ).exec();

      if (updateTransfer)
        addToTaskQueue({
          taskHandler: TaskHandlers.REFUND_TRANSFER,
          payload: updateTransfer.id,
        });
      else throw new Error("Failed to update transfer status to FAILED");
    }

    res.status(200).json({ STATUS: "OK" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export { payoutStatus };
