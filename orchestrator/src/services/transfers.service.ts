import type { PayoutType } from "../models/payout.ts";
import type { TransferType } from "../models/transfer.ts";
import type { TransfersRepository } from "../repositories/transfers.repository.ts";
import type { PayoutStatusType } from "../validations/payoutStatus.ts";
import type { TasksService } from "./tasks.service.ts";
import { approveTransfer } from "./transfers/approveTransfer.ts";
import { cancelTransfer } from "./transfers/cancelTransfer.ts";
import { checkTransferCompliance } from "./transfers/checkTransferCompliance.ts";
import { confirmTransferQuote } from "./transfers/confirmTransferQuote.ts";
import { createTransfer } from "./transfers/createTransfer.ts";
import { getTransfer } from "./transfers/getTransfer.ts";
import { getUserTransfers } from "./transfers/getUserTransfers.ts";
import { initiatePayout } from "./transfers/inititatePayout.ts";
import { quoteTransfer } from "./transfers/quoteTransfer.ts";
import { reconciliateTransfers } from "./transfers/reconciliateTransfers.ts";
import { refundTransfer } from "./transfers/refundTransfer.ts";
import { rejectTransfer } from "./transfers/rejectTransfer.ts";
import { updatePayoutStatus } from "./transfers/updatePayoutStatus.ts";

export class TransfersService {
  constructor(
    private transfersRepository: TransfersRepository,
    private taskService: TasksService,
  ) {}
  async approveTransfer(id: string, reviewerId: string) {
    return await approveTransfer(
      this.transfersRepository,
      this.taskService,
      id,
      reviewerId,
    );
  }
  async rejectTransfer(id: string, reviewerId: string) {
    return await rejectTransfer(
      this.transfersRepository,
      this.taskService,
      id,
      reviewerId,
    );
  }
  async cancelTransfer(id: string) {
    return await cancelTransfer(this.transfersRepository, this.taskService, id);
  }
  async quoteTransfer(id: string) {
    return await quoteTransfer(this.transfersRepository, id);
  }
  async confirmTransferQuote(id: string) {
    return await confirmTransferQuote(
      this.transfersRepository,
      this.taskService,
      id,
    );
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

  async checkTransferCompliance(id: string) {
    return await checkTransferCompliance(
      this.transfersRepository,
      this.taskService,
      id,
    );
  }

  async initiatePayout(id: string) {
    return await initiatePayout(this.transfersRepository, id);
  }

  async refundTransfer(id: string) {
    return await refundTransfer(this.transfersRepository, id);
  }

  async reconciliateTransfers(startDate: Date, endDate: Date) {
    return await reconciliateTransfers(
      this.transfersRepository,
      startDate,
      endDate,
    );
  }

  async updatePayoutStatusWebhook(payoutStatus: PayoutStatusType) {
    return await updatePayoutStatus(
      this.transfersRepository,
      this.taskService,
      payoutStatus,
    );
  }
}
