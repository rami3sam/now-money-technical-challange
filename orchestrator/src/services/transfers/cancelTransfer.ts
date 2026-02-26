import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { Task } from "../../models/task.ts";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";
import type { TasksService } from "../tasks.service.ts";

export async function cancelTransfer(
  transferRepository: TransfersRepository,
  tasksService: TasksService,
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

  tasksService.add(
    new Task({
      taskHandler: TaskHandlers.REFUND_TRANSFER,
      payload: updatedTransfer.id,
    }),
  );
  return updatedTransfer;
}
