import type { Request, Response } from "express";
import { tr } from "zod/locales";
import { addToTaskQueue } from "../../queues/taskQueue.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";

export const triggerReconcilliation = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate)
      throw Error("startDate and endDate query parameters are required");
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      throw Error("Invalid date format for startDate or endDate");



    const task = await addToTaskQueue({
      taskHandler: TaskHandlers.TRIGGER_RECONCILIATION,
      payload: { startDate: start, endDate: end },
    });

    res
      .status(200)
      .json({ message: "Reconciliation triggered", taskId: task._id });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
