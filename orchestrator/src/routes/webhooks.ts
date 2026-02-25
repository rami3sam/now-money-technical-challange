import { Router } from "express";
import { payoutStatus } from "../controllers/webhooks/payoutStatus.ts";

const webhooksRoutes = Router();
webhooksRoutes.post("/payout-status", payoutStatus);

export default webhooksRoutes;