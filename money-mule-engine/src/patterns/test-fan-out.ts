import { initializeDatabase } from "../db/schema";
import { detectFanOut } from "./fan-out";

async function main() {
  await initializeDatabase();

  const result = await detectFanOut("100000000001");

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});