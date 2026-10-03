import { getDatabase } from "../db/duckdb";
export function getAccountGraph(accountId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all(`
      SELECT
        transaction_id,
        sender_account,
        receiver_account,
        amount,
        timestamp,
        payment_mode
      FROM transactions
      WHERE
        sender_account = ?
        OR receiver_account = ?
      ORDER BY timestamp ASC
      `, [accountId, accountId], (error, rows) => {
            if (error) {
                reject(error);
                return;
            }
            const nodeMap = new Map();
            const edges = [];
            for (const row of rows) {
                const sender = String(row.sender_account);
                const receiver = String(row.receiver_account);
                if (!nodeMap.has(sender)) {
                    nodeMap.set(sender, {
                        id: sender,
                        label: sender,
                        type: "account",
                        hop: 0
                    });
                }
                if (!nodeMap.has(receiver)) {
                    nodeMap.set(receiver, {
                        id: receiver,
                        label: receiver,
                        type: "account",
                        hop: 0
                    });
                }
                edges.push({
                    id: String(row.transaction_id),
                    source: sender,
                    target: receiver,
                    amount: Number(row.amount),
                    timestamp: new Date(row.timestamp).toISOString(),
                    paymentMode: String(row.payment_mode),
                    transactionId: String(row.transaction_id)
                });
            }
            resolve({
                nodes: Array.from(nodeMap.values()),
                edges
            });
        });
    });
}
