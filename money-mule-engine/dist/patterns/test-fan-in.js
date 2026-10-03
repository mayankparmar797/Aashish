import { initializeDatabase } from "../db/schema";
import { detectFanIn } from "./fan-in";
async function main() {
    await initializeDatabase();
    const result = await detectFanIn("100000000001");
    console.log(JSON.stringify(result, null, 2));
}
main().catch(console.error);
