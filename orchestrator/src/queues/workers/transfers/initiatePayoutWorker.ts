import {v7 as uuidv7} from "uuid";
import { assertTransferStatusTransition, TransferStatus } from "../../../enums/transferStatus.enum.ts";
import { Transfer } from "../../../models/transfer.ts";
import axios from "axios";
import { payoutStatusSchema } from "../../../validations/payoutStatus.ts";
import type { TaskType } from "../../../models/task.ts";


export async function initaitePayoutWorker(task: TaskType & { id: string }) {
  const transferId = task.payload
  const transfer = await Transfer.findById(transferId);
  if (!transfer) throw Error(`Transfer with id ${transferId} not found`);

  const { recipient } = transfer;
  if (!recipient) throw Error("Transfer recipient not found");

  assertTransferStatusTransition(
    transfer.status,
    TransferStatus.PAYOUT_PENDING,
  );

  transfer.status = TransferStatus.PAYOUT_PENDING;
  transfer.stateHistory.push({ state: TransferStatus.PAYOUT_PENDING });
  transfer.payoutId = uuidv7()
  const newTransfer = await Transfer.findOneAndUpdate(
    { _id: transfer.id, status: TransferStatus.COMPLIANCE_APPROVED },
    { $set: transfer },
  ).exec();

  if (!newTransfer)
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

  const payoutFromPartner = payoutStatusSchema.parse(payoutResponse.data);

  await Transfer.findOneAndUpdate(
    { _id: transfer.id, status: TransferStatus.PAYOUT_PENDING },
    { $set: { partnerPayoutId: payoutFromPartner.partnerPayoutId } },
  ).exec();
}
