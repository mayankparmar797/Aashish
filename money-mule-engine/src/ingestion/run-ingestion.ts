import { initializeDatabase } from "../db/schema";
import { ingestCSV } from "./ingest";
import { closeDatabase } from "../db/duckdb";

async function main() {
  try {
    await initializeDatabase();

    await ingestCSV(
      "data/raw/transactions.csv"
    );

    console.log("🎉 Ingestion finished successfully");

    await closeDatabase();

  } catch (error) {
    console.error("❌ Ingestion failed");
    console.error(error);

    try {
      await closeDatabase();
    } catch {
      // Ignore close errors
    }

    process.exitCode = 1;
  }
}

main();