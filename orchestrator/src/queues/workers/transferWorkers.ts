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
import {
  CurrencyCodes,
  getCurrencyEnum,
} from "../../enums/currencyCodes.enum.ts";
import currency from "currency.js";

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

  await Transfer.findOneAndUpdate(
    { _id: transfer.id, status: TransferStatus.CREATED },
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
    const newTransfer = await Transfer.findOneAndUpdate(
      { _id: transfer.id, status: TransferStatus.CONFIRMED },
      { $set: transfer },
    ).exec();

    if (!newTransfer)
      throw new Error(
        "Failed to update transfer status to COMPLIANCE_APPROVED",
      );
  } else {
    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_PENDING,
    );

    transfer.status = TransferStatus.COMPLIANCE_PENDING;
    const newTransfer = await Transfer.findOneAndUpdate(
      { _id: transfer.id, status: TransferStatus.CONFIRMED },
      { $set: transfer },
    ).exec();

    if (!newTransfer)
      throw new Error("Failed to update transfer status to COMPLIANCE_PENDING");
  }
}
