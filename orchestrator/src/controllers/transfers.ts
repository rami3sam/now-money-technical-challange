import type { Request, Response } from "express";
import { createTransferSchema } from "../validations/createTransfer.ts";
import { PayoutMethods } from "../enums/payoutMethods.enum.ts";
import { Transfer, type TransferType } from "../models/transfer.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../enums/transferStatus.enum.ts";

import { addToTransferQueue } from "../queues/transferQueue.ts";
import { ComplianceDecisions } from "../enums/complianceDecisions.ts";

const createTransfer = async (req: Request, res: Response) => {
  try {
    const transfer = createTransferSchema.parse(req.body);
    const {
      recipient,
      recipient: { payoutDetails, payoutMethod },
    } = transfer;

    const bankInfoNotOk =
      payoutMethod == PayoutMethods.Bank &&
      payoutDetails.accountNumber == undefined;

    const cashInfoNotOk =
      payoutMethod === PayoutMethods.Cash &&
      (payoutDetails.personalIDNumber === undefined ||
        payoutDetails.personalIDType === undefined);

    if (bankInfoNotOk || cashInfoNotOk)
      throw Error("You must specify recipient details correctly");

    const dbTransfer = new Transfer({
      ...transfer,
      status: TransferStatus.CREATED,
    });

    await dbTransfer.save();

    addToTransferQueue(dbTransfer.id);

    res.status(200).json(dbTransfer);
  } catch (err: any) {
    res.status(400).json(err.message);
  }
};

const getTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);
    if (!transfer) throw Error("Transfer not found");
    res.status(200).json({ transfer });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

const confirmTransferQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);
    if (!transfer) throw Error("Transfer not found");

    if (transfer.status !== TransferStatus.QUOTED)
      throw Error("Transfer status is not quoted");

    if (
      transfer.quote?.expiry &&
      new Date(transfer.quote.expiry) > new Date()
    ) {
      transfer.immutableQuoteSnapshot = { ...transfer.quote };
      assertTransferStatusTransition(transfer.status, TransferStatus.CONFIRMED);
      transfer.status = TransferStatus.CONFIRMED;

      const newTransfer = await Transfer.findOneAndUpdate(
        { _id: id, status: TransferStatus.QUOTED },
        { $set: transfer },
        { returnDocument: "after" },
      ).exec();

      if (newTransfer) addToTransferQueue(transfer.id);
      else throw Error("Failed to update transfer status to CONFIRMED");

      res.status(200).json({ newTransfer });
    } else {
      assertTransferStatusTransition(
        transfer.status,
        TransferStatus.QUOTE_EXPIRED,
      );
      transfer.status = TransferStatus.QUOTE_EXPIRED;
      transfer.quote = null;
      const newTransfer = await Transfer.findOneAndUpdate(
        { _id: id, status: TransferStatus.QUOTED },
        { $set: transfer },
        { returnDocument: "after" },
      ).exec();

      if (newTransfer) addToTransferQueue(transfer.id);
      else throw Error("Failed to update transfer status to QUOTE_EXPIRED");

      throw Error("Quote has expired");
    }
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

const cancelTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);
    if (!transfer) throw Error("Transfer not found");

    assertTransferStatusTransition(transfer.status, TransferStatus.CANCELLED);
    transfer.status = TransferStatus.CANCELLED;
    const newTransfer = await Transfer.findOneAndUpdate(
      {
        _id: id,
        status: {
          $in: [
            TransferStatus.CREATED,
            TransferStatus.QUOTED,
            TransferStatus.CONFIRMED,
          ],
        },
      },
      { $set: transfer },
      { returnDocument: "after" },
    ).exec();

    addToTransferQueue(transfer.id);

    res.status(200).json({ newTransfer });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

const approveTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);
    if (!transfer) throw Error("Transfer not found");

    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_APPROVED,
    );
    transfer.status = TransferStatus.COMPLIANCE_APPROVED;
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.APPROVED,
      triggeredRule: `Transfer approved by manual review`,
      reviewerId: "1",
    });

    const newTransfer = await Transfer.findOneAndUpdate(
      {
        _id: id,
        status: TransferStatus.COMPLIANCE_PENDING,
      },
      { $set: transfer },
      { returnDocument: "after" },
    ).exec();

    addToTransferQueue(transfer.id);

    res.status(200).json({ newTransfer });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

const rejectTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);
    if (!transfer) throw Error("Transfer not found");

    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_REJECTED,
    );
    transfer.status = TransferStatus.COMPLIANCE_REJECTED;
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.REJECTED,
      triggeredRule: `Transfer rejected by manual review`,
      reviewerId: "1",
    });
    const newTransfer = await Transfer.findOneAndUpdate(
      {
        _id: id,
        status: TransferStatus.COMPLIANCE_PENDING,
      },
      { $set: transfer },
      { returnDocument: "after" },
    ).exec();

    addToTransferQueue(transfer.id);

    res.status(200).json({ newTransfer });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export {
  createTransfer,
  getTransfer,
  confirmTransferQuote,
  cancelTransfer,
  approveTransfer,
  rejectTransfer,
};
