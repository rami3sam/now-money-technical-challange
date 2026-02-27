import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";
import { v7 as uuidv7 } from "uuid";
import { PayoutStatusType } from "../../validations/payoutStatus.ts";
import axios from "axios";
export async function initiatePayout(
  transfersRepository: TransfersRepository,
  id: string,
) {
  const transfer = await transfersRepository.findById(id);
  if (!transfer) throw Error(`Transfer with id ${id} not found`);

  const { recipient } = transfer;
  if (!recipient) throw Error("Transfer recipient not found");

  assertTransferStatusTransition(
    transfer.status as TransferStatus,
    TransferStatus.PAYOUT_PENDING,
  );

  transfer.status = TransferStatus.PAYOUT_PENDING;
  transfer.payoutId = uuidv7();
  const updateTransfer = await transfersRepository.markPayoutPending(
    transfer.id,
    transfer.payoutId,
  );

  if (!updateTransfer)
    throw new Error("Failed to update transfer status to PAYOUT_PENDING");

  const payout = {
    payoutId: transfer.payoutId,
    sendAmount: transfer.sendAmount,
    sendCurrency: transfer.sendCurrency,
    payoutAmount: transfer.quote!.payoutAmount,
    payoutCurrency: transfer.payoutCurrency,
    destinationCountry: recipient.country,
    sender: { name: transfer.sender!.name },
    recipient: {
      name: recipient.name,
      country: recipient.country,
      payoutMethod: recipient.payoutMethod,
      payoutDetails: recipient.payoutDetails,
    },
  };

  const payoutResponse = await axios.post(
    "http://localhost:8002/partner/payouts",
    payout,
  );

  const payoutFromPartner = PayoutStatusType.parse(payoutResponse.data);

  const updatedTransfer = await transfersRepository.updatePartnerPayoutId(
    transfer.id,
    payoutFromPartner.partnerPayoutId,
  );

  if (!updatedTransfer)
    throw new Error(
      "Failed to update transfer with partner payout id after initiating payout",
    );
}
