import { PayoutMethods } from "../../enums/payoutMethods.enum.ts";
import { TransferStatus } from "../../enums/transferStatus.enum.ts";
import { Transfer, type TransferType } from "../../models/transfer.ts";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";

export async function createTransfer(
  transferRepository: TransfersRepository,
  transfer: TransferType,
) {
  const bankInfoOk =
    transfer.recipient.payoutMethod == PayoutMethods.Bank &&
    transfer.recipient.payoutDetails?.accountNumber;

  const cashInfoOk =
    transfer.recipient.payoutMethod === PayoutMethods.Cash &&
    transfer.recipient.payoutDetails.personalIDNumber &&
    transfer.recipient.payoutDetails.personalIDType;

  if (!bankInfoOk && !cashInfoOk)
    throw Error("You must specify recipient details correctly");
  console.log("Creating transfer with data:", transfer);

  transfer.status = TransferStatus.CREATED;

  const newTransfer = await transferRepository.create(transfer);
  if (!newTransfer) throw new Error("Failed to create transfer");

  return newTransfer;
}
