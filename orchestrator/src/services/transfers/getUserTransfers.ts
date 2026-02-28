import type { TransfersRepository } from "../../repositories/transfers.repository.js";

export async function getUserTransfers(
  transferRepository: TransfersRepository,
  senderId: string,
) {
  if (!senderId) throw Error("You must provide a sender id");
  const transfers = await transferRepository.findBySenderId(senderId);
  if (!transfers) throw Error("No transfers with this used id");
  return transfers;
}
