import { Transfer, type TransferType } from "../models/transfer.ts";

export class TransferRepository {
  findById(id: string) {
    return Transfer.findById(id).exec();
  }

  async create(data: TransferType) {
    console.log("Creating transfer with data:", data);
    const newTransfer = await Transfer.create(data);
    const savedTransfer = await newTransfer.save();
    if (!savedTransfer) throw new Error("Failed to save transfer");
    return savedTransfer;
  }

  updateTransfer(id: string, updates: TransferType) {
    

    return Transfer.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: "after" },
    ).exec();
  }

  findBySenderId(senderId: string) {
    return Transfer.find({ "sender.senderId": senderId }).exec();
  }
}
