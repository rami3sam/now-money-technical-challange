import mongoose, { type InferSchemaType } from "mongoose";
import { isValidFloat, isValidMoney } from "../utils/validatorFunctions.js";

export const quoteSchema = new mongoose.Schema(
  {
    rate: {
      type: String,
      required: true,
      valdate: {
        validator: isValidFloat,
        message: "rate must be a valid float string eg 1.23",
      },
    },
    fee: {
      type: String,
      required: true,
      valdate: {
        validator: isValidMoney,
        message: "fees must be a valid money string eg 100.00",
      },
    },
    payoutAmount: {
      type: String,
      required: true,
      valdate: {
        validator: isValidMoney,
        message: "payoutAmount must be a valid money string eg 100.00",
      },
    },
    expiry: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

export type QuoteType = InferSchemaType<typeof quoteSchema>;
