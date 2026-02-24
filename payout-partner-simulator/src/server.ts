
import express, { json } from "express";
import { EnvVariables } from "./constants/config.ts";
import partnerRoutes from "./routes/partnerRoutes.ts";
import connectDB from "./utils/connectDB.ts";

const PORT = EnvVariables.PORT;
const app = express();

app.use(json());
app.use(partnerRoutes);

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
