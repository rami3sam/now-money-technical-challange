import { Router, type Request, type Response } from "express";
import { createTransferSchema } from "../validations/createTransfer.ts";
import { confirmTransferQuote, createTransfer, getTransfer } from "../controllers/transfers.ts";

const transfersRoutes = Router()

transfersRoutes.post("/transfers", createTransfer)
transfersRoutes.get("/transfers/:id", getTransfer)
transfersRoutes.post("/transfers/:id", confirmTransferQuote) 

export default transfersRoutes