import { Router } from "express";
import { TransfersService } from "../services/transfers.service.js";
import { TransferController } from "../controllers/transfers.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function transfersRoutes(transfersService: TransfersService) {
  const transfersRouter = Router();
  const transfersController = new TransferController(transfersService);

  transfersRouter.post("/", asyncHandler(transfersController.createTransfer));
  transfersRouter.get("/:id", asyncHandler(transfersController.getTransfer));
  transfersRouter.get("/", asyncHandler(transfersController.getUserTransfers));
  transfersRouter.post("/:id/confirm", asyncHandler(transfersController.confirm));
  transfersRouter.post("/:id/cancel", asyncHandler(transfersController.cancel));
  transfersRouter.post("/:id/compliance/approve", asyncHandler(transfersController.approve));
  transfersRouter.post("/:id/compliance/reject", asyncHandler(transfersController.reject));
  transfersRouter.post("/:id/quote", asyncHandler(transfersController.quote));

  return transfersRouter;
}
