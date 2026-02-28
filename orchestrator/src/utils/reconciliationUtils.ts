import currency from "currency.js";
import type { TransferType } from "../models/transfer.js";
import type { PayoutType } from "../models/payout.js";
import { EnvVariables } from "../constants/config.js";

export function calculateReconciliationDifference(
  transfer: TransferType,
  payout: PayoutType,
) {
  const payoutAmountDifference = currency(payout.payoutAmount).subtract(
    transfer.immutableQuoteSnapshot?.payoutAmount || 0,
  ).value;

  const sendAmountDifference = currency(payout.sendAmount).subtract(
    transfer.sendAmount,
  ).value;

  const matchingAmounts =
    transfer.immutableQuoteSnapshot &&
    transfer.immutableQuoteSnapshot.payoutAmount &&
    currency(payout.sendAmount).value === currency(transfer.sendAmount).value &&
    currency(payout.payoutAmount).value ===
      currency(transfer.immutableQuoteSnapshot.payoutAmount).value;

  const matchingCurrencies =
    payout.sendCurrency.toLowerCase() === transfer.sendCurrency.toLowerCase() &&
    payout.payoutCurrency.toLowerCase() ===
      transfer.payoutCurrency.toLowerCase();

  const matchingStatus =
    payout.payoutStatus.toLowerCase() === transfer.payoutsStatus?.toLowerCase();

  const matchingAmountsWithTolerance =
    transfer.immutableQuoteSnapshot &&
    transfer.immutableQuoteSnapshot.payoutAmount &&
    Math.abs(
        currency(payout.sendAmount).subtract(transfer.sendAmount).value,
    ) <= EnvVariables.RECONCILIATION_TOLERANCE &&
    Math.abs(
      currency(payout.payoutAmount).subtract(
        transfer.immutableQuoteSnapshot.payoutAmount,
      ).value,
    ) <= EnvVariables.RECONCILIATION_TOLERANCE;

  return {
    payoutAmountDifference,
    sendAmountDifference,
    matchingAmounts,
    matchingCurrencies,
    matchingStatus,
    matchingAmountsWithTolerance,
  };
}
