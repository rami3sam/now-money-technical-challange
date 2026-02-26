import { Router } from "express";
import { verifyHmacMiddleware } from "../middlewares/verifyHmacMiddleware.ts";
import { EnvVariables } from "../constants/config.ts";
import { payoutStatus } from "../services/transfers/updatePayoutStatus.ts";
import type { TasksService } from "../services/tasks.service.ts";
import type { TransfersService } from "../services/transfers.service.ts";
import { WebhookController } from "../controllers/webhook.controller.ts";



export function webhookRoutes(
  transfersService: TransfersService,
  tasksService: TasksService,
) {
  const webhookController = new WebhookController(transfersService, tasksService);
  const webhooksRouter = Router();
  webhooksRouter.post(
    "/payout-status",
    verifyHmacMiddleware(EnvVariables.WEBHOOK_SECRET),
    webhookController.payoutStatus,
  );
  webhooksRouter.post("/reconciliation", webhookController.triggerReconciliation);
  return webhooksRouter;
}