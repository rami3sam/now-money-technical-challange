import mongoose, { type InferSchemaType } from "mongoose";

export const quoteSchema = new mongoose.Schema(
  {
    rate: {
      type: String,
    },
    fee: {
      type: String,
    },
    payoutAmount: {
      type: String,
    },
    expiry: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

export const Quote = mongoose.model("Quote", quoteSchema);