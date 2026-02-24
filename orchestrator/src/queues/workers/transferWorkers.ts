import axios from "axios";
import { Transfer } from "../../models/transfer.ts";
import { quoteResponseSchema } from "../../validations/quote.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { bannedCountries, bannedPeople } from "../../constants/constants.ts";
import {
  checkForNameInList,
  getComplianceMaximum,
} from "../../utils/utilFunctions.ts";
import { CurrencyCodes } from "../../enums/currencyCodes.enum.ts";
import currency from "currency.js";
import { ComplianceDecisions } from "../../enums/complianceDecisions.ts";
import { v7 as uuidv7 } from "uuid";
import { addToTransferQueue } from "../transferQueue.ts";
import { sensitiveHeaders } from "node:http2";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";

export async function quoteTransferWorker(transferId: string) {
  const transfer = await Transfer.findById(transferId);
  if (!transfer) throw Error(`Transfer with id ${transferId} not found`);

  const { recipient } = transfer;
  const quoteResponse = await axios.post("http://localhost:8001/quote", {
    sendAmount: transfer.sendAmount,
    sendCurrency: transfer.sendCurrency,
    payoutCurrency: transfer.payoutCurrency,
    destinationCountry: recipient!.country,
    payoutMethod: recipient!.payoutMethod,
  });

  const quote = quoteResponseSchema.parse(quoteResponse.data);

  transfer.quote = {
    rate: quote.fxRate,
    fee: quote.feeAmount,
    payoutAmount: quote.payoutAmount,
    expiry: quote.quoteExpiry,
  };

  assertTransferStatusTransition(transfer.status, TransferStatus.QUOTED);
  transfer.status = TransferStatus.QUOTED;
  transfer.stateHistory.push({ state: TransferStatus.QUOTED });

  await Transfer.findOneAndUpdate(
    {
      _id: transfer.id,
      status: { $in: [TransferStatus.CREATED, TransferStatus.QUOTE_EXPIRED] },
    },
    transfer,
  ).exec();
}

export async function checkTransferCompliance(transferId: string) {
  const transfer = await Transfer.findById(transferId);
  if (!transfer) throw Error(`Transfer with id ${transferId} not found`);

  const { recipient } = transfer;
  if (!recipient) throw Error("Transfer recipient not found");

  if (bannedCountries.includes(recipient.country)) {
    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_REJECTED,
    );

    transfer.status = TransferStatus.COMPLIANCE_REJECTED;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_REJECTED });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.REJECTED,
      triggeredRule: `Recipient country ${recipient.country} is banned`,
    });

    const newTransfer = await Transfer.findOneAndUpdate(
      { _id: transfer.id, status: TransferStatus.CONFIRMED },
      { $set: transfer },
    ).exec();

    if (!newTransfer)
      throw new Error(
        "Failed to update transfer status to COMPLIANCE_REJECTED",
      );
  } else if (checkForNameInList(recipient.name, bannedPeople)) {
    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_PENDING,
    );

    transfer.status = TransferStatus.COMPLIANCE_PENDING;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_PENDING });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.PENDING,
      triggeredRule: `Recipient name ${recipient.name} is banned`,
    });
    const newTransfer = await Transfer.findOneAndUpdate(
      { _id: transfer.id, status: TransferStatus.CONFIRMED },
      { $set: transfer },
    ).exec();

    if (!newTransfer)
      throw new Error("Failed to update transfer status to COMPLIANCE_PENDING");
  } else if (
    currency(transfer.sendAmount) <
    currency(getComplianceMaximum(transfer.sendCurrency as CurrencyCodes))
  ) {
    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_APPROVED,
    );

    transfer.status = TransferStatus.COMPLIANCE_APPROVED;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_APPROVED });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.APPROVED,
      triggeredRule: `amount ${transfer.sendAmount} is below compliance threshold`,
    });
    const newTransfer = await Transfer.findOneAndUpdate(
      { _id: transfer.id, status: TransferStatus.CONFIRMED },
      { $set: transfer },
    ).exec();

    if (!newTransfer)
      throw new Error(
        "Failed to update transfer status to COMPLIANCE_APPROVED",
      );

    addToTransferQueue(
     { taskHandler: TaskHandlers.INITIATE_PAYOUT,
      payload: newTransfer.id}
    );

  } else {
    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_PENDING,
    );

    transfer.status = TransferStatus.COMPLIANCE_PENDING;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_PENDING });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.PENDING,
      triggeredRule: `amount ${transfer.sendAmount} is above compliance threshold`,
    });
    const newTransfer = await Transfer.findOneAndUpdate(
      { _id: transfer.id, status: TransferStatus.CONFIRMED },
      { $set: transfer },
    ).exec();

    if (!newTransfer)
      throw new Error("Failed to update transfer status to COMPLIANCE_PENDING");
  }
}

export async function initaitePayout(transferId: string) {
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
  transfer.payoutId = uuidv7();
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
}
