import mongoose, { type InferSchemaType } from "mongoose";
import { complianceDecisionValues } from "../enums/complianceDecisions.js";
import { required } from "zod/mini";

export const complianceDecisionSchema = new mongoose.Schema(
  {
    decision: {
      type: String,
      enum: complianceDecisionValues,
      required: true,
    },
    triggeredRule: {
      type: String,
      required: true,
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
