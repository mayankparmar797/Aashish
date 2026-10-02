import { getDatabase } from "../db/duckdb";

export async function ingestCSV(filePath: string): Promise<void> {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    console.time("CSV ingestion");

    const query = `
      INSERT INTO transactions
      SELECT
        Transaction_ID,
        Sender_Account,
        Receiver_Account,
        Sender_IFSC,
        Receiver_IFSC,
        CAST(Amount AS DOUBLE),
        CAST(Timestamp AS TIMESTAMP),
        Payment_Mode,
        Narration,
        IP_Address,
        Device_Type
      FROM read_csv_auto(
        '${filePath}',
        header = true
      );
    `;

    db.run(query, (error) => {
      console.timeEnd("CSV ingestion");

      if (error) {
        reject(error);
        return;
      }

      console.log("✅ CSV successfully ingested");

      resolve();
    });
  });
}