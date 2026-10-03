import React, { useState, useEffect } from "react";
import { OfficerSession } from "../types";
import { TraceMindLogo } from "./TraceMindLogo";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserCheck,
  Building,
  FileCheck2,
  Sparkles,
  KeyRound,
  AlertOctagon,
  Eye,
  EyeOff,
  CheckCircle2,
  Trash2,
  Server,
  Activity,
  FileText
} from "lucide-react";

interface Props {
  onLoginSuccess: (session: OfficerSession) => void;
}

const AUTHORIZED_ACCESS_CODE = "CYBER1930";

export const OfficerLoginView: React.FC<Props> = ({ onLoginSuccess }) => {
  // Saved credentials in localStorage
  const [saveCredentials, setSaveCredentials] = useState<boolean>(() => {
    return localStorage.getItem("tracemind_save_credentials_opt") === "true";
  });

  const [name, setName] = useState("");
  const [badge, setBadge] = useState("");
  const [station, setStation] = useState("");
  const [designation, setDesignation] = useState("");
  const [activeCase, setActiveCase] = useState("");
  const [accessCode, setAccessCode] = useState(AUTHORIZED_ACCESS_CODE);
  const [showAccessCode, setShowAccessCode] = useState(false);

  const [hasSavedCreds, setHasSavedCreds] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Unauthorized Access Alert State
  const [unauthorizedAlert, setUnauthorizedAlert] = useState<{
    isOpen: boolean;
    reason: string;
    incidentId: string;
    timestamp: string;
  }>({
    isOpen: false,
    reason: "",
    incidentId: "",
    timestamp: ""
  });

  // Load saved credentials on component mount / site refresh
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tracemind_saved_credentials");
      if (saved) {
        const parsed = JSON.parse(saved);
        setName(parsed.name || "");
        setBadge(parsed.badge || "");
        setStation(parsed.station || "");
        setDesignation(parsed.designation || "");
        setActiveCase(parsed.activeCase || "");
        if (parsed.accessCode) setAccessCode(parsed.accessCode);
        setHasSavedCreds(true);
        setSaveCredentials(true);
      } else {
        // Defaults for first-time convenience
        loadPreset({
          name: "Insp. Mayank Sharma",
          badge: "MP-IND-CYBER-8842",
          station: "Cyber Crime Police Station, Indore (1930 NCRP Hub)",
          designation: "Inspector / Lead Cyber Forensics Officer",
          activeCase: "FIR No. 412/2026 - Operation MuleBuster"
        });
      }
    } catch {
      // Fallback
    }
  }, []);

  const loadPreset = (preset: {
    name: string;
    badge: string;
    station: string;
    designation: string;
    activeCase: string;
  }) => {
    setName(preset.name);
    setBadge(preset.badge);
    setStation(preset.station);
    setDesignation(preset.designation);
    setActiveCase(preset.activeCase);
    setAccessCode(AUTHORIZED_ACCESS_CODE);
  };

  const handleClearSavedCredentials = () => {
    localStorage.removeItem("tracemind_saved_credentials");
    localStorage.removeItem("tracemind_save_credentials_opt");
    setHasSavedCreds(false);
    setSaveCredentials(false);
    setName("");
    setBadge("");
    setStation("");
    setDesignation("");
    setActiveCase("");
    setAccessCode("");
  };

  // Play high-tech unauthorized alert tone
  const playAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Ignore audio failure
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanBadge = badge.trim();
    const cleanCode = accessCode.trim();

    // Verification check for authorized police clearance
    const isBadgeValid =
      cleanBadge.startsWith("MP-") ||
      cleanBadge.startsWith("IND-") ||
      cleanBadge.startsWith("CYBER-") ||
      cleanBadge.length >= 8;

    const isCodeValid =
      cleanCode === AUTHORIZED_ACCESS_CODE ||
      cleanCode === "1930" ||
      cleanCode === "8842" ||
      cleanCode === "0104";

    if (!cleanName || !cleanBadge || !isBadgeValid || !isCodeValid) {
      // Trigger unauthorized access alert!
      playAlertSound();
      setUnauthorizedAlert({
        isOpen: true,
        reason: !isCodeValid
          ? "Invalid Officer Access Code / Cryptographic Key. Authorization denied by 1930 NCRP Hub."
          : "Invalid or Unregistered Police Service Badge ID. Clearance could not be verified against MP State Police directory.",
        incidentId: `INC-2026-IND-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " IST"
      });
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const session: OfficerSession = {
        name: cleanName,
        badge: cleanBadge,
        station: station.trim() || "Cyber Crime Police Station, Indore",
        designation: designation.trim() || "Inspector of Police",
        activeCase: activeCase.trim() || "FIR No. 412/2026",
        signedInAt: new Date().toISOString()
      };

      // Save credential information if option selected
      if (saveCredentials) {
        localStorage.setItem(
          "tracemind_saved_credentials",
          JSON.stringify({
            name: cleanName,
            badge: cleanBadge,
            station: session.station,
            designation: session.designation,
            activeCase: session.activeCase,
            accessCode: cleanCode
          })
        );
        localStorage.setItem("tracemind_save_credentials_opt", "true");
      } else {
        localStorage.removeItem("tracemind_saved_credentials");
        localStorage.setItem("tracemind_save_credentials_opt", "false");
      }

      setIsVerifying(false);
      onLoginSuccess(session);
    }, 700);
  };

  return (
    <div className="login-desktop-wrapper">
      {/* Background Animated Layers */}
      <div className="cyber-bg-animation-container">
        <div className="cyber-animated-grid" />
        <div className="cyber-glow-orb cyber-glow-orb-1" />
        <div className="cyber-glow-orb cyber-glow-orb-2" />
        <div className="cyber-glow-orb cyber-glow-orb-3" />
        <div className="cyber-animated-scanline" />
      </div>

      {/* Main Desktop Window Container */}
      <div className="login-desktop-window">
        {/* Top Command Bar */}
        <div
          style={{
            background: "linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 24, 40, 0.9) 100%)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "16px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <TraceMindLogo size="sm" showTagline={false} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
                borderLeft: "1px solid var(--border-subtle)",
                paddingLeft: "12px"
              }}
            >
              ZONE-1 CYBER CRIME CELL • INDORE POLICE HQ
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="cyber-badge cyber-badge-cyan">
              <Lock size={12} />
              LAW ENFORCEMENT CLEARANCE GATEWAY
            </div>
            <div className="cyber-badge cyber-badge-emerald">
              <Activity size={12} />
              1930 NCRP ONLINE
            </div>
          </div>
        </div>

        {/* Desktop 2-Column Grid */}
        <div className="login-desktop-grid">
          {/* Left Column: Security Directives & Intelligence Overview */}
          <div
            style={{
              padding: "36px 32px",
              background: "rgba(8, 12, 22, 0.7)",
              borderRight: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "24px"
            }}
          >
            <div>
              {/* Header with symmetric styling */}
              <div style={{ marginBottom: "20px" }}>
                <h2 className="login-heading-symmetric" style={{ marginBottom: "8px" }}>
                  <ShieldCheck size={22} color="#06b6d4" />
                  Law Enforcement Clearance Directives
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                  TraceMind is a specialized cyber forensics and money mule tracking engine authorized for Indore Police & STF personnel investigating digital fraud and organized syndicates.
                </p>
              </div>

              {/* Symmetric Section: System Directives */}
              <div style={{ marginBottom: "24px" }}>
                <div className="login-subheading-symmetric" style={{ marginBottom: "12px" }}>
                  <Server size={14} color="#06b6d4" />
                  Forensic Capabilities Available Post-Sign-In
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px"
                    }}
                  >
                    <CheckCircle2 size={16} color="#06b6d4" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Multi-Tier Mule Topology:</strong> Automated 4-hop tracing isolating Layer 1 Collectors, Layer 2 Distributors, and Layer 3 Terminals.
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px"
                    }}
                  >
                    <CheckCircle2 size={16} color="#10b981" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Section 91 CrPC Automation:</strong> Instant, court-ready Bank Freezing Requisitions pre-populated with disputed transaction trails.
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px"
                    }}
                  >
                    <CheckCircle2 size={16} color="#a855f7" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Blind Victim Suite (40% Criteria):</strong> Pinpoints and tracks money trails for 5 major scam syndicates in real time.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Statutory Notice */}
            <div
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#f87171",
                  marginBottom: "4px"
                }}
              >
                <AlertOctagon size={15} />
                CONFIDENTIAL • LAW ENFORCEMENT DIRECTIVE
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Access is restricted to authorized Police Officers and Cyber Forensics Analysts. System activity is logged under Section 66F of the Information Technology Act 2000.
              </p>
            </div>
          </div>

          {/* Right Column: Officer Authentication Console */}
          <div style={{ padding: "36px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              {/* Header with symmetric styling */}
              <div style={{ marginBottom: "20px" }}>
                <h2 className="login-heading-symmetric" style={{ marginBottom: "6px" }}>
                  <Lock size={20} color="#06b6d4" />
                  Investigating Officer Sign In
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  Provide your official credentials to authenticate your workstation and unlock live forensics data.
                </p>
              </div>

              {/* Symmetric Section: Quick Presets */}
              <div style={{ marginBottom: "20px" }}>
                <div className="login-subheading-symmetric" style={{ marginBottom: "8px" }}>
                  <Sparkles size={13} color="#06b6d4" />
                  Quick Officer Profiles (Demo & Jury)
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "8px 12px", justifyContent: "flex-start" }}
                    onClick={() =>
                      loadPreset({
                        name: "Insp. Mayank Sharma",
                        badge: "MP-IND-CYBER-8842",
                        station: "Cyber Crime Police Station, Indore (1930 NCRP Hub)",
                        designation: "Inspector / Lead Cyber Forensics Officer",
                        activeCase: "FIR No. 412/2026 - Operation MuleBuster"
                      })
                    }
                  >
                    <UserCheck size={14} color="#06b6d4" />
                    Insp. Mayank Sharma (Forensics)
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "8px 12px", justifyContent: "flex-start" }}
                    onClick={() =>
                      loadPreset({
                        name: "ACP Vikram Singh",
                        badge: "MP-POL-IND-0104",
                        station: "Special Task Force (STF) Cyber Wing, Indore",
                        designation: "Assistant Commissioner of Police",
                        activeCase: "FIR No. 89/2026 - Digital Arrest Syndicate"
                      })
                    }
                  >
                    <Building size={14} color="#a855f7" />
                    ACP Vikram Singh (STF)
                  </button>
                </div>
              </div>

              {/* Main Credentials Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Officer Name & Badge Number */}
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="login-label-symmetric">Officer Full Name *</label>
                    <input
                      type="text"
                      required
                      className="cyber-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Insp. Mayank Sharma"
                    />
                  </div>

                  <div>
                    <label className="login-label-symmetric">Badge / Service ID *</label>
                    <input
                      type="text"
                      required
                      className="cyber-input font-mono"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="MP-IND-CYBER-8842"
                    />
                  </div>
                </div>

                {/* Designation & Police Station */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="login-label-symmetric">Designation & Rank</label>
                    <input
                      type="text"
                      className="cyber-input"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="Inspector / Cyber Analyst"
                    />
                  </div>

                  <div>
                    <label className="login-label-symmetric">Police Station / 1930 Unit</label>
                    <input
                      type="text"
                      className="cyber-input"
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      placeholder="Cyber Crime Station, Indore"
                    />
                  </div>
                </div>

                {/* Active Case Reference & Security Access Code */}
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="login-label-symmetric">Active FIR / Investigation Ref</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        className="cyber-input font-mono"
                        value={activeCase}
                        onChange={(e) => setActiveCase(e.target.value)}
                        placeholder="FIR No. 412/2026"
                      />
                      <FileCheck2
                        size={16}
                        color="var(--accent-cyan)"
                        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="login-label-symmetric">
                      Security Code *
                      <span style={{ color: "var(--accent-cyan)", marginLeft: "4px", fontSize: "0.68rem" }}>
                        (Demo: CYBER1930)
                      </span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showAccessCode ? "text" : "password"}
                        required
                        className="cyber-input font-mono"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        placeholder="CYBER1930"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAccessCode(!showAccessCode)}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer"
                        }}
                      >
                        {showAccessCode ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Option to Save Credential Information */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px dashed var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "4px"
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      color: "var(--text-primary)",
                      userSelect: "none"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={saveCredentials}
                      onChange={(e) => setSaveCredentials(e.target.checked)}
                      style={{
                        accentColor: "var(--accent-cyan)",
                        width: "16px",
                        height: "16px",
                        cursor: "pointer"
                      }}
                    />
                    <span>Save credential information on this workstation</span>
                  </label>

                  {hasSavedCreds && (
                    <button
                      type="button"
                      onClick={handleClearSavedCredentials}
                      title="Clear saved credentials from local storage"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "transparent",
                        border: "none",
                        color: "#f87171",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        padding: "2px 6px"
                      }}
                    >
                      <Trash2 size={13} />
                      Clear Saved
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    marginTop: "8px",
                    padding: "12px",
                    fontSize: "0.9rem",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <div className="pulsing-dot" style={{ color: "#ffffff" }} />
                      Authenticating Clearance with Indore Cyber Hub...
                    </>
                  ) : (
                    <>
                      <Shield size={17} />
                      Verify Clearance & Enter TraceMind Command Center
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Status bar */}
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.72rem",
                color: "var(--text-dim)"
              }}
            >
              <span>TLS 1.3 • AES-256 SESSION ENCRYPTION</span>
              <span>SECTION 91 CrPC COMPLIANT ENGINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unauthorized Access Critical Security Alert Modal */}
      {unauthorizedAlert.isOpen && (
        <div className="unauthorized-alert-backdrop">
          <div className="unauthorized-alert-card">
            {/* Alert Header */}
            <div
              style={{
                background: "linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#ffffff"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 800, fontSize: "0.95rem" }}>
                <ShieldAlert size={22} color="#ffffff" />
                CRITICAL SECURITY ALERT: UNAUTHORIZED ACCESS DETECTED
              </div>
              <span
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-mono)"
                }}
              >
                LEVEL 1 ALERT
              </span>
            </div>

            {/* Alert Body */}
            <div style={{ padding: "24px", color: "var(--text-primary)" }}>
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px",
                  marginBottom: "16px"
                }}
              >
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f87171", marginBottom: "6px" }}>
                  ACCESS DENIED: CLEARANCE VERIFICATION FAILED
                </div>
                <div style={{ fontSize: "0.82rem", color: "#fca5a5", lineHeight: 1.4 }}>
                  {unauthorizedAlert.reason}
                </div>
              </div>

              {/* Forensic Telemetry of the Attempt */}
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 14px",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  marginBottom: "20px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>INCIDENT REF:</span>
                  <span style={{ color: "#22d3ee" }}>{unauthorizedAlert.incidentId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>TIMESTAMP:</span>
                  <span style={{ color: "#ffffff" }}>{unauthorizedAlert.timestamp}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>SOURCE IP:</span>
                  <span style={{ color: "#f59e0b" }}>103.25.10.45 (Indore Nodal Gateway)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>STATUTORY CODE:</span>
                  <span style={{ color: "#ef4444" }}>SECTION 66F IT ACT 2000 (CYBER VIOLATION)</span>
                </div>
              </div>

              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4, marginBottom: "20px" }}>
                Unauthorized access attempts to police cyber crime forensics networks are logged, monitored, and transmitted to the Cyber Crime Police Station, Indore. Please provide valid officer credentials.
              </p>

              <button
                type="button"
                className="btn-danger"
                style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
                onClick={() => setUnauthorizedAlert({ ...unauthorizedAlert, isOpen: false })}
              >
                Acknowledge Security Alert & Re-verify Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
