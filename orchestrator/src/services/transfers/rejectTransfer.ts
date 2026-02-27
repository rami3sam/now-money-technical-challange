import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { ComplianceDecisions } from "../../enums/complianceDecisions.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";
import { Task } from "../../models/task.ts";
import type { TasksService } from "../tasks.service.ts";

export async function rejectTransfer(
  transferRepository: TransfersRepository,
  tasksService: TasksService,
  id: string,
  reviewerId: string,
) {
  if (!reviewerId) throw new Error("reviewerId query parameter is required");
  const transfer = await transferRepository.findById(id);
  if (!transfer) throw Error("Transfer not found");

  assertTransferStatusTransition(
    transfer.status as TransferStatus,
    TransferStatus.COMPLIANCE_REJECTED,
  );

  const updateTransfer = await transferRepository.markTransferAsRejected(
    id,
    `Transfer rejected by manual review`,
    reviewerId,
  );

  if (!updateTransfer)
    throw new Error("Failed to update transfer status to COMPLIANCE_REJECTED");

  tasksService.add(
    new Task({
      taskHandler: TaskHandlers.REFUND_TRANSFER,
      payload: updateTransfer.id,
    }),
  );

  return updateTransfer;
}
