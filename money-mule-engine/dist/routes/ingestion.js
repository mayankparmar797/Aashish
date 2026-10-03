import { getDatabase, MemoryDuckDB } from "../db/duckdb";
export async function ingestionRoutes(app) {
    // 1. Ingestion Summary & Database Status
    app.get("/ingest/status", async () => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM transactions ORDER BY timestamp ASC", (err, rows) => {
                if (err)
                    return reject(err);
                const list = rows || [];
                const senders = new Set();
                const receivers = new Set();
                let totalVolume = 0;
                for (const r of list) {
                    senders.add(String(r.sender_account));
                    receivers.add(String(r.receiver_account));
                    totalVolume += Number(r.amount || 0);
                }
                const uniqueAccounts = new Set([...senders, ...receivers]);
                resolve({
                    status: "ONLINE",
                    storageEngine: "DuckDB High-Throughput Engine",
                    totalTransactions: list.length,
                    uniqueAccountsCount: uniqueAccounts.size,
                    totalVolumeINR: totalVolume,
                    firstTimestamp: list[0]?.timestamp || null,
                    lastTimestamp: list[list.length - 1]?.timestamp || null
                });
            });
        });
    });
    // 2. Fetch paginated transactions with search & filters
    app.get("/transactions/list", async (request) => {
        const { account, limit = "50", offset = "0", search, mode } = request.query;
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM transactions ORDER BY timestamp ASC", (err, rows) => {
                if (err)
                    return reject(err);
                let filtered = rows || [];
                if (account) {
                    filtered = filtered.filter((r) => String(r.sender_account) === account || String(r.receiver_account) === account);
                }
                if (mode) {
                    filtered = filtered.filter((r) => String(r.payment_mode).toUpperCase() === mode.toUpperCase());
                }
                if (search) {
                    const q = search.toLowerCase();
                    filtered = filtered.filter((r) => String(r.transaction_id).toLowerCase().includes(q) ||
                        String(r.sender_account).includes(q) ||
                        String(r.receiver_account).includes(q) ||
                        String(r.narration).toLowerCase().includes(q) ||
                        String(r.ip_address).includes(q) ||
                        String(r.device_type).toLowerCase().includes(q));
                }
                const l = Math.min(Math.max(1, Number(limit)), 500);
                const o = Math.max(0, Number(offset));
                const paginated = filtered.slice(o, o + l);
                resolve({
                    total: filtered.length,
                    offset: o,
                    limit: l,
                    transactions: paginated
                });
            });
        });
    });
    // 3. Reset / Seed VoidHacks 8.0 Syndicate Data
    app.post("/ingest/reset-voidhack8", async () => {
        const db = getDatabase();
        if (db instanceof MemoryDuckDB) {
            db.clear();
            db.seedVoidhack8SyndicateData();
            return {
                status: "SUCCESS",
                message: "Reset database and re-seeded VoidHacks 8.0 Money Mule Syndicate dataset",
                count: db.getAllRecords().length
            };
        }
        return {
            status: "SUCCESS",
            message: "Database reloaded"
        };
    });
}
