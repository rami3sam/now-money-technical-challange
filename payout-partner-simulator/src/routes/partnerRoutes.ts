import { Router } from "express"
import type { PayoutsService } from "../services/payouts.service.ts"
import { PayoutController } from "../controllers/payouts.controller.ts.ts"
import type { TasksService } from "../services/tasks.service.ts"

export function partnerPayoutsRoutes(
  payoutsService: PayoutsService,
  tasksService: TasksService,
) {
  const payoutController = new PayoutController(payoutsService, tasksService);
  const partnerPayoutsRouter = Router();
  partnerPayoutsRouter.post("/payouts", payoutController.receivePartnerPayoutRequest);
  return partnerPayoutsRouter;
}