import { Router, type Request, type Response } from "express";
import { createTransferSchema } from "../validations/createTransfer.ts";
import {
  approveTransfer,
  cancelTransfer,
  confirmTransferQuote,
  createTransfer,
  getTransfer,
  rejectTransfer,
} from "../controllers/transfers.ts";

const transfersRoutes = Router();

transfersRoutes.post("/transfers", createTransfer);
transfersRoutes.get("/transfers/:id", getTransfer);
transfersRoutes.post("/transfers/:id/confirm", confirmTransferQuote);
transfersRoutes.post("/transfers/:id/cancel", cancelTransfer);
transfersRoutes.post("/transfers/:id/compliance/approve", approveTransfer);
transfersRoutes.post("/transfers/:id/compliance/reject", rejectTransfer);

export default transfersRoutes;
