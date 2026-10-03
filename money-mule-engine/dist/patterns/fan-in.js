import { getDatabase } from "../db/duckdb";
export async function detectFanIn(accountId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all(`
      SELECT
        sender_account,
        transaction_id,
        amount
      FROM transactions
      WHERE receiver_account = ?
      `, [accountId], (error, rows) => {
            if (error) {
                reject(error);
                return;
            }
            const transactions = rows;
            const uniqueSenders = new Set(transactions.map(tx => String(tx.sender_account)));
            const transactionCount = transactions.length;
            const uniqueAccounts = uniqueSenders.size;
            if (uniqueAccounts < 3) {
                resolve(null);
                return;
            }
            let severity = "LOW";
            let score = 10;
            if (uniqueAccounts >= 5) {
                severity = "MEDIUM";
                score = 20;
            }
            if (uniqueAccounts >= 10) {
                severity = "HIGH";
                score = 30;
            }
            const totalAmount = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
            resolve({
                type: "FAN_IN",
                severity,
                score,
                description: `Account received money from ${uniqueAccounts} different accounts`,
                accounts: Array.from(uniqueSenders),
                transactionIds: transactions.map(tx => String(tx.transaction_id)),
                metadata: {
                    uniqueSenders: uniqueAccounts,
                    transactionCount,
                    totalAmount
                }
            });
        });
    });
}
