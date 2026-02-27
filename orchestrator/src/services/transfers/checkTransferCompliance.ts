import currency from "currency.js";
import { bannedCountries, bannedPeople } from "../../constants/constants.ts";
import { ComplianceDecisions } from "../../enums/complianceDecisions.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import { TransfersRepository } from "../../repositories/transfers.repository.ts";
import {
  checkForNameInList,
  getComplianceMaximum,
} from "../../utils/utilFunctions.ts";
import type { CurrencyCodes } from "../../enums/currencyCodes.enum.ts";
import type { TasksService } from "../tasks.service.ts";
import { Task } from "../../models/task.ts";

export async function checkTransferCompliance(
  transfersRepository: TransfersRepository,
  tasksService: TasksService,
  id: string,
) {
  const transfer = await transfersRepository.findById(id);
  if (!transfer) throw Error(`Transfer with id ${id} not found`);

  const { recipient } = transfer;
  if (!recipient) throw Error("Transfer recipient not found");

  if (bannedCountries.includes(recipient.country)) {
    assertTransferStatusTransition(
      transfer.status as TransferStatus,
      TransferStatus.COMPLIANCE_REJECTED,
    );

    const updatedTransfer = await transfersRepository.markTransferAsRejected(
      id,
      `Recipient country "${recipient.country}" is banned`,
    );

    if (!updatedTransfer)
      throw new Error(
        "Failed to update transfer status to COMPLIANCE_REJECTED",
      );

    tasksService.add(
      new Task({
        taskHandler: TaskHandlers.REFUND_TRANSFER,
        payload: updatedTransfer.id,
      }),
    );

    return updatedTransfer;
  } else if (checkForNameInList(recipient.name, bannedPeople)) {
    assertTransferStatusTransition(
      transfer.status as TransferStatus,
      TransferStatus.COMPLIANCE_PENDING,
    );

    const updatedTransfer =
      await transfersRepository.markTransferAsCompliancePending(
        transfer.id,
        `Recipient name ${recipient.name} is banned`,
      );

    if (!updatedTransfer)
      throw new Error("Failed to update transfer status to COMPLIANCE_PENDING");
    return updatedTransfer;
  } else if (
    currency(transfer.sendAmount).value <
    currency(getComplianceMaximum(transfer.sendCurrency as CurrencyCodes)).value
  ) {
    assertTransferStatusTransition(
      transfer.status as TransferStatus,
      TransferStatus.COMPLIANCE_APPROVED,
    );

    const updatedTransfer = await transfersRepository.markTransferAsApproved(
      transfer.id,
      `amount ${transfer.sendAmount} is below compliance threshold`,
    );

    if (!updatedTransfer)
      throw new Error(
        "Failed to update transfer status to COMPLIANCE_APPROVED",
      );

    tasksService.add(
      new Task({
        taskHandler: TaskHandlers.INITIATE_PAYOUT,
        payload: updatedTransfer.id,
      }),
    );

    return updatedTransfer;
  } else {
    assertTransferStatusTransition(
      transfer.status as TransferStatus,
      TransferStatus.COMPLIANCE_PENDING,
    );

    const updatedTransfer =
      await transfersRepository.markTransferAsCompliancePending(
        transfer.id,
        `amount ${transfer.sendAmount} is above compliance threshold`,
      );

    if (!updatedTransfer)
      throw new Error("Failed to update transfer status to COMPLIANCE_PENDING");
    return updatedTransfer;
  }
}
