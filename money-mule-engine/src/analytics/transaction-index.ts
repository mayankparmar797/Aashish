import { getDatabase } from "../db/duckdb";

export interface IndexedTransaction {
  transactionId: string;
  sender: string;
  receiver: string;
  amount: number;
  timestamp: Date;
  paymentMode: string;
}

export interface TransactionIndex {
  all: IndexedTransaction[];

  byId: Map<string, IndexedTransaction>;

  outgoing: Map<string, IndexedTransaction[]>;

  incoming: Map<string, IndexedTransaction[]>;
}

export async function buildTransactionIndex(): Promise<TransactionIndex> {
  const db = getDatabase();

  const transactions = await new Promise<IndexedTransaction[]>(
    (resolve, reject) => {
      db.all(
        `
        SELECT
          transaction_id,
          sender_account,
          receiver_account,
          amount,
          timestamp,
          payment_mode
        FROM transactions
        ORDER BY timestamp ASC
        `,
        (error, rows) => {
          if (error) {
            reject(error);
            return;
          }

          const result = (rows as any[]).map((row) => ({
            transactionId: String(row.transaction_id),
            sender: String(row.sender_account),
            receiver: String(row.receiver_account),
            amount: Number(row.amount),
            timestamp: new Date(row.timestamp),
            paymentMode: String(row.payment_mode),
          }));

          resolve(result);
        }
      );
    }
  );

  const byId = new Map<string, IndexedTransaction>();

  const outgoing = new Map<
    string,
    IndexedTransaction[]
  >();

  const incoming = new Map<
    string,
    IndexedTransaction[]
  >();

  for (const transaction of transactions) {
    /*
     * Transaction ID index
     */
    byId.set(
      transaction.transactionId,
      transaction
    );

    /*
     * Outgoing index
     */
    if (!outgoing.has(transaction.sender)) {
      outgoing.set(transaction.sender, []);
    }

    outgoing
      .get(transaction.sender)!
      .push(transaction);

    /*
     * Incoming index
     */
    if (!incoming.has(transaction.receiver)) {
      incoming.set(transaction.receiver, []);
    }

    incoming
      .get(transaction.receiver)!
      .push(transaction);
  }

  return {
    all: transactions,
    byId,
    outgoing,
    incoming,
  };
}
