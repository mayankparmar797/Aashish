import { getDatabase } from "../db/duckdb";
import { PatternResult } from "./types";

interface TransactionRow {
  transaction_id: string;
  sender_account: string;
  receiver_account: string;
  amount: number;
  timestamp: string;
}

export async function detectMultiHop(
  rootAccount: string,
  maxHops = 4
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
         * Build outgoing transaction map.
         *
         * account -> transactions sent by account
         */
        const outgoing = new Map<
          string,
          TransactionRow[]
        >();

        for (const tx of transactions) {
          const sender = String(tx.sender_account);

          if (!outgoing.has(sender)) {
            outgoing.set(sender, []);
          }

          outgoing.get(sender)!.push(tx);
        }

        /*
         * BFS queue.
         */
        interface QueueItem {
          account: string;
          depth: number;
          pathAccounts: string[];
          pathTransactions: TransactionRow[];
        }

        const queue: QueueItem[] = [
          {
            account: rootAccount,
            depth: 0,
            pathAccounts: [rootAccount],
            pathTransactions: []
          }
        ];

        /*
         * Keep track of visited accounts at the
         * shallowest depth.
         */
        const visited = new Set<string>();
        visited.add(rootAccount);

        while (queue.length > 0) {
          const current = queue.shift()!;

          if (current.depth >= maxHops) {
            continue;
          }

          const nextTransactions =
            outgoing.get(current.account) || [];

          for (const tx of nextTransactions) {
            const nextAccount = String(tx.receiver_account);

            /*
             * Don't immediately follow a cycle.
             */
            if (current.pathAccounts.includes(nextAccount)) {
              continue;
            }

            const newPathAccounts = [
              ...current.pathAccounts,
              nextAccount
            ];

            const newPathTransactions = [
              ...current.pathTransactions,
              tx
            ];

            const newDepth = current.depth + 1;

            /*
             * We need at least 2 hops to call this
             * a multi-hop flow.
             */
            if (newDepth >= 2) {
              const transactionIds =
                newPathTransactions.map((transaction) =>
                  String(transaction.transaction_id)
                );

              const totalAmount =
                newPathTransactions.reduce(
                  (sum, transaction) =>
                    sum + Number(transaction.amount),
                  0
                );

              /*
               * Score based on number of hops.
               */
              let score = 20;
              let severity:
                | "LOW"
                | "MEDIUM"
                | "HIGH"
                | "CRITICAL" = "MEDIUM";

              if (newDepth >= 3) {
                score = 30;
                severity = "HIGH";
              }

              if (newDepth >= 4) {
                score = 40;
                severity = "CRITICAL";
              }

              resolve({
                type: "MULTI_HOP",
                severity,
                score,
                description:
                  `Money moved through ${newDepth} hops from account ${rootAccount}`,
                accounts: newPathAccounts,
                transactionIds,
                metadata: {
                  hops: newDepth,
                  totalAmount,
                  startAccount: rootAccount,
                  endAccount: nextAccount
                }
              });

              return;
            }

            /*
             * Continue exploring the network.
             */
            if (!visited.has(nextAccount)) {
              visited.add(nextAccount);

              queue.push({
                account: nextAccount,
                depth: newDepth,
                pathAccounts: newPathAccounts,
                pathTransactions: newPathTransactions
              });
            }
          }
        }

        /*
         * No multi-hop chain found.
         */
        resolve(null);
      }
    );
  });
}
