import { detectAllPatterns } from "../patterns/detect-all";
import {
  PatternResult,
  PatternSeverity
} from "../patterns/types";

export interface RiskAssessment {
  account: string;
  riskScore: number;
  severity: PatternSeverity;
  patterns: PatternResult[];
  reasons: string[];
}

function calculateSeverity(score: number): PatternSeverity {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

export async function assessAccountRisk(
  accountId: string
): Promise<RiskAssessment> {
  const detection = await detectAllPatterns(accountId);

  const riskScore = Math.min(
    detection.totalScore,
    100
  );

  const reasons = detection.patterns.map(
    (pattern) => pattern.description
  );

  return {
    account: accountId,
    riskScore,
    severity: calculateSeverity(riskScore),
    patterns: detection.patterns,
    reasons
  };
}
