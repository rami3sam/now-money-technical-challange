export enum PayoutStatus {
  PENDING = "PENDING",
  FAILED = "FAILED",
  PAID = "PAID",
}

export const PayoutStatusValues = Object.values(PayoutStatus) as string[];
