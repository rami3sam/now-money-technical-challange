import { ComplianceDecisions } from "../../enums/complianceDecisions.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { addToTaskQueue } from "../../queues/taskQueue.ts";
import type { TransferRepository } from "../../repositories/transfer.repository.ts";

export async function approveTransfer(
  transferRepository: TransferRepository,
  id: string,
  reviewerId: string,
) {
  if (!reviewerId) throw new Error("reviewerId query parameter is required");

  const transfer = await transferRepository.findById(id);
  if (!transfer) throw Error("Transfer not found");

  assertTransferStatusTransition(
    transfer.status as TransferStatus,
    TransferStatus.COMPLIANCE_APPROVED,
  );

  transfer.status = TransferStatus.COMPLIANCE_APPROVED;

  transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_APPROVED });
  transfer.complianceDecisions.push({
    decision: ComplianceDecisions.APPROVED,
    triggeredRule: `Transfer approved by manual review`,
    reviewerId: reviewerId,
  });

  const updatedTransfer = await transferRepository.updateTransfer(id, transfer);

  if (!updatedTransfer)
    throw new Error("Failed to update transfer status to COMPLIANCE_APPROVED");

  addToTaskQueue({
    taskHandler: TaskHandlers.INITIATE_PAYOUT,
    payload: updatedTransfer.id,
  });
  return updatedTransfer;
}
