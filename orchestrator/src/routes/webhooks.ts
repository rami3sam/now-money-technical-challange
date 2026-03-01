import { Router } from "express";
import { verifyHmacMiddleware } from "../middlewares/verifyHmacMiddleware.js";
import { EnvVariables } from "../constants/config.js";
import type { TasksService } from "../services/tasks.service.js";
import type { TransfersService } from "../services/transfers.service.js";
import { WebhookController } from "../controllers/webhook.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";



export function webhookRoutes(
  transfersService: TransfersService,
  tasksService: TasksService,
) {
  const webhookController = new WebhookController(transfersService, tasksService);
  const webhooksRouter = Router();
  webhooksRouter.post(
    "/payout-status",
    verifyHmacMiddleware(EnvVariables.WEBHOOK_SECRET),
    asyncHandler(webhookController.payoutStatus),
  );
  webhooksRouter.post("/reconciliation", asyncHandler(webhookController.triggerReconciliation));
  return webhooksRouter;
}