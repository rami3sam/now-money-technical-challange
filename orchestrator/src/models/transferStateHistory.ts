import mongoose, { type InferSchemaType } from "mongoose";
import { TransferStatusValues } from "../enums/transferStatus.enum.js";

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