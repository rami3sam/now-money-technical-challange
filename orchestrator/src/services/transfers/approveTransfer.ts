import { ComplianceDecisions } from "../../enums/complianceDecisions.js";
import { TaskHandlers } from "../../enums/taskHandlers.enum.js";
import { TransferStatus } from "../../enums/transferStatus.enum.js";
import { Task } from "../../models/task.js";
import type { TransfersRepository } from "../../repositories/transfers.repository.js";
import { TasksService } from "../tasks.service.js";

export async function approveTransfer(
  transfersRepository: TransfersRepository,
  taskSservice: TasksService,
  id: string,
  reviewerId: string,
) {
  if (!reviewerId) throw new Error("reviewerId query parameter is required");

  const transfer = await transfersRepository.findById(id);
  if (!transfer) throw Error("Transfer not found");

  transfer.status = TransferStatus.COMPLIANCE_APPROVED;
  const decision = reviewerId
    ? ComplianceDecisions.APPROVED_MANUALLY
    : ComplianceDecisions.APPROVED_AUTOMATICALLY;

  const complianceDecision = {
    decision: decision,
    triggeredRule: `Transfer approved by manual review`,
    reviewerId: reviewerId,
  };

  const updatedTransfer = await transfersRepository.markTransferAsApproved(
    id,
    complianceDecision,
  );

  if (!updatedTransfer)
    throw new Error("Failed to update transfer status to COMPLIANCE_APPROVED");

  taskSservice.add(
    new Task({
      taskHandler: TaskHandlers.INITIATE_PAYOUT,
      payload: updatedTransfer.id,
    }),
  );
  return updatedTransfer;
}
