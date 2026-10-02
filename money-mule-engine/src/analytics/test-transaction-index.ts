import { initializeDatabase } from "../db/schema";
import { buildTransactionIndex } from "./transaction-index";

async function main() {
  await initializeDatabase();

  const index = await buildTransactionIndex();

  console.log("=================================");
  console.log("TRANSACTION INDEX TEST");
  console.log("=================================");

  console.log(
    "Total transactions:",
    index.all.length
  );

  console.log(
    "Indexed by ID:",
    index.byId.size
  );

  console.log(
    "Accounts with outgoing transactions:",
    index.outgoing.size
  );

  console.log(
    "Accounts with incoming transactions:",
    index.incoming.size
  );

  const account = "100000000001";

  console.log("\nACCOUNT:", account);

  console.log(
    "Outgoing:",
    index.outgoing.get(account)?.length ?? 0
  );

  console.log(
    "Incoming:",
    index.incoming.get(account)?.length ?? 0
  );

  console.log("\nFirst outgoing transaction:");

  console.log(
    index.outgoing.get(account)?.[0]
  );

  console.log("\nFirst incoming transaction:");

  console.log(
    index.incoming.get(account)?.[0]
  );
}

main().catch(console.error);

