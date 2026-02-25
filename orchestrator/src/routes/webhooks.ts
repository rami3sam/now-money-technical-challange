import { Router } from "express";
import { payoutStatus } from "../controllers/webhooks/payoutStatus.ts";
import { verifyHmacMiddleware } from "../middlewares/verifyHmacMiddleware.ts";
import { EnvVariables } from "../constants/config.ts";
import { triggerReconcilliation } from "../controllers/webhooks/triggerReconcilliation.ts";

const webhooksRoutes = Router();

webhooksRoutes.post(
  "/payout-status",
  verifyHmacMiddleware(EnvVariables.WEBHOOK_SECRET),
  payoutStatus,
);
webhooksRoutes.post(
  "/reconcilliation",
  triggerReconcilliation,
);

export default webhooksRoutes;
