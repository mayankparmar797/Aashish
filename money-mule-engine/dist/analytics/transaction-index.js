import { getDatabase } from "../db/duckdb";
export async function buildTransactionIndex() {
    const db = getDatabase();
    const transactions = await new Promise((resolve, reject) => {
        db.all(`
        SELECT
          transaction_id,
          sender_account,
          receiver_account,
          amount,
          timestamp,
          payment_mode
        FROM transactions
        ORDER BY timestamp ASC
        `, (error, rows) => {
            if (error) {
                reject(error);
                return;
            }
            const result = rows.map((row) => ({
                transactionId: String(row.transaction_id),
                sender: String(row.sender_account),
                receiver: String(row.receiver_account),
                amount: Number(row.amount),
                timestamp: new Date(row.timestamp),
                paymentMode: String(row.payment_mode),
            }));
            resolve(result);
        });
    });
    const byId = new Map();
    const outgoing = new Map();
    const incoming = new Map();
    for (const transaction of transactions) {
        /*
         * Transaction ID index
         */
        byId.set(transaction.transactionId, transaction);
        /*
         * Outgoing index
         */
        if (!outgoing.has(transaction.sender)) {
            outgoing.set(transaction.sender, []);
        }
        outgoing
            .get(transaction.sender)
            .push(transaction);
        /*
         * Incoming index
         */
        if (!incoming.has(transaction.receiver)) {
            incoming.set(transaction.receiver, []);
        }
        incoming
            .get(transaction.receiver)
            .push(transaction);
    }
    return {
        all: transactions,
        byId,
        outgoing,
        incoming,
    };
}
