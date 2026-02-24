export enum PayoutStatus {
  PENDING = "PENDING",
  FAILED = "FAILED",
  PAID = "PAID",
}

export const allowedTransitions: Record<string, string[]> = {
  [PayoutStatus.PENDING]: [PayoutStatus.FAILED, PayoutStatus.PAID],
};

export function assertTransferStatusTransition(from: string, to: string) {
  if (!Object.keys(allowedTransitions).includes(from))
    throw Error(`Invalid from status "${from}"`);
  if (!allowedTransitions[from]!.includes(to))
    throw Error(`Invalid payout status transition from "${from}" to "${to}"`);
}

export const PayoutStatusValues = Object.values(PayoutStatus) as string[];
