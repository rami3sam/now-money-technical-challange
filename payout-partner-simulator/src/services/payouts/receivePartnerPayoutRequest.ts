import { v7 as uuidv7 } from "uuid";
import { TaskHandlers } from "../../enums/taskHandlers.enum.js";
import { Payout } from "../../models/payout.js";
import { Task } from "../../models/task.js";
import type { PayoutsRepository } from "../../repositories/payouts.repository.js";
import { InitatePayoutType } from "../../validations/initiatePayout.js";
import type { TasksService } from "../tasks.service.js";
import { logger } from "../../config/logger.js";

export const receivePartnerPayoutRequest = async (
  payoutsRepository: PayoutsRepository,
  tasksService: TasksService,
  initiatePayout: InitatePayoutType,
) => {
   
  const databasePayout = await payoutsRepository.findByPartnerPayoutId(
    initiatePayout.payoutId,
  );

  if (databasePayout) {
    return {
      partnerPayoutId: databasePayout.partnerPayoutId,
      status: databasePayout.payoutStatus,
    };
  }

  const payout = new Payout({
    sender: { name: initiatePayout.sender.name },
    recipient: {
      name: initiatePayout.recipient.name,
      country: initiatePayout.recipient.country,
      payoutMethod: initiatePayout.recipient.payoutMethod,
      payoutDetails: {
        accountNumber: initiatePayout.recipient.payoutDetails.accountNumber,
        personalIDNumber:
          initiatePayout.recipient.payoutDetails.personalIDNumber,
        personalIDType: initiatePayout.recipient.payoutDetails.personalIDType,
      },
    },
    sendAmount: initiatePayout.sendAmount,
    sendCurrency: initiatePayout.sendCurrency,
    payoutCurrency: initiatePayout.payoutCurrency,
    payoutAmount: initiatePayout.payoutAmount,
    partnerPayoutId: initiatePayout.payoutId,
    payoutId: uuidv7(),
  });

  await payout.save();
  if (!payout) throw new Error("Failed to save payout to database");


  await tasksService.add(
    new Task({
      taskHandler: TaskHandlers.PROCESS_PAYOUT,
      payload: payout._id,
      executeAt: new Date(Date.now() + 500),
    }),
  );

  return {
    partnerPayoutId: payout.partnerPayoutId,
    status: payout.payoutStatus,
  };
};

export { receivePartnerPayoutRequest as partnerPayoutController };
