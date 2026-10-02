import { FastifyInstance } from "fastify";
import { getDatabase } from "../db/duckdb";

export async function transactionRoutes(
  app: FastifyInstance
) {
  app.get("/transactions/count", async () => {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT COUNT(*) AS count
        FROM transactions
        `,
        (error, rows) => {
          if (error) {
            reject(error);
            return;
          }

          resolve({
            count: Number(rows[0].count)
          });
        }
      );
    });
  });
}