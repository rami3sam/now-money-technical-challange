import type { TransferRepository } from "../../repositories/transfer.repository.ts";

export async function getUserTransfers(
  transferRepository: TransferRepository,
  senderId: string,
) {
  if (!senderId) throw Error("You must provide a sender id");
  const transfers = await transferRepository.findBySenderId(senderId);
  if (!transfers) throw Error("No transfers with this used id");
  return transfers;
}
