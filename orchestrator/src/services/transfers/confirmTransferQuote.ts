import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";
import { Task } from "../../models/task.ts";
import type { TasksService } from "../tasks.service.ts";

export async function confirmTransferQuote(
  transferRepository: TransfersRepository,
  tasksService: TasksService,
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

    tasksService.add(
      new Task({
        taskHandler: TaskHandlers.CHECK_COMPLIANCE,
        payload: updatedTransfer.id,
      }),
    );
    return updatedTransfer;
  } else {
    throw Error("Quote has expired");
  }
}
