import type { PayoutsRepository } from "../repositories/payouts.repository.js";
import type { InitatePayoutType } from "../validations/initiatePayout.js";
import { getPayouts } from "./payouts/getPayoutsBetweenDates.js";
import { processPayout } from "./payouts/processPayout.js";
import { providePayoutStatus } from "./payouts/providePayoutStatus.js";
import { receivePartnerPayoutRequest } from "./payouts/receivePartnerPayoutRequest.js";
import type { TasksService } from "./tasks.service.js";

export class PayoutsService {
  constructor(
    private payoutsRepository: PayoutsRepository,
    private tasksService: TasksService,
  ) {}

  async getPayoutsBetweenDates(startDate: Date, endDate: Date) {
    return await getPayouts(this.payoutsRepository, startDate, endDate);
  }

  async receivePartnerPayoutRequest(payoutData: InitatePayoutType) {
    return await receivePartnerPayoutRequest(
      this.payoutsRepository,
      this.tasksService,
      payoutData,
    );
  }

  async processPayout(payoutId: string) {
    return await processPayout(
      this.tasksService,
      this.payoutsRepository,
      payoutId,
    );
  }

  async providePayoutStatus(payoutId: string) {
    return await providePayoutStatus(this.payoutsRepository, payoutId);
  }
}
