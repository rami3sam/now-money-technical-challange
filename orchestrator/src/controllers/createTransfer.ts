import type { Request, Response } from "express";
import { createTransferSchema } from "../validations/createTransfer.ts";
import { PayoutMethods } from "../enums/payoutMethods.enum.ts";
import { errorMonitor } from "node:events";

const createTransfer = (req: Request, res: Response) => {
    try {
        const transfer = createTransferSchema.parse(req.body);
        const { recipient, recipient: { payoutDetails, payoutMethod } } = transfer
        
        const bankInfoNotOk = payoutMethod == PayoutMethods.Bank &&
            payoutDetails.accountNumber == undefined

        const cashInfoNotOk = payoutMethod === PayoutMethods.Cash &&
            (payoutDetails.personalIDNumber === undefined ||
                payoutDetails.personalIDType === undefined)

        if (bankInfoNotOk || cashInfoNotOk) throw Error("You must specify recipient details correctly")

        res.status(200).json(transfer)
    } catch (err: any) {
        res.status(400).json(err.message);
    }
}

export { createTransfer }