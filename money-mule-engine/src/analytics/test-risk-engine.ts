import { initializeDatabase } from "../db/schema";
import { assessAccountRisk } from "./risk-engine";

async function main() {
  await initializeDatabase();

  const result = await assessAccountRisk(
    "100000000001"
  );

  console.log(
    JSON.stringify(result, null, 2)
  );
}

main().catch(console.error);
