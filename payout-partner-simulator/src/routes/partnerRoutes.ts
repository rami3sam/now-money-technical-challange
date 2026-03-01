import { Router } from "express"
import type { PayoutsService } from "../services/payouts.service.js"
import { PayoutController } from "../controllers/payouts.controller.ts.js"
import type { TasksService } from "../services/tasks.service.js"
import { asyncHandler } from "../utils/asyncHandler.js";

export function partnerPayoutsRoutes(
  payoutsService: PayoutsService,
  tasksService: TasksService,
) {
  const payoutController = new PayoutController(payoutsService, tasksService);
  const partnerPayoutsRouter = Router();
  partnerPayoutsRouter.post("/payouts", asyncHandler(payoutController.receivePartnerPayoutRequest));
  return partnerPayoutsRouter;
}