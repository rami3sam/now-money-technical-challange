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

  assertTransferStatusTransition(
    transfer.status as TransferStatus,
    TransferStatus.QUOTED,
  );
  transfer.status = TransferStatus.QUOTED;

  const updatedTransfer = await transferRepository.updateTransfer(
    transfer.id,
    transfer,
  );

  if (!updatedTransfer)
    throw Error(`Failed to update transfer with id ${id} to QUOTED status`);

  return updatedTransfer;
}
