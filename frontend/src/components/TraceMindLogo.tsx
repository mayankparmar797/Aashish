import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export const TraceMindLogo: React.FC<LogoProps> = ({ size = "md", showTagline = true }) => {
  const dimensions = {
    sm: { icon: 34, title: "text-lg", sub: "text-[10px]" },
    md: { icon: 44, title: "text-2xl", sub: "text-xs" },
    lg: { icon: 60, title: "text-4xl", sub: "text-sm" }
  }[size];

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size === "lg" ? "16px" : "12px", userSelect: "none" }}>
      {/* Animated Holographic Shield Icon */}
      <div
        style={{
          position: "relative",
          width: `${dimensions.icon}px`,
          height: `${dimensions.icon}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {/* Ambient Glow */}
        <div
          style={{
            position: "absolute",
            inset: "-4px",
            background: "radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(4px)"
          }}
        />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: "100%",
            height: "100%",
            filter: "drop-shadow(0 0 10px rgba(6, 182, 212, 0.6))"
          }}
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Outer Cyber Hex Shield */}
          <polygon
            points="50,4 90,24 90,68 50,96 10,68 10,24"
            stroke="url(#shieldGrad)"
            strokeWidth="3.5"
            fill="rgba(12, 18, 30, 0.85)"
            strokeLinejoin="round"
          />

          {/* Concentric Radar Rings */}
          <circle cx="50" cy="50" r="28" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="16" stroke="rgba(6, 182, 212, 0.35)" strokeWidth="1.2" />

          {/* Radar Sweep Line (Static) */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="22"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Neural Network Nodes & Links (Mule Trail Symbolism) */}
          {/* Edge: Origin to Collector */}
          <line x1="32" y1="36" x2="50" y2="48" stroke="#06b6d4" strokeWidth="2" />
          {/* Edge: Collector to Distributor */}
          <line x1="50" y1="48" x2="68" y2="38" stroke="#a855f7" strokeWidth="2" />
          {/* Edge: Distributor to Terminal Cashout */}
          <line x1="50" y1="48" x2="50" y2="74" stroke="#ef4444" strokeWidth="2.5" />

          {/* Center High-Security Core */}
          <circle cx="50" cy="48" r="6.5" fill="url(#coreGrad)" />

          {/* Satellite Mule Tier Nodes */}
          {/* Victim/Origin Node */}
          <circle cx="32" cy="36" r="4.5" fill="#38bdf8" />
          {/* Distributor Node */}
          <circle cx="68" cy="38" r="4.5" fill="#c084fc" />
          {/* Terminal Cashout Alert Node */}
          <circle cx="50" cy="74" r="5" fill="#ef4444" />

          {/* Corner Cyber Reticles */}
          <line x1="22" y1="18" x2="30" y2="18" stroke="#06b6d4" strokeWidth="1.5" />
          <line x1="78" y1="18" x2="70" y2="18" stroke="#06b6d4" strokeWidth="1.5" />
          <line x1="50" y1="90" x2="50" y2="82" stroke="#ef4444" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Typography & Sub-branding */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 900,
              fontSize: size === "lg" ? "2.25rem" : size === "md" ? "1.5rem" : "1.15rem",
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #ffffff 30%, #22d3ee 85%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 20px rgba(6, 182, 212, 0.4)"
            }}
          >
            Trace<span style={{ color: "#06b6d4" }}>Mind</span>
          </span>
          <span
            style={{
              background: "rgba(6, 182, 212, 0.15)",
              border: "1px solid rgba(6, 182, 212, 0.4)",
              color: "#22d3ee",
              fontSize: "0.65rem",
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: "4px",
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}
          >
            v2.0
          </span>
        </div>

        {showTagline && (
          <div
            style={{
              fontSize: size === "lg" ? "0.85rem" : "0.7rem",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span style={{ color: "#10b981", fontSize: "0.6rem" }}>●</span>
            Indore Police • 1930 Cyber Cell
          </div>
        )}
      </div>
    </div>
  );
};
