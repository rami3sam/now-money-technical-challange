import { EnvVariables } from "./constants/config.js";
import express, { json } from "express";
import quotesRoutes from "./routes/quotesRoutes.js";
import connectDB from "./utils/connectDB.js";
const PORT = EnvVariables.PORT;
const app = express();

app.use(json());
app.use("/quote", quotesRoutes);
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
