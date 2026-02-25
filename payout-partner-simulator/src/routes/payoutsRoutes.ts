import { Router } from "express"
import { getPayouts } from "../controllers/getPayoutsInRange.ts"

const payoutsRoutes = Router()

payoutsRoutes.get("/", getPayouts)

export default payoutsRoutes