import React, { useState, useEffect } from "react";
import {
  X,
  ShieldAlert,
  Scale,
  Crosshair,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface Props {
  accountId: string | null;
  onClose: () => void;
  onIsolateRing: (accountId: string) => void;
  onGenerateNotice: (accountId: string) => void;
  onGenerateDiary: (accountId: string) => void;
}

export const AccountDossierModal: React.FC<Props> = ({
  accountId,
  onClose,
  onIsolateRing,
  onGenerateNotice,
  onGenerateDiary
}) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) return;

    setLoading(true);
    Promise.all([
      fetch(`http://localhost:8000/analytics/account/${accountId}`).then((r) => r.json()),
      fetch(`http://localhost:8000/risk/account/${accountId}`).then((r) => r.json()),
      fetch(`http://localhost:8000/accounts/${accountId}/transactions`).then((r) => r.json())
    ])
      .then(([aData, rData, tData]) => {
        setAnalytics(aData);
        setRisk(rData);
        setTransactions(tData.transactions || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accountId]);

  if (!accountId) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(5, 8, 16, 0.8)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
    >
      <div
        className="glass-panel-elevated"
        style={{
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid rgba(6, 182, 212, 0.4)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(12, 18, 29, 0.8)"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="cyber-badge cyber-badge-cyan">Forensic Dossier</span>
              {risk && (
                <span
                  className={
                    risk.riskScore >= 80
                      ? "cyber-badge cyber-badge-crimson"
                      : risk.riskScore >= 60
                      ? "cyber-badge cyber-badge-amber"
                      : "cyber-badge cyber-badge-emerald"
                  }
                >
                  MRI: {risk.riskScore}/100 ({risk.severity})
                </span>
              )}
            </div>

            <h2 style={{ fontSize: "1.35rem", fontFamily: "var(--font-mono)" }}>
              Account {accountId}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ width: "32px", height: "32px", borderRadius: "50%", padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quick Action Toolbar */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                onIsolateRing(accountId);
                onClose();
              }}
              className="btn-primary"
              style={{ fontSize: "0.8rem", padding: "8px 14px" }}
            >
              <Crosshair size={14} />
              Isolate Syndicate Ring on Graph
            </button>

            <button
              onClick={() => {
                onGenerateDiary(accountId);
                onClose();
              }}
              className="btn-secondary"
              style={{ fontSize: "0.8rem", padding: "8px 14px" }}
            >
              <FileText size={14} />
              Open Investigation Case Brief & Diary
            </button>
          </div>

          {/* Flow Metrics */}
          {analytics && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div className="glass-panel" style={{ padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  <ArrowDownLeft size={14} color="#10b981" />
                  TOTAL INCOMING
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                  ₹{Number(analytics.incoming.amount).toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {analytics.incoming.count} txns from {analytics.incoming.uniqueAccounts} accounts
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  <ArrowUpRight size={14} color="#ef4444" />
                  TOTAL OUTGOING
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ef4444", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                  ₹{Number(analytics.outgoing.amount).toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {analytics.outgoing.count} txns to {analytics.outgoing.uniqueAccounts} accounts
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "14px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>ESTIMATED HOLDING</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#22d3ee", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                  ₹{Math.max(0, analytics.incoming.amount - analytics.outgoing.amount).toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Total Flow: ₹{(analytics.totalFlow / 1000).toFixed(0)}k
                </div>
              </div>
            </div>
          )}

          {/* Risk Reasons */}
          {risk && risk.reasons.length > 0 && (
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                Active Heuristic Indicators Flagged
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {risk.reasons.map((r: string, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8rem",
                      color: "#fca5a5"
                    }}
                  >
                    🚨 {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disputed Transactions */}
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
              Linked Transactions ({transactions.length})
            </div>

            <div className="cyber-table-container" style={{ maxHeight: "240px" }}>
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>TXN ID</th>
                    <th>TYPE</th>
                    <th>COUNTERPARTY</th>
                    <th>AMOUNT (₹)</th>
                    <th>DATE & TIME</th>
                    <th>NARRATION</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 15).map((t) => {
                    const isIncoming = String(t.receiver_account) === accountId;
                    return (
                      <tr key={t.transaction_id}>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-cyan)" }}>
                          {t.transaction_id}
                        </td>
                        <td>
                          <span
                            className={isIncoming ? "cyber-badge cyber-badge-emerald" : "cyber-badge cyber-badge-crimson"}
                            style={{ fontSize: "0.62rem", padding: "1px 5px" }}
                          >
                            {isIncoming ? "INFLOW" : "OUTFLOW"}
                          </span>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>
                          {isIncoming ? t.sender_account : t.receiver_account}
                        </td>
                        <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                          ₹{Number(t.amount).toLocaleString("en-IN")}
                        </td>
                        <td style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {t.timestamp}
                        </td>
                        <td style={{ fontSize: "0.72rem" }}>{t.narration}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
