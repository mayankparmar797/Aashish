import { FastifyInstance } from "fastify";
import { getDatabase } from "../db/duckdb";

interface AccountParams {
  accountId: string;
}

export async function accountRoutes(
  app: FastifyInstance
) {
  app.get<{ Params: AccountParams }>(
    "/accounts/:accountId/transactions",
    async (request, reply) => {
      const { accountId } = request.params;

      // Account numbers in our dataset are 12-digit numeric values.
      if (!/^\d{12}$/.test(accountId)) {
        return reply.code(400).send({
          error: "Invalid account number"
        });
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
            sender_account = '${accountId}'
            OR receiver_account = '${accountId}'

          ORDER BY timestamp ASC
          `,
          (error, rows) => {
            if (error) {
              reject(error);
              return;
            }

            resolve({
              account: accountId,
              transaction_count: rows.length,
              transactions: rows
            });
          }
        );
      });
    }
  );
}