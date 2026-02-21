import { EnvVariables } from "./constants/config.ts";
import express from "express"
const PORT = EnvVariables.PORT
const app = express()

async function startServer() {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();