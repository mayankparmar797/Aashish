import { getDatabase } from "../db/duckdb";
import {
  PatternResult
} from "./types";

interface TransactionRow {
  transaction_id: string;
  sender_account: string;
  receiver_account: string;
  amount: number;
  timestamp: Date;
}

export function detectFanOut(
  accountId: string
): Promise<PatternResult | null> {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT
        transaction_id,
        sender_account,
        receiver_account,
        amount,
        timestamp
      FROM transactions
      WHERE sender_account = ?
      ORDER BY timestamp ASC
      `,
      [accountId],
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }

        const transactions =
          rows as TransactionRow[];

        /*
         * Find unique accounts receiving money
         * from the target account.
         */
        const recipients = new Set<string>();

        const transactionIds: string[] = [];

        let totalAmount = 0;

        for (const tx of transactions) {
          recipients.add(
            String(tx.receiver_account)
          );

          transactionIds.push(
            String(tx.transaction_id)
          );

          totalAmount += Number(tx.amount);
        }

        const uniqueRecipients =
          recipients.size;

        /*
         * No fan-out if there are fewer than
         * 3 unique recipients.
         */
        if (uniqueRecipients < 3) {
          resolve(null);
          return;
        }

        let severity:
          | "LOW"
          | "MEDIUM"
          | "HIGH"
          | "CRITICAL";

        let score: number;

        if (uniqueRecipients >= 10) {
          severity = "CRITICAL";
          score = 30;
        } else if (uniqueRecipients >= 7) {
          severity = "HIGH";
          score = 25;
        } else if (uniqueRecipients >= 5) {
          severity = "MEDIUM";
          score = 20;
        } else {
          severity = "LOW";
          score = 10;
        }

        resolve({
          type: "FAN_OUT",
          severity,
          score,

          description:
            `Account sent money to ${uniqueRecipients} different accounts`,

          accounts: Array.from(recipients),

          transactionIds,

          metadata: {
            uniqueRecipients,
            transactionCount:
              transactions.length,
            totalAmount
          }
        });
      }
    );
  });
}