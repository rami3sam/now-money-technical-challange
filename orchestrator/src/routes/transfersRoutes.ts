import { Router, type Request, type Response } from "express";
import validate from "../middlewares/validate.ts";
import { transferSchema } from "../validations/transfer.ts";

const transfersRoutes = Router()
transfersRoutes.post("/transfers", validate(transferSchema), (req: Request, res: Response) => {
    res.end("Route was reached successfully")
})

export default transfersRoutes