export enum PayoutStatus {
  PENDING = "PENDING",
  FAILED = "FAILED",
  PAID = "PAID",
}

export const allowedTransitions: Record<string, string[]> = {
  [PayoutStatus.PENDING]: [PayoutStatus.FAILED, PayoutStatus.PAID],
};

export const PayoutStatusValues = Object.values(PayoutStatus) as string[];
