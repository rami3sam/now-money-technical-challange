import type { Request, Response } from "express";
import type { TasksService } from "../services/tasks.service.ts";
import { Payout, type PayoutType } from "../models/payout.ts";
import type { PayoutsRepository } from "../repositories/payouts.repository.ts";
import type { PayoutsService } from "../services/payouts.service.ts";
import { InitatePayoutType } from "../validations/initiatePayout.ts";

export class PayoutController {
  constructor(
    private payoutsService: PayoutsService,
    private tasksService: TasksService,
  ) {}

  receivePartnerPayoutRequest = async (req: Request, res: Response) => {
    const initiatePayout = InitatePayoutType.parse(req.body);
    const response =
      await this.payoutsService.receivePartnerPayoutRequest(initiatePayout);
    res.status(200).json(response);
  };

  getPayoutsBetweenDates = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate)
      throw Error("startDate and endDate query parameters are required");
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      throw Error("Invalid date format for startDate or endDate");

    const payouts = await this.payoutsService.getPayoutsBetweenDates(
      start,
      end,
    );
    res.status(200).json(payouts);
  };
}
