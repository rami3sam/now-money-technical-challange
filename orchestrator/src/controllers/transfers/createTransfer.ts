import type { Request, Response } from "express";
import { PayoutMethods } from "../../enums/payoutMethods.enum.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import { TransferStatus } from "../../enums/transferStatus.enum.ts";
import { Transfer } from "../../models/transfer.ts";
import { createTransferSchema } from "../../validations/createTransfer.ts";
import { addToTaskQueue } from "../../queues/taskQueue.ts";

export const createTransfer = async (req: Request, res: Response) => {
  try {
    const transfer = createTransferSchema.parse(req.body);
    const {
      recipient,
      recipient: { payoutDetails, payoutMethod },
    } = transfer;

    const bankInfoNotOk =
      payoutMethod == PayoutMethods.Bank &&
      payoutDetails.accountNumber == undefined;

    const cashInfoNotOk =
      payoutMethod === PayoutMethods.Cash &&
      (payoutDetails.personalIDNumber === undefined ||
        payoutDetails.personalIDType === undefined);

    if (bankInfoNotOk || cashInfoNotOk)
      throw Error("You must specify recipient details correctly");

    const dbTransfer = new Transfer({
      ...transfer,
      status: TransferStatus.CREATED,
    });

    dbTransfer.stateHistory.push({ state: TransferStatus.CREATED });

    await dbTransfer.save();

    res.status(200).json(dbTransfer);
  } catch (err: any) {
    res.status(400).json(err.message);
  }
};
