import currency from "currency.js";
import { TaskHandlers } from "../../enums/taskHandlers.enum.js";
import { Task } from "../../models/task.js";
import type { TransfersRepository } from "../../repositories/transfers.repository.js";
import type { TasksService } from "../tasks.service.js";

export async function cancelTransfer(
  transferRepository: TransfersRepository,
  tasksService: TasksService,
  id: string,
) {
  const transfer = await transferRepository.findById(id);
  if (!transfer) throw Error("Transfer not found");

  const updatedTransfer = await transferRepository.markTransferAsCancelled(id);

  if (!updatedTransfer)
    throw new Error("Failed to update transfer status to CANCELLED");

  if (
    updatedTransfer.final?.paidAmount &&
    currency(updatedTransfer.final?.paidAmount).value > 0
  ) {
    tasksService.add(
      new Task({
        taskHandler: TaskHandlers.REFUND_TRANSFER,
        payload: updatedTransfer.id,
      }),
    );
  }
  return updatedTransfer;
}
