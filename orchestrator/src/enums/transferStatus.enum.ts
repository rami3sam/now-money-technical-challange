export enum TransferStatus {
  CREATED = "CREATED",
  QUOTED = "QUOTED",
  CONFIRMED = "CONFIRMED",

  COMPLIANCE_PENDING = "COMPLIANCE_PENDING",
  COMPLIANCE_APPROVED = "COMPLIANCE_APPROVED",
  COMPLIANCE_REJECTED = "COMPLIANCE_REJECTED",

  PAYOUT_PENDING = "PAYOUT_PENDING",

  PAID = "PAID",
  FAILED = "FAILED",

  REFUNDED = "REFUNDED",
  CANELLED = "CANCELLED",
}


export const allowedTransitions: Record<string, string[]> = {
  [TransferStatus.CREATED]: [TransferStatus.QUOTED],
  [TransferStatus.QUOTED]: [TransferStatus.CONFIRMED],
  [TransferStatus.CONFIRMED]: [TransferStatus.COMPLIANCE_PENDING, TransferStatus.PAYOUT_PENDING],
  [TransferStatus.COMPLIANCE_PENDING]: [TransferStatus.COMPLIANCE_APPROVED, TransferStatus.COMPLIANCE_REJECTED],
  [TransferStatus.COMPLIANCE_APPROVED]: [TransferStatus.PAYOUT_PENDING],
  [TransferStatus.COMPLIANCE_REJECTED]: [TransferStatus.REFUNDED],
  [TransferStatus.PAYOUT_PENDING]: [TransferStatus.PAID, TransferStatus.FAILED],
  [TransferStatus.PAID]: [],
  [TransferStatus.FAILED]: [TransferStatus.REFUNDED],
  [TransferStatus.REFUNDED]: [],
  [TransferStatus.CANELLED]: []
};

export function assertTransferStatusTransition(from: string, to: string) {
  if(!Object.keys(allowedTransitions).includes(from)) throw Error(`Invalid from status "${from}"`);
  if (!allowedTransitions[from]!.includes(to)) throw Error(`Invalid transfer status transition from "${from}" to "${to}"`);
}

export const TransferStatusValues = Object.values(TransferStatus) as string[];