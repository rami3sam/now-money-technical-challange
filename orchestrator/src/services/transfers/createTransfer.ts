import { PayoutMethods } from "../../enums/payoutMethods.enum.js";
import { TransferStatus } from "../../enums/transferStatus.enum.js";
import { Transfer, type TransferType } from "../../models/transfer.js";
import type { TransfersRepository } from "../../repositories/transfers.repository.js";
import type { createTransferSchema } from "../../validations/createTransfer.js";

export async function createTransfer(
  transferRepository: TransfersRepository,
  createTransferType: createTransferSchema,
) {
  const bankInfoOk =
    createTransferType.recipient.payoutMethod == PayoutMethods.Bank &&
    createTransferType.recipient.payoutDetails?.accountNumber;

  const cashInfoOk =
    createTransferType.recipient.payoutMethod === PayoutMethods.Cash &&
    createTransferType.recipient.payoutDetails.personalIDNumber &&
    createTransferType.recipient.payoutDetails.personalIDType;

  if (!bankInfoOk && !cashInfoOk)
    throw Error("You must specify recipient details correctly");

  const transfer = new Transfer()
  transfer.sender = createTransferType.sender;
  // @ts-ignore
  transfer.recipient = createTransferType.recipient;
  transfer.sendAmount = createTransferType.sendAmount;
  transfer.sendCurrency = createTransferType.sendCurrency;
  transfer.payoutCurrency = createTransferType.payoutCurrency;
  transfer.status = TransferStatus.CREATED;

  const newTransfer = await transferRepository.create(transfer);
  if (!newTransfer) throw new Error("Failed to create transfer");

  return newTransfer;
}
