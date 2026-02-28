import mongoose, { Schema, model } from "mongoose";
import { payoutSchema } from "../validations/payout.js";
import { transferSchema } from "./transfer.js";
import { ReconciliationStatusValues } from "../enums/reconciliationStatus.enum.js";
import { required } from "zod/mini";

const ReconciliationSchema = new Schema(
  {
    runDate: { type: Date, required: true, default: () => new Date() },

    reconciliationEntries: [
      {
        transfer: {
          type: transferSchema,
          required: false,
        },
        payout: { type: payoutSchema, required: false },
        variance: {
          type: {
            payoutAmountDifference: { type: Number, required: true },
            sendAmountDifference: { type: Number, required: true },
            currencyMismatch: { type: Boolean, required: true },
          },
          required: false,
        },
        status: {
          type: String,
          enum: ReconciliationStatusValues,
          required: true,
        },
      },
    ],

    totalTransfers: { type: Number, default: 0 },
    totalPayouts: { type: Number, default: 0 },
    totalExactMatch: { type: Number, default: 0 },
    totalToleranceMatch: { type: Number, default: 0 },
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
