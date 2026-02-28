import { Router, type Request, type Response } from "express"

const healthRoutes = Router()

healthRoutes.get("/", (req: Request, res: Response) => {
    return res.status(200).json({ status: "OK" })
})

export default healthRoutes