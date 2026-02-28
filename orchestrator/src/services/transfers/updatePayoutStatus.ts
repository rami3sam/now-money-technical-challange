import { PayoutStatus } from "../../enums/payoutStatus.enum.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import type { PayoutType } from "../../models/payout.ts";
import { Task } from "../../models/task.ts";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";
import type { PayoutStatusType } from "../../validations/payoutStatus.ts";
import type { TasksService } from "../tasks.service.ts";

export const updatePayoutStatus = async (
  transfersRepository: TransfersRepository,
  tasksService: TasksService,
  payoutStatus: PayoutStatusType,
) => {
  const transfer = await transfersRepository.findByPartnerPayoutId(
    payoutStatus.partnerPayoutId as string,
  );
  if (!transfer) throw Error("Transfer not found");

  if (transfer.isPayoutProcessed) {
    return transfer;
  }

  if (payoutStatus.status === PayoutStatus.PAID) {
    const updatedTransfer = await transfersRepository.updatePayoutStatus(
      transfer.id,
      PayoutStatus.PAID,
    );

    if (!updatedTransfer)
      throw new Error("Failed to update transfer status to PAID");
    return updatedTransfer;
  } else if (payoutStatus.status === PayoutStatus.FAILED) {
    const updatedTransfer = await transfersRepository.updatePayoutStatus(
      transfer.id,
      PayoutStatus.FAILED,
    );

    if (!updatedTransfer)
      throw new Error("Failed to update transfer status to FAILED");

    const task = await tasksService.add(
      new Task({
        taskHandler: TaskHandlers.REFUND_TRANSFER,
        payload: updatedTransfer.id,
      }),
    );

    if (!task)
      throw new Error("Failed to create refund task for failed payout");
    return updatedTransfer;
  } else {
    throw new Error(`Unhandled payout status: ${payoutStatus.status}`);
  }
};
