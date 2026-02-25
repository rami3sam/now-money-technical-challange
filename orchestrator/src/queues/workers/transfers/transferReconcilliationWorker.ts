import axios from "axios";
import { Transfer, type TransferType } from "../../../models/transfer.ts";
import type { TaskType } from "../../../models/task.ts";
import { payoutSchema } from "../../../validations/payout.ts";
import type { PayoutType } from "../../../models/payout.ts";
import { Reconciliation } from "../../../models/reconcilliation.ts";

export async function transfersReconcilliationWorker(
  task: TaskType & { id: string },
) {
  const startDate: Date = task.payload.startDate;
  const endDate: Date = task.payload.endDate;
  const matched: {
    transfer: TransferType & { id: string };
    payout: PayoutType;
  }[] = [];
  const unmatched: {
    transfer: TransferType & { id: string };
    payout: PayoutType;
  }[] = [];
  const onlyInTransfers: (TransferType & { id: string })[] = [];
  const onlyInPayouts: PayoutType[] = [];

  const payoutsResponse = await axios.get("http://localhost:8002/payouts", {
    params: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  });

  let payouts = payoutSchema.parse(payoutsResponse.data);
  const transfers = await Transfer.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  while (transfers.length > 0) {
    const transfer = transfers.pop()!;
    const matchingPayout = payouts.filter(
      (payout) => payout.partnerPayoutId === transfer.partnerPayoutId,
    )[0];

    if (matchingPayout) {
      const matchingAmounts =
        matchingPayout.sendAmount === transfer.sendAmount &&
        matchingPayout.payoutAmount ===
          transfer.immutableQuoteSnapshot?.payoutAmount;
      const matchingCurrencies =
        matchingPayout.sendCurrency === transfer.sendCurrency &&
        matchingPayout.payoutCurrency === transfer.payoutCurrency;

      payouts = payouts.filter(
        (p) => p.partnerPayoutId !== transfer.partnerPayoutId,
      );

      if (matchingAmounts && matchingCurrencies) {
        matched.push({
          transfer: transfer,
          payout: matchingPayout as PayoutType,
        });
      } else {
        unmatched.push({
          transfer: transfer,
          payout: matchingPayout as PayoutType,
        });
      }
    } else {
      onlyInTransfers.push(transfer);
    }
  }

  onlyInPayouts.push(...(payouts as PayoutType[]));

  const reconciliationRecord = new Reconciliation({
    runId: task.id,
    runDate: new Date(),
    matched: matched.map((m) => ({
      transfer: m.transfer,
      payout: m.payout,
    })),
    unmatched: unmatched.map((m) => ({
      transfer: m.transfer,
      payout: m.payout,
    })),
    onlyInTransfers: onlyInTransfers.map((transfer) => ({
      transfer: transfer,
      reason: "no corresponding payout",
    })),
    onlyInPayouts: onlyInPayouts.map((payout) => ({
      payout: payout,
      reason: "no corresponding transfer",
    })),
    totalTransfers: matched.length + unmatched.length + onlyInTransfers.length,
    totalPayouts: matched.length + unmatched.length + onlyInPayouts.length,
    totalMatched: matched.length,
    totalUnmatched: unmatched.length,
    totalOnlyInTransfers: onlyInTransfers.length,
    totalOnlyInPayouts: onlyInPayouts.length,
  });

  reconciliationRecord.save();
}
