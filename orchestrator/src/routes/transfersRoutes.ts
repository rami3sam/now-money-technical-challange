import { Router, type Request, type Response } from "express";
import { createTransferSchema } from "../validations/createTransfer.ts";
import { createTransfer } from "../controllers/createTransfer.ts";

const transfersRoutes = Router()
transfersRoutes.post("/transfers", createTransfer )

export default transfersRoutes