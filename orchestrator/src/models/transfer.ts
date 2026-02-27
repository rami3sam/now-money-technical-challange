import mongoose, { Mongoose, Schema, type InferSchemaType } from "mongoose";
import { PayoutMethodsValues } from "../enums/payoutMethods.enum.ts";
import { TransferStatusValues } from "../enums/transferStatus.enum.ts";
import { CountryCodesValues } from "../enums/countryCodes.enum.ts";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.ts";
import {
  allValuesProvidedValidator,
  isValidMoney,
} from "../utils/validatorFunctions.ts";
import { quoteSchema } from "./quote.ts";
import { immutableQuoteSchema } from "./immutableQuote.ts";
import { complianceDecisionSchema } from "./complianceDecision.ts";
import { transferStateHistorySchema } from "./transferStateHistory.ts";
import { PayoutStatus } from "../enums/payoutStatus.enum.ts";
import { required } from "zod/mini";

export const transferSchema = new mongoose.Schema(
  {
    sender: {
      type: {
        senderId: {
          type: String,
          required: true,
          index: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
      required: true,
      _id: false,
    },

    recipient: {
      type: {
        name: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          enum: CountryCodesValues,
          required: true,
          minlength: 2,
        },
        payoutMethod: {
          type: String,
          enum: PayoutMethodsValues,
          required: true,
        },

        payoutDetails: {
          type: {
            accountNumber: {
              type: String,
              required: false,
            },
            personalIDNumber: {
              type: String,
              required: false,
            },
            personalIDType: {
              type: String,
              required: false,
            },
          },
          required: true,
          _id: false,
        },
      },
      required: true,
    },

    sendAmount: {
      type: String,
      required: true,
      valdate: {
        validator: isValidMoney,
        message: "sendAmount must be a valid money string eg 100.00",
      },
    },

    quote: {
      type: quoteSchema,
      validate: {
        validator: allValuesProvidedValidator(Object.keys(quoteSchema.paths)),
        message: "quote must be either fully null or fully provided",
      },
    },

    immutableQuoteSnapshot: {
      type: immutableQuoteSchema,
      immutable: (value: any) => {
        return value.immutableQuoteSnapshot !== undefined;
      },
      validate: {
        validator: allValuesProvidedValidator(
          Object.keys(immutableQuoteSchema.paths),
        ),
        message:
          "immutableQuoteSnapshot must be either fully null or fully provided",
      },
    },

    final: {
      paidAmount: {
        type: String,
        valdate: {
          validator: isValidMoney,
          message: "sendAmount must be a valid money string eg 100.00",
        },
      },
      refundedAmount: {
        type: String,
        valdate: {
          validator: isValidMoney,
          message: "refundedAmount must be a valid money string eg 100.00",
        },
      },
      feesCharged: {
        type: String,
        valdate: {
          validator: isValidMoney,
          message: "feesCharged must be a valid money string eg 100.00",
        },
      },
    },

    sendCurrency: {
      type: String,
      enum: CurrencyCodesValues,
      required: true,
      minlength: 3,
      maxlength: 3,
    },

    payoutCurrency: {
      type: String,
      enum: CurrencyCodesValues,
      required: true,
      minlength: 3,
      maxlength: 3,
    },

    status: {
      type: String,
      enum: TransferStatusValues,
      required: true,
    },

    payoutsStatus: {
      type: String,
      enum: PayoutStatus,
      required: false,
    },

    complianceDecisions: {
      type: [complianceDecisionSchema],
    },

    stateHistory: {
      type: [transferStateHistorySchema],
    },

    payoutId: {
      type: String,
      immutable: (value: any) => {
        return value.payoutId !== undefined;
      },
    },

    isPayoutProcessed: {
      type: Boolean,
      default: false,
    },

    partnerPayoutId: {
      type: String,
      immutable: (value: any) => {
        return value.partnerPayoutId !== undefined;
      },
    },
  },
  {
    timestamps: true,
  },
);

export const Transfer = mongoose.model("Transfers", transferSchema);
export type TransferType = InferSchemaType<typeof transferSchema>;
