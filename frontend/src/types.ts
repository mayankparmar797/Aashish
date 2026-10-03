export interface OfficerSession {
  name: string;
  badge: string;
  station: string;
  designation: string;
  activeCase: string;
  signedInAt: string;
}

export interface Transaction {
  transaction_id: string;
  sender_account: string;
  receiver_account: string;
  sender_ifsc: string;
  receiver_ifsc: string;
  amount: number;
  timestamp: string;
  payment_mode: string;
  narration: string;
  ip_address: string;
  device_type: string;
}

export type NodeRole = "ORIGIN" | "COLLECTOR_L1" | "DISTRIBUTOR_L2" | "TERMINAL_L3" | "DESTINATION_L4" | "REGULAR";

export type TerminalCashoutForm = "ATM" | "CRYPTO_P2P" | "FOREIGN_TRADE" | "SHELL_POS";

export interface TerminalFormDetails {
  form: TerminalCashoutForm;
  label: string;
  icon: string;
  description: string;
  locationOrExchange: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  hop: number;
  role?: NodeRole;
  tierName?: string;
  terminalForm?: TerminalFormDetails;
  bankName?: string;
  ifsc?: string;
  ipAddress?: string;
  ipLocation?: string;
  deviceType?: string;
  totalInflow?: number;
  totalOutflow?: number;
  transactionCount?: number;
  firstTimestamp?: string;
  latestTimestamp?: string;
  transactions?: any[];
  muleRiskScore?: number;
  riskSeverity?: string;
  riskReasons?: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  timestamp: string;
  paymentMode: string;
  transactionId: string;
}

export interface PatternItem {
  type: "FAN_IN" | "FAN_OUT" | "CYCLE" | "RAPID_FLOW" | "MULTI_HOP";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number;
  description: string;
  accounts?: string[];
  transactionIds?: string[];
  metadata?: Record<string, any>;
}

export interface RiskAssessment {
  account: string;
  riskScore: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  patterns: PatternItem[];
  reasons: string[];
}

export interface BlindVictim {
  id: string;
  name: string;
  scheme: string;
  lossINR: number;
  expectedL1: string;
  expectedL2: string[];
  expectedL3: string[];
}

export interface LegalNoticeData {
  metadata: {
    noticeReference: string;
    dateGenerated: string;
    legalSection: string;
    policeStation: string;
    firNumber: string;
    caseYear: string;
    officer: {
      name: string;
      badge: string;
      designation: string;
      sealAuthority: string;
    };
  };
  targetBank: {
    bankName: string;
    ifsc: string;
    nodalOffice: string;
    complianceWindow: string;
  };
  suspectAccount: {
    accountNumber: string;
    ifsc: string;
    totalInflowINR: number;
    totalOutflowINR: number;
    estimatedLienAmountINR: number;
    currentEstimatedHoldingINR: number;
    muleRiskScore: number;
    muleSeverity: string;
  };
  disputedTransactions: Array<{
    transactionId: string;
    originAccount: string;
    originIfsc: string;
    beneficiaryAccount: string;
    beneficiaryIfsc: string;
    amount: number;
    timestamp: string;
    paymentMode: string;
    narration: string;
    ipAddress: string;
    deviceType: string;
  }>;
  statutoryDirectives: string[];
  legalNoticeText: string;
}

export interface CaseDiaryData {
  caseDiaryHeader: {
    caseDiaryNumber: string;
    policeStation: string;
    firNumber: string;
    investigatingOfficer: string;
    badgeId: string;
    dateRecorded: string;
    subject: string;
  };
  victimSummary: {
    rootAccount: string;
    totalSiphonedAmount: number;
    detectedHops: number;
    visitedNodesCount: number;
    muleRiskScore: number;
    muleSeverity: string;
  };
  syndicateLayerBreakdown: {
    layer0_victim: string[];
    layer1_collectors: string[];
    layer2_distributors: string[];
    layer3_terminal_cashouts: string[];
  };
  chronologicalTrail: Array<{
    step: number;
    timestamp: string;
    transactionId: string;
    sourceAccount: string;
    targetAccount: string;
    amount: number;
    mode: string;
    narration: string;
    ipAddress: string;
    device: string;
    layerDescription: string;
  }>;
  immediateActionRecommendations: string[];
}

export interface BenchmarkResult {
  benchmarkName: string;
  targetConstraint: string;
  resultStatus: "PASSED" | "FAILED";
  projectedTimeFor2MSeconds: number;
  measuredThroughputRowsPerSecond: number;
  sampleSizeIngested: number;
  actualSampleDurationSeconds: number;
  memoryFootprintMB: number;
  engineType: string;
}

export interface IngestionOverviewData {
  status: string;
  sourceFileName: string;
  fileSizeBytes: number;
  sha256Hash: string;
  totalParsedRows: number;
  muleAccountsCount: number;
  muleRiskBreakdown: {
    criticalL3Terminals: number;
    highL2Distributors: number;
    mediumL1Collectors: number;
  };
  evidenceIntegrity: {
    status: string;
    hashVerified: boolean;
    statutoryCertificate: string;
  };
  throughputRowsPerSec: number;
  throughputMBPerSec: number;
  elapsedSeconds: number;
  breakdown: {
    uniqueAccountsCount: number;
    uniqueIfscCount: number;
    uniqueIpsCount: number;
    flaggedIpsCount: number;
    uniqueDevicesCount: number;
    emulatorDevicesCount: number;
    deduplicatedRows: number;
    totalVolumeINR: number;
  };
  topMules: Array<{
    account: string;
    role: string;
    riskScore: number;
    severity: string;
    inflow: number;
    outflow: number;
    reasons: string[];
  }>;
}

export interface MuleRegistryItem {
  account: string;
  tier: "L1" | "L2" | "L3";
  role: string;
  roleLabel: string;
  riskScore: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  inflow: number;
  outflow: number;
  txCount: number;
  ifsc: string;
  bankName: string;
  ipAddress: string;
  deviceType: string;
  paymentModes: string[];
  flags: string[];
}

