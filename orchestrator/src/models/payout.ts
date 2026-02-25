import mongoose, { Mongoose, Schema, type InferSchemaType } from "mongoose";
import { PayoutMethodsValues } from "../enums/payoutMethods.enum.ts";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.ts";
import {
  allValuesProvidedValidator,
  isValidMoney,
} from "../utils/validatorFunctions.ts";
import { CountryCodesValues } from "../enums/countryCodes.enum.ts";
import {
  PayoutStatus,
  PayoutStatusValues,
} from "../enums/payoutStatus.enum.ts";

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

    payoutAmount: {
      type: String,
      required: true,
      minLength: 1,
      valdate: {
        validator: isValidMoney,
        message: "payoutAmount must be a valid money string eg 100.00",
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

    payoutIdFromPartner: {
      type: String,
      immutable: true,
    },

    partnerPayoutId: {
      type: String,
      immutable: (value: any) => {
        return value.payoutId !== undefined;
      },
    },
    payoutStatus: {
      type: String,
      enum: PayoutStatusValues,
      default: PayoutStatus.PENDING,
    },
  },
  {
    timestamps: true,
    _id: false,
  },
);

export const Payout = mongoose.model("Payouts", payoutSchema);
export type PayoutType = InferSchemaType<typeof payoutSchema>;
