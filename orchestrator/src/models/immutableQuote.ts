import mongoose, { type InferSchemaType } from "mongoose";
import { isValidFloat, isValidMoney } from "../utils/validatorFunctions.js";

export const immutableQuoteSchema = new mongoose.Schema(
  {
    rate: {
      type: String,
      required: true,
      valdate: {
        validator: isValidFloat,
        message: "rate must be a valid float string eg 1.23",
      },
      immutable: (value: ImmutableQuoteType) => {
        return value.rate !== undefined;
      },
    },
    fee: {
      type: String,
      required: true,
      valdate: {
        validator: isValidMoney,
        message: "fees must be a valid money string eg 100.00",
      },
      immutable: (value: ImmutableQuoteType) => {
        return value.fee !== undefined;
      },
    },
    payoutAmount: {
      type: String,
      required: true,
      valdate: {
        validator: isValidMoney,
        message: "payoutAmount must be a valid money string eg 100.00",
      },
      immutable: (value: ImmutableQuoteType) => {
        return value.payoutAmount !== undefined;
      },
    },
    expiry: {
      type: Date,
      immutable: (value: ImmutableQuoteType) => {
        return value.expiry !== undefined;
      },
    },
  },
  {
    _id: false,
  },
);

interface ImmutableQuoteType {
  rate?: string | undefined;
  fee?: string | undefined;
  payoutAmount?: string | undefined;
  expiry?: Date | undefined;
}
