import express, { json, response } from "express"
import transfersRoutes from "./routes/transfersRoutes.ts"

const app = express()
app.use(json())
app.use(transfersRoutes)
app.listen(8000)