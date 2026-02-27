import type { Request, Response } from "express";
import { TaskHandlers } from "../enums/taskHandlers.enum.ts";
import { Task, type TaskType } from "../models/task.ts";
import type { TasksService } from "../services/tasks.service.ts";
import type { TransfersService } from "../services/transfers.service.ts";
import { PayoutStatusType } from "../validations/payoutStatus.ts";
import { Payout, type PayoutType } from "../models/payout.ts";

export class WebhookController {
  constructor(
    private transfersService: TransfersService,
    private taskService: TasksService,
  ) {}
  triggerReconciliation = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate)
      throw Error("startDate and endDate query parameters are required");
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      throw Error("Invalid date format for startDate or endDate");

    const task = await this.taskService.add(
      new Task({
        taskHandler: TaskHandlers.TRIGGER_RECONCILIATION,
        payload: { startDate: start, endDate: end },
      }),
    );

    res
      .status(200)
      .json({ message: "Reconciliation triggered", taskId: task._id });
  };

  payoutStatus = async (req: Request, res: Response) => {
    const payoutStatusRequest = PayoutStatusType.parse(req.body);

    await this.transfersService.updatePayoutStatusWebhook(payoutStatusRequest);

    res.status(200).json({ message: "Payout status updated successfully" });
  };
}
