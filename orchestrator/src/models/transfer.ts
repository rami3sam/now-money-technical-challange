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

const transferSchema = new mongoose.Schema(
  {
    sender: {
      senderId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },

    recipient: {
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
        accountNumber: {
          type: String,
        },
        personalIDNumber: {
          type: String,
        },
        personalIDType: {
          type: String,
        },
      },
    },

    sendAmount: {
      type: String,
      required: true,
      minLength: 1,
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
      immutable: (value: TransferType) => {
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

    complianceDecisions: {
      type: [complianceDecisionSchema],
    },
  },
  {
    timestamps: true,
  },
);

export const Transfer = mongoose.model("Transfers", transferSchema);

export type TransferType = InferSchemaType<typeof transferSchema>;
