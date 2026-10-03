import { getDatabase } from "../db/duckdb";
import { PatternResult, PatternSeverity } from "./types";

interface TransactionRow {
  transaction_id: string;
  sender_account: string;
  receiver_account: string;
  amount: number;
  narration: string;
  ip_address: string;
  device_type: string;
  payment_mode: string;
  timestamp: string;
}

export async function detectTerminalCashout(
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
        narration,
        ip_address,
        device_type,
        payment_mode,
        timestamp
      FROM transactions
      WHERE sender_account = ? OR receiver_account = ?
      `,
      [accountId, accountId],
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }

        const transactions = (rows || []) as TransactionRow[];
        if (transactions.length === 0) {
          resolve(null);
          return;
        }

        const markers: string[] = [];
        const matchedTxIds: string[] = [];
        let totalCashoutAmount = 0;

        for (const tx of transactions) {
          const narr = (tx.narration || "").toUpperCase();
          const ip = (tx.ip_address || "").trim();
          const dev = (tx.device_type || "").trim();
          const mode = (tx.payment_mode || "").toUpperCase();

          let txMatched = false;

          // 1. Crypto P2P narrations
          if (
            narr.includes("CRYPTO") ||
            narr.includes("USDT") ||
            narr.includes("P2P") ||
            narr.includes("BINANCE") ||
            narr.includes("WAZIRX")
          ) {
            markers.push("Crypto P2P Narration (" + narr.substring(0, 20) + ")");
            txMatched = true;
          }

          // 2. Foreign IP addresses (185.x.x.x, 194.x.x.x, Tor/Proxy)
          if (
            ip.startsWith("185.") ||
            ip.startsWith("194.") ||
            ip.startsWith("45.") ||
            ip.startsWith("198.")
          ) {
            markers.push(`Foreign Proxy/Tor IP (${ip})`);
            txMatched = true;
          }

          // 3. ATM / Cash withdrawal ring markers
          if (
            narr.includes("ATM") ||
            narr.includes("CASH") ||
            narr.includes("WITHDRAWAL") ||
            mode === "ATM"
          ) {
            markers.push(`ATM Cash Withdrawal Ring`);
            txMatched = true;
          }

          // 4. Automated script user-agents
          if (
            dev.includes("Linux_Script") ||
            dev.includes("Web_Emulator") ||
            dev.includes("Python") ||
            dev.includes("Curl") ||
            dev.includes("Bot")
          ) {
            markers.push(`Automated Script Agent (${dev})`);
            txMatched = true;
          }

          if (txMatched) {
            matchedTxIds.push(tx.transaction_id);
            totalCashoutAmount += Number(tx.amount);
          }
        }

        const uniqueMarkers = Array.from(new Set(markers));
        if (uniqueMarkers.length === 0) {
          resolve(null);
          return;
        }

        let severity: PatternSeverity = "HIGH";
        let score = 25;

        if (uniqueMarkers.length >= 2 || totalCashoutAmount >= 300000) {
          severity = "CRITICAL";
          score = 35;
        }

        resolve({
          type: "TERMINAL_CASHOUT" as any,
          severity,
          score,
          description: `Layer 3 Terminal Cash-Out Node: ${uniqueMarkers.slice(0, 3).join(", ")}`,
          accounts: [accountId],
          transactionIds: matchedTxIds,
          metadata: {
            markers: uniqueMarkers,
            totalCashoutAmount,
            dissipationPointsCount: matchedTxIds.length
          }
        });
      }
    );
  });
}
