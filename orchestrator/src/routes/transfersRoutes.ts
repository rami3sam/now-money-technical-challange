import { Router } from "express";
import { TransfersService } from "../services/transfers.service.js";
import { TransferController } from "../controllers/transfers.controller.js";

export function transfersRoutes(transfersService: TransfersService) {
  const transfersRouter = Router();
  const transfersController = new TransferController(transfersService);

  transfersRouter.post("/", transfersController.createTransfer);
  transfersRouter.get("/:id", transfersController.getTransfer);
  transfersRouter.get("/", transfersController.getUserTransfers);
  transfersRouter.post("/:id/confirm", transfersController.confirm);
  transfersRouter.post("/:id/cancel", transfersController.cancel);
  transfersRouter.post("/:id/compliance/approve", transfersController.approve);
  transfersRouter.post("/:id/compliance/reject", transfersController.reject);
  transfersRouter.post("/:id/quote", transfersController.quote);

  return transfersRouter;
}
