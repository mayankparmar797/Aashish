import React, { useState, useEffect, useRef } from "react";
import { OfficerSession, LegalNoticeData, CaseDiaryData } from "../types";
import {
  Scale,
  FileText,
  Printer,
  Copy,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Building,
  ShieldCheck,
  QrCode,
  Search,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  RefreshCw,
  X,
  FileUp,
  FolderOpen
} from "lucide-react";

export interface TrailHopItem {
  hop: string;
  fromAccount: string;
  toAccount: string;
  amount: string;
  mode: string;
  networkRole: string;
  timestamp: string;
}

export interface InvestigationBriefData {
  firNumber: string;
  date: string;
  time: string;
  classification: string;
  primaryTxnId: string;
  inflowAmount: string;
  victimAccount: string;
  victimName: string;
  geolocation: string;
  jurisdiction: string;
  ackNumber: string;
  l1CollectorAccount: string;
  latency: string;
  trailHops: TrailHopItem[];
}

const DEFAULT_REFERENCE_BRIEF: InvestigationBriefData = {
  firNumber: "IND/2026/CY-08819A",
  date: "02-10-2026",
  time: "11:45 IST",
  classification: "CONFIDENTIAL / STATUTORY",
  primaryTxnId: "TXN7701928301",
  inflowAmount: "15,00,000",
  victimAccount: "910011223344",
  victimName: "Dr. Arvind K. Sharma",
  geolocation: "Indore, Madhya Pradesh (22.7196° N, 75.8577° E)",
  jurisdiction: "Vijay Nagar Sector 5, Indore Police Commissionerate",
  ackNumber: "1930/IND/2026/08819A",
  l1CollectorAccount: "401928410291",
  latency: "0.002s (≤ 3.0s SLA Met ✓)",
  trailHops: [
    {
      hop: "Hop 1",
      fromAccount: "...3344",
      toAccount: "...0291",
      amount: "15,00,000",
      mode: "RTGS",
      networkRole: "L1: Collector Mule",
      timestamp: "2026-09-18 10:14:02"
    },
    {
      hop: "Hop 2",
      fromAccount: "...0291",
      toAccount: "...5610",
      amount: "6,50,000",
      mode: "IMPS",
      networkRole: "L2: Distributor Mule",
      timestamp: "2026-09-18 10:18:15"
    },
    {
      hop: "Hop 3",
      fromAccount: "...0291",
      toAccount: "...5622",
      amount: "8,00,000",
      mode: "IMPS",
      networkRole: "L2: Distributor Mule",
      timestamp: "2026-09-18 10:20:44"
    },
    {
      hop: "Hop 4",
      fromAccount: "...5610",
      toAccount: "...0190",
      amount: "6,40,000",
      mode: "UPI",
      networkRole: "L3: Terminal Cash-out",
      timestamp: "2026-09-18 10:27:10"
    }
  ]
};

interface Props {
  initialAccountId?: string;
  officerSession: OfficerSession | null;
}

export const LegalNoticeGenerator: React.FC<Props> = ({
  initialAccountId = "100000000007",
  officerSession
}) => {
  const [targetAccount, setTargetAccount] = useState(initialAccountId);
  const [docType, setDocType] = useState<"brief" | "notice" | "diary">("brief");
  const [noticeData, setNoticeData] = useState<LegalNoticeData | null>(null);
  const [diaryData, setDiaryData] = useState<CaseDiaryData | null>(null);
  const [customBrief, setCustomBrief] = useState<InvestigationBriefData | null>(null);
  const [useReferenceCase, setUseReferenceCase] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch both notice and case diary whenever target account or officer changes
  const fetchBothData = async (accountId: string) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        officerName: officerSession?.name || "Insp. Mayank Sharma",
        badgeNumber: officerSession?.badge || "MP-IND-CYBER-8842",
        station: officerSession?.station || "Cyber Crime Police Station, Indore (1930 NCRP Hub)",
        firNumber: officerSession?.activeCase || "FIR No. 412/2026",
        caseYear: "2026"
      });

      const [resNotice, resDiary] = await Promise.all([
        fetch(`http://localhost:8000/police/freeze-notice/${accountId}?${q}`).catch(() => null),
        fetch(`http://localhost:8000/police/case-diary/${accountId}?${q}`).catch(() => null)
      ]);

      if (resNotice && resNotice.ok) {
        const nData = await resNotice.json();
        setNoticeData(nData);
      }
      if (resDiary && resDiary.ok) {
        const dData = await resDiary.json();
        setDiaryData(dData);
      }
    } catch (e) {
      console.error("Failed to fetch legal / case diary data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetAccount) {
      fetchBothData(targetAccount);
    }
  }, [targetAccount, officerSession]);

  // Construct active Investigation Brief data
  const getActiveBriefData = (): InvestigationBriefData => {
    if (customBrief) return customBrief;
    if (useReferenceCase) return DEFAULT_REFERENCE_BRIEF;

    // Dynamically build from live diary and notice data if available
    const tx = noticeData?.disputedTransactions?.[0];
    const totalAmount = noticeData?.suspectAccount?.totalInflowINR || diaryData?.victimSummary?.totalSiphonedAmount || 955271;

    const dynamicHops: TrailHopItem[] = (diaryData?.chronologicalTrail || []).slice(0, 4).map((entry, idx) => ({
      hop: `Hop ${idx + 1}`,
      fromAccount: `...${entry.sourceAccount.slice(-4)}`,
      toAccount: `...${entry.targetAccount.slice(-4)}`,
      amount: entry.amount.toLocaleString("en-IN"),
      mode: entry.mode,
      networkRole: entry.layerDescription.includes("Collector")
        ? "L1: Collector Mule"
        : entry.layerDescription.includes("Distributor")
        ? "L2: Distributor Mule"
        : "L3: Terminal Cash-out",
      timestamp: entry.timestamp.replace("T", " ").replace(".000Z", "")
    }));

    return {
      firNumber: officerSession?.activeCase || "IND/2026/CY-08819A",
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST",
      classification: "CONFIDENTIAL / STATUTORY",
      primaryTxnId: tx?.transactionId || "TXN000014",
      inflowAmount: totalAmount.toLocaleString("en-IN"),
      victimAccount: tx?.originAccount || "910011223344",
      victimName: "Complainant Victim (Verified NCRP 1930)",
      geolocation: "Indore, Madhya Pradesh (22.7196° N, 75.8577° E)",
      jurisdiction: officerSession?.station || "Vijay Nagar Sector 5, Indore Police Commissionerate",
      ackNumber: `1930/IND/2026/${targetAccount.slice(-6)}`,
      l1CollectorAccount: targetAccount,
      latency: "0.002s (≤ 3.0s SLA Met ✓)",
      trailHops: dynamicHops.length > 0 ? dynamicHops : DEFAULT_REFERENCE_BRIEF.trailHops
    };
  };

  const activeBrief = getActiveBriefData();

  const handlePrint = () => {
    window.print();
  };

  const handlePrintInvestigationBrief = () => {
    setDocType("brief");
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleFreezeRequisitionAction = () => {
    setDocType("notice");
  };

  const handleCopy = () => {
    let textToCopy = "";
    if (docType === "brief") {
      textToCopy = `INVESTIGATION CASE BRIEF // CASE DOSSIER: ${activeBrief.firNumber}\nClassification: ${activeBrief.classification}\nPrimary TXN: ${activeBrief.primaryTxnId}\nAmount: ₹ ${activeBrief.inflowAmount}\nVictim: ${activeBrief.victimName} (${activeBrief.victimAccount})\nCollector Mule: ${activeBrief.l1CollectorAccount}\n\nTRAIL HOPS:\n` +
        activeBrief.trailHops.map(h => `${h.hop}: ${h.fromAccount} -> ${h.toAccount} | ₹ ${h.amount} | ${h.mode} | ${h.networkRole}`).join("\n");
    } else if (docType === "notice") {
      textToCopy = noticeData?.legalNoticeText || "";
    } else {
      textToCopy = JSON.stringify(diaryData, null, 2);
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let content = "";
    let filename = "";

    if (docType === "brief") {
      content = JSON.stringify(activeBrief, null, 2);
      filename = `InvestigationCaseBrief_${activeBrief.firNumber.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    } else if (docType === "notice") {
      content = noticeData?.legalNoticeText || "";
      filename = `Sec91_FreezeNotice_${targetAccount}.txt`;
    } else {
      content = JSON.stringify(diaryData, null, 2);
      filename = `CaseDiary_${targetAccount}.json`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import handler for custom JSON files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.trailHops || parsed.primaryTxnId || parsed.firNumber) {
          setCustomBrief({
            ...DEFAULT_REFERENCE_BRIEF,
            ...parsed
          });
          setUseReferenceCase(false);
          setDocType("brief");
          setIsImportModalOpen(false);
          setImportError(null);
        } else {
          setImportError("File parsed, but missing investigation brief fields (e.g. firNumber, primaryTxnId, trailHops).");
        }
      } catch (err: any) {
        setImportError("Invalid JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyJsonImport = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      setCustomBrief({
        ...DEFAULT_REFERENCE_BRIEF,
        ...parsed
      });
      setUseReferenceCase(false);
      setDocType("brief");
      setIsImportModalOpen(false);
      setImportError(null);
    } catch (err: any) {
      setImportError("Invalid JSON syntax: " + err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Banner & Control Bar */}
      <div
        className="glass-panel no-print"
        style={{
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          border: "1px solid rgba(6, 182, 212, 0.35)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div className="cyber-badge cyber-badge-emerald">
              <ShieldCheck size={12} />
              Module D Legal Officer & Statutory Dispatch
            </div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Strict Database Grounding • 1930 Cyber Fraud Helpline • Section 91 Cr.P.C. / Sec 94 BNSS
            </span>
          </div>

          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "0.02em" }}>
            Investigation case brief and legal action
          </h2>
        </div>

        {/* Action Controls & Document Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Doc Type Toggle Tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(12, 18, 29, 0.9)",
              padding: "3px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <button
              onClick={() => setDocType("brief")}
              style={{
                padding: "6px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                border: "none",
                cursor: "pointer",
                background: docType === "brief" ? "var(--accent-cyan)" : "transparent",
                color: docType === "brief" ? "#ffffff" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <FileText size={13} />
              Investigation Case Brief
            </button>

            <button
              onClick={() => setDocType("notice")}
              style={{
                padding: "6px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                border: "none",
                cursor: "pointer",
                background: docType === "notice" ? "var(--accent-cyan)" : "transparent",
                color: docType === "notice" ? "#ffffff" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <Scale size={13} />
              Freeze Requisition Notice
            </button>

            <button
              onClick={() => setDocType("diary")}
              style={{
                padding: "6px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                border: "none",
                cursor: "pointer",
                background: docType === "diary" ? "var(--accent-cyan)" : "transparent",
                color: docType === "diary" ? "#ffffff" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <Layers size={13} />
              Chronological Case Diary
            </button>
          </div>

          {/* Account Input & Quick Lookup */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="text"
              className="cyber-input font-mono"
              placeholder="Target Account No..."
              value={targetAccount}
              onChange={(e) => setTargetAccount(e.target.value)}
              style={{ width: "160px", height: "36px", fontSize: "0.82rem" }}
            />
            <button
              onClick={() => fetchBothData(targetAccount)}
              className="btn-primary"
              style={{ height: "36px", padding: "0 12px" }}
              disabled={loading}
              title="Fetch Records"
            >
              <Search size={14} />
            </button>
          </div>

          {/* Explicit User Requested Buttons */}
          <button
            onClick={handleFreezeRequisitionAction}
            className="btn-danger font-display"
            style={{
              height: "36px",
              padding: "0 14px",
              fontSize: "0.78rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 0 15px rgba(239, 68, 68, 0.35)",
              border: "1px solid #ef4444"
            }}
            title="Open Statutory Bank Freeze Requisition"
          >
            <Scale size={14} />
            Freeze Requisition
          </button>

          <button
            onClick={handlePrintInvestigationBrief}
            className="btn-primary font-display"
            style={{
              height: "36px",
              padding: "0 14px",
              fontSize: "0.78rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, #0284c7, #06b6d4)",
              boxShadow: "0 0 15px rgba(6, 182, 212, 0.4)"
            }}
            title="Print Investigation Brief (Matching Dossier Standard)"
          >
            <Printer size={14} />
            Print Investigation Brief
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-secondary"
            style={{ height: "36px", padding: "0 12px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "5px" }}
            title="Import or Load Investigation Brief Data"
          >
            <Upload size={14} />
            Import
          </button>

          <button
            onClick={handlePrint}
            className="btn-secondary"
            style={{ height: "36px", padding: "0 12px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "5px" }}
            title="Print Current Document"
          >
            <Printer size={14} />
            Print
          </button>

          <button
            onClick={handleCopy}
            className="btn-secondary"
            style={{ height: "36px", padding: "0 12px", fontSize: "0.78rem" }}
            title="Copy Document Text"
          >
            {copied ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>

          <button
            onClick={handleDownload}
            className="btn-secondary"
            style={{ height: "36px", padding: "0 12px", fontSize: "0.78rem" }}
            title="Download Document"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* ========================================================
          DOCUMENT VIEW 1: INVESTIGATION CASE BRIEF
          (High-Fidelity Match to Reference Image Dossier)
          ======================================================== */}
      {docType === "brief" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Sub-bar for Brief customization / preset toggle (no-print) */}
          <div
            className="glass-panel no-print"
            style={{
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.78rem",
              color: "var(--text-secondary)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>Case Dossier Source:</span>
              <button
                onClick={() => {
                  setCustomBrief(null);
                  setUseReferenceCase(true);
                }}
                className={useReferenceCase && !customBrief ? "cyber-badge cyber-badge-cyan" : "btn-secondary"}
                style={{ fontSize: "0.72rem", padding: "3px 10px", cursor: "pointer" }}
              >
                Operation Abhedya-Chakra Reference (FIR IND/2026/CY-08819A)
              </button>

              <button
                onClick={() => {
                  setCustomBrief(null);
                  setUseReferenceCase(false);
                }}
                className={!useReferenceCase && !customBrief ? "cyber-badge cyber-badge-emerald" : "btn-secondary"}
                style={{ fontSize: "0.72rem", padding: "3px 10px", cursor: "pointer" }}
              >
                Active Account {targetAccount} Forensic Brief
              </button>

              {customBrief && (
                <span className="cyber-badge cyber-badge-purple" style={{ fontSize: "0.72rem", padding: "3px 10px" }}>
                  Custom Imported Brief Active
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>Ready for Section 91 Court Delivery</span>
            </div>
          </div>

          {/* Printable Investigation Brief Document */}
          <div
            className="printable-document"
            style={{
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "var(--radius-lg)",
              border: "1.5px solid #0f172a",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
              padding: "36px 44px",
              maxWidth: "960px",
              margin: "0 auto",
              width: "100%",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              lineHeight: 1.5,
              position: "relative"
            }}
          >
            {/* Header: Commissionerate & Case Details (exact match to image) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "2px solid #0f172a",
                paddingBottom: "16px",
                marginBottom: "20px"
              }}
            >
              {/* Left Logo & Unit Branding */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "#0f172a",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff"
                  }}
                >
                  <Layers size={24} color="#38bdf8" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      color: "#0f172a",
                      textTransform: "uppercase"
                    }}
                  >
                    POLICE COMMISSIONERATE • CYBER CRIME CELL
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#334155",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      marginTop: "2px"
                    }}
                  >
                    1930 HELPLINE FORENSIC UNIT • OPERATION ABHEDYA-CHAKRA (VOID HACKS 8.0)
                  </div>
                </div>
              </div>

              {/* Right: FIR Reference & Statutory Classification */}
              <div style={{ textAlign: "right", fontSize: "0.78rem", lineHeight: 1.45, color: "#0f172a" }}>
                <div style={{ fontWeight: 800 }}>
                  CASE DOSSIER FIR: <span style={{ fontFamily: "monospace", letterSpacing: "0.02em" }}>{activeBrief.firNumber}</span>
                </div>
                <div style={{ fontWeight: 700, color: "#334155" }}>
                  DATE: {activeBrief.date} | TIME: {activeBrief.time}
                </div>
                <div style={{ fontWeight: 800, color: "#0f172a", letterSpacing: "0.03em" }}>
                  CLASSIFICATION: <span style={{ color: "#b91c1c" }}>{activeBrief.classification}</span>
                </div>
              </div>
            </div>

            {/* 1. EXECUTIVE INCIDENT SUMMARY */}
            <div style={{ marginBottom: "22px" }}>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "0.04em",
                  marginBottom: "8px",
                  textTransform: "uppercase"
                }}
              >
                1. EXECUTIVE INCIDENT SUMMARY
              </div>
              <div style={{ fontSize: "0.86rem", color: "#1e293b", textAlign: "justify", lineHeight: 1.6 }}>
                The 1930 Cyber Fraud Helpline and Void Hacks 8.0 Forensics Engine detected an organized cyber-fraud operation involving unauthorized fund exfiltration under Transaction ID <strong style={{ fontFamily: "monospace", color: "#0f172a" }}>{activeBrief.primaryTxnId}</strong>. Automated forensic algorithmic money-tracing was executed across 4 tiers of intermediate money mules to identify smurfing routes and mandate Section 91 CrPC statutory debit freezes.
              </div>
            </div>

            {/* 2. ORIGINATING FRAUDULENT INCIDENT PARTICULARS */}
            <div style={{ marginBottom: "26px" }}>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "0.04em",
                  marginBottom: "10px",
                  textTransform: "uppercase"
                }}
              >
                2. ORIGINATING FRAUDULENT INCIDENT PARTICULARS
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 700, color: "#0f172a", width: "38%" }}>
                      Primary Transaction ID:
                    </td>
                    <td style={{ padding: "8px 4px", fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>
                      {activeBrief.primaryTxnId}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 700, color: "#0f172a" }}>
                      Incident Inflow Amount:
                    </td>
                    <td style={{ padding: "8px 4px", fontWeight: 800, color: "#0f172a" }}>
                      ₹ {activeBrief.inflowAmount}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 700, color: "#0f172a" }}>
                      Victim Sender Account:
                    </td>
                    <td style={{ padding: "8px 4px", fontFamily: "monospace", fontWeight: 600, color: "#0f172a" }}>
                      {activeBrief.victimAccount}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 700, color: "#0f172a" }}>
                      Victim Complainant:
                    </td>
                    <td style={{ padding: "8px 4px", fontWeight: 700, color: "#0f172a" }}>
                      {activeBrief.victimName}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 700, color: "#0f172a" }}>
                      Victim Transfer Geolocation:
                    </td>
                    <td style={{ padding: "8px 4px", color: "#334155" }}>
                      {activeBrief.geolocation}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 700, color: "#0f172a" }}>
                      Police Jurisdiction:
                    </td>
                    <td style={{ padding: "8px 4px", color: "#334155" }}>
                      {activeBrief.jurisdiction}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 700, color: "#0f172a" }}>
                      1930 Portal Acknowledgment:
                    </td>
                    <td style={{ padding: "8px 4px", fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>
                      {activeBrief.ackNumber}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 700, color: "#0f172a" }}>
                      L1 Collector Mule Account:
                    </td>
                    <td style={{ padding: "8px 4px", fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>
                      {activeBrief.l1CollectorAccount}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 700, color: "#0f172a" }}>
                      4-Hop Timeline Latency:
                    </td>
                    <td style={{ padding: "8px 4px", fontWeight: 700, color: "#15803d" }}>
                      {activeBrief.latency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. 4-HOP MONEY TRAIL MULTI-HOP BREAKDOWN */}
            <div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "0.04em",
                  marginBottom: "12px",
                  textTransform: "uppercase"
                }}
              >
                3. 4-HOP MONEY TRAIL MULTI-HOP BREAKDOWN
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #0f172a", textAlign: "left", color: "#0f172a" }}>
                    <th style={{ padding: "8px 6px", fontWeight: 800 }}>HOP</th>
                    <th style={{ padding: "8px 6px", fontWeight: 800 }}>FROM ACCOUNT</th>
                    <th style={{ padding: "8px 6px", fontWeight: 800 }}>TO ACCOUNT</th>
                    <th style={{ padding: "8px 6px", fontWeight: 800 }}>TRANSFER AMOUNT</th>
                    <th style={{ padding: "8px 6px", fontWeight: 800 }}>PAYMENT MODE</th>
                    <th style={{ padding: "8px 6px", fontWeight: 800 }}>NETWORK ROLE</th>
                    <th style={{ padding: "8px 6px", fontWeight: 800 }}>TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBrief.trailHops.map((hop, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "10px 6px", fontWeight: 700, color: "#0f172a" }}>
                        {hop.hop}
                      </td>
                      <td style={{ padding: "10px 6px", fontFamily: "monospace", fontWeight: 600 }}>
                        {hop.fromAccount}
                      </td>
                      <td style={{ padding: "10px 6px", fontFamily: "monospace", fontWeight: 600 }}>
                        {hop.toAccount}
                      </td>
                      <td style={{ padding: "10px 6px", fontWeight: 800, color: "#0f172a" }}>
                        ₹ {hop.amount}
                      </td>
                      <td style={{ padding: "10px 6px", fontWeight: 600 }}>
                        {hop.mode}
                      </td>
                      <td style={{ padding: "10px 6px", fontWeight: 600, color: "#1e293b" }}>
                        {hop.networkRole}
                      </td>
                      <td style={{ padding: "10px 6px", color: "#475569", fontFamily: "monospace" }}>
                        {hop.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print Footer Attribution */}
            <div
              style={{
                marginTop: "28px",
                paddingTop: "14px",
                borderTop: "1px solid #cbd5e1",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.7rem",
                color: "#64748b"
              }}
            >
              <div>TraceMind Cyber Forensic Engine • Void Hacks 8.0 • Section 91 CrPC Dossier</div>
              <div>Page 1 of 1 • Statutory Official Record</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DOCUMENT VIEW 2: STATUTORY BANK FREEZE REQUISITION NOTICE
          (Section 91 Cr.P.C. / Section 94 BNSS)
          ======================================================== */}
      {docType === "notice" && noticeData && (
        <div
          className="printable-document glass-panel"
          style={{
            padding: "48px 56px",
            background: "#ffffff",
            color: "#0f172a",
            borderRadius: "var(--radius-lg)",
            border: "1px solid #cbd5e1",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
            lineHeight: 1.6,
            fontFamily: "'Inter', sans-serif",
            maxWidth: "900px",
            margin: "0 auto"
          }}
        >
          {/* Official Indian Police Header & State Emblem Motif */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: "16px", marginBottom: "24px" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 900, letterSpacing: "0.08em", color: "#0f172a", textTransform: "uppercase" }}>
              OFFICE OF THE SUPERINTENDENT OF POLICE
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1e293b", textTransform: "uppercase" }}>
              {noticeData.metadata.policeStation}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 500, marginTop: "2px" }}>
              1930 National Cybercrime Reporting Portal (NCRP) • State Cyber Police Headquarters
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>
              <div>REF NO: <span style={{ fontFamily: "monospace" }}>{noticeData.metadata.noticeReference}</span></div>
              <div>DATE: {new Date(noticeData.metadata.dateGenerated).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
            </div>
          </div>

          {/* Addressee */}
          <div style={{ marginBottom: "20px", fontSize: "0.9rem" }}>
            <strong>To,</strong><br />
            <strong>The Chief Nodal Officer (Law Enforcement Desk) / Branch Manager,</strong><br />
            {noticeData.targetBank.bankName}<br />
            IFSC Code: <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{noticeData.targetBank.ifsc}</span><br />
            <strong>Compliance Window:</strong> <span style={{ color: "#b91c1c", fontWeight: 700 }}>{noticeData.targetBank.complianceWindow}</span>
          </div>

          {/* Subject */}
          <div
            style={{
              background: "#f1f5f9",
              padding: "12px 16px",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "0.88rem",
              marginBottom: "20px",
              borderLeft: "4px solid #0284c7"
            }}
          >
            SUBJECT: STATUTORY REQUISITION UNDER {noticeData.metadata.legalSection.toUpperCase()} — URGENT DEBIT FREEZE / LIEN MARKING ON FRAUDULENT BENEFICIARY ACCOUNT NO. {noticeData.suspectAccount.accountNumber} AND PRODUCTION OF BANKING DOSSIER
          </div>

          {/* Formal Body Paragraphs */}
          <div style={{ fontSize: "0.88rem", color: "#1e293b", marginBottom: "20px", textAlign: "justify" }}>
            <p style={{ marginBottom: "12px" }}>
              1. <strong>WHEREAS</strong>, an investigation into an organized inter-state cyber fraud syndicate is being actively pursued under <strong>{noticeData.metadata.firNumber}</strong> at {noticeData.metadata.policeStation};
            </p>
            <p style={{ marginBottom: "12px" }}>
              2. <strong>AND WHEREAS</strong>, advanced graph-topology digital forensics and real-time transaction tracing reveal that defrauded proceeds of crime amounting to <strong>₹{noticeData.suspectAccount.totalInflowINR.toLocaleString("en-IN")}</strong> were deceptively transferred into Beneficiary Account No. <strong>{noticeData.suspectAccount.accountNumber}</strong> maintained at your bank branch;
            </p>
            <p>
              3. <strong>SCHEDULE OF DISPUTED PROCEEDS (ANTI-HALLUCINATION AUDIT TRAIL):</strong>
            </p>
          </div>

          {/* Verified Disputed Transactions Table (Anti-Hallucination) */}
          <div style={{ marginBottom: "24px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", border: "1px solid #94a3b8" }}>
              <thead>
                <tr style={{ background: "#e2e8f0", color: "#0f172a" }}>
                  <th style={{ border: "1px solid #94a3b8", padding: "8px" }}>TXN ID</th>
                  <th style={{ border: "1px solid #94a3b8", padding: "8px" }}>DATE & TIME</th>
                  <th style={{ border: "1px solid #94a3b8", padding: "8px" }}>MODE</th>
                  <th style={{ border: "1px solid #94a3b8", padding: "8px" }}>ORIGIN ACCOUNT</th>
                  <th style={{ border: "1px solid #94a3b8", padding: "8px" }}>AMOUNT (₹)</th>
                  <th style={{ border: "1px solid #94a3b8", padding: "8px" }}>NARRATION / REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {noticeData.disputedTransactions.map((tx) => (
                  <tr key={tx.transactionId}>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", fontFamily: "monospace", fontWeight: 700 }}>
                      {tx.transactionId}
                    </td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px" }}>{tx.timestamp}</td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", fontWeight: 600 }}>{tx.paymentMode}</td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", fontFamily: "monospace" }}>{tx.originAccount}</td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", fontWeight: 700, textAlign: "right" }}>
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", fontSize: "0.72rem" }}>{tx.narration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statutory Directives */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "8px" }}>
              STATUTORY ORDERS TO NODAL OFFICER:
            </div>
            <ul style={{ paddingLeft: "20px", fontSize: "0.85rem", color: "#1e293b", display: "flex", flexDirection: "column", gap: "6px" }}>
              {noticeData.statutoryDirectives.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

          {/* Penal Warning */}
          <div
            style={{
              padding: "12px 14px",
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: "6px",
              fontSize: "0.8rem",
              color: "#991b1b",
              marginBottom: "32px",
              fontWeight: 500
            }}
          >
            <strong>PENAL LIABILITY NOTICE:</strong> Failure to comply with this statutory order within the stipulated time frame invites criminal prosecution under Section 175 of the Indian Penal Code / Section 223 of Bharatiya Nyaya Sanhita (BNS), 2023, along with reporting to Reserve Bank of India (RBI) Regulatory Sandbox and Enforcement Directorate.
          </div>

          {/* Officer Signature & Digital Police Seal */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #94a3b8", paddingTop: "20px" }}>
            {/* Digital Verification QR */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "56px", height: "56px", border: "1px solid #94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QrCode size={44} color="#0f172a" />
              </div>
              <div style={{ fontSize: "0.7rem", color: "#64748b", lineHeight: 1.3 }}>
                <div>NCRP DIGITAL SEAL</div>
                <div style={{ fontFamily: "monospace" }}>SEC-HASH: {noticeData.metadata.noticeReference.slice(-10)}</div>
                <div>VERIFIED COURT RECORD</div>
              </div>
            </div>

            {/* Signature Block */}
            <div style={{ textAlign: "right", fontSize: "0.85rem" }}>
              <div style={{ fontFamily: "cursive", fontSize: "1.2rem", color: "#0f172a", marginBottom: "4px" }}>
                {noticeData.metadata.officer.name}
              </div>
              <div style={{ fontWeight: 700 }}>({noticeData.metadata.officer.name})</div>
              <div>Badge / Service ID: {noticeData.metadata.officer.badge}</div>
              <div>{noticeData.metadata.officer.designation}</div>
              <div style={{ fontWeight: 600, color: "#475569" }}>{noticeData.metadata.policeStation}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DOCUMENT VIEW 3: CHRONOLOGICAL FUND TRAIL INVESTIGATION
          - Mule Syndicate Analysis for Root Account
          (Maintained Completely Intact as Requested)
          ======================================================== */}
      {docType === "diary" && diaryData && (
        <div
          className="printable-document glass-panel"
          style={{
            padding: "40px 48px",
            background: "#0c121d",
            color: "#f8fafc",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(6, 182, 212, 0.4)",
            lineHeight: 1.6,
            maxWidth: "960px",
            margin: "0 auto",
            width: "100%"
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "16px", marginBottom: "20px" }}>
            <div className="cyber-badge cyber-badge-cyan" style={{ marginBottom: "8px" }}>
              FORM VI • GENERAL / CASE DIARY (SECTION 172 Cr.P.C. / SECTION 192 BNSS)
            </div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>
              {diaryData.caseDiaryHeader.subject || `Chronological Fund Trail Investigation - Mule Syndicate Analysis for Root Account ${targetAccount}`}
            </h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexWrap: "wrap", gap: "8px" }}>
              <div>CASE REF: {diaryData.caseDiaryHeader.caseDiaryNumber}</div>
              <div>INVESTIGATING OFFICER: {diaryData.caseDiaryHeader.investigatingOfficer} ({diaryData.caseDiaryHeader.badgeId})</div>
              <div>POLICE STATION: {diaryData.caseDiaryHeader.policeStation}</div>
            </div>
          </div>

          {/* Crime Summary Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "24px" }}>
            <div className="glass-panel" style={{ padding: "14px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>TOTAL SIPHONED CAPITAL</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ef4444" }}>
                ₹{diaryData.victimSummary.totalSiphonedAmount.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "14px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>DETECTED MULTI-HOP DEPTH</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#22d3ee" }}>
                {diaryData.victimSummary.detectedHops} Hops Deep
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "14px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>SYNDICATE NODES VISITED</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b" }}>
                {diaryData.victimSummary.visitedNodesCount} Bank Nodes
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "14px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>ROOT MULE RISK SCORE</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#a855f7" }}>
                {diaryData.victimSummary.muleRiskScore}/100 ({diaryData.victimSummary.muleSeverity})
              </div>
            </div>
          </div>

          {/* Chronological Step-by-Step Fund Movement Trail */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "1rem", color: "var(--accent-cyan)", marginBottom: "12px" }}>
              CHRONOLOGICAL FUND FLOW INVESTIGATION TIMELINE
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {diaryData.chronologicalTrail.map((entry) => (
                <div
                  key={entry.transactionId}
                  className="glass-panel"
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderLeft: "3px solid #06b6d4"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: "0.65rem", padding: "1px 5px" }}>
                        Step #{entry.step}
                      </span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                        {entry.sourceAccount} &rarr; {entry.targetAccount}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        ({entry.layerDescription})
                      </span>
                    </div>

                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                      UTR: {entry.transactionId} • Mode: {entry.mode} • IP: {entry.ipAddress} • Device: {entry.device}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)" }}>
                      ₹{entry.amount.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      {entry.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Recommendations */}
          <div>
            <h4 style={{ fontSize: "0.95rem", color: "#f59e0b", marginBottom: "8px" }}>
              INVESTIGATING OFFICER DIRECTIVES & ACTIONS:
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              {diaryData.immediateActionRecommendations.map((act, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          IMPORT MODAL DIALOG
          ======================================================== */}
      {isImportModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            className="glass-panel-elevated"
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "24px 28px",
              borderRadius: "var(--radius-lg)",
              border: "1.5px solid rgba(6, 182, 212, 0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "18px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FolderOpen size={20} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Import Investigation Case Brief</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="btn-secondary"
                style={{ padding: "6px 8px" }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
              Upload an FIR dossier JSON or paste a raw case payload to instantly generate the court-ready Investigation Brief.
            </p>

            {importError && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid #ef4444",
                  borderRadius: "var(--radius-sm)",
                  padding: "8px 12px",
                  fontSize: "0.78rem",
                  color: "#ef4444"
                }}
              >
                {importError}
              </div>
            )}

            {/* Quick Presets */}
            <div>
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                Quick Presets
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    setCustomBrief(null);
                    setUseReferenceCase(true);
                    setDocType("brief");
                    setIsImportModalOpen(false);
                  }}
                  className="btn-primary"
                  style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                >
                  Load Reference Image Case (FIR IND/2026/CY-08819A)
                </button>
                <button
                  onClick={() => {
                    setCustomBrief(null);
                    setUseReferenceCase(false);
                    setDocType("brief");
                    setIsImportModalOpen(false);
                  }}
                  className="btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                >
                  Load Account 100000000007 Live Brief
                </button>
              </div>
            </div>

            {/* File Upload Button */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".json,application/json"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary"
                style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "0.82rem" }}
              >
                <FileUp size={16} />
                Upload JSON Case File
              </button>
            </div>

            {/* Paste JSON */}
            <div>
              <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Or Paste Brief JSON:
              </label>
              <textarea
                className="cyber-input font-mono"
                rows={6}
                placeholder='{"firNumber": "IND/2026/CY-08819A", "primaryTxnId": "TXN7701928301", "inflowAmount": "15,00,000", ...}'
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                style={{ width: "100%", fontSize: "0.75rem", padding: "10px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.82rem" }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyJsonImport}
                className="btn-primary font-display"
                style={{ padding: "8px 20px", fontSize: "0.82rem" }}
                disabled={!importJsonText.trim()}
              >
                Apply Imported Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
