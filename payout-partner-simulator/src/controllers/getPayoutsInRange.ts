import type { Request, Response } from "express";
import { Payout, type PayoutType } from "../models/payout.ts";

export const getPayouts = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate)
      throw Error("You must provide a range start and end");
    const payouts = await Payout.find({
      createdAt: {
        $gte: new Date(startDate as string).getTime(),
        $lte: new Date(endDate as string).getTime(),
      },
    });
    if (!payouts) throw Error("No payouts found in this date range");
    const payoutsWithoutIds: Omit<PayoutType, "_id">[] = payouts;
    res.status(200).json(payoutsWithoutIds);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
