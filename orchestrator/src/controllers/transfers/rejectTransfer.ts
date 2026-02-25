import type { Request, Response } from "express";
import { Transfer } from "../../models/transfer.ts";
import { assertTransferStatusTransition, TransferStatus } from "../../enums/transferStatus.enum.ts";
import { ComplianceDecisions } from "../../enums/complianceDecisions.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import { addToTaskQueue } from "../../queues/taskQueue.ts";


export const rejectTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);
    if (!transfer) throw Error("Transfer not found");

    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_REJECTED,
    );
    transfer.status = TransferStatus.COMPLIANCE_REJECTED;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_REJECTED });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.REJECTED,
      triggeredRule: `Transfer rejected by manual review`,
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

    if(newTransfer) addToTaskQueue({
      taskHandler: TaskHandlers.REFUND_TRANSFER,
      payload: newTransfer.id
    });
    else throw new Error("Failed to update transfer status to COMPLIANCE_REJECTED");

    res.status(200).json({ newTransfer });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};