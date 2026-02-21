import z from "zod";
import type { createTransferSchema as createTransferType } from "../validations/createTransfer.ts";
import { Transfer, type ITransfer } from "../models/transfer.ts";


function convertTransfer  (requestTransfer : createTransferType  ): ITransfer{
    const transfer: ITransfer = {
        sender: {
            senderId: requestTransfer.sender.senderId,
            name: requestTransfer.sender.name
        },
        recipient: {
            name: requestTransfer.recipient.name,
            country: requestTransfer.recipient.country,
            payoutMethod: requestTransfer.recipient.payoutMethod,
            payoutDetails: {
                accountNumber: requestTransfer.recipient.payoutDetails.accountNumber || "",
                personalIDNumner: requestTransfer.recipient.payoutDetails.personalIDNumber || "",
                personalIDType: requestTransfer.recipient.payoutDetails.personalIDType || ""
            }
        },
        sendAmount: requestTransfer.sendAmount,
        sendCurrency: requestTransfer.sendCurrency,
        payoutCurrency: requestTransfer.payoutCurrency
    }
    return transfer
}