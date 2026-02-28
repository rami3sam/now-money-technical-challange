import { ComplianceDecisions } from "../enums/complianceDecisions.ts";
import { PayoutStatus } from "../enums/payoutStatus.enum.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../enums/transferStatus.enum.ts";
import type { QuoteType } from "../models/quote.ts";
import { Transfer, type TransferType } from "../models/transfer.ts";

export class TransfersRepository {
  findById(id: string) {
    return Transfer.findById(id).exec();
  }

  async create(data: TransferType) {
    const newTransfer = await Transfer.create(data);
    newTransfer.stateHistory.push({ state: data.status });
    const savedTransfer = await newTransfer.save();
    if (!savedTransfer) throw new Error("Failed to save transfer");
    return savedTransfer;
  }

  async markPayoutPending(id: string, payoutId: string) {
    return await Transfer.findOneAndUpdate(
      {
        _id: id,
        status: TransferStatus.COMPLIANCE_APPROVED,
      },
      {
        $set: { status: TransferStatus.PAYOUT_PENDING, payoutId: payoutId },
        $push: { stateHistory: { state: TransferStatus.PAYOUT_PENDING } },
      },
      { returnDocument: "after" },
    ).exec();
  }

  async markTransferAsConfirmed(id: string) {
    return await Transfer.findOneAndUpdate(
      {
        _id: id,
        status: TransferStatus.QUOTED,
        "quote.expiry": { $gt: new Date() },
      },
      [
        {
          $set: {
            status: TransferStatus.CONFIRMED,
            immutableQuoteSnapshot: "$quote",
            "final.paidAmount": "$sendAmount",
            stateHistory: {
              $concatArrays: [
                "$stateHistory",
                [{ state: TransferStatus.CONFIRMED }],
              ],
            },
          },
        },
      ],
      { returnDocument: "after", updatePipeline: true },
    ).exec();
  }

  async markTransferAsCancelled(id: string) {
    return await Transfer.findOneAndUpdate(
      {
        _id: id,
        status: {
          $in: [
            TransferStatus.CREATED,
            TransferStatus.QUOTED,
            TransferStatus.CONFIRMED,
            TransferStatus.COMPLIANCE_PENDING,
            TransferStatus.COMPLIANCE_APPROVED,
          ],
        },
      },
      {
        $set: { status: TransferStatus.CANCELLED },
        $push: { stateHistory: { state: TransferStatus.CANCELLED } },
      },
    ).exec();
  }

  async markTransferAsCompliancePending(
    id: string,
    complianceDecision: {
      decision: ComplianceDecisions;
      triggeredRule: string;
    },
  ) {
    return await Transfer.findOneAndUpdate(
      {
        _id: id,
        status: {
          $in: [TransferStatus.CONFIRMED],
        },
      },
      {
        $set: { status: TransferStatus.COMPLIANCE_PENDING },
        $push: {
          complianceDecisions: complianceDecision,
          stateHistory: { state: TransferStatus.COMPLIANCE_PENDING },
        },
      },
      { returnDocument: "after" },
    ).exec();
  }

  async markTransferAsApproved(
    id: string,
    complianceDecision: {
      decision: ComplianceDecisions;
      triggeredRule: string;
      reviewerId?: string;
    },
  ) {
    return await Transfer.findOneAndUpdate(
      {
        _id: id,
        status: {
          $in: [TransferStatus.COMPLIANCE_PENDING, TransferStatus.CONFIRMED],
        },
      },
      {
        $set: { status: TransferStatus.COMPLIANCE_APPROVED },
        $push: {
          complianceDecisions: complianceDecision,
          stateHistory: { state: TransferStatus.COMPLIANCE_APPROVED },
        },
      },
      { returnDocument: "after" },
    ).exec();
  }

  markTransferAsRejected(
    id: string,
    complianceDecision: {
      decision: ComplianceDecisions;
      triggeredRule: string;
      reviewerId?: string;
    },
  ) {
    return Transfer.findOneAndUpdate(
      {
        _id: id,
        status: {
          $in: [TransferStatus.COMPLIANCE_PENDING, TransferStatus.CONFIRMED],
        },
      },
      {
        $set: { status: TransferStatus.COMPLIANCE_REJECTED },
        $push: {
          complianceDecisions: complianceDecision,
          stateHistory: { state: TransferStatus.COMPLIANCE_REJECTED },
        },
      },
      { returnDocument: "after" },
    ).exec();
  }

  findBySenderId(senderId: string) {
    return Transfer.find({ "sender.senderId": senderId }).exec();
  }

  findByPartnerPayoutId(partnerPayoutId: string) {
    return Transfer.findOne({ partnerPayoutId: partnerPayoutId }).exec();
  }

  updatePartnerPayoutId(id: string, partnerPayoutId: string) {
    return Transfer.findByIdAndUpdate(
      id,
      { partnerPayoutId },
      { returnDocument: "after" },
    ).exec();
  }

  updateTransferQuote(id: string, quoteData: QuoteType) {
    return Transfer.findOneAndUpdate(
      {
        _id: id,
        status: { $in: [TransferStatus.CREATED, TransferStatus.QUOTED] },
      },
      {
        $set: { quote: quoteData, status: TransferStatus.QUOTED },
        $push: { stateHistory: { state: TransferStatus.QUOTED } },
      },

      { returnDocument: "after" },
    ).exec();
  }

  updatePayoutStatus(id: string, payoutStatus: PayoutStatus) {
    if (payoutStatus === PayoutStatus.PAID) {
      return Transfer.findOneAndUpdate(
        {
          _id: id,
          status: TransferStatus.PAYOUT_PENDING,
        },
        {
          $set: {
            status: TransferStatus.PAID,
            payoutStatus: PayoutStatus.PAID,
            isPayoutProcessed: true,
          },
          $push: { stateHistory: { state: TransferStatus.PAID } },
        },
        { returnDocument: "after" },
      ).exec();
    } else if (payoutStatus === PayoutStatus.FAILED) {
      return Transfer.findOneAndUpdate(
        {
          _id: id,
          status: TransferStatus.PAYOUT_PENDING,
        },
        {
          $set: {
            status: TransferStatus.FAILED,
            payoutStatus: PayoutStatus.FAILED,
            isPayoutProcessed: true,
          },
          $push: { stateHistory: { state: TransferStatus.FAILED } },
        },
        { returnDocument: "after" },
      ).exec();
    }
  }

  refundTransfer(id: string, refundedAmount: string, feesCharged: string) {
    return Transfer.findOneAndUpdate(
      {
        _id: id,
        status: {
          $in: [
            TransferStatus.COMPLIANCE_REJECTED,
            TransferStatus.CANCELLED,
            TransferStatus.FAILED,
          ],
        },
      },
      {
        $set: {
          status: TransferStatus.REFUNDED,
          "final.refundedAmount": refundedAmount,
          "final.feesCharged": feesCharged,
        },
        $push: { stateHistory: { state: TransferStatus.REFUNDED } },
      },
      { returnDocument: "after" },
    ).exec();
  }

  findBetweenDates(startDate: Date, endDate: Date) {
    return Transfer.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).exec();
  }
}
