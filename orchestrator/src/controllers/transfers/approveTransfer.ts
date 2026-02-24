import type { Request, Response } from "express";
import { Transfer } from "../../models/transfer.ts";
import { assertTransferStatusTransition, TransferStatus } from "../../enums/transferStatus.enum.ts";
import { ComplianceDecisions } from "../../enums/complianceDecisions.ts";
import { addToTaskQueue } from "../../queues/taskQueue.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";

export const approveTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);
    if (!transfer) throw Error("Transfer not found");

    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_APPROVED,
    );
    transfer.status = TransferStatus.COMPLIANCE_APPROVED;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_APPROVED });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.APPROVED,
      triggeredRule: `Transfer approved by manual review`,
      reviewerId: "1",
    });

    const newTransfer = await Transfer.findOneAndUpdate(
      {
        _id: id,
        status: TransferStatus.COMPLIANCE_PENDING,
      },
      { $set: transfer },
      { returnDocument: "after" },
    ).exec();

    if (newTransfer)
      addToTaskQueue({
        taskHandler: TaskHandlers.INITIATE_PAYOUT,
        payload: newTransfer.id
      });
    else throw new Error("Failed to update transfer status to COMPLIANCE_APPROVED");

    res.status(200).json({ newTransfer });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}; 