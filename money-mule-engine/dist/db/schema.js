import { getDatabase } from "./duckdb";
export function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id VARCHAR,
        sender_account VARCHAR,
        receiver_account VARCHAR,

        sender_ifsc VARCHAR,
        receiver_ifsc VARCHAR,

        amount DOUBLE,
        timestamp TIMESTAMP,

        payment_mode VARCHAR,
        narration VARCHAR,

        ip_address VARCHAR,
        device_type VARCHAR
      )
      `, (error) => {
            if (error) {
                reject(error);
                return;
            }
            console.log("✅ transactions table ready");
            resolve();
        });
    });
}
