import { Router, type Request, type Response } from "express";
import { TransferRepository } from "../repositories/transfer.repository.ts";
import { TransferService } from "../services/transfers.service.ts";
import { TransferController } from "../controllers/transfers.controller.ts";

const transfersRoutes = Router();
const transfersRepo = new TransferRepository();
const transfersService = new TransferService(transfersRepo);
const transfersController = new TransferController(transfersService);

transfersRoutes.post("/", transfersController.createTransfer);
transfersRoutes.get("/:id", transfersController.getTransfer);
transfersRoutes.get("/", transfersController.getUserTransfers);
transfersRoutes.post("/:id/confirm", transfersController.confirm);
transfersRoutes.post("/:id/cancel", transfersController.cancel);
transfersRoutes.post("/:id/compliance/approve", transfersController.approve);
transfersRoutes.post("/:id/compliance/reject", transfersController.reject);
transfersRoutes.post("/:id/quote", transfersController.quote);

export default transfersRoutes;
