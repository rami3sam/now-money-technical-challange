import type { Request, Response } from "express";
import { Transfer } from "../../models/transfer.ts";

export const getTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);
    if (!transfer) throw Error("Transfer not found");
    res.status(200).json({ transfer });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};