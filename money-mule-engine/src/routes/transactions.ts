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

  // Search by Transaction ID, Sender Account, or Receiver Account
  app.get<{ Querystring: { q?: string } }>("/transactions/search", async (request, reply) => {
    const query = (request.query.q || "").trim();
    if (!query) {
      return { total: 0, results: [] };
    }

    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT
          transaction_id,
          sender_account,
          receiver_account,
          sender_ifsc,
          receiver_ifsc,
          amount,
          timestamp,
          payment_mode,
          narration,
          ip_address,
          device_type
        FROM transactions
        WHERE
          transaction_id LIKE '%${query}%'
          OR sender_account LIKE '%${query}%'
          OR receiver_account LIKE '%${query}%'
        ORDER BY timestamp ASC
        LIMIT 50
        `,
        (error, rows) => {
          if (error) {
            return reject(error);
          }

          const results = (rows || []).map((r: any) => ({
            transaction_id: String(r.transaction_id),
            sender_account: String(r.sender_account),
            receiver_account: String(r.receiver_account),
            sender_ifsc: String(r.sender_ifsc || ""),
            receiver_ifsc: String(r.receiver_ifsc || ""),
            amount: Number(r.amount),
            timestamp: r.timestamp,
            payment_mode: String(r.payment_mode || "UPI"),
            narration: String(r.narration || ""),
            ip_address: String(r.ip_address || ""),
            device_type: String(r.device_type || "")
          }));

          resolve({
            query,
            total: results.length,
            results
          });
        }
      );
    });
  });
}