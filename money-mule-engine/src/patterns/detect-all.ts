import { PatternDetectionResult } from "./types";

import { detectFanIn } from "./fan-in";
import { detectFanOut } from "./fan-out";
import { detectCycle } from "./cycle";
import { detectRapidFlow } from "./rapid-flow";
import { detectMultiHop } from "./multi-hop";

export async function detectAllPatterns(
  accountId: string
): Promise<PatternDetectionResult> {
  const [
    fanIn,
    fanOut,
    cycle,
    rapidFlow,
    multiHop
  ] = await Promise.all([
    detectFanIn(accountId),
    detectFanOut(accountId),
    detectCycle(accountId, 4),
    detectRapidFlow(accountId),
    detectMultiHop(accountId, 4)
  ]);

  const patterns = [
    fanIn,
    fanOut,
    cycle,
    rapidFlow,
    multiHop
  ].filter(
    (pattern): pattern is NonNullable<typeof pattern> =>
      pattern !== null
  );

  const totalScore = Math.min(
    patterns.reduce(
      (total, pattern) => total + pattern.score,
      0
    ),
    100
  );

  return {
    account: accountId,
    patterns,
    totalScore
  };
}
