import { getDatabase } from "../db/duckdb";
import { PatternResult } from "./types";

interface TransactionRow {
  transaction_id: string;
  sender_account: string;
  receiver_account: string;
  amount: number;
  timestamp: string;
}

export async function detectCycle(
  accountId: string,
  maxDepth = 4
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

        const transactions = rows as TransactionRow[];

        /*
         * Build an adjacency list.
         *
         * A -> B
         * B -> C
         * C -> A
         */
        const graph = new Map<
          string,
          TransactionRow[]
        >();

        for (const tx of transactions) {
          const sender = String(tx.sender_account);

          if (!graph.has(sender)) {
            graph.set(sender, []);
          }

          graph.get(sender)!.push(tx);
        }

        interface PathItem {
          account: string;
          path: string[];
          transactionIds: string[];
          depth: number;
        }

        const queue: PathItem[] = [
          {
            account: accountId,
            path: [accountId],
            transactionIds: [],
            depth: 0
          }
        ];

        while (queue.length > 0) {
          const current = queue.shift()!;

          if (current.depth >= maxDepth) {
            continue;
          }

          const outgoing =
            graph.get(current.account) ?? [];

          for (const tx of outgoing) {
            const nextAccount =
              String(tx.receiver_account);

            /*
             * We found a cycle back to the root.
             */
            if (nextAccount === accountId) {
              return resolve({
                type: "CYCLE",
                severity: "HIGH",
                score: 30,
                description:
                  `Money returned to account ${accountId} after ${current.depth + 1} hops`,
                accounts: [
                  ...current.path,
                  accountId
                ],
                transactionIds: [
                  ...current.transactionIds,
                  String(tx.transaction_id)
                ],
                metadata: {
                  depth: current.depth + 1,
                  cycleLength:
                    current.path.length,
                  totalAmount:
                    current.transactionIds.reduce(
                      (sum, id) => {
                        const transaction =
                          transactions.find(
                            t =>
                              String(t.transaction_id) ===
                              id
                          );

                        return (
                          sum +
                          Number(
                            transaction?.amount ?? 0
                          )
                        );
                      },
                      Number(tx.amount)
                    )
                }
              });
            }

            /*
             * Don't revisit accounts already in
             * this particular path.
             *
             * This prevents:
             *
             * A -> B -> A -> B -> ...
             */
            if (current.path.includes(nextAccount)) {
              continue;
            }

            queue.push({
              account: nextAccount,
              path: [
                ...current.path,
                nextAccount
              ],
              transactionIds: [
                ...current.transactionIds,
                String(tx.transaction_id)
              ],
              depth: current.depth + 1
            });
          }
        }

        resolve(null);
      }
    );
  });
}