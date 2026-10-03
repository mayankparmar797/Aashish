import { getDatabase } from "../db/duckdb";
import { PatternResult } from "./types";

interface TransactionRow {
  transaction_id: string;
  sender_account: string;
  receiver_account: string;
  amount: number;
  timestamp: string;
}

const RAPID_FLOW_WINDOW_MINUTES = 30;

export async function detectRapidFlow(
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
      ORDER BY timestamp ASC
      `,
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }

        const transactions =
          rows as TransactionRow[];

        // Filter in JavaScript because the DuckDB
        // Node driver has been inconsistent with
        // multiple prepared parameters.
        const accountTransactions =
          transactions.filter(
            tx =>
              String(tx.sender_account) === accountId ||
              String(tx.receiver_account) === accountId
          );

        const incoming =
          accountTransactions.filter(
            tx =>
              String(tx.receiver_account) === accountId
          );

        const outgoing =
          accountTransactions.filter(
            tx =>
              String(tx.sender_account) === accountId
          );

        /*
         * Find money entering the account and then
         * leaving the account within 30 minutes.
         */
        for (const inTx of incoming) {
          const incomingTime = new Date(
            inTx.timestamp
          ).getTime();

          for (const outTx of outgoing) {
            const outgoingTime = new Date(
              outTx.timestamp
            ).getTime();

            // Money must leave after it arrives.
            if (outgoingTime < incomingTime) {
              continue;
            }

            const differenceMinutes =
              (outgoingTime - incomingTime) /
              (1000 * 60);

            /*
             * High-Velocity Passthrough:
             * Flags accounts moving >= 90% of incoming funds to downstream nodes
             * within a narrow 3 to 15-minute window.
             */
            const incomingAmount = Number(inTx.amount);
            const outgoingAmount = Number(outTx.amount);
            const passthroughRatio = incomingAmount > 0 ? outgoingAmount / incomingAmount : 0;

            if (differenceMinutes <= 15 || differenceMinutes <= RAPID_FLOW_WINDOW_MINUTES) {
              const isHighVelocity = differenceMinutes >= 2.5 && differenceMinutes <= 15.5 && passthroughRatio >= 0.85;

              return resolve({
                type: "RAPID_FLOW",
                severity: isHighVelocity ? "CRITICAL" : "HIGH",
                score: isHighVelocity ? 35 : 30,

                description: isHighVelocity
                  ? `High-Velocity Passthrough: Account moved ${(passthroughRatio * 100).toFixed(0)}% of incoming funds to downstream nodes within ${differenceMinutes.toFixed(1)} minutes (3-15m window)`
                  : `Money moved through account within ${differenceMinutes.toFixed(1)} minutes`,

                accounts: [
                  String(inTx.sender_account),
                  accountId,
                  String(outTx.receiver_account)
                ],

                transactionIds: [
                  String(inTx.transaction_id),
                  String(outTx.transaction_id)
                ],

                metadata: {
                  incomingAmount,
                  outgoingAmount,
                  passthroughRatio: Number(passthroughRatio.toFixed(2)),
                  isHighVelocity,
                  timeDifferenceMinutes: Number(differenceMinutes.toFixed(2)),
                  windowMinutes: 15
                }
              });
            }
          }
        }

        resolve(null);
      }
    );
  });
}