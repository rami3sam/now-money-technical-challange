import mongoose from "mongoose";
import { PayoutMethodsValues } from "../enums/payoutMethods.enum.js";
import { CountryCodesValues } from "../enums/countryCodes.enum.js";
import { CurrencyCodesValues } from "../enums/currencyCodes.enum.js";
import { isValidMoney } from "../utils/validatorFunctions.js";

const quoteSchema = new mongoose.Schema(
  {
    destinationCountry: {
      type: String,
      enum: CountryCodesValues,
      required: false,
      minlength: 2,
    },

    payoutMethod: {
      type: String,
      enum: PayoutMethodsValues,
      required: false,
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

    fxRate: {
      type: String,
      required: true,
    },

    feeAmount: {
      type: String,
      required: true,
    },

    payoutAmount: {
      type: String,
      required: true,
    },

    quoteExpiry: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Quote = mongoose.model("Quotes", quoteSchema);
