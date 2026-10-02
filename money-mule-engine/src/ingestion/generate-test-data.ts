import fs from "fs";
import path from "path";

const output = path.join(
  process.cwd(),
  "data/raw/transactions.csv"
);

const header = [
  "Transaction_ID",
  "Sender_Account",
  "Receiver_Account",
  "Sender_IFSC",
  "Receiver_IFSC",
  "Amount",
  "Timestamp",
  "Payment_Mode",
  "Narration",
  "IP_Address",
  "Device_Type"
];

const rows: string[][] = [];

const accounts = [
  "100000000001",
  "100000000002",
  "100000000003",
  "100000000004",
  "100000000005",
  "100000000006",
  "100000000007",
  "100000000008"
];

for (let i = 1; i <= 100; i++) {
  const sender =
    accounts[Math.floor(Math.random() * accounts.length)];

  let receiver =
    accounts[Math.floor(Math.random() * accounts.length)];

  while (receiver === sender) {
    receiver =
      accounts[Math.floor(Math.random() * accounts.length)];
  }

  rows.push([
    `TXN${String(i).padStart(6, "0")}`,
    sender,
    receiver,
    "SBIN0001234",
    "HDFC0001234",
    String(Math.floor(Math.random() * 90000) + 1000),
    `2026-09-01 ${String(10 + Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}:00`,
    "UPI",
    "TEST TRANSFER",
    "103.25.10.20",
    "Android"
  ]);
}

const csv = [
  header.join(","),
  ...rows.map((row) => row.join(","))
].join("\n");

fs.writeFileSync(output, csv);

console.log(`✅ Generated ${rows.length} transactions`);
console.log(`📁 ${output}`);