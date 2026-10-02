export type PatternType =
  | "FAN_IN"
  | "FAN_OUT"
  | "CYCLE"
  | "RAPID_FLOW"
  | "MULTI_HOP";

export type PatternSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface PatternResult {
  type: PatternType;
  severity: PatternSeverity;
  score: number;
  description: string;

  accounts?: string[];
  transactionIds?: string[];

  metadata?: Record<string, unknown>;
}

export interface PatternDetectionResult {
  account: string;
  patterns: PatternResult[];
  totalScore: number;
}
