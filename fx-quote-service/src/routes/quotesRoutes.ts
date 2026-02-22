import { Router, type Request, type Response } from "express";
import { generateQuote } from "../controllers/quotes.ts";


const quotesRoutes = Router()

quotesRoutes.post("/quote", generateQuote)

export default quotesRoutes