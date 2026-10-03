import React, { useState } from "react";
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
  EyeOff
} from "lucide-react";

interface Props {
  currentSession: OfficerSession | null;
  onSaveSession: (session: OfficerSession) => void;
  onClose?: () => void;
  isMandatory?: boolean;
}

const AUTHORIZED_ACCESS_CODE = "CYBER1930";

export const OfficerAuthModal: React.FC<Props> = ({
  currentSession,
  onSaveSession,
  onClose,
  isMandatory = false
}) => {
  const [name, setName] = useState(currentSession?.name || "Insp. Mayank Sharma");
  const [badge, setBadge] = useState(currentSession?.badge || "MP-IND-CYBER-8842");
  const [station, setStation] = useState(
    currentSession?.station || "Cyber Crime Police Station, Indore (1930 NCRP Hub)"
  );
  const [designation, setDesignation] = useState(
    currentSession?.designation || "Inspector / Lead Cyber Forensics Officer"
  );
  const [activeCase, setActiveCase] = useState(
    currentSession?.activeCase || "FIR No. 412/2026 - Operation MuleBuster"
  );
  const [accessCode, setAccessCode] = useState(AUTHORIZED_ACCESS_CODE);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [saveCredentials, setSaveCredentials] = useState(true);

  const [isVerifying, setIsVerifying] = useState(false);
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanBadge = badge.trim();
    const cleanCode = accessCode.trim();

    // Verify authorized badge format and access code
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
      setUnauthorizedError(
        !isCodeValid
          ? "UNAUTHORIZED ACCESS: Invalid Officer Access Code / Cryptographic Key. Access Denied."
          : "UNAUTHORIZED ACCESS: Service Badge ID not recognized in State Cyber Cell registry."
      );
      return;
    }

    setUnauthorizedError(null);
    setIsVerifying(true);
    setTimeout(() => {
      const session: OfficerSession = {
        name: cleanName,
        badge: cleanBadge,
        station: station.trim() || "Cyber Crime Police Station, Indore",
        designation: designation.trim() || "Inspector / Cyber Forensics",
        activeCase: activeCase.trim() || "FIR No. 412/2026",
        signedInAt: new Date().toISOString()
      };

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
      }

      onSaveSession(session);
      setIsVerifying(false);
    }, 600);
  };

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
    setUnauthorizedError(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(5, 8, 16, 0.88)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
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
          maxWidth: "680px",
          overflow: "hidden",
          border: "1px solid rgba(6, 182, 212, 0.35)",
          boxShadow: "0 0 50px rgba(6, 182, 212, 0.25), 0 25px 60px rgba(0, 0, 0, 0.8)"
        }}
      >
        {/* Top Cyber Command Header */}
        <div
          style={{
            background: "linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 24, 40, 0.8) 100%)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <TraceMindLogo size="sm" showTagline={false} />

          <div className="cyber-badge cyber-badge-cyan">
            <Lock size={12} />
            Law Enforcement Clearance
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: "26px 30px" }}>
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "rgba(6, 182, 212, 0.12)",
                border: "1px solid rgba(6, 182, 212, 0.4)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#22d3ee",
                marginBottom: "10px",
                boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)"
              }}
            >
              <ShieldCheck size={26} />
            </div>
            {/* Symmetric heading */}
            <h2 className="login-heading-symmetric" style={{ justifyContent: "center", marginBottom: "6px" }}>
              Investigating Officer Profile Configuration
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Update your identity to trace money mule accounts, isolate syndicates, and generate court-ready Section 91 CrPC Bank Freezing Requisitions.
            </p>
          </div>

          {/* Unauthorized Alert Warning Banner */}
          {unauthorizedError && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid #ef4444",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#f87171"
              }}
            >
              <AlertOctagon size={18} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{unauthorizedError}</div>
            </div>
          )}

          {/* Quick Presets */}
          <div style={{ marginBottom: "18px" }}>
            <div className="login-subheading-symmetric" style={{ marginBottom: "8px" }}>
              <Sparkles size={12} color="#06b6d4" />
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Officer Name & Badge Number */}
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "12px" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="login-label-symmetric">Designation & Rank</label>
                <input
                  type="text"
                  className="cyber-input"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Inspector of Police / Cyber Forensics Analyst"
                />
              </div>

              <div>
                <label className="login-label-symmetric">Police Station / 1930 Unit</label>
                <input
                  type="text"
                  className="cyber-input"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  placeholder="e.g. Cyber Crime Police Station, Indore"
                />
              </div>
            </div>

            {/* Active FIR & Security Access Code */}
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "12px" }}>
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
                    (CYBER1930)
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

            {/* Save Credential Information Checkbox */}
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                background: "rgba(255, 255, 255, 0.03)",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px dashed var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  userSelect: "none"
                }}
              >
                <input
                  type="checkbox"
                  checked={saveCredentials}
                  onChange={(e) => setSaveCredentials(e.target.checked)}
                  style={{ accentColor: "var(--accent-cyan)" }}
                />
                <span>Save credential information on this workstation</span>
              </label>

              <KeyRound size={14} color="#10b981" />
            </div>

            {/* Submit & Cancel Buttons */}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              {!isMandatory && onClose && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  onClick={onClose}
                  disabled={isVerifying}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 2 }}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <div className="pulsing-dot" style={{ color: "#ffffff" }} />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Confirm & Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
