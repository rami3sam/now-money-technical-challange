import currency from "currency.js";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../../enums/transferStatus.enum.ts";
import { Transfer } from "../../../models/transfer.ts";
import { EnvVariables } from "../../../constants/config.ts";
import type { TaskType } from "../../../models/task.ts";

export async function refundTransferWorker(task: TaskType & { id: string }) {
  const transferId = task.payload;

  const transfer = await Transfer.findById(transferId);
  if (!transfer) throw Error("Transfer not found");

  assertTransferStatusTransition(transfer.status as TransferStatus, TransferStatus.REFUNDED);
  transfer.stateHistory.push({ state: TransferStatus.REFUNDED });
  transfer.status = TransferStatus.REFUNDED;
  if (
    transfer.final?.paidAmount &&
    currency(transfer.final.paidAmount) > currency(0)
  ) {
    const feesCharged = currency(transfer.sendAmount).multiply(
      EnvVariables.CANCELLATION_FEE_PERCENTAGE,
    );

    const refundedAmount = currency(transfer.sendAmount).subtract(feesCharged);
    transfer.final = {
      ...transfer.final,
      refundedAmount: refundedAmount.value.toFixed(2),
      feesCharged: feesCharged.value.toFixed(2),
    };

    const updateTransfer = await Transfer.findOneAndUpdate(
      {
        _id: transferId,
        status: {
          $in: [
            TransferStatus.FAILED,
            TransferStatus.CANCELLED,
            TransferStatus.COMPLIANCE_REJECTED,
          ],
        },
      },
      { $set: transfer },
      { returnDocument: "after" },
    ).exec();
  }
}
