import Fastify from "fastify";
import cors from "@fastify/cors";

import { initializeDatabase } from "./db/schema";
import { transactionRoutes } from "./routes/transactions";
import { accountRoutes } from "./routes/accounts";
import { graphRoutes } from "./routes/graph";
import { traceRoutes } from "./routes/trace";
import { analyticsRoutes } from "./routes/analytics";
import { riskRoutes } from "./routes/risk";

const app = Fastify({
  logger: true
});

app.register(cors, {
  origin: true
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "money-mule-engine",
    version: "0.1.0"
  };
});
app.register(transactionRoutes);
app.register(accountRoutes);
app.register(graphRoutes);
app.register(traceRoutes);
app.register(analyticsRoutes);
app.register(riskRoutes);

const start = async () => {
  try {
    await initializeDatabase();

    await app.listen({
      port: 8000,
      host: "0.0.0.0"
    });

    console.log("🚀 Server running on http://localhost:8000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();