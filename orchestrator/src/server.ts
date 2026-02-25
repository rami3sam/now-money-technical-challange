import express, { json, response } from "express";
import transfersRoutes from "./routes/transfersRoutes.ts";
import connectDB from "./utils/connectDB.ts";
import { EnvVariables } from "./constants/config.ts";
import { runQueueWorker } from "./queues/taskQueue.ts";
import webhooksRoutes from "./routes/webhooks.ts";

const PORT = EnvVariables.PORT;
const app = express();

app.use(
  express.json({
    verify: (req, res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);
app.use("/transfers", transfersRoutes);
app.use("/webhooks", webhooksRoutes);

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  runQueueWorker();
}

startServer();
