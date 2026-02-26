import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { addToTaskQueue } from "../../queues/taskQueue.ts";
import type { TransferRepository } from "../../repositories/transfer.repository.ts";

export async function cancelTransfer(
  transferRepository: TransferRepository,
  id: string,
) {
  const transfer = await transferRepository.findById(id);
  if (!transfer) throw Error("Transfer not found");

  assertTransferStatusTransition(
    transfer.status as TransferStatus,
    TransferStatus.CANCELLED,
  );

  transfer.status = TransferStatus.CANCELLED;

  const updatedTransfer = await transferRepository.updateTransfer(id, transfer);

  if (!updatedTransfer)
    throw new Error("Failed to update transfer status to CANCELLED");

  addToTaskQueue({
    taskHandler: TaskHandlers.REFUND_TRANSFER,
    payload: updatedTransfer.id,
  });
  return updatedTransfer;
}
