import React, { useState } from "react";
import { TraceMindLogo } from "./TraceMindLogo";
import { OfficerSession } from "../types";
import {
  Network,
  Sliders,
  Scale,
  Database,
  User,
  Search,
  LogOut,
  Clock,
  ArrowRight,
  ShieldCheck,
  Hash,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";

export type ActiveTab = "flow-graph" | "blind-victims" | "heuristics" | "legal-notices" | "benchmarks";
export type SearchTargetType = "TXN" | "SENDER" | "RECEIVER";

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  officerSession: OfficerSession | null;
  onOpenOfficerModal: () => void;
  onSearchAccount: (target: string) => void;
  searchValue: string;
  setSearchValue: (val: string) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  officerSession,
  onOpenOfficerModal,
  onSearchAccount,
  searchValue,
  setSearchValue,
  onLogout
}) => {
  const [searchType, setSearchType] = useState<SearchTargetType>("TXN");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearchAccount(searchValue.trim());
    }
  };

  const handleQuickPreset = (type: SearchTargetType, presetVal: string) => {
    setSearchType(type);
    setSearchValue(presetVal);
    onSearchAccount(presetVal);
  };

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }> = [
    {
      id: "benchmarks",
      label: "Evidence Intake & Ingestion",
      icon: <Database size={16} />,
      badge: "STREAM"
    },
    {
      id: "flow-graph",
      label: "Graph Flow",
      icon: <Network size={16} />
    },
    {
      id: "blind-victims",
      label: "Case Replay & Timeline",
      icon: <Clock size={16} />,
      badge: "4-HOP"
    },
    {
      id: "heuristics",
      label: "Mule Ring Heuristics",
      icon: <Sliders size={16} />
    },
    {
      id: "legal-notices",
      label: "Case Brief & Legal Action",
      icon: <Scale size={16} />
    }
  ];

  return (
    <aside
      className="dashboard-left-sidebar"
      style={{
        width: "280px",
        minWidth: "280px",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        background: "rgba(8, 12, 20, 0.98)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 14px",
        zIndex: 100,
        overflowY: "auto",
        boxShadow: "4px 0 24px rgba(0, 0, 0, 0.6)"
      }}
    >
      {/* Top Portion */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Brand & Police Cell Badge */}
        <div>
          <TraceMindLogo size="sm" showTagline={true} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "8px",
              padding: "4px 8px",
              background: "rgba(6, 182, 212, 0.08)",
              border: "1px solid rgba(6, 182, 212, 0.25)",
              borderRadius: "4px",
              fontSize: "0.68rem",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)"
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
            <span>1930 NCRP HUB • ACTIVE DESK</span>
          </div>
        </div>

        {/* ========================================================
            TARGET INQUIRY SELECTOR & SEARCH
            (Replaces 12-digit account detection button with
             Transaction ID, Sender Account, and Receiver Account buttons)
           ======================================================== */}
        <div
          style={{
            background: "rgba(12, 18, 29, 0.8)",
            padding: "10px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Target Inquiry By:
          </div>

          {/* 3 Prominent Selector Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
            <button
              type="button"
              onClick={() => {
                setSearchType("TXN");
                if (!searchValue || searchValue.startsWith("900") || searchValue.startsWith("100")) {
                  setSearchValue("TXN000001");
                }
              }}
              style={{
                padding: "6px 2px",
                fontSize: "0.68rem",
                fontWeight: 700,
                borderRadius: "4px",
                border: searchType === "TXN" ? "1px solid var(--accent-cyan)" : "1px solid rgba(255, 255, 255, 0.08)",
                background: searchType === "TXN" ? "rgba(6, 182, 212, 0.22)" : "rgba(255, 255, 255, 0.03)",
                color: searchType === "TXN" ? "#22d3ee" : "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px"
              }}
              title="Search by Transaction ID (e.g. TXN000001)"
            >
              <Hash size={12} />
              <span>TXN ID</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchType("SENDER");
                if (!searchValue || searchValue.startsWith("TXN") || searchValue.startsWith("100")) {
                  setSearchValue("900000000001");
                }
              }}
              style={{
                padding: "6px 2px",
                fontSize: "0.68rem",
                fontWeight: 700,
                borderRadius: "4px",
                border: searchType === "SENDER" ? "1px solid var(--accent-cyan)" : "1px solid rgba(255, 255, 255, 0.08)",
                background: searchType === "SENDER" ? "rgba(6, 182, 212, 0.22)" : "rgba(255, 255, 255, 0.03)",
                color: searchType === "SENDER" ? "#22d3ee" : "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px"
              }}
              title="Search by Sender Account No. (e.g. 900000000001)"
            >
              <ArrowUpRight size={12} />
              <span>Sender A/C</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchType("RECEIVER");
                if (!searchValue || searchValue.startsWith("TXN") || searchValue.startsWith("900")) {
                  setSearchValue("100000000007");
                }
              }}
              style={{
                padding: "6px 2px",
                fontSize: "0.68rem",
                fontWeight: 700,
                borderRadius: "4px",
                border: searchType === "RECEIVER" ? "1px solid var(--accent-cyan)" : "1px solid rgba(255, 255, 255, 0.08)",
                background: searchType === "RECEIVER" ? "rgba(6, 182, 212, 0.22)" : "rgba(255, 255, 255, 0.03)",
                color: searchType === "RECEIVER" ? "#22d3ee" : "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px"
              }}
              title="Search by Receiver Account No. (e.g. 100000000007)"
            >
              <ArrowDownLeft size={12} />
              <span>Receiver A/C</span>
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "4px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                className="cyber-input font-mono"
                placeholder={
                  searchType === "TXN"
                    ? "TXN ID (e.g. TXN000001)..."
                    : searchType === "SENDER"
                    ? "Sender A/C (9000...)..."
                    : "Receiver A/C (1000...)..."
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                  height: "34px",
                  paddingLeft: "28px",
                  fontSize: "0.76rem",
                  width: "100%",
                  borderRadius: "4px"
                }}
              />
              <Search
                size={13}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ height: "34px", padding: "0 10px", fontSize: "0.76rem" }}
              title="Execute Trace"
            >
              <ArrowRight size={13} />
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", paddingTop: "2px" }}>
            <button
              type="button"
              onClick={() => handleQuickPreset("TXN", "TXN000001")}
              style={{
                fontSize: "0.62rem",
                padding: "2px 6px",
                borderRadius: "3px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              TXN000001
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("SENDER", "900000000001")}
              style={{
                fontSize: "0.62rem",
                padding: "2px 6px",
                borderRadius: "3px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              900000000001 (Victim)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("RECEIVER", "100000000007")}
              style={{
                fontSize: "0.62rem",
                padding: "2px 6px",
                borderRadius: "3px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              100000000007 (Mule)
            </button>
          </div>
        </div>

        {/* ========================================================
            VERTICAL NAVIGATION MENU (LEFT SIDEBAR)
           ======================================================== */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 4px" }}>
            Platform Modules
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: isActive ? "1px solid rgba(6, 182, 212, 0.45)" : "1px solid transparent",
                  background: isActive ? "rgba(6, 182, 212, 0.15)" : "transparent",
                  color: isActive ? "#22d3ee" : "var(--text-secondary)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  textAlign: "left",
                  userSelect: "none"
                }}
              >
                <div style={{ color: isActive ? "#22d3ee" : "var(--text-muted)", display: "flex", alignItems: "center" }}>
                  {item.icon}
                </div>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      background: "rgba(6, 182, 212, 0.2)",
                      border: "1px solid rgba(6, 182, 212, 0.4)",
                      color: "#38bdf8",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: "3px"
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Portion: Active Officer Status Card & Lock Session */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        {officerSession ? (
          <>
            <div
              onClick={onOpenOfficerModal}
              className="glass-panel"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                border: "1px solid rgba(6, 182, 212, 0.25)"
              }}
              title="Click to view or edit officer profile"
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))",
                  border: "1px solid rgba(6, 182, 212, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#22d3ee",
                  flexShrink: 0
                }}
              >
                <User size={16} />
              </div>

              <div style={{ lineHeight: 1.25, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {officerSession.name}
                  </span>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {officerSession.badge}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="btn-secondary"
                title="Lock Console / Sign Out to Login Page"
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: "0.76rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  color: "#f87171"
                }}
              >
                <LogOut size={13} />
                <span>Lock Console</span>
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onOpenOfficerModal}
            className="btn-primary"
            style={{ width: "100%", padding: "8px", fontSize: "0.78rem" }}
          >
            <User size={14} />
            Officer Sign In
          </button>
        )}
      </div>
    </aside>
  );
};
