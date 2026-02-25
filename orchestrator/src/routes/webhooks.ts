import { Router } from "express";
import { payoutStatus } from "../controllers/webhooks/payoutStatus.ts";
import { verifyHmacMiddleware } from "../middlewares/verifyHmacMiddleware.ts";
import { EnvVariables } from "../constants/config.ts";

const webhooksRoutes = Router();
webhooksRoutes.post(
  "/payout-status",
  verifyHmacMiddleware(EnvVariables.WEBHOOK_SECRET),
  payoutStatus,
);

export default webhooksRoutes;
