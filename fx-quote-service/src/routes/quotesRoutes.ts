import { Router, type Request, type Response } from "express";
import { generateQuote } from "../controllers/quotes/generateQuote.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const quotesRoutes = Router()

quotesRoutes.post("/", asyncHandler(generateQuote))

export default quotesRoutes