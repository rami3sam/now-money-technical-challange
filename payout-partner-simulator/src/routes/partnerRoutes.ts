import { Router } from "express"
import { partnerPayoutController } from "../controllers/partner.ts"

const partnerRoutes = Router()

partnerRoutes.post("/partner/payouts", partnerPayoutController)

export default partnerRoutes