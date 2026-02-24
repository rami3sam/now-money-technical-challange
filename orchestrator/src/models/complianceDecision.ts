import mongoose, { type InferSchemaType } from "mongoose";
import { complianceDecisionValues } from "../enums/complianceDecisions.ts";

export const complianceDecisionSchema = new mongoose.Schema(
  {
    decision: {
      type: String,
      enum: complianceDecisionValues,
    },
    triggeredRule: {
      type: String,
    },
    reviewerId: {
      type: String,
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
