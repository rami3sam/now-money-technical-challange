import mongoose, { type InferSchemaType } from "mongoose";
import { complianceDecisionValues } from "../enums/complianceDecisions.ts";
import { TransferStatusValues } from "../enums/transferStatus.enum.ts";

export const transferStateHistorySchema = new mongoose.Schema(
  {
    state: {
      type: String,
      enum: TransferStatusValues,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

export interface TransferStateHistory {
  timestamp: Date;
  state?: string | null;
}