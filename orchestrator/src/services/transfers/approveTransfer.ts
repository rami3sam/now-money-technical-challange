import { ComplianceDecisions } from "../../enums/complianceDecisions.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { Task } from "../../models/task.ts";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";
import { TasksService } from "../tasks.service.ts";

export async function approveTransfer(
  transfersRepository: TransfersRepository,
  taskSservice: TasksService,
  id: string,
  reviewerId: string,
) {
  if (!reviewerId) throw new Error("reviewerId query parameter is required");

  const transfer = await transfersRepository.findById(id);
  if (!transfer) throw Error("Transfer not found");

  assertTransferStatusTransition(
    transfer.status as TransferStatus,
    TransferStatus.COMPLIANCE_APPROVED,
  );

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
