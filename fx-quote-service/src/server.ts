import { EnvVariables } from "./constants/config.ts";
import express, { json } from "express"
import quotesRoutes from "./routes/quotesRoutes.ts";
const PORT = EnvVariables.PORT
const app = express()

app.use(json())
app.use(quotesRoutes)
async function startServer() {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();