import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="glass-panel"
          style={{
            padding: "36px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            margin: "20px 0",
            border: "1.5px solid rgba(239, 68, 68, 0.4)",
            background: "rgba(15, 23, 42, 0.95)"
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #ef4444"
            }}
          >
            <AlertTriangle size={26} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
              {this.props.fallbackTitle || "An unexpected error occurred in this view"}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", maxWidth: "550px", lineHeight: 1.5 }}>
              {this.state.error?.message || "Something went wrong while rendering this section."}
            </p>
          </div>
          <button onClick={this.handleReset} className="btn-primary" style={{ padding: "8px 22px", display: "flex", alignItems: "center", gap: "8px" }}>
            <RotateCcw size={14} />
            <span>Reload View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
