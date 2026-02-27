import { Router } from "express"
import { PayoutController } from "../controllers/payouts.controller.ts.ts";
import type { TasksService } from "../services/tasks.service.ts";
import type { PayoutsService } from "../services/payouts.service.ts";

export function payoutsRoutes(
  payoutsService: PayoutsService,
  tasksService: TasksService,
) {
  const payoutController = new PayoutController(payoutsService, tasksService);
  const payoutsRouter = Router();
  payoutsRouter.get("/", payoutController.getPayoutsBetweenDates);
  return payoutsRouter;
}