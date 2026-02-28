import currency from "currency.js";
import { bannedCountries, bannedPeople } from "../../constants/constants.js";
import { ComplianceDecisions } from "../../enums/complianceDecisions.js";
import { TaskHandlers } from "../../enums/taskHandlers.enum.js";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.js";
import { TransfersRepository } from "../../repositories/transfers.repository.js";
import {
  checkForNameInList,
  getComplianceMaximum,
} from "../../utils/utilFunctions.js";
import type { CurrencyCodes } from "../../enums/currencyCodes.enum.js";
import type { TasksService } from "../tasks.service.js";
import { Task } from "../../models/task.js";

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

    const decision = ComplianceDecisions.REJECTED_AUTOMATICALLY;

    const complianceDecision = {
      decision: decision,
      triggeredRule: `Recipient country "${recipient.country}" is banned`,
    };

    const updatedTransfer = await transfersRepository.markTransferAsRejected(
      id,
      complianceDecision,
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

    const complianceDecision = {
      decision: ComplianceDecisions.PENDING,
      triggeredRule: `Recipient name ${recipient.name} is banned`,
    };

    const updatedTransfer =
      await transfersRepository.markTransferAsCompliancePending(
        transfer.id,
        complianceDecision,
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

    const complianceDecision = {
      decision: ComplianceDecisions.APPROVED_AUTOMATICALLY,
      triggeredRule: `amount ${transfer.sendAmount} is below compliance threshold`,
    };

    const updatedTransfer = await transfersRepository.markTransferAsApproved(
      transfer.id,
      complianceDecision,
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

    const complianceDecision = {
      decision: ComplianceDecisions.PENDING,
      triggeredRule: `amount ${transfer.sendAmount} is above compliance threshold`,
    };

    const updatedTransfer =
      await transfersRepository.markTransferAsCompliancePending(
        transfer.id,
        complianceDecision,
      );

    if (!updatedTransfer)
      throw new Error("Failed to update transfer status to COMPLIANCE_PENDING");
    return updatedTransfer;
  }
}
