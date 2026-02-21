import express, { json, response } from "express"
import transfersRoutes from "./routes/transfersRoutes.ts"
import connectDB from "./utils/connectDB.ts"
import { EnvVariables } from "./constants/config.ts"

const PORT = EnvVariables.PORT
const app = express()
app.use(json())
app.use(transfersRoutes)

async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();