import React, { useState, useEffect } from "react";
import {
  Sliders,
  ShieldAlert,
  Flame,
  GitBranch,
  Repeat,
  Radio,
  ExternalLink,
  Scale,
  Activity,
  CheckCircle2,
  TrendingUp,
  Cpu
} from "lucide-react";

interface Props {
  onSelectAccount: (accountId: string) => void;
  onGenerateNotice: (accountId: string) => void;
}

export const MuleRingHeuristics: React.FC<Props> = ({
  onSelectAccount,
  onGenerateNotice
}) => {
  const [detectedMules, setDetectedMules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAccount, setActiveAccount] = useState<string>("100000000001");
  const [accountRisk, setAccountRisk] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/mule-rings/detected-mules")
      .then((res) => res.json())
      .then((data) => {
        setDetectedMules(data.mules || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch detected mules", err);
        setLoading(false);
      });
  }, []);

  const inspectAccountRisk = async (accountId: string) => {
    setActiveAccount(accountId);
    setRiskLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/risk/account/${accountId}`);
      const data = await res.json();
      setAccountRisk(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRiskLoading(false);
    }
  };

  useEffect(() => {
    inspectAccountRisk("100000000001");
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Heuristic Engine Overview */}
      <div
        className="glass-panel"
        style={{
          padding: "24px",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(16, 24, 40, 0.7) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.35)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div className="cyber-badge cyber-badge-purple">
              <Sliders size={12} />
              Module B Graph Analytics Engine
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--accent-purple)", fontFamily: "var(--font-mono)" }}>
              0–100 Mule Risk Index (MRI)
            </span>
          </div>

          <h2 style={{ fontSize: "1.5rem", marginBottom: "6px" }}>
            Mule Ring Detection & Heuristic Scoring
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "720px" }}>
            Evaluates account graph topology across 5 mathematical indicators: High-Velocity Pass-Through (&ge;90% within 3–15 min), Collector Fan-In (L1), Distributor Fan-Out (L2), Terminal Cash-Outs (L3 Crypto P2P/ATM/Proxy IPs), and Cyclical Smurfing.
          </p>
        </div>

        {/* 5 Heuristic Indicators Badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="cyber-badge cyber-badge-amber">⚡ High-Velocity Dispersal (&le; 15 mins)</div>
          <div className="cyber-badge cyber-badge-cyan">📥 Collector Mule (High In-Degree)</div>
          <div className="cyber-badge cyber-badge-purple">📤 Distributor Mule (Slicing 3-7 Accounts)</div>
          <div className="cyber-badge cyber-badge-crimson">🚨 Terminal Cashout (P2P/Foreign IP/Emulator)</div>
        </div>
      </div>

      {/* Main Grid: Left Account Risk Gauge, Right Detected Mule Accounts Ledger */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: "20px" }}>
        {/* Left: Active Account Risk Dossier */}
        <div className="glass-panel-elevated" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem" }}>Account Risk Scorecard</h3>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                ACCOUNT: {activeAccount}
              </div>
            </div>
          </div>

          {accountRisk ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Score Meter */}
              <div
                style={{
                  background: "rgba(12, 18, 29, 0.8)",
                  padding: "18px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Mule Risk Index (MRI)
                  </div>
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: 900,
                      fontFamily: "var(--font-heading)",
                      color: accountRisk.riskScore >= 80 ? "#ef4444" : accountRisk.riskScore >= 60 ? "#f59e0b" : "#10b981",
                      textShadow: "0 0 15px currentColor"
                    }}
                  >
                    {accountRisk.riskScore}
                    <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/100</span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    className={
                      accountRisk.severity === "CRITICAL"
                        ? "cyber-badge cyber-badge-crimson"
                        : accountRisk.severity === "HIGH"
                        ? "cyber-badge cyber-badge-amber"
                        : "cyber-badge cyber-badge-emerald"
                    }
                    style={{ fontSize: "0.85rem", padding: "6px 14px" }}
                  >
                    {accountRisk.severity} THREAT
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    {accountRisk.patterns.length} Active Heuristic Violations
                  </div>
                </div>
              </div>

              {/* Detected Heuristic Patterns List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Flagged Topology Patterns
                </div>

                {accountRisk.patterns.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{
                      padding: "12px",
                      borderLeft: `4px solid ${
                        p.type === "RAPID_FLOW"
                          ? "#ef4444"
                          : p.type === "FAN_IN"
                          ? "#f59e0b"
                          : p.type === "FAN_OUT"
                          ? "#a855f7"
                          : "#06b6d4"
                      }`
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                        {p.type.replace("_", " ")}
                      </span>
                      <span className="cyber-badge cyber-badge-amber" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                        +{p.score} PTS
                      </span>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                      {p.description}
                    </div>

                    {/* Metadata chips */}
                    {p.metadata && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {p.metadata.timeDifferenceMinutes !== undefined && (
                          <span style={{ background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "3px" }}>
                            Velocity: {p.metadata.timeDifferenceMinutes} min
                          </span>
                        )}
                        {p.metadata.uniqueSenders !== undefined && (
                          <span style={{ background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "3px" }}>
                            Inflow Nodes: {p.metadata.uniqueSenders}
                          </span>
                        )}
                        {p.metadata.uniqueRecipients !== undefined && (
                          <span style={{ background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "3px" }}>
                            Outflow Nodes: {p.metadata.uniqueRecipients}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Loading account risk scorecard...
            </div>
          )}
        </div>

        {/* Right: Detected Mules in Dataset Table */}
        <div className="glass-panel-elevated" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem" }}>High-Risk Suspect Ledger</h3>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Ranked by Multi-Tier Mule Risk Score across the 15-day window.
              </div>
            </div>

            <div className="cyber-badge cyber-badge-crimson">
              {detectedMules.length} Syndicates Flagged
            </div>
          </div>

          <div className="cyber-table-container" style={{ maxHeight: "480px" }}>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>ACCOUNT NUMBER</th>
                  <th>RISK SCORE</th>
                  <th>PATTERNS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {detectedMules.map((m) => {
                  const isCur = activeAccount === m.account;
                  return (
                    <tr
                      key={m.account}
                      style={{
                        background: isCur ? "rgba(6, 182, 212, 0.08)" : undefined,
                        cursor: "pointer"
                      }}
                      onClick={() => inspectAccountRisk(m.account)}
                    >
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {m.account}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            fontFamily: "var(--font-mono)",
                            color: m.riskScore >= 80 ? "#ef4444" : m.riskScore >= 60 ? "#f59e0b" : "#10b981"
                          }}
                        >
                          {m.riskScore}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "4px" }}>
                          ({m.severity})
                        </span>
                      </td>
                      <td style={{ fontSize: "0.72rem" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {m.patterns.slice(0, 3).map((p: string, i: number) => (
                            <span
                              key={i}
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                padding: "2px 5px",
                                borderRadius: "3px"
                              }}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAccount(m.account);
                          }}
                          className="btn-primary"
                          style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                          title="View on Interactive Flow Graph"
                        >
                          Graph
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
