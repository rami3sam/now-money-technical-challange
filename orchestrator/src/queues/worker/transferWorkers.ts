import axios from "axios";
import { Transfer } from "../../models/transfer.ts";
import { quoteResponseSchema } from "../../validations/quote.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";

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
