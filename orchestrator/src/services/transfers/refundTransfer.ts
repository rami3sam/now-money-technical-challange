import currency from "currency.js";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { EnvVariables } from "../../constants/config.ts";

export async function refundTransfer(
  transfersRepository: TransfersRepository,
  id: string,
) {
  const transfer = await transfersRepository.findById(id);
  if (!transfer) throw Error("Transfer not found");

  assertTransferStatusTransition(
    transfer.status as TransferStatus,
    TransferStatus.REFUNDED,
  );

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

    const updateTransfer = await transfersRepository.updateTransfer(
      transfer.id,
      transfer,
    );

    if (!updateTransfer)
      throw new Error("Failed to update transfer after refund");
  }
}
