import type { TransferRepository } from "../../repositories/transfer.repository.ts";

export async function getTransfer(transferRepository: TransferRepository, id: string) {
  const transfer = await transferRepository.findById(id);
  if (!transfer) throw Error("Transfer not found");
  return transfer;
};