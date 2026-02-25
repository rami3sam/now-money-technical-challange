import type { Request, Response } from "express";
import { Transfer } from "../../models/transfer.ts";

export const getUserTransfers = async (req: Request, res: Response) => {
  try {
    const { senderId } = req.query;
    if (!senderId) throw Error("You must provide a sender id");
    const transfers = await Transfer.find({ "sender.senderId": senderId });
    if (!transfers) throw Error("No transfers with this used id");
    res.status(200).json(transfers);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
