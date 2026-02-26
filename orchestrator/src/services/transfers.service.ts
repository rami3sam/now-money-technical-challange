import type { TransferType } from "../models/transfer.ts";
import type { TransferRepository } from "../repositories/transfer.repository.ts";
import { approveTransfer } from "./transfers/approveTransfer.ts";
import { cancelTransfer } from "./transfers/cancelTransfer.ts";
import { confirmTransferQuote } from "./transfers/confirmTransferQuote.ts";
import { createTransfer } from "./transfers/createTransfer.ts";
import { getTransfer } from "./transfers/getTransfer.ts";
import { getUserTransfers } from "./transfers/getUserTransfers.ts";
import { quoteTransfer } from "./transfers/quoteTransfer.ts";
import { rejectTransfer } from "./transfers/rejectTransfer.ts";

export class TransferService {
  constructor(private transfersRepository: TransferRepository) {}
  async approveTransfer(id: string, reviewerId: string) {
    return await approveTransfer(this.transfersRepository, id, reviewerId);
  }
  async rejectTransfer(id: string, reviewerId: string) {
    return await rejectTransfer(this.transfersRepository, id, reviewerId);
  }
  async cancelTransfer(id: string) {
    return await cancelTransfer(this.transfersRepository, id);
  }
  async quoteTransfer(id: string) {
    return await quoteTransfer(this.transfersRepository, id);
  }
  async confirmTransferQuote(id: string) {
    return await confirmTransferQuote(this.transfersRepository, id);
  }
  async getTransfer(id: string) {
    return await getTransfer(this.transfersRepository, id);
  }
  async getUserTransfers(senderId: string) {
    return await getUserTransfers(this.transfersRepository, senderId);
  }
  async createTransfer(transfer: TransferType) {
    return await createTransfer(this.transfersRepository, transfer);
  }
}
