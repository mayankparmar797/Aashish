import React, { useState, useEffect } from "react";
import { Navbar, ActiveTab } from "./components/Navbar";
import { InteractiveGraph } from "./components/InteractiveGraph";
import { CaseReplayTimeline } from "./components/CaseReplayTimeline";
import { MuleRingHeuristics } from "./components/MuleRingHeuristics";
import { LegalNoticeGenerator } from "./components/LegalNoticeGenerator";
import { IngestionBenchmarkView } from "./components/IngestionBenchmarkView";
import { OfficerLoginView } from "./components/OfficerLoginView";
import { OfficerAuthModal } from "./components/OfficerAuthModal";
import { AccountDossierModal } from "./components/AccountDossierModal";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OfficerSession, GraphNode, GraphEdge } from "./types";
import {
  Crosshair,
  Layers,
  ShieldAlert,
  Scale,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Search,
  Building,
  MapPin,
  UserCheck,
  ShieldCheck,
  Clock,
  ArrowRight,
  Shield
} from "lucide-react";

export const PRIORITY_VICTIM_CASES = [
  {
    accountId: "900000000001",
    name: "Ramesh Sharma",
    scheme: "Digital Arrest / Fake CBI Extortion",
    amount: 450000,
    bank: "HDFC Bank Ltd.",
    ifsc: "HDFC0005678",
    location: "Indore, Madhya Pradesh",
    reportedAt: "2026-10-02 09:14 IST",
    firNumber: "FIR #MP-IND-2026/842",
    tag: "High Priority • Sr. Citizen"
  },
  {
    accountId: "900000000002",
    name: "Sunita Verma",
    scheme: "Customs Parcel / Courier Narcotics Scam",
    amount: 680000,
    bank: "ICICI Bank Ltd.",
    ifsc: "ICIC0001234",
    location: "Jaipur, Rajasthan",
    reportedAt: "2026-10-01 14:32 IST",
    firNumber: "FIR #RJ-JPR-2026/519",
    tag: "FedEx Courier Impersonation"
  },
  {
    accountId: "900000000003",
    name: "Anand Joshi",
    scheme: "Telegram Prepaid Rating / Task Fraud",
    amount: 320000,
    bank: "State Bank of India",
    ifsc: "SBIN0004567",
    location: "Pune, Maharashtra",
    reportedAt: "2026-09-30 18:22 IST",
    firNumber: "FIR #MH-PUN-2026/304",
    tag: "Work-From-Home Task Scheme"
  },
  {
    accountId: "900000000004",
    name: "Kavita Rao",
    scheme: "Electricity Power Bill Disconnection APK",
    amount: 195000,
    bank: "Axis Bank Ltd.",
    ifsc: "UTIB0002345",
    location: "Hyderabad, Telangana",
    reportedAt: "2026-09-29 11:45 IST",
    firNumber: "FIR #TS-HYD-2026/188",
    tag: "Malware APK Sideloading"
  },
  {
    accountId: "900000000005",
    name: "Alok Gupta",
    scheme: "Crypto Arbitrage Phishing Investment",
    amount: 840000,
    bank: "Kotak Mahindra Bank",
    ifsc: "KKBK0008901",
    location: "New Delhi, Delhi",
    reportedAt: "2026-09-28 20:10 IST",
    firNumber: "FIR #DL-CP-2026/993",
    tag: "Fake Investment Portal"
  }
];

export const App: React.FC = () => {
  // Session starts unauthenticated on page refresh/load as requested
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Officer Session
  const [officerSession, setOfficerSession] = useState<OfficerSession | null>(null);

  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);

  // Active Tab: Evidence Intake & Ingestion at the first place
  const [activeTab, setActiveTab] = useState<ActiveTab>("benchmarks");

  // Search Value
  const [searchValue, setSearchValue] = useState("");

  // Graph state: On-demand generation when details are entered
  const [hasEnteredDetails, setHasEnteredDetails] = useState<boolean>(false);
  const [targetInput, setTargetInput] = useState<string>("");
  const [focusedTransactionId, setFocusedTransactionId] = useState<string | null>(null);

  // Current Analyzed Root Account
  const [rootAccount, setRootAccount] = useState("900000000001");
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[]; summary?: any } | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);

  // Selected Account for Dossier Modal
  const [dossierAccountId, setDossierAccountId] = useState<string | null>(null);

  // Isolated Ring Filter
  const [isolatedRingNodeIds, setIsolatedRingNodeIds] = useState<string[] | null>(null);

  // Target Account for Legal Notice Pre-population
  const [legalNoticeAccountId, setLegalNoticeAccountId] = useState<string>("100000000011");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoginSuccess = (session: OfficerSession) => {
    setOfficerSession(session);
    setIsAuthenticated(true);
    showToast(`Welcome on duty, ${session.name}! Clearance Verified.`);
  };

  const handleSaveOfficerSession = (session: OfficerSession) => {
    setOfficerSession(session);
    setIsOfficerModalOpen(false);
    showToast(`Profile updated: ${session.name}`);
  };

  // Fetch Graph Data for Root Account or Transaction ID
  const fetchGraphForAccount = async (targetQuery: string) => {
    setGraphLoading(true);
    try {
      const cleanTarget = (targetQuery || "").trim();
      const res = await fetch(`http://localhost:8000/mule-rings/analyze/${encodeURIComponent(cleanTarget)}`);
      const data = await res.json();
      
      const realRoot = data.rootAccount || cleanTarget;
      setRootAccount(realRoot);
      setGraphData({
        nodes: data.nodes || [],
        edges: data.edges || [],
        summary: data.summary || null
      });

      if (data.focusedTransactionId) {
        setFocusedTransactionId(data.focusedTransactionId);
        showToast(`Traced 4-hop network for TXN ${data.focusedTransactionId} (Sender: ${realRoot})`);
      } else {
        setFocusedTransactionId(null);
        showToast(`Analyzed ${data.nodes?.length || 0} nodes across 4-hop money trail for ${realRoot}`);
      }
    } catch (e) {
      console.error(e);
      showToast(`Failed to trace target ${targetQuery}`);
    } finally {
      setGraphLoading(false);
    }
  };

  // On-demand launch of graph once details are entered
  const handleGenerateGraphForTarget = (accId: string) => {
    const cleanId = accId.trim();
    if (!cleanId) {
      showToast("Please enter a valid Account Number or Transaction ID");
      return;
    }
    fetchGraphForAccount(cleanId);
    setHasEnteredDetails(true);
  };

  const handleSearchAccount = (accId: string) => {
    handleGenerateGraphForTarget(accId);
    setActiveTab("flow-graph");
  };

  const handleSelectVictimFromSuite = (victimAccId: string) => {
    handleGenerateGraphForTarget(victimAccId);
    setActiveTab("flow-graph");
  };

  const handleGenerateNotice = (accountId: string) => {
    setLegalNoticeAccountId(accountId);
    setActiveTab("legal-notices");
  };

  const handleGenerateDiary = (accountId: string) => {
    setLegalNoticeAccountId(accountId);
    setActiveTab("legal-notices");
  };

  const handleIsolateRing = (accountId: string) => {
    if (!graphData) return;
    const connected = new Set<string>();
    connected.add(accountId);

    graphData.edges.forEach((e) => {
      if (e.source === accountId) connected.add(e.target);
      if (e.target === accountId) connected.add(e.source);
    });

    setIsolatedRingNodeIds(Array.from(connected));
    setActiveTab("flow-graph");
    showToast(`Isolated syndicate cluster: ${connected.size} accounts`);
  };

  // If not authenticated, always show the desktop login view (redirects to login on refresh)
  if (!isAuthenticated) {
    return <OfficerLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      {/* Left Sidebar Dashboard */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        officerSession={officerSession}
        onOpenOfficerModal={() => setIsOfficerModalOpen(true)}
        onSearchAccount={handleSearchAccount}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        onLogout={() => {
          setIsAuthenticated(false);
          showToast("Workstation session locked. Please sign in to resume.");
        }}
      />

      {/* Main Content Area (Right Side) */}
      <main style={{ flex: 1, padding: "24px 28px", minWidth: 0, overflowY: "auto", minHeight: "100vh" }}>
        {/* Tab 1: Evidence Intake & Ingestion (First Place) */}
        {activeTab === "benchmarks" && (
          <ErrorBoundary fallbackTitle="Evidence Intake & Ingestion Error">
            <IngestionBenchmarkView
              onSelectAccount={(accId) => {
                fetchGraphForAccount(accId);
                setActiveTab("flow-graph");
              }}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          </ErrorBoundary>
        )}

        {/* Tab 2: Flow Graph */}
        {activeTab === "flow-graph" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {!hasEnteredDetails ? (
              /* ========================================================
                 TARGET INVESTIGATION LAUNCHPAD (GRAPH ON-DEMAND)
                 Shows when details are not entered yet
                 ======================================================== */
              <div className="target-launchpad-hero">
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="cyber-badge cyber-badge-cyan" style={{ border: "1.5px solid #06b6d4" }}>
                      <Crosshair size={13} />
                      CYBERCRIME FINANCIAL FORENSICS // LAYER 1-3 TOPOLOGY DISCOVERY
                    </span>
                  </div>
                  <h1
                    className="font-display"
                    style={{
                      fontSize: "2.1rem",
                      fontWeight: 800,
                      color: "#ffffff",
                      letterSpacing: "0.02em",
                      lineHeight: 1.2
                    }}
                  >
                    INVESTIGATION TARGET INQUIRY CONSOLE
                  </h1>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", maxWidth: "880px", lineHeight: 1.5 }}>
                    Reconstruct and traverse the money laundering syndication graph up to 4 hops in under 2 seconds. Enter an
                    origin complainant account, suspected money mule account, or disputed transaction ID below to render the
                    topology.
                  </p>
                </div>

                {/* Search Target Mode Switcher & Graph Launch Bar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "880px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Search By:
                    </span>
                    <button
                      type="button"
                      onClick={() => setTargetInput("TXN000001")}
                      className="cyber-badge cyber-badge-cyan"
                      style={{ fontSize: "0.74rem", padding: "4px 10px", cursor: "pointer" }}
                    >
                      Transaction ID (TXN000001)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetInput("900000000001")}
                      className="cyber-badge cyber-badge-amber"
                      style={{ fontSize: "0.74rem", padding: "4px 10px", cursor: "pointer" }}
                    >
                      Sender Account No. (900000000001)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetInput("100000000007")}
                      className="cyber-badge cyber-badge-purple"
                      style={{ fontSize: "0.74rem", padding: "4px 10px", cursor: "pointer" }}
                    >
                      Receiver Account No. (100000000007)
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGenerateGraphForTarget(targetInput || rootAccount);
                    }}
                    style={{
                      display: "flex",
                      gap: "12px",
                      width: "100%",
                      flexWrap: "wrap",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        minWidth: "320px",
                        position: "relative",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <Search
                        size={18}
                        color="var(--accent-cyan)"
                        style={{ position: "absolute", left: "16px", pointerEvents: "none" }}
                      />
                      <input
                        type="text"
                        className="cyber-input font-mono"
                        placeholder="Enter Transaction ID (TXN...), Sender Acc, or Receiver Acc..."
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "14px 16px 14px 46px",
                          fontSize: "0.95rem",
                          background: "rgba(10, 16, 28, 0.9)",
                          border: "1.5px solid rgba(6, 182, 212, 0.4)",
                          borderRadius: "var(--radius-md)",
                          color: "#ffffff",
                          boxShadow: "0 0 20px rgba(6, 182, 212, 0.15)"
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary font-display"
                      style={{
                        padding: "14px 28px",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        boxShadow: "0 0 25px rgba(6, 182, 212, 0.35)",
                        whiteSpace: "nowrap"
                      }}
                    >
                      <Zap size={16} />
                      GENERATE SYNDICATE TOPOLOGY GRAPH
                    </button>
                  </form>
                </div>

                {/* Quick Selection: Priority Case Dossiers */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ShieldCheck size={16} color="var(--accent-cyan)" />
                      <h3
                        className="font-display"
                        style={{ fontSize: "1.05rem", fontWeight: 700, color: "#ffffff", letterSpacing: "0.03em" }}
                      >
                        PRIORITY COMPLAINANT CASES // NATIONAL CYBERCRIME HELPLINE 1930
                      </h3>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Click any case card to automatically generate forensic graph
                    </span>
                  </div>

                  <div className="case-card-grid">
                    {PRIORITY_VICTIM_CASES.map((c) => (
                      <div
                        key={c.accountId}
                        className="case-dossier-card"
                        onClick={() => handleGenerateGraphForTarget(c.accountId)}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div
                                className="font-display"
                                style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}
                              >
                                {c.name}
                              </div>
                              <div style={{ fontSize: "0.7rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                                {c.firNumber}
                              </div>
                            </div>
                            <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: "0.68rem" }}>
                              {c.tag}
                            </span>
                          </div>

                          <div
                            style={{
                              background: "rgba(255, 255, 255, 0.03)",
                              padding: "8px 10px",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border-subtle)"
                            }}
                          >
                            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-heading)" }}>
                              REPORTED LOSS
                            </div>
                            <div
                              style={{
                                fontSize: "1.25rem",
                                fontWeight: 800,
                                color: "#38bdf8",
                                fontFamily: "var(--font-mono)",
                                marginTop: "2px"
                              }}
                            >
                              ₹{c.amount.toLocaleString()}
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                            <div>
                              <span style={{ color: "var(--text-muted)" }}>Scheme:</span> {c.scheme}
                            </div>
                            <div>
                              <span style={{ color: "var(--text-muted)" }}>Bank:</span> {c.bank} ({c.ifsc})
                            </div>
                            <div>
                              <span style={{ color: "var(--text-muted)" }}>Location:</span> {c.location}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: "10px",
                            borderTop: "1px solid var(--border-subtle)"
                          }}
                        >
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                            A/C #{c.accountId}
                          </span>
                          <span
                            className="font-display"
                            style={{
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              color: "var(--accent-cyan)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            LAUNCH GRAPH <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================
                 GRAPH VIEW (ACTIVATED AFTER DETAILS ARE ENTERED)
                 ======================================================== */
              <>
                {/* Top Quick Status Bar */}
                <div
                  className="glass-panel"
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                    border: "1.5px solid rgba(6, 182, 212, 0.35)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setHasEnteredDetails(false)}
                      className="btn-secondary font-display"
                      style={{ fontSize: "0.76rem", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}
                      title="Return to Target Inquiry Console to enter new details"
                    >
                      <ArrowLeft size={13} />
                      NEW TARGET INQUIRY
                    </button>

                    <span className="cyber-badge cyber-badge-cyan" style={{ border: "1.5px solid #06b6d4" }}>
                      <Crosshair size={12} />
                      Active Root: {rootAccount}
                    </span>

                    {focusedTransactionId && (
                      <span
                        className="cyber-badge cyber-badge-cyan"
                        style={{
                          border: "1.5px solid #38bdf8",
                          boxShadow: "0 0 15px rgba(56, 189, 248, 0.4)",
                          fontFamily: "var(--font-mono)"
                        }}
                      >
                        <Zap size={12} color="#38bdf8" />
                        Target TXN: {focusedTransactionId}
                      </span>
                    )}

                    {graphData?.summary && (
                      <div style={{ display: "flex", gap: "8px", fontSize: "0.78rem", flexWrap: "wrap" }}>
                        <span className="cyber-badge cyber-badge-amber">
                          L1: {graphData.summary.layer1CollectorsCount} Collectors
                        </span>
                        <span className="cyber-badge cyber-badge-purple">
                          L2: {graphData.summary.layer2DistributorsCount} Distributors
                        </span>
                        <span className="cyber-badge cyber-badge-crimson">
                          L3: {graphData.summary.layer3TerminalsCount} Terminals
                        </span>
                        {graphData.summary.layer4DestinationsCount > 0 && (
                          <span
                            className="cyber-badge"
                            style={{
                              background: "rgba(236, 72, 153, 0.15)",
                              border: "1.5px solid #ec4899",
                              color: "#f472b6"
                            }}
                          >
                            L4: {graphData.summary.layer4DestinationsCount} Offshore
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Click any node to view forensic dossier and banking specifications.
                    </span>
                  </div>
                </div>

                {/* Interactive Graph Canvas */}
                {graphData && (
                  <InteractiveGraph
                    nodes={graphData.nodes}
                    edges={graphData.edges}
                    rootAccount={rootAccount}
                    focusedTransactionId={focusedTransactionId}
                    onSelectAccount={(accId) => setDossierAccountId(accId)}
                    selectedAccountId={dossierAccountId}
                    isolatedRingNodeIds={isolatedRingNodeIds}
                    onClearIsolation={() => setIsolatedRingNodeIds(null)}
                    onSearchAccount={handleSearchAccount}
                    onGenerateNotice={handleGenerateNotice}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 2: 4-Hop Case Replay & Dynamic Timeline */}
        {activeTab === "blind-victims" && (
          <ErrorBoundary fallbackTitle="Case Replay & Chrono-Timeline Error">
            <CaseReplayTimeline
              onSelectVictim={handleSelectVictimFromSuite}
              onGenerateNotice={handleGenerateNotice}
              onGenerateDiary={handleGenerateDiary}
            />
          </ErrorBoundary>
        )}

        {/* Tab 3: Mule Ring Heuristics */}
        {activeTab === "heuristics" && (
          <MuleRingHeuristics
            onSelectAccount={(accId) => {
              fetchGraphForAccount(accId);
              setActiveTab("flow-graph");
            }}
            onGenerateNotice={handleGenerateNotice}
          />
        )}

        {/* Tab 5: Legal Notices & Police Case Diary */}
        {activeTab === "legal-notices" && (
          <LegalNoticeGenerator
            initialAccountId={legalNoticeAccountId}
            officerSession={officerSession}
          />
        )}
      </main>

      {/* Account Forensic Dossier Modal */}
      {dossierAccountId && (
        <AccountDossierModal
          accountId={dossierAccountId}
          onClose={() => setDossierAccountId(null)}
          onIsolateRing={handleIsolateRing}
          onGenerateNotice={handleGenerateNotice}
          onGenerateDiary={handleGenerateDiary}
        />
      )}

      {/* Officer Authentication Modal */}
      {isOfficerModalOpen && (
        <OfficerAuthModal
          currentSession={officerSession}
          onSaveSession={handleSaveOfficerSession}
          onClose={() => setIsOfficerModalOpen(false)}
          isMandatory={!officerSession}
        />
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 99999,
            background: "rgba(12, 18, 29, 0.95)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(6, 182, 212, 0.5)",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.85rem",
            fontWeight: 500
          }}
        >
          <Sparkles size={16} color="#06b6d4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
