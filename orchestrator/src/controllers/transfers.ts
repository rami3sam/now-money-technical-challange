import type { Request, Response } from "express";
import { createTransferSchema } from "../validations/createTransfer.ts";
import { PayoutMethods } from "../enums/payoutMethods.enum.ts";
import { errorMonitor } from "node:events";
import { Transfer } from "../models/transfer.ts";
import { TransferStatus } from "../enums/transferStatus.enum.ts";

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

        const dbTransfer = new Transfer({ ...transfer, status: TransferStatus.CREATED })
        dbTransfer.save()
        res.status(200).json(dbTransfer)
    } catch (err: any) {
        res.status(400).json(err.message);
    }
}

const getTransfer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const transfer = await Transfer.findById(id)
        if (!transfer) throw Error("Transfer not found")
        res.status(200).json({ transfer })
    }
    catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}

export { createTransfer, getTransfer }