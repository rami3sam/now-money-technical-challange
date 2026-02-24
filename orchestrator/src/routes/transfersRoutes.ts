import { Router, type Request, type Response } from "express";
import { createTransfer } from "../controllers/transfers/createTransfer.ts";
import { getTransfer } from "../controllers/transfers/getTransfer.ts";
import { confirmTransferQuote } from "../controllers/transfers/confirmTransferQuote.ts";
import { cancelTransfer } from "../controllers/transfers/cancelTransfer.ts";
import { approveTransfer } from "../controllers/transfers/approveTransfer.ts";
import { rejectTransfer } from "../controllers/transfers/rejectTransfer.ts";

const transfersRoutes = Router();

transfersRoutes.post("/transfers", createTransfer);
transfersRoutes.get("/transfers/:id", getTransfer);
transfersRoutes.post("/transfers/:id/confirm", confirmTransferQuote);
transfersRoutes.post("/transfers/:id/cancel", cancelTransfer);
transfersRoutes.post("/transfers/:id/compliance/approve", approveTransfer);
transfersRoutes.post("/transfers/:id/compliance/reject", rejectTransfer);

export default transfersRoutes;
