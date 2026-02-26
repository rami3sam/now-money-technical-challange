export enum TransferStatus {
  CREATED = "CREATED",
  QUOTED = "QUOTED",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",

  COMPLIANCE_PENDING = "COMPLIANCE_PENDING",
  COMPLIANCE_APPROVED = "COMPLIANCE_APPROVED",
  COMPLIANCE_REJECTED = "COMPLIANCE_REJECTED",

  PAYOUT_PENDING = "PAYOUT_PENDING",

  PAID = "PAID",
  FAILED = "FAILED",

  REFUNDED = "REFUNDED",
}

export const allowedTransitions: Record<TransferStatus, TransferStatus[]> = {
  [TransferStatus.CREATED]: [
    TransferStatus.QUOTED,
    TransferStatus.CANCELLED,
  ],
  [TransferStatus.QUOTED]: [
    TransferStatus.CONFIRMED,
    TransferStatus.CANCELLED,
    TransferStatus.QUOTED,
  ],
  [TransferStatus.CONFIRMED]: [
    TransferStatus.COMPLIANCE_PENDING,
    TransferStatus.COMPLIANCE_APPROVED,
    TransferStatus.COMPLIANCE_REJECTED,
    TransferStatus.CANCELLED,
  ],
  [TransferStatus.COMPLIANCE_PENDING]: [
    TransferStatus.COMPLIANCE_APPROVED,
    TransferStatus.COMPLIANCE_REJECTED,
    TransferStatus.CANCELLED,
  ],
  [TransferStatus.COMPLIANCE_APPROVED]: [
    TransferStatus.PAYOUT_PENDING,
    TransferStatus.CANCELLED,
  ],
  [TransferStatus.COMPLIANCE_REJECTED]: [TransferStatus.REFUNDED],

  [TransferStatus.CANCELLED]: [TransferStatus.REFUNDED],
  [TransferStatus.PAYOUT_PENDING]: [TransferStatus.PAID, TransferStatus.FAILED],
  [TransferStatus.PAID]: [],
  [TransferStatus.FAILED]: [TransferStatus.REFUNDED],
  [TransferStatus.REFUNDED]: [],
};



export function assertTransferStatusTransition(from: TransferStatus, to: TransferStatus) {
  if (!Object.keys(allowedTransitions).includes(from))
    throw Error(`Invalid from status "${from}"`);
  if (!allowedTransitions[from]!.includes(to))
    throw Error(`Invalid transfer status transition from "${from}" to "${to}"`);
}

function transposeTransitions(transitions: Record<TransferStatus, TransferStatus[]>) {
  const result: Map<TransferStatus, TransferStatus[]> = new Map();

  for (const [from, toList] of Object.entries(transitions)) {
    // ensure key exists even if no one points to it
    if (!result.has(from as TransferStatus)) result.set(from as TransferStatus, []);

    for (const to of toList) {
      if (!result.has(to as TransferStatus)) result.set(to as TransferStatus, []);
      result.get(to as TransferStatus)!.push(from as TransferStatus);
    }
  }

  return result;
}

export const reverseTransitions = transposeTransitions(allowedTransitions);

export const TransferStatusValues = Object.values(TransferStatus) as string[];
