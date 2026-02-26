import type { Request, Response } from "express";
import type { TransferService } from "../services/transfers.service.ts";
import { isString } from "../utils/utilFunctions.ts";
import { createTransferSchema } from "../validations/createTransfer.ts";
import { Transfer } from "../models/transfer.ts";

export class TransferController {
  constructor(private service: TransferService) {}

  getTransfer = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");
    const result = await this.service.getTransfer(id);
    res.json(result);
  };

  getUserTransfers = async (req: Request, res: Response) => {
    const { senderId } = req.params;
    if (!senderId) throw Error("Sender id is required");
    if (!isString(senderId)) throw Error("Sender id must be a string");
    const result = await this.service.getUserTransfers(senderId);
    res.json(result);
  };

  createTransfer = async (req: Request, res: Response) => {
    const transferData = createTransferSchema.parse(req.body);
    if (!transferData) throw Error("Transfer data is required");
    const result = await this.service.createTransfer(
      new Transfer(transferData),
    );
    res.status(200).json(result);
  };

  quote = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");
    const result = await this.service.quoteTransfer(id);
    res.json(result);
  };

  confirm = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");
    const result = await this.service.confirmTransferQuote(id);
    res.json(result);
  };

  approve = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reviewerId } = req.body;

    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");
    if (!reviewerId) throw Error("Reviewer id is required");
    if (!isString(reviewerId)) throw Error("Reviewer id must be a string");

    await this.service.approveTransfer(id, reviewerId);
    res.json({ message: "Transfer approved successfully" });
  };

  reject = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reviewerId } = req.body;

    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");
    if (!reviewerId) throw Error("Reviewer id is required");
    if (!isString(reviewerId)) throw Error("Reviewer id must be a string");

    await this.service.rejectTransfer(id, reviewerId);
    res.json({ message: "Transfer rejected successfully" });
  };

  cancel = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) throw Error("Transfer id is required");
    if (!isString(id)) throw Error("Transfer id must be a string");

    await this.service.cancelTransfer(id);
    res.json({ message: "Transfer cancelled successfully" });
  };
}
