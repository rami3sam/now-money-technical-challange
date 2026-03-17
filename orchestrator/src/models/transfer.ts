import mongoose, { Mongoose, Schema, type InferSchemaType } from "mongoose";
import { PayoutMethodsValues } from "../enums/payoutMethods.enum.js";
import {
  assertTransferStatusTransition,
  TransferStatus,
  TransferStatusValues,
} from "../enums/transferStatus.enum.js";
import { CountryCodesValues } from "../enums/countryCodes.enum.js";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.js";
import {
  allValuesProvidedValidator,
  isValidMoney,
} from "../utils/validatorFunctions.js";
import { quoteSchema } from "./quote.js";
import { immutableQuoteSchema } from "./immutableQuote.js";
import { complianceDecisionSchema } from "./complianceDecision.js";
import { transferStateHistorySchema } from "./transferStateHistory.js";
import { PayoutStatus } from "../enums/payoutStatus.enum.js";
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
      _id: false,
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
    },

    payoutCurrency: {
      type: String,
      enum: CurrencyCodesValues,
      required: true,
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

transferSchema.pre("findOneAndUpdate", async function () {
  const query = this.getQuery();
  const update = this.getUpdate() as any;
  const docToUpdate = await this.model.findOne(query);

  if (!docToUpdate) return;

  const isPipeline = Array.isArray(update);

  if (!isPipeline && update.$set && update.$set.status) {
    assertTransferStatusTransition(docToUpdate.status, update.$set.status);
  } else if (isPipeline) {
    const setStatusUpdate = update.find(
      (stage) => stage.$set && stage.$set.status,
    );
    if (setStatusUpdate) {
      assertTransferStatusTransition(
        docToUpdate.status,
        setStatusUpdate.$set.status,
      );
    }
  }
});

export const Transfer = mongoose.model("Transfers", transferSchema);
export type TransferType = InferSchemaType<typeof transferSchema>;
