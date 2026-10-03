import { initializeDatabase } from "../db/schema";
import { detectMultiHop } from "./multi-hop";
async function main() {
    await initializeDatabase();
    const result = await detectMultiHop("100000000001", 4);
    console.log(JSON.stringify(result, null, 2));
}
main().catch(console.error);
