import express, { json } from "express";
import { EnvVariables } from "./constants/config.ts";
import partnerRoutes from "./routes/partnerRoutes.ts";
import connectDB from "./utils/connectDB.ts";
import { runQueueWorker } from "./queues/taskQueue.ts";
import payoutsRoutes from "./routes/payoutsRoutes.ts";

const PORT = EnvVariables.PORT;
const app = express();

app.use(json());

app.use("/partner", partnerRoutes);
app.use("/payouts", payoutsRoutes)

async function startServer() {
  await connectDB();
  runQueueWorker();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
