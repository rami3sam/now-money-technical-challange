import type { TransfersRepository } from "../repositories/transfers.repository.js";
import type { createTransferSchema } from "../validations/createTransfer.js";
import type { PayoutStatusType } from "../validations/payoutStatus.js";
import type { TasksService } from "./tasks.service.js";
import { approveTransfer } from "./transfers/approveTransfer.js";
import { cancelTransfer } from "./transfers/cancelTransfer.js";
import { checkTransferCompliance } from "./transfers/checkTransferCompliance.js";
import { confirmTransferQuote } from "./transfers/confirmTransferQuote.js";
import { createTransfer } from "./transfers/createTransfer.js";
import { getTransfer } from "./transfers/getTransfer.js";
import { getUserTransfers } from "./transfers/getUserTransfers.js";
import { initiatePayout } from "./transfers/inititatePayout.js";
import { quoteTransfer } from "./transfers/quoteTransfer.js";
import { reconciliateTransfers } from "./transfers/reconciliateTransfers.js";
import { refundTransfer } from "./transfers/refundTransfer.js";
import { rejectTransfer } from "./transfers/rejectTransfer.js";
import { updatePayoutStatus } from "./transfers/updatePayoutStatus.js";

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
  async createTransfer(transfer: createTransferSchema) {
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

  async updatePayoutStatus(payoutStatus: PayoutStatusType) {
    return await updatePayoutStatus(
      this.transfersRepository,
      this.taskService,
      payoutStatus,
    );
  }
}
