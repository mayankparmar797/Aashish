import { getDatabase } from "../db/duckdb";
export async function getAccountAnalytics(accountId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all(`
      SELECT
        COUNT(*) AS transaction_count,

        SUM(
          CASE
            WHEN receiver_account = account_id
            THEN amount
            ELSE 0
          END
        ) AS incoming_amount,

        SUM(
          CASE
            WHEN sender_account = account_id
            THEN amount
            ELSE 0
          END
        ) AS outgoing_amount,

        SUM(
          CASE
            WHEN receiver_account = account_id
            THEN 1
            ELSE 0
          END
        ) AS incoming_count,

        SUM(
          CASE
            WHEN sender_account = account_id
            THEN 1
            ELSE 0
          END
        ) AS outgoing_count,

        COUNT(
          DISTINCT CASE
            WHEN receiver_account = account_id
            THEN sender_account
          END
        ) AS unique_senders,

        COUNT(
          DISTINCT CASE
            WHEN sender_account = account_id
            THEN receiver_account
          END
        ) AS unique_receivers

      FROM transactions,
           (SELECT ? AS account_id)

      WHERE
        sender_account = account_id
        OR receiver_account = account_id
      `, [accountId], (error, rows) => {
            if (error) {
                reject(error);
                return;
            }
            const row = rows[0];
            const transactionCount = Number(row.transaction_count || 0);
            const incomingCount = Number(row.incoming_count || 0);
            const outgoingCount = Number(row.outgoing_count || 0);
            const incomingAmount = Number(row.incoming_amount || 0);
            const outgoingAmount = Number(row.outgoing_amount || 0);
            const uniqueSenders = Number(row.unique_senders || 0);
            const uniqueReceivers = Number(row.unique_receivers || 0);
            const totalFlow = incomingAmount + outgoingAmount;
            resolve({
                account: accountId,
                transactionCount,
                incoming: {
                    count: incomingCount,
                    amount: incomingAmount,
                    uniqueAccounts: uniqueSenders
                },
                outgoing: {
                    count: outgoingCount,
                    amount: outgoingAmount,
                    uniqueAccounts: uniqueReceivers
                },
                totalFlow,
                riskIndicators: {
                    highTransactionVolume: transactionCount >= 15,
                    manyCounterparties: uniqueSenders + uniqueReceivers >= 6,
                    highOutgoingRatio: incomingAmount > 0 &&
                        outgoingAmount / incomingAmount >= 0.8
                }
            });
        });
    });
}
