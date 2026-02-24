import type { Request, Response } from "express";

const partnerPayoutController = async (req: Request, res: Response) => {
  res.send(
    "This is a placeholder response from the payout partner simulator.",
  );
};

export { partnerPayoutController };
