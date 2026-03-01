import { Router } from "express"
import { PayoutController } from "../controllers/payouts.controller.ts.js";
import type { TasksService } from "../services/tasks.service.js";
import type { PayoutsService } from "../services/payouts.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function payoutsRoutes(
  payoutsService: PayoutsService,
  tasksService: TasksService,
) {
  const payoutController = new PayoutController(payoutsService, tasksService);
  const payoutsRouter = Router();
  payoutsRouter.get("/", asyncHandler(payoutController.getPayoutsBetweenDates));
  return payoutsRouter;
}