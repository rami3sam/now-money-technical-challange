import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.js";
import { TaskHandlers } from "../../enums/taskHandlers.enum.js";
import type { TransfersRepository } from "../../repositories/transfers.repository.js";
import { Task } from "../../models/task.js";
import type { TasksService } from "../tasks.service.js";

export async function confirmTransferQuote(
  transfersRepository: TransfersRepository,
  tasksService: TasksService,
  id: string,
) {
  const transfer = await transfersRepository.findById(id);
  if (!transfer) throw Error("Transfer not found");

  if (transfer.status !== TransferStatus.QUOTED)
    throw Error(`Transfer status is ${transfer.status} not QUOTED`);

  if (transfer.quote?.expiry && new Date(transfer.quote.expiry) > new Date()) {
    assertTransferStatusTransition(transfer.status, TransferStatus.CONFIRMED);

    const updatedTransfer =
      await transfersRepository.markTransferAsConfirmed(id);

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
