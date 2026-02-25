import mongoose, { Schema, model } from "mongoose";
import { payoutSchema } from "../validations/payout.ts";
import { transferSchema } from "./transfer.ts";

const ReconciliationSchema = new Schema(
  {
    runId: { type: String, required: true, unique: true },
    runDate: { type: Date, required: true, default: () => new Date() },

    matched: [
      {
        transfer: {
          type: transferSchema,
          required: true,
        },
        payout: { type: payoutSchema, required: true },
      },
    ],

    unmatched: [
      {
        transfer: {
          type: transferSchema,
          required: true,
        },
        payout: { type: payoutSchema, required: true },
      },
    ],

    onlyInTransfers: [
      {
        transfer: {
          type: transferSchema,
        },
        reason: { type: String, default: "no corresponding payout" },
      },
    ],

    onlyInPayouts: [
      {
        payout: {
          type: payoutSchema,
          required: true,
        },
        reason: { type: String, default: "no corresponding transfer" },
      },
    ],

    // Optional summary stats
    totalTransfers: { type: Number, default: 0 },
    totalPayouts: { type: Number, default: 0 },
    totalMatched: { type: Number, default: 0 },
    totalOnlyInTransfers: { type: Number, default: 0 },
    totalOnlyInPayouts: { type: Number, default: 0 },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

export const Reconciliation = model("Reconciliation", ReconciliationSchema);
export type ReconciliationType = mongoose.InferSchemaType<
  typeof ReconciliationSchema
>;
