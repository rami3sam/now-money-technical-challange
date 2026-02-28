import { Router, type Request, type Response } from "express";
import { generateQuote } from "../controllers/quotes/generateQuote.js";


const quotesRoutes = Router()

quotesRoutes.post("/", generateQuote)

export default quotesRoutes