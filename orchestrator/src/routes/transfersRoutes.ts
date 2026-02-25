import { Router, type Request, type Response } from "express";
import { createTransfer } from "../controllers/transfers/createTransfer.ts";
import { getTransfer } from "../controllers/transfers/getTransfer.ts";
import { confirmTransferQuote } from "../controllers/transfers/confirmTransferQuote.ts";
import { cancelTransfer } from "../controllers/transfers/cancelTransfer.ts";
import { approveTransfer } from "../controllers/transfers/approveTransfer.ts";
import { rejectTransfer } from "../controllers/transfers/rejectTransfer.ts";
import { getUserTransfers } from "../controllers/transfers/getUserTransfers.ts";
import { quoteTransfer } from "../controllers/transfers/quoteTransfer.ts";

const transfersRoutes = Router();

transfersRoutes.post("/", createTransfer);
transfersRoutes.get("/:id", getTransfer);
transfersRoutes.get("/", getUserTransfers);
transfersRoutes.post("/:id/confirm", confirmTransferQuote);
transfersRoutes.post("/:id/cancel", cancelTransfer);
transfersRoutes.post("/:id/compliance/approve", approveTransfer);
transfersRoutes.post("/:id/compliance/reject", rejectTransfer);
transfersRoutes.post("/:id/quote", quoteTransfer);

export default transfersRoutes;
