import mongoose from "mongoose";
import { PayoutMethods } from "../enums/payoutMethods.enum.ts";

export interface ITransfer {
    sender: { senderId: string, name: string }
    recipient: {
        name: string, country: string, payoutMethod: string,
        payoutDetails: { accountNumber?: string, personalIDNumner?: string, personalIDType?: string },
    },
    sendAmount: number,
    sendCurrency: string,
    payoutCurrency: string
}

const transferSchema = new mongoose.Schema<ITransfer>(
    {
        sender: {
            senderId: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
        },

        recipient: {
            name: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
                minlength: 2,
            },
            payoutMethod: {
                type: String,
                enum: [PayoutMethods.Bank, PayoutMethods.Cash], // or Object.values(PayoutMethods)
                required: true,
            },

            payoutDetails: {
                accountNumber: {
                    type: String,
                },
                personalIDNumber: {
                    type: String,
                },
                personalIDType: {
                    type: String,
                },
            },
        },

        sendAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        sendCurrency: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 3,
        },

        payoutCurrency: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 3,
        },
    },
    {
        timestamps: true,
    }
);

export const Transfer = mongoose.model<ITransfer>("Transfer", transferSchema);