import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../../enums/transferStatus.enum.ts";
import { Transfer } from "../../../models/transfer.ts";
import type { TaskType } from "../../../models/task.ts";
import { addToTaskQueue } from "../../taskQueue.ts";
import { TaskHandlers } from "../../../enums/taskHandlers.enum.ts";

export async function markTransferFailedWorker(
  task: TaskType & { id: string },
) {
  const transferId = task.payload;

  const transfer = await Transfer.findById(transferId);
  if (!transfer) throw Error("Transfer not found");

  assertTransferStatusTransition(transfer.status, TransferStatus.FAILED);
  transfer.stateHistory.push({ state: TransferStatus.FAILED });
  transfer.status = TransferStatus.FAILED;

  const updateTransfer = await Transfer.findOneAndUpdate(
    {
      _id: transferId,
      status: {
        $in: [
          TransferStatus.CREATED,
          TransferStatus.QUOTED,
          TransferStatus.COMPLIANCE_REJECTED,
        ],
      },
    },
    { $set: transfer },
    { returnDocument: "after" },
  ).exec();

  if (updateTransfer) {
    addToTaskQueue({
      taskHandler: TaskHandlers.REFUND_TRANSFER,
      payload: transferId,
    });
  } else throw Error("Failed to update transfer status to FAILED");
}
