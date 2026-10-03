async function verify() {
  console.log("--- Checking Full Stack ---");

  // 1. Frontend
  try {
    const fRes = await fetch("http://localhost:3000");
    console.log("Frontend Status (localhost:3000):", fRes.status, fRes.statusText);
  } catch (e: any) {
    console.error("Frontend check failed:", e.message);
  }

  // 2. Backend Health
  try {
    const bRes = await fetch("http://localhost:8000/health");
    const bData = await bRes.json();
    console.log("Backend Health (localhost:8000):", bData);
  } catch (e: any) {
    console.error("Backend health failed:", e.message);
  }

  // 3. Transactions Count
  try {
    const cRes = await fetch("http://localhost:8000/transactions/count");
    const cData = await cRes.json();
    console.log("Transactions Count:", cData);
  } catch (e: any) {
    console.error("Transactions count failed:", e.message);
  }

  // 4. Blind Victims
  try {
    const vRes = await fetch("http://localhost:8000/mule-rings/blind-victims");
    const vData = await vRes.json();
    console.log("Blind Victims Count:", vData.victims?.length);
  } catch (e: any) {
    console.error("Blind victims failed:", e.message);
  }

  // 5. Trace Money
  try {
    const tRes = await fetch("http://localhost:8000/mule-rings/analyze/900000000001");
    const tData = await tRes.json();
    console.log("Trace Root Account 900000000001:");
    console.log("  - Latency:", tData.latencyMs, "ms (Benchmark < 2000ms:", tData.satisfiesLatencyBenchmark, ")");
    console.log("  - Nodes:", tData.nodes?.length, "Edges:", tData.edges?.length);
    console.log("  - Collectors (L1):", tData.summary?.layer1CollectorsCount);
    console.log("  - Distributors (L2):", tData.summary?.layer2DistributorsCount);
    console.log("  - Terminals (L3):", tData.summary?.layer3TerminalsCount);
  } catch (e: any) {
    console.error("Trace failed:", e.message);
  }

  // 5b. Trace via Transaction ID (4-Hops)
  try {
    const txnRes = await fetch("http://localhost:8000/mule-rings/analyze/TXN000001");
    const txnData = await txnRes.json();
    console.log("Trace Transaction ID TXN000001 (4-Hops Graph):");
    console.log("  - Focused TXN:", txnData.focusedTransactionId);
    console.log("  - Resolved Root Account:", txnData.rootAccount);
    console.log("  - Total Nodes:", txnData.nodes?.length, "Edges:", txnData.edges?.length);
    console.log("  - Layer 4 Offshore Count:", txnData.summary?.layer4DestinationsCount);
  } catch (e: any) {
    console.error("TXN trace failed:", e.message);
  }

  // 6. Section 91 Requisition Notice
  try {
    const nRes = await fetch("http://localhost:8000/police/freeze-notice/100000000011");
    const nData = await nRes.json();
    console.log("Section 91 Notice Generated for 100000000011:");
    console.log("  - Target Bank:", nData.targetBank?.bankName);
    console.log("  - Total Inflow:", nData.suspectAccount?.totalInflowINR);
    console.log("  - Disputed Txns Count:", nData.disputedTransactions?.length);
  } catch (e: any) {
    console.error("Section 91 notice failed:", e.message);
  }

  // 7. 2M Benchmark
  try {
    const bmRes = await fetch("http://localhost:8000/benchmark/run");
    const bmData = await bmRes.json();
    console.log("2M Benchmark:");
    console.log("  - Projected Time:", bmData.projectedTimeFor2MSeconds, "s (Target:", bmData.targetConstraint, ")");
    console.log("  - Result:", bmData.resultStatus);
    console.log("  - Throughput:", bmData.measuredThroughputRowsPerSecond, "rows/sec");
  } catch (e: any) {
    console.error("Benchmark failed:", e.message);
  }
}

verify();
