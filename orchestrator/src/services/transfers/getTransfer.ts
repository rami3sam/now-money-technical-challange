import type { TransfersRepository } from "../../repositories/transfers.repository.js";

export async function getTransfer(transferRepository: TransfersRepository, id: string) {
  const transfer = await transferRepository.findById(id);
  if (!transfer) throw Error("Transfer not found");
  return transfer;
};