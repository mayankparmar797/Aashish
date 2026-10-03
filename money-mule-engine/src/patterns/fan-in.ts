import { getDatabase } from "../db/duckdb";
import { PatternResult, PatternSeverity } from "./types";

export async function detectFanIn(
  accountId: string
): Promise<PatternResult | null> {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT
        sender_account,
        transaction_id,
        amount
      FROM transactions
      WHERE receiver_account = ?
      `,
      [accountId],
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }

        const transactions = rows as any[];

        const uniqueSenders = new Set(
          transactions.map(tx => String(tx.sender_account))
        );

        const transactionCount = transactions.length;
        const uniqueAccounts = uniqueSenders.size;

        if (uniqueAccounts < 3) {
          resolve(null);
          return;
        }

        let severity: PatternSeverity = "LOW";
        let score = 10;

        if (uniqueAccounts >= 5) {
          severity = "MEDIUM";
          score = 20;
        }

        if (uniqueAccounts >= 10) {
          severity = "HIGH";
          score = 30;
        }

        const totalAmount = transactions.reduce(
          (sum, tx) => sum + Number(tx.amount),
          0
        );

        resolve({
          type: "FAN_IN",
          severity,
          score,
          description: `Layer 1 Collector Mule (High In-Degree Centrality): Account pooled deposits from ${uniqueAccounts} distinct accounts`,
          accounts: Array.from(uniqueSenders),
          transactionIds: transactions.map(
            tx => String(tx.transaction_id)
          ),
          metadata: {
            uniqueSenders: uniqueAccounts,
            transactionCount,
            totalAmount
          }
        });
      }
    );
  });
}
