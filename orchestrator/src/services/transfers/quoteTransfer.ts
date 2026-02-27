import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import axios from "axios";
import { quoteResponseSchema } from "../../validations/quote.ts";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";

export async function quoteTransfer(
  transferRepository: TransfersRepository,
  id: string,
) {
  const transfer = await transferRepository.findById(id);
  if (!transfer) throw Error(`Transfer with id ${id} not found`);

  const { recipient } = transfer;

  const Response = await axios.post("http://localhost:8001/quote", {
    sendAmount: transfer.sendAmount,
    sendCurrency: transfer.sendCurrency,
    payoutCurrency: transfer.payoutCurrency,
    destinationCountry: recipient.country,
    payoutMethod: recipient.payoutMethod,
  });

  const validatedQuote = quoteResponseSchema.parse(Response.data);

  const quote = {
    rate: validatedQuote.fxRate,
    fee: validatedQuote.feeAmount,
    payoutAmount: validatedQuote.payoutAmount,
    expiry: validatedQuote.quoteExpiry,
  };

  assertTransferStatusTransition(
    transfer.status as TransferStatus,
    TransferStatus.QUOTED,
  );

  const updatedTransfer = await transferRepository.updateTransferQuote(
    transfer.id,
    quote,
  );

  if (!updatedTransfer)
    throw Error(`Failed to update transfer with id ${id} to QUOTED status`);

  return updatedTransfer;
}
