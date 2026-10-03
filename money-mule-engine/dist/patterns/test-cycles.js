import { initializeDatabase } from "../db/schema";
import { detectCycle } from "./cycle";
async function main() {
    await initializeDatabase();
    const result = await detectCycle("100000000001", 4);
    console.log(JSON.stringify(result, null, 2));
}
main().catch(console.error);
