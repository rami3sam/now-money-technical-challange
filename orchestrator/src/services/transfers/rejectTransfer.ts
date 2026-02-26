import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { ComplianceDecisions } from "../../enums/complianceDecisions.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import { addToTaskQueue } from "../../queues/taskQueue.ts";
import type { TransferRepository } from "../../repositories/transfer.repository.ts";

export async function rejectTransfer(
  transferRepository: TransferRepository,
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

  transfer.status = TransferStatus.COMPLIANCE_REJECTED;
  transfer.complianceDecisions.push({
    decision: ComplianceDecisions.REJECTED,
    triggeredRule: `Transfer rejected by manual review`,
    reviewerId: reviewerId,
  });
  const updateTransfer = await transferRepository.updateTransfer(id, transfer);

  if (!updateTransfer)
    throw new Error("Failed to update transfer status to COMPLIANCE_REJECTED");

  addToTaskQueue({
    taskHandler: TaskHandlers.REFUND_TRANSFER,
    payload: updateTransfer.id,
  });
  return updateTransfer;
}
