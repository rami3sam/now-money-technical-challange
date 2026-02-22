import { EnvVariables } from "./constants/config.ts";
import express, { json } from "express"
import quotesRoutes from "./routes/quotesRoutes.ts";
import connectDB from "./utils/connectDB.ts";
const PORT = EnvVariables.PORT
const app = express()

app.use(json())
app.use(quotesRoutes)
async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();