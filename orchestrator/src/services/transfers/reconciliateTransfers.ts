import axios from "axios";
import { ReconciliationStatus } from "../../enums/reconciliationStatus.enum.js";
import type { PayoutType } from "../../models/payout.js";
import type { TransferType } from "../../models/transfer.js";
import type { TransfersRepository } from "../../repositories/transfers.repository.js";
import { payoutSchema } from "../../validations/payout.js";
import { calculateReconciliationDifference } from "../../utils/reconciliationUtils.js";
import { Reconciliation } from "../../models/reconciliation.js";
import { uuidv7 } from "zod";

export async function reconciliateTransfers(
  transfersRepository: TransfersRepository,
  startDate: Date,
  endDate: Date,
) {
  const reconciliationEntries: {
    transfer?: TransferType & { id: string };
    payout?: PayoutType;
    variance?: {
      payoutAmountDifference: number;
      sendAmountDifference: number;
      currencyMismatch: boolean;
    };
    status: ReconciliationStatus;
  }[] = [];

  const payoutsResponse = await axios.get("http://localhost:8002/payouts", {
    params: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  });

  let payouts = payoutSchema.parse(payoutsResponse.data);
  const transfers = await transfersRepository.findBetweenDates(
    startDate,
    endDate,
  );

  while (transfers.length > 0) {
    const transfer = transfers.pop()!;
    const matchingPayout = payouts.filter(
      (payout) => payout.partnerPayoutId === transfer.partnerPayoutId,
    )[0];

    if (matchingPayout) {
      const {
        payoutAmountDifference,
        sendAmountDifference,
        matchingAmounts,
        matchingCurrencies,
        matchingStatus,
        matchingAmountsWithTolerance,
      } = calculateReconciliationDifference(
        transfer,
        matchingPayout as PayoutType,
      );

      const variance = {
        payoutAmountDifference: payoutAmountDifference,
        sendAmountDifference: sendAmountDifference,
        currencyMismatch: !matchingCurrencies,
      };

      payouts = payouts.filter(
        (p) => p.partnerPayoutId !== transfer.partnerPayoutId,
      );

      if (matchingAmounts && matchingCurrencies && matchingStatus) {
        reconciliationEntries.push({
          transfer: transfer,
          payout: matchingPayout as PayoutType,
          variance: {
            payoutAmountDifference: payoutAmountDifference,
            sendAmountDifference: sendAmountDifference,
            currencyMismatch: !matchingCurrencies,
          },
          status: ReconciliationStatus.MATCHED_EXACT,
        });
      } else if (
        matchingAmountsWithTolerance &&
        matchingCurrencies &&
        matchingStatus
      ) {
        reconciliationEntries.push({
          transfer: transfer,
          payout: matchingPayout as PayoutType,
          variance: variance,
          status: ReconciliationStatus.MATCHED_WITH_TOLERANCE,
        });
      } else if (!matchingStatus) {
        reconciliationEntries.push({
          transfer: transfer,
          payout: matchingPayout as PayoutType,
          variance: variance,
          status: ReconciliationStatus.STATUS_MISMATCH,
        });
      } else if (!matchingAmounts) {
        reconciliationEntries.push({
          transfer: transfer,
          payout: matchingPayout as PayoutType,
          variance: variance,
          status: ReconciliationStatus.AMOUNT_MISMATCH,
        });
      } else if (!matchingCurrencies) {
        reconciliationEntries.push({
          transfer: transfer,
          payout: matchingPayout as PayoutType,
          variance: variance,
          status: ReconciliationStatus.CURRENCY_MISMATCH,
        });
      } else {
        reconciliationEntries.push({
          transfer: transfer,
          payout: matchingPayout as PayoutType,
          variance: variance,
          status: ReconciliationStatus.UNKNOWN_MISMATCH,
        });
      }
    } else {
      reconciliationEntries.push({
        transfer: transfer,
        status: ReconciliationStatus.MISSING_PAYOUT,
      });
    }
  }

  reconciliationEntries.push(
    ...payouts.map((payout) => ({
      payout: payout as PayoutType,
      status: ReconciliationStatus.MISSING_TRANSFER,
    })),
  );

  const reconciliationRecord = new Reconciliation({
    runId: uuidv7(),
    runDate: new Date(),

    reconciliationEntries: reconciliationEntries,

    totalTransfers: reconciliationEntries.filter((entry) => entry.transfer)
      .length,
    totalPayouts: reconciliationEntries.filter((entry) => entry.payout).length,
    totalExactMatch: reconciliationEntries.filter(
      (entry) => entry.status === ReconciliationStatus.MATCHED_EXACT,
    ).length,
    totalToleranceMatch: reconciliationEntries.filter(
      (entry) => entry.status === ReconciliationStatus.MATCHED_WITH_TOLERANCE,
    ).length,
    totalUnmatched: reconciliationEntries.filter(
      (entry) =>
        entry.status === ReconciliationStatus.MISSING_PAYOUT ||
        entry.status === ReconciliationStatus.MISSING_TRANSFER,
    ).length,
    totalOnlyInTransfers: reconciliationEntries.filter(
      (entry) => entry.status === ReconciliationStatus.MISSING_PAYOUT,
    ).length,
    totalOnlyInPayouts: reconciliationEntries.filter(
      (entry) => entry.status === ReconciliationStatus.MISSING_TRANSFER,
    ).length,
  });

  reconciliationRecord.save();
}
