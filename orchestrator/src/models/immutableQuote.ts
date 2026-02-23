import mongoose, { type InferSchemaType } from "mongoose";

export const immutableQuoteSchema = new mongoose.Schema(
  {
    rate: {
      type: String,
      immutable: (value: ImmutableQuoteType) => {
        return value.rate !== undefined;
      },
    },
    fee: {
      type: String,
      immutable: (value: ImmutableQuoteType) => {
        return value.fee !== undefined;
      },
    },
    payoutAmount: {
      type: String,
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

export const ImmutableQuote = mongoose.model(
  "ImmutableQuote",
  immutableQuoteSchema,
);

interface ImmutableQuoteType {
  rate?: string | undefined;
  fee?: string | undefined;
  payoutAmount?: string | undefined;
  expiry?: Date | undefined;
}

// export type ImmutableQuoteType = InferSchemaType<typeof immutableQuoteSchema>;
