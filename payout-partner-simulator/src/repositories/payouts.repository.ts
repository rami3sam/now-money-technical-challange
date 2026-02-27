import { Payout, type PayoutType } from "../models/payout.ts";

export class PayoutsRepository {
  findById(id: string) {
    return Payout.findById(id).exec();
  }

  async create(data: PayoutType) {
    const newPayout = await Payout.create(data);
    const savedPayout = await newPayout.save();
    if (!savedPayout) throw new Error("Failed to save payout");
    return savedPayout;
  }

  async updatePayout(id: string, updates: Partial<PayoutType>) {
    return Payout.findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { returnDocument: "after" },
    ).exec();
  }

  findBetweenDates(startDate: Date, endDate: Date) {
    return Payout.find({
      createdAt: {
        $gte: startDate.getTime(),
        $lte: endDate.getTime(),
      },
    }).exec();
  }

  findByPartnerPayoutId(partnerPayoutId: string) {
    return Payout.findOne({ partnerPayoutId }).exec();
  }
}
