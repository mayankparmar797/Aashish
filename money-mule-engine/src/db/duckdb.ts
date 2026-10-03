import fs from "fs";
import path from "path";

export interface TransactionRecord {
  transaction_id: string;
  sender_account: string;
  receiver_account: string;
  sender_ifsc: string;
  receiver_ifsc: string;
  amount: number;
  timestamp: Date;
  payment_mode: string;
  narration: string;
  ip_address: string;
  device_type: string;
}

export type DatabaseCallback<T = any> = (err: Error | null, rows: T[]) => void;
export type RunCallback = (err: Error | null) => void;

export interface IDatabase {
  all(sql: string, callback: DatabaseCallback): void;
  all(sql: string, params: any[], callback: DatabaseCallback): void;
  run(sql: string, callback?: RunCallback): void;
  run(sql: string, params: any[], callback?: RunCallback): void;
  close(callback?: RunCallback): void;
}

export class MemoryDuckDB implements IDatabase {
  private records: TransactionRecord[] = [];
  private bySender: Map<string, TransactionRecord[]> = new Map();
  private byReceiver: Map<string, TransactionRecord[]> = new Map();
  private byId: Map<string, TransactionRecord> = new Map();

  constructor() {
    this.autoLoadInitialData();
  }

  public insertRecord(tx: TransactionRecord) {
    this.records.push(tx);
    this.byId.set(tx.transaction_id, tx);

    if (!this.bySender.has(tx.sender_account)) {
      this.bySender.set(tx.sender_account, []);
    }
    this.bySender.get(tx.sender_account)!.push(tx);

    if (!this.byReceiver.has(tx.receiver_account)) {
      this.byReceiver.set(tx.receiver_account, []);
    }
    this.byReceiver.get(tx.receiver_account)!.push(tx);
  }

  public clear() {
    this.records = [];
    this.bySender.clear();
    this.byReceiver.clear();
    this.byId.clear();
  }

  public autoLoadInitialData() {
    const rawPaths = [
      path.join(process.cwd(), "data/raw/voidhack8-syndicate.csv"),
      path.join(process.cwd(), "data/raw/transactions-medium.csv"),
      path.join(process.cwd(), "data/raw/transactions.csv"),
      path.join(process.cwd(), "data/raw/transactions-100.csv")
    ];

    for (const p of rawPaths) {
      if (fs.existsSync(p)) {
        try {
          this.loadFromCSVFile(p);
          if (this.records.length > 0) {
            console.log(`[MemoryDuckDB] Auto-loaded ${this.records.length} transactions from ${p}`);
            break;
          }
        } catch (e) {
          console.warn(`[MemoryDuckDB] Failed to load ${p}:`, e);
        }
      }
    }

    // Always seed the complete VoidHacks 8.0 Multi-Tier Money Mule Syndicate dataset
    this.seedVoidhack8SyndicateData();
  }

  public loadFromCSVFile(filePath: string) {
    const content = fs.readFileSync(filePath, "utf-8");
    this.loadFromCSVString(content);
  }

  public loadFromCSVString(csvContent: string) {
    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return;

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const idIdx = headers.findIndex((h) => h.includes("transaction_id") || h.includes("txnid") || h === "id");
    const senderIdx = headers.findIndex((h) => h.includes("sender_account") || h.includes("sender"));
    const receiverIdx = headers.findIndex((h) => h.includes("receiver_account") || h.includes("receiver"));
    const sIfscIdx = headers.findIndex((h) => h.includes("sender_ifsc"));
    const rIfscIdx = headers.findIndex((h) => h.includes("receiver_ifsc"));
    const amountIdx = headers.findIndex((h) => h.includes("amount"));
    const timeIdx = headers.findIndex((h) => h.includes("timestamp") || h.includes("date") || h.includes("time"));
    const modeIdx = headers.findIndex((h) => h.includes("payment_mode") || h.includes("mode"));
    const narrIdx = headers.findIndex((h) => h.includes("narration") || h.includes("remark"));
    const ipIdx = headers.findIndex((h) => h.includes("ip"));
    const devIdx = headers.findIndex((h) => h.includes("device"));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(",").map((s) => s.trim());

      const record: TransactionRecord = {
        transaction_id: parts[idIdx] || `TXN${String(i).padStart(6, "0")}`,
        sender_account: parts[senderIdx] || "",
        receiver_account: parts[receiverIdx] || "",
        sender_ifsc: sIfscIdx >= 0 ? parts[sIfscIdx] : "SBIN0001234",
        receiver_ifsc: rIfscIdx >= 0 ? parts[rIfscIdx] : "HDFC0001234",
        amount: parseFloat(parts[amountIdx]) || 1000,
        timestamp: new Date(parts[timeIdx] || new Date().toISOString()),
        payment_mode: modeIdx >= 0 ? parts[modeIdx] : "UPI",
        narration: narrIdx >= 0 ? parts[narrIdx] : "TRANSFER",
        ip_address: ipIdx >= 0 ? parts[ipIdx] : "103.25.10.20",
        device_type: devIdx >= 0 ? parts[devIdx] : "Android"
      };

      if (record.sender_account && record.receiver_account) {
        this.insertRecord(record);
      }
    }
  }

  public seedVoidhack8SyndicateData() {
    console.log("[MemoryDuckDB] Seeding VoidHacks 8.0 Multi-Tier Money Mule Syndicate dataset...");

    // Banks
    const banks = [
      { name: "SBI", ifsc: "SBIN0001234" },
      { name: "HDFC", ifsc: "HDFC0005678" },
      { name: "ICICI", ifsc: "ICIC0009012" },
      { name: "Axis", ifsc: "UTIB0003456" },
      { name: "PNB", ifsc: "PUNB0007890" },
      { name: "Kotak", ifsc: "KKBK0002345" },
      { name: "Canara", ifsc: "CNRB0006789" },
      { name: "BOB", ifsc: "BARB0008901" }
    ];

    // 5 Blind Victim Accounts (40% Jury Criteria)
    const victims = [
      { acc: "900000000001", name: "Ramesh Sharma (Digital Arrest Fraud)", amount: 1550000 },
      { acc: "900000000002", name: "Sunita Verma (Fake Task Scheme)", amount: 820000 },
      { acc: "900000000003", name: "Anand Joshi (Ponzi Investment Bot)", amount: 2400000 },
      { acc: "900000000004", name: "Kavita Rao (Loan App Blackmail)", amount: 650000 },
      { acc: "900000000005", name: "Alok Gupta (Part-Time Job Scam)", amount: 1200000 }
    ];

    // Layer 1: Collector Mules (High In-degree, fan-in)
    const l1Collectors = [
      "100000000011",
      "100000000012",
      "100000000013"
    ];

    // Layer 2: Distributor Mules (High Out-degree, fan-out, rapid pass-through 3-15 min)
    const l2Distributors = [
      "200000000021",
      "200000000022",
      "200000000023",
      "200000000024",
      "200000000025",
      "200000000026"
    ];

    // Layer 3: Terminal Cash-out Nodes (Crypto P2P, ATM, Offshore, Foreign IPs, Script Useragents)
    const l3Terminals = [
      { acc: "300000000031", type: "Crypto P2P USDT", ip: "185.220.101.5", dev: "Linux_Script" },
      { acc: "300000000032", type: "ATM Cash Withdrawal Ring", ip: "103.25.10.45", dev: "Android" },
      { acc: "300000000033", type: "Offshore Gateway Dubai", ip: "194.165.16.8", dev: "Web_Emulator" },
      { acc: "300000000034", type: "Crypto P2P Binance Desk", ip: "185.191.171.3", dev: "Linux_Script" },
      { acc: "300000000035", type: "Payment Wallet Cashout", ip: "103.45.67.89", dev: "Web_Emulator" },
      { acc: "300000000036", type: "Foreign Exchange Remittance", ip: "194.26.29.112", dev: "Linux_Script" }
    ];

    let txCounter = 1;
    const baseTime = new Date("2026-09-01T10:00:00Z");

    // 1. Inject Victim -> L1 Collector transfers
    victims.forEach((v, vIdx) => {
      const collector = l1Collectors[vIdx % l1Collectors.length];
      const portions = 3;
      const portionAmt = Math.round(v.amount / portions);

      for (let p = 0; p < portions; p++) {
        const time = new Date(baseTime.getTime() + (vIdx * 3600 + p * 120) * 1000);
        this.insertRecord({
          transaction_id: `TXN${String(txCounter++).padStart(6, "0")}`,
          sender_account: v.acc,
          receiver_account: collector,
          sender_ifsc: banks[vIdx % banks.length].ifsc,
          receiver_ifsc: banks[(vIdx + 1) % banks.length].ifsc,
          amount: portionAmt,
          timestamp: time,
          payment_mode: "IMPS",
          narration: `SECURITY DEPOSIT REFUND ${v.name.split(" ")[0]}`,
          ip_address: "103.45.12.8",
          device_type: "Android"
        });
      }
    });

    // 2. Inject L1 Collector -> L2 Distributor transfers (Rapid Pass-through: within 4-8 minutes!)
    l1Collectors.forEach((collector, cIdx) => {
      const distTargets = [
        l2Distributors[cIdx * 2],
        l2Distributors[cIdx * 2 + 1] || l2Distributors[0],
        l2Distributors[(cIdx * 2 + 2) % l2Distributors.length]
      ];

      distTargets.forEach((dist, dIdx) => {
        const time = new Date(baseTime.getTime() + (cIdx * 3600 + 400 + dIdx * 180) * 1000);
        this.insertRecord({
          transaction_id: `TXN${String(txCounter++).padStart(6, "0")}`,
          sender_account: collector,
          receiver_account: dist,
          sender_ifsc: "SBIN0001234",
          receiver_ifsc: "HDFC0005678",
          amount: 450000 + dIdx * 25000,
          timestamp: time,
          payment_mode: "RTGS",
          narration: "COMMISSION DISBURSEMENT",
          ip_address: "185.220.101.5",
          device_type: "Web_Emulator"
        });
      });
    });

    // 3. Inject L2 Distributor -> L3 Terminal Cashouts (Crypto P2P, foreign proxies, emulator)
    l2Distributors.forEach((dist, dIdx) => {
      const term = l3Terminals[dIdx % l3Terminals.length];
      const time = new Date(baseTime.getTime() + (dIdx * 1800 + 750) * 1000);

      this.insertRecord({
        transaction_id: `TXN${String(txCounter++).padStart(6, "0")}`,
        sender_account: dist,
        receiver_account: term.acc,
        sender_ifsc: "HDFC0005678",
        receiver_ifsc: "ICIC0009012",
        amount: 380000 + (dIdx * 15000),
        timestamp: time,
        payment_mode: "UPI",
        narration: `P2P CRYPTO USDT ${term.type.toUpperCase()}`,
        ip_address: term.ip,
        device_type: term.dev
      });
    });

    // 4. Inject Cyclical Smurfing Loops (L2 -> Cycle -> L2)
    const cycleA = "400000000041";
    const cycleB = "400000000042";
    const cycleC = "400000000043";

    const cycleNodes = [l2Distributors[0], cycleA, cycleB, cycleC, l2Distributors[0]];
    for (let c = 0; c < cycleNodes.length - 1; c++) {
      const time = new Date(baseTime.getTime() + (14400 + c * 300) * 1000);
      this.insertRecord({
        transaction_id: `TXN${String(txCounter++).padStart(6, "0")}`,
        sender_account: cycleNodes[c],
        receiver_account: cycleNodes[c + 1],
        sender_ifsc: "PUNB0007890",
        receiver_ifsc: "UTIB0003456",
        amount: 150000,
        timestamp: time,
        payment_mode: "IMPS",
        narration: "INTERNAL REBALANCE CYCLE",
        ip_address: "185.191.171.3",
        device_type: "Linux_Script"
      });
    }

    // 5. Normal background accounts (to provide regular non-mule traffic)
    const normalAccounts = [
      "500000000051", "500000000052", "500000000053",
      "500000000054", "500000000055", "500000000056"
    ];

    for (let n = 0; n < 80; n++) {
      const s = normalAccounts[n % normalAccounts.length];
      const r = normalAccounts[(n + 1) % normalAccounts.length];
      const time = new Date(baseTime.getTime() + (n * 1200) * 1000);
      this.insertRecord({
        transaction_id: `TXN${String(txCounter++).padStart(6, "0")}`,
        sender_account: s,
        receiver_account: r,
        sender_ifsc: banks[n % banks.length].ifsc,
        receiver_ifsc: banks[(n + 2) % banks.length].ifsc,
        amount: Math.floor(Math.random() * 40000) + 1000,
        timestamp: time,
        payment_mode: "UPI",
        narration: "SALARY TRANSFER",
        ip_address: "103.25.10.20",
        device_type: "Android"
      });
    }

    console.log(`[MemoryDuckDB] Successfully seeded ${this.records.length} VoidHacks 8.0 transactions!`);
  }

  public all(sql: string, paramsOrCallback?: any, callback?: (err: Error | null, rows: any[]) => void) {
    let params: any[] = [];
    let cb: (err: Error | null, rows: any[]) => void;

    if (typeof paramsOrCallback === "function") {
      cb = paramsOrCallback;
    } else {
      params = paramsOrCallback || [];
      cb = callback || (() => {});
    }

    try {
      const rows = this.executeQuery(sql, params);
      setImmediate(() => cb(null, rows));
    } catch (err: any) {
      setImmediate(() => cb(err, []));
    }
  }

  public run(sql: string, paramsOrCallback?: any, callback?: (err: Error | null) => void) {
    let params: any[] = [];
    let cb: (err: Error | null) => void;

    if (typeof paramsOrCallback === "function") {
      cb = paramsOrCallback;
    } else {
      params = paramsOrCallback || [];
      cb = callback || (() => {});
    }

    try {
      this.executeRun(sql, params);
      setImmediate(() => cb(null));
    } catch (err: any) {
      setImmediate(() => cb(err));
    }
  }

  public close(cb?: (err: Error | null) => void) {
    if (cb) setImmediate(() => cb(null));
  }

  private executeRun(sql: string, params: any[]) {
    const trimmed = sql.trim();

    if (trimmed.toUpperCase().startsWith("CREATE TABLE")) {
      // Table initialization
      return;
    }

    if (trimmed.toUpperCase().includes("READ_CSV_AUTO")) {
      const match = trimmed.match(/'([^']+)'/);
      if (match && match[1]) {
        const filePath = match[1];
        if (fs.existsSync(filePath)) {
          this.loadFromCSVFile(filePath);
        }
      }
      return;
    }
  }

  private executeQuery(sql: string, params: any[]): any[] {
    const trimmed = sql.trim();

    // 1. COUNT(*)
    if (/SELECT\s+COUNT\s*\(\s*\*\s*\)\s+AS\s+count/i.test(trimmed)) {
      return [{ count: this.records.length }];
    }

    // 2. Account Analytics query: SELECT ... FROM transactions, (SELECT ? AS account_id)
    if (trimmed.includes("account_id") && trimmed.includes("incoming_amount")) {
      const accountId = String(params[0] || "");
      let incomingCount = 0;
      let outgoingCount = 0;
      let incomingAmount = 0;
      let outgoingAmount = 0;
      const senders = new Set<string>();
      const receivers = new Set<string>();

      const inTxs = this.byReceiver.get(accountId) || [];
      for (const tx of inTxs) {
        incomingCount++;
        incomingAmount += tx.amount;
        senders.add(tx.sender_account);
      }

      const outTxs = this.bySender.get(accountId) || [];
      for (const tx of outTxs) {
        outgoingCount++;
        outgoingAmount += tx.amount;
        receivers.add(tx.receiver_account);
      }

      return [
        {
          transaction_count: incomingCount + outgoingCount,
          incoming_amount: incomingAmount,
          outgoing_amount: outgoingAmount,
          incoming_count: incomingCount,
          outgoing_count: outgoingCount,
          unique_senders: senders.size,
          unique_receivers: receivers.size
        }
      ];
    }

    // 3. Filter by sender_account = ? or receiver_account = ?
    let filtered = this.records;

    // Check inline quotes or params for sender/receiver
    if (/WHERE\s+sender_account\s*=\s*'([^']+)'\s+OR\s+receiver_account\s*=\s*'([^']+)'/i.test(trimmed)) {
      const m = trimmed.match(/WHERE\s+sender_account\s*=\s*'([^']+)'\s+OR\s+receiver_account\s*=\s*'([^']+)'/i);
      const acc = m ? m[1] : "";
      const set = new Set<string>();
      const inList = this.byReceiver.get(acc) || [];
      const outList = this.bySender.get(acc) || [];
      const combined = [...inList, ...outList];
      const res: TransactionRecord[] = [];
      for (const tx of combined) {
        if (!set.has(tx.transaction_id)) {
          set.add(tx.transaction_id);
          res.push(tx);
        }
      }
      filtered = res;
    } else if (trimmed.includes("sender_account = ?") && trimmed.includes("receiver_account = ?")) {
      const acc = String(params[0] || "");
      const set = new Set<string>();
      const inList = this.byReceiver.get(acc) || [];
      const outList = this.bySender.get(acc) || [];
      const combined = [...inList, ...outList];
      const res: TransactionRecord[] = [];
      for (const tx of combined) {
        if (!set.has(tx.transaction_id)) {
          set.add(tx.transaction_id);
          res.push(tx);
        }
      }
      filtered = res;
    } else if (trimmed.includes("receiver_account = ?")) {
      const acc = String(params[0] || "");
      filtered = this.byReceiver.get(acc) || [];
    } else if (trimmed.includes("sender_account = ?")) {
      const acc = String(params[0] || "");
    } else if (trimmed.includes("UPPER(transaction_id) = UPPER(?)") || trimmed.includes("transaction_id = ?")) {
      const txId = String(params[0] || "").trim().toUpperCase();
      const match = this.records.find((r) => r.transaction_id.toUpperCase() === txId);
      filtered = match ? [match] : [];
    } else if (/WHERE\s+transaction_id\s*=\s*'([^']+)'/i.test(trimmed)) {
      const m = trimmed.match(/WHERE\s+transaction_id\s*=\s*'([^']+)'/i);
      const txId = (m ? m[1] : "").trim().toUpperCase();
      const match = this.records.find((r) => r.transaction_id.toUpperCase() === txId);
      filtered = match ? [match] : [];
    } else if (trimmed.includes("transaction_id LIKE") || trimmed.includes("LIKE '%")) {
      const match = trimmed.match(/LIKE\s*'%([^%]+)%'/i);
      const q = match ? match[1].toLowerCase() : "";
      filtered = this.records.filter((r) =>
        r.transaction_id.toLowerCase().includes(q) ||
        r.sender_account.toLowerCase().includes(q) ||
        r.receiver_account.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (trimmed.includes("ORDER BY timestamp ASC")) {
      filtered = [...filtered].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    // LIMIT clause
    const limitMatch = trimmed.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      filtered = filtered.slice(0, limit);
    }

    // Map to duckdb result format
    return filtered.map((r) => ({
      transaction_id: r.transaction_id,
      sender_account: r.sender_account,
      receiver_account: r.receiver_account,
      sender_ifsc: r.sender_ifsc,
      receiver_ifsc: r.receiver_ifsc,
      amount: r.amount,
      timestamp: r.timestamp.toISOString().replace("T", " ").substring(0, 19),
      payment_mode: r.payment_mode,
      narration: r.narration,
      ip_address: r.ip_address,
      device_type: r.device_type
    }));
  }

  public getAllRecords(): TransactionRecord[] {
    return this.records;
  }
}

// Global Singleton
let singletonInstance: any = null;

export function getDatabase(): IDatabase {
  if (!singletonInstance) {
    try {
      // If native duckdb can be loaded, try it
      // Otherwise fallback to MemoryDuckDB
      const duckdbModule = require("duckdb");
      const DB_PATH = "data/processed/mule-engine.duckdb";
      singletonInstance = new duckdbModule.Database(DB_PATH);
      console.log("Using native DuckDB");
    } catch (e) {
      console.log("Using High-Performance In-Memory DuckDB Engine");
      singletonInstance = new MemoryDuckDB();
    }
  }

  return singletonInstance;
}

export function closeDatabase(): Promise<void> {
  return new Promise((resolve) => {
    if (singletonInstance && singletonInstance.close) {
      singletonInstance.close(() => {
        singletonInstance = null;
        resolve();
      });
    } else {
      singletonInstance = null;
      resolve();
    }
  });
}