import Fastify from "fastify";
import cors from "@fastify/cors";

import { initializeDatabase } from "./db/schema";
import { transactionRoutes } from "./routes/transactions";
import { accountRoutes } from "./routes/accounts";
import { graphRoutes } from "./routes/graph";
import { traceRoutes } from "./routes/trace";
import { analyticsRoutes } from "./routes/analytics";
import { riskRoutes } from "./routes/risk";
import { policeRoutes } from "./routes/police";
import { muleRingRoutes } from "./routes/mule-rings";
import { ingestionRoutes } from "./routes/ingestion";

const app = Fastify({
  logger: true
});

app.register(cors, {
  origin: true
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "TraceMind Mule Engine",
    version: "2.0.0",
    hackathon: "VoidHacks 8.0"
  };
});

app.register(transactionRoutes);
app.register(accountRoutes);
app.register(graphRoutes);
app.register(traceRoutes);
app.register(analyticsRoutes);
app.register(riskRoutes);
app.register(policeRoutes);
app.register(muleRingRoutes);
app.register(ingestionRoutes);

const start = async () => {
  try {
    await initializeDatabase();

    await app.listen({
      port: 8000,
      host: "0.0.0.0"
    });

    console.log("🚀 TraceMind Mule Engine running on http://localhost:8000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();