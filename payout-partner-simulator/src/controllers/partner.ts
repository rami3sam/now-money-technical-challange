import type { Request, Response } from "express";
import { initatePayoutSchema } from "../validations/initiatePayout.ts";
import { Payout } from "../models/payout.ts";
import { v7 as uuidv7 } from "uuid";
import { PayoutStatus } from "../enums/payoutStatus.enum.ts";
import { TaskHandlers } from "../enums/taskHandlers.enum.ts";
import { addToTaskQueue } from "../queues/taskQueue.ts";
const partnerPayoutController = async (req: Request, res: Response) => {
  try {
    const payoutResponse = initatePayoutSchema.parse(req.body);

    const payout = new Payout({
      sender: { name: payoutResponse.sender.name },
      recipient: {
        name: payoutResponse.recipient.name,
        country: payoutResponse.recipient.country,
        payoutMethod: payoutResponse.recipient.payoutMethod,
        payoutDetails: {
          accountNumber: payoutResponse.recipient.payoutDetails.accountNumber,
          personalIDNumber:
            payoutResponse.recipient.payoutDetails.personalIDNumber,
          personalIDType: payoutResponse.recipient.payoutDetails.personalIDType,
        },
      },
      sendAmount: payoutResponse.sendAmount,
      sendCurrency: payoutResponse.sendCurrency,
      payoutCurrency: payoutResponse.payoutCurrency,
      payoutAmount: payoutResponse.payoutAmount,
      partnerPayoutId: payoutResponse.payoutId,
      payoutId: uuidv7(),
    });

    await payout.save();
    if (!payout) throw new Error("Failed to save payout to database");

    addToTaskQueue({
      taskHandler: TaskHandlers.PROCESS_PAYOUT,
      payload: payout._id,
      executeAt: new Date(Date.now() + 5000),
    });

    res
      .status(200)
      .json({ partnerPayoutId: payout.payoutId, status: PayoutStatus.PENDING });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export { partnerPayoutController };
