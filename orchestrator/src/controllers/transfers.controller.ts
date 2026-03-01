import type { Request, Response } from "express";
import type { TransfersService } from "../services/transfers.service.js";
import { isString } from "../utils/utilFunctions.js";
import { createTransferSchema } from "../validations/createTransfer.js";
import { Transfer } from "../models/transfer.js";

export class TransferController {
  constructor(private transfersService: TransfersService) {}

  getTransfer = async (req: Request, res: Response) => {
    const { id } = req.params;
    (req as any).locals = { ...(req as any).locals, transferId: id };
    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");
    const result = await this.transfersService.getTransfer(id);
    res.json(result);
  };

  getUserTransfers = async (req: Request, res: Response) => {
    const { senderId } = req.query;
    if (!senderId) throw Error("Sender id is required");
    if (!isString(senderId)) throw Error("Sender id must be a string");
    const result = await this.transfersService.getUserTransfers(senderId);
    res.json(result);
  };

  createTransfer = async (req: Request, res: Response) => {
    const transferData = createTransferSchema.parse(req.body);
    if (!transferData) throw Error("Transfer data is required");
    const result = await this.transfersService.createTransfer(transferData);
    (req as any).locals = { ...(req as any).locals, transferId: result.id };
    res.status(200).json(result);
  };

  quote = async (req: Request, res: Response) => {
    const { id } = req.params;
    (req as any).locals = { ...(req as any).locals, transferId: id };
    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");
    const result = await this.transfersService.quoteTransfer(id);
    res.json({
      message: "Transfer quote retrieved successfully",
      data: result,
    });
  };

  confirm = async (req: Request, res: Response) => {
    const { id } = req.params;
    (req as any).locals = { ...(req as any).locals, transferId: id };
    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");
    const result = await this.transfersService.confirmTransferQuote(id);
    res.json({
      message: "Transfer quote confirmed successfully",
      data: result,
    });
  };

  approve = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reviewerId } = req.query;
    (req as any).locals = { ...(req as any).locals, transferId: id };
    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");
    if (!reviewerId) throw Error("Reviewer id is required");
    if (!isString(reviewerId)) throw Error("Reviewer id must be a string");

    await this.transfersService.approveTransfer(id, reviewerId);
    res.json({ message: "Transfer approved successfully" });
  };

  reject = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reviewerId } = req.query;
    (req as any).locals = { ...(req as any).locals, transferId: id };

    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");
    if (!reviewerId) throw Error("Reviewer id is required");
    if (!isString(reviewerId)) throw Error("Reviewer id must be a string");

    await this.transfersService.rejectTransfer(id, reviewerId);
    res.json({ message: "Transfer rejected successfully" });
  };

  cancel = async (req: Request, res: Response) => {
    const { id } = req.params;
    (req as any).locals = { ...(req as any).locals, transferId: id };

    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");

    await this.transfersService.cancelTransfer(id);
    res.json({ message: "Transfer cancelled successfully" });
  };
}
