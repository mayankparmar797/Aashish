import { initializeDatabase } from "../db/schema";
import { detectAllPatterns } from "./detect-all";

async function main() {
  await initializeDatabase();

  const result = await detectAllPatterns(
    "100000000001"
  );

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
