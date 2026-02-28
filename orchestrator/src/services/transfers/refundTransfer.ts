import currency from "currency.js";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { EnvVariables } from "../../constants/config.ts";
import { Transfer } from "../../models/transfer.ts";

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

  if (!transfer.final?.paidAmount) throw new Error("No paid amount to refund");

  if (
    transfer.final?.paidAmount &&
    currency(transfer.final.paidAmount) > currency(0)
  ) {
    const feesCharged = [
      TransferStatus.FAILED,
      TransferStatus.COMPLIANCE_REJECTED,
    ].includes(transfer.status as TransferStatus)
      ? currency(0)
      : currency(transfer.sendAmount).multiply(
          EnvVariables.CANCELLATION_FEE_PERCENTAGE,
        );

    const refundedAmount = currency(transfer.sendAmount).subtract(feesCharged);

    const refundedAmountFormatted = refundedAmount.value.toFixed(2);
    const feesChargedFormatted = feesCharged.value.toFixed(2);

    const updateTransfer = await transfersRepository.refundTransfer(
      id,
      refundedAmountFormatted,
      feesChargedFormatted,
    );

    if (!updateTransfer)
      throw new Error("Failed to update transfer after refund");

    return updateTransfer;
  }
}
