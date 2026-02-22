import mongoose from "mongoose";
import { PayoutMethodsValues } from "../enums/payoutMethods.enum.ts";
import { TransferStatusValues } from "../enums/transferStatus.enum.ts";
import { CountryCodesValues } from "../enums/countryCodes.enum.ts";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.ts";
import { minLength } from "zod";
import { isValid } from "zod/v3";
import { isValidMoney } from "../utils/validatorFunctions.ts";

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
  },
  {
    timestamps: true,
  },
);

export const Transfer = mongoose.model("Transfer", transferSchema);
