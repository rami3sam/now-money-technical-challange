import { TransferStatus } from "../enums/transferStatus.enum.ts";
import { Transfer, type TransferType } from "../models/transfer.ts";

export class TransferRepository {
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

  async updateTransfer(id: string, updates: TransferType) {
    const transfer = await Transfer.findById(id).exec();
    if (!transfer) throw Error(`Transfer with id ${id} not found`);

    if (updates.status) {
      updates.stateHistory.push({ state: updates.status });
    }

    return Transfer.findOneAndUpdate(
      { _id: id, status: transfer.status },
      { $set: updates },
      { returnDocument: "after" },
    ).exec();
  }

  findBySenderId(senderId: string) {
    return Transfer.find({ "sender.senderId": senderId }).exec();
  }
}
