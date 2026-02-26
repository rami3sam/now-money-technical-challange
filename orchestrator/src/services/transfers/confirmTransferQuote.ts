import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { addToTaskQueue } from "../../queues/taskQueue.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import type { TransferRepository } from "../../repositories/transfer.repository.ts";

export async function confirmTransferQuote(
  transferRepository: TransferRepository,
  id: string,
) {
  const transfer = await transferRepository.findById(id);
  if (!transfer) throw Error("Transfer not found");

  if (transfer.status !== TransferStatus.QUOTED)
    throw Error(`Transfer status is ${transfer.status} not QUOTED`);

  if (transfer.quote?.expiry && new Date(transfer.quote.expiry) > new Date()) {
    transfer.immutableQuoteSnapshot = { ...transfer.quote };
    assertTransferStatusTransition(transfer.status, TransferStatus.CONFIRMED);
    transfer.status = TransferStatus.CONFIRMED;
    transfer.final = { ...transfer.final, paidAmount: transfer.sendAmount };

    const updatedTransfer = await transferRepository.updateTransfer(
      id,
      transfer,
    );

    if (!updatedTransfer)
      throw Error("Failed to update transfer status to CONFIRMED");

    addToTaskQueue({
      taskHandler: TaskHandlers.CHECK_COMPLIANCE,
      payload: updatedTransfer.id,
    });
    return updatedTransfer;
  } else {
    throw Error("Quote has expired");
  }
}
