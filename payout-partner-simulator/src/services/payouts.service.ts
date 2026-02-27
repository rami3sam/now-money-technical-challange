import type { PayoutsRepository } from "../repositories/payouts.repository.ts";
import type { InitatePayoutType } from "../validations/initiatePayout.ts";
import { getPayouts } from "./payouts/getPayoutsBetweenDates.ts";
import { processPayout } from "./payouts/processPayout.ts";
import { providePayoutStatus } from "./payouts/providePayoutStatus.ts";
import { receivePartnerPayoutRequest } from "./payouts/receivePartnerPayoutRequest.ts";
import type { TasksService } from "./tasks.service.ts";

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
