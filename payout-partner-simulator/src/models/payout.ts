import mongoose, { Mongoose, Schema, type InferSchemaType } from "mongoose";
import { PayoutMethodsValues } from "../enums/payoutMethods.enum.ts";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.ts";
import {
  allValuesProvidedValidator,
  isValidMoney,
} from "../utils/validatorFunctions.ts";
import { CountryCodesValues } from "../enums/countryCodes.enum.ts";

const payoutSchema = new mongoose.Schema(
  {
    sender: {
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

    partnerPayoutId: {
      type: String,
      immutable: true
    },

    payoutId: {
      type: String,
      immutable: (value: any) => {
        return value.payoutId !== undefined;
      },
    },
  },
  {
    timestamps: true,
  },
);

export const Payout = mongoose.model("Payouts", payoutSchema);