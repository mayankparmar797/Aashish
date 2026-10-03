import { initializeDatabase } from "../db/schema";
import { detectRapidFlow } from "./rapid-flow";
async function main() {
    await initializeDatabase();
    const result = await detectRapidFlow("100000000001");
    console.log(JSON.stringify(result, null, 2));
}
main().catch(console.error);
