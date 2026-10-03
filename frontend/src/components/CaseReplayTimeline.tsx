import React, { useState, useEffect, useRef, useMemo } from "react";
import { GraphNode, GraphEdge, TerminalCashoutForm } from "../types";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  Search,
  Building,
  MapPin,
  Lock,
  Share2,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

interface Props {
  onSelectVictim: (accountId: string) => void;
  onGenerateNotice: (accountId: string) => void;
  onGenerateDiary?: (accountId: string) => void;
}

interface CasePreset {
  id: string;
  victimAcc: string;
  victimName: string;
  scheme: string;
  firNumber: string;
  lossAmount: number;
  bankName: string;
  ifsc: string;
  location: string;
  reportedAt: string;
  stageTimestamps: {
    stage1: string;
    stage2: string;
    stage3: string;
    stage4: string;
  };
}

const PRESET_CASES: CasePreset[] = [
  {
    id: "case-01",
    victimAcc: "900000000001",
    victimName: "Ramesh Sharma",
    scheme: "Digital Arrest Scam (Fake CBI/Police Video Call Extortion)",
    firNumber: "FIR #MP-IND-2026/842",
    lossAmount: 450000,
    bankName: "HDFC Bank Ltd.",
    ifsc: "HDFC0005678",
    location: "Indore, Madhya Pradesh",
    reportedAt: "2026-10-02 09:14 IST",
    stageTimestamps: {
      stage1: "09:14:00 IST (T+0m)",
      stage2: "09:22:15 IST (T+8m)",
      stage3: "09:44:30 IST (T+30m)",
      stage4: "11:15:00 IST (T+2h)"
    }
  },
  {
    id: "case-02",
    victimAcc: "900000000002",
    victimName: "Sunita Verma",
    scheme: "Customs Parcel Narcotics Blackmail (FedEx Impersonation)",
    firNumber: "FIR #RJ-JPR-2026/519",
    lossAmount: 680000,
    bankName: "ICICI Bank Ltd.",
    ifsc: "ICIC0001234",
    location: "Jaipur, Rajasthan",
    reportedAt: "2026-10-01 14:32 IST",
    stageTimestamps: {
      stage1: "14:32:00 IST (T+0m)",
      stage2: "14:41:10 IST (T+9m)",
      stage3: "15:08:45 IST (T+36m)",
      stage4: "16:50:00 IST (T+2.3h)"
    }
  },
  {
    id: "case-03",
    victimAcc: "900000000003",
    victimName: "Anand Joshi",
    scheme: "Telegram Prepaid Rating / Task Fraud & Crypto Desk",
    firNumber: "FIR #MH-PUN-2026/304",
    lossAmount: 320000,
    bankName: "State Bank of India",
    ifsc: "SBIN0004567",
    location: "Pune, Maharashtra",
    reportedAt: "2026-09-30 18:22 IST",
    stageTimestamps: {
      stage1: "18:22:00 IST (T+0m)",
      stage2: "18:29:40 IST (T+7m)",
      stage3: "18:55:10 IST (T+33m)",
      stage4: "20:40:00 IST (T+2.2h)"
    }
  },
  {
    id: "case-04",
    victimAcc: "900000000004",
    victimName: "Kavita Rao",
    scheme: "Instant Chinese Loan App APK Extortion & Contact Harvesting",
    firNumber: "FIR #TS-HYD-2026/188",
    lossAmount: 195000,
    bankName: "Axis Bank Ltd.",
    ifsc: "UTIB0002345",
    location: "Hyderabad, Telangana",
    reportedAt: "2026-09-29 11:45 IST",
    stageTimestamps: {
      stage1: "11:45:00 IST (T+0m)",
      stage2: "11:51:20 IST (T+6m)",
      stage3: "12:12:00 IST (T+27m)",
      stage4: "13:30:00 IST (T+1.8h)"
    }
  },
  {
    id: "case-05",
    victimAcc: "900000000005",
    victimName: "Alok Gupta",
    scheme: "Crypto Arbitrage Phishing Investment Portal",
    firNumber: "FIR #DL-CP-2026/993",
    lossAmount: 840000,
    bankName: "Kotak Mahindra Bank",
    ifsc: "KKBK0008901",
    location: "New Delhi, Delhi",
    reportedAt: "2026-09-28 20:10 IST",
    stageTimestamps: {
      stage1: "20:10:00 IST (T+0m)",
      stage2: "20:18:05 IST (T+8m)",
      stage3: "20:45:30 IST (T+35m)",
      stage4: "22:20:00 IST (T+2.1h)"
    }
  }
];

export const CaseReplayTimeline: React.FC<Props> = ({
  onSelectVictim,
  onGenerateNotice,
  onGenerateDiary
}) => {
  // Active Case State
  const [selectedCase, setSelectedCase] = useState<CasePreset>(PRESET_CASES[0]);
  const [customQuery, setCustomQuery] = useState("");

  // Timeline Progress (0 to 100) and Stage Index (1 to 4)
  // Stage 1: 0% - 25% (Origin)
  // Stage 2: 26% - 50% (Collector)
  // Stage 3: 51% - 75% (Distributor)
  // Stage 4: 76% - 100% (Terminal Cash-Out)
  const [timelineProgress, setTimelineProgress] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5>(1);

  // Active Stage (1 to 4) derived from timeline progress
  const activeStage = useMemo(() => {
    if (timelineProgress <= 25) return 1;
    if (timelineProgress <= 50) return 2;
    if (timelineProgress <= 75) return 3;
    return 4;
  }, [timelineProgress]);

  // Graph Data fetched from backend for this case
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[]; summary?: any } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Selected Node in Correlation Graph for Inspection
  const [inspectedNodeId, setInspectedNodeId] = useState<string>(selectedCase.victimAcc);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Canvas Ref for the Live Correlation Graph
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  // Update canvas dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        setCanvasDimensions({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        });
      }
    };
    const timer = setTimeout(updateDimensions, 50);
    window.addEventListener("resize", updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Load Graph Data whenever selected case changes
  useEffect(() => {
    let isCancelled = false;

    const fetchCaseData = async (query: string) => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`http://localhost:8000/mule-rings/analyze/${encodeURIComponent(query)}`);
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
        const data = await res.json();
        if (isCancelled) return;

        setGraphData({
          nodes: data.nodes || [],
          edges: data.edges || [],
          summary: data.summary || {}
        });

        const victimNode = (data.nodes || []).find((n: GraphNode) => n.id === query);
        if (victimNode) {
          setInspectedNodeId(victimNode.id);
        } else if (data.rootAccount) {
          setInspectedNodeId(data.rootAccount);
        } else if (data.nodes && data.nodes.length > 0) {
          setInspectedNodeId(data.nodes[0].id);
        } else {
          setInspectedNodeId(query);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Failed to load case graph data", err);
          setFetchError(err.message || "Failed to load case data");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchCaseData(selectedCase.victimAcc);

    return () => {
      isCancelled = true;
    };
  }, [selectedCase]);

  // Playback Timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimelineProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return Math.min(100, prev + 1 * playbackSpeed);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Handle stage buttons
  const jumpToStage = (stage: 1 | 2 | 3 | 4) => {
    setIsPlaying(false);
    if (stage === 1) setTimelineProgress(25);
    else if (stage === 2) setTimelineProgress(50);
    else if (stage === 3) setTimelineProgress(75);
    else setTimelineProgress(100);
  };

  // Filtered nodes and edges simultaneously built for current stage
  const visibleNodes = useMemo(() => {
    if (!graphData) return [];
    return graphData.nodes.filter((node) => {
      if (activeStage === 1) return node.hop === 0 || node.role === "ORIGIN" || node.id === selectedCase.victimAcc;
      if (activeStage === 2) return node.hop <= 1;
      if (activeStage === 3) return node.hop <= 2;
      return true; // Stage 4: all 4 hops
    });
  }, [graphData, activeStage, selectedCase.victimAcc]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(() => {
    if (!graphData) return [];
    return graphData.edges.filter(
      (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [graphData, visibleNodeIds]);

  // Inspected Node Object
  const inspectedNode = useMemo(() => {
    if (!graphData) return null;
    return graphData.nodes.find((n) => n.id === inspectedNodeId) || graphData.nodes[0] || null;
  }, [graphData, inspectedNodeId]);

  // Custom Search Query
  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    // Check if it matches preset
    const foundPreset = PRESET_CASES.find(
      (p) => p.victimAcc === customQuery.trim() || p.firNumber.toLowerCase().includes(customQuery.trim().toLowerCase())
    );

    if (foundPreset) {
      setSelectedCase(foundPreset);
    } else {
      // Dynamic custom case
      const dynamicCase: CasePreset = {
        id: `custom-${Date.now()}`,
        victimAcc: customQuery.trim(),
        victimName: `Account ${customQuery.trim()}`,
        scheme: "Target Incident Replay (Direct Search)",
        firNumber: "FIR #CYBER-2026/CUSTOM",
        lossAmount: 500000,
        bankName: "Disputed Banking Entity",
        ifsc: "DISP0001001",
        location: "National Jurisdiction",
        reportedAt: "Live Telemetry",
        stageTimestamps: {
          stage1: "Incident Start (T+0m)",
          stage2: "Collector Pooling (T+10m)",
          stage3: "Distributor Smurfing (T+35m)",
          stage4: "Terminal Cashout (T+2h)"
        }
      };
      setSelectedCase(dynamicCase);
    }
  };

  // -------------------------------------------------------------
  // LIVE CORRELATION GRAPH RENDERING ON CANVAS
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (width === 0 || height === 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Layout nodes into 4 horizontal columns corresponding to the 4 stages
    // Column 1: Stage 1 (Victim)
    // Column 2: Stage 2 (Collector Mules)
    // Column 3: Stage 3 (Distributor Mules)
    // Column 4: Stage 4 (Terminal Cashout Nodes)
    const stageColumns: Record<number, GraphNode[]> = { 0: [], 1: [], 2: [], 3: [] };

    visibleNodes.forEach((node) => {
      const hop = Math.min(3, Math.max(0, node.hop));
      stageColumns[hop].push(node);
    });

    const colXPositions = [
      width * 0.12,  // Stage 1
      width * 0.38,  // Stage 2
      width * 0.65,  // Stage 3
      width * 0.90   // Stage 4
    ];

    const nodePositions = new Map<string, { x: number; y: number; role: string; form?: any }>();

    [0, 1, 2, 3].forEach((stageHop) => {
      const stageNodes = stageColumns[stageHop];
      const count = stageNodes.length;
      const x = colXPositions[stageHop];

      // Limit displayed nodes in column to avoid clutter
      const maxDisplay = stageHop === 0 ? 1 : stageHop === 1 ? 5 : stageHop === 2 ? 6 : 6;
      const displaySubset = stageNodes.slice(0, maxDisplay);

      displaySubset.forEach((n, idx) => {
        const spacing = height / (displaySubset.length + 1);
        const y = spacing * (idx + 1);
        nodePositions.set(n.id, { x, y, role: n.role || "", form: n.terminalForm });
      });
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Column Guidelines & Background Glow
      colXPositions.forEach((cx, sIdx) => {
        const isCurrentActive = activeStage === sIdx + 1;
        ctx.beginPath();
        ctx.moveTo(cx, 30);
        ctx.lineTo(cx, height - 20);
        ctx.strokeStyle = isCurrentActive ? "rgba(6, 182, 212, 0.25)" : "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Stage Title Header on Canvas
        ctx.font = "bold 9px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle =
          sIdx === 0
            ? "#22d3ee"
            : sIdx === 1
            ? "#f59e0b"
            : sIdx === 2
            ? "#c084fc"
            : "#f87171";
        const title =
          sIdx === 0
            ? "STAGE 1: VICTIM"
            : sIdx === 1
            ? "STAGE 2: COLLECTORS"
            : sIdx === 2
            ? "STAGE 3: DISTRIBUTORS"
            : "STAGE 4: TERMINALS";
        ctx.fillText(title, cx, 20);
      });

      // 2. Draw Edges with Directional Lines
      visibleEdges.forEach((edge) => {
        const sPos = nodePositions.get(edge.source);
        const tPos = nodePositions.get(edge.target);
        if (!sPos || !tPos) return;

        ctx.beginPath();
        ctx.moveTo(sPos.x, sPos.y);
        ctx.lineTo(tPos.x, tPos.y);

        const isInspectedEdge = edge.source === inspectedNodeId || edge.target === inspectedNodeId;
        if (isInspectedEdge) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#06b6d4";
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
          ctx.lineWidth = 1.2;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // 3. Draw Nodes (Static forensic presentation)

      // 4. Draw Nodes
      nodePositions.forEach((pos, nodeId) => {
        const isSelected = nodeId === inspectedNodeId;
        const isVictim = nodeId === selectedCase.victimAcc;

        let nodeColor = "#64748b";
        let glowColor = "rgba(100, 116, 139, 0.3)";
        let radius = 17;

        if (isVictim) {
          nodeColor = "#06b6d4";
          glowColor = "rgba(6, 182, 212, 0.6)";
          radius = 22;
        } else if (pos.role === "COLLECTOR_L1") {
          nodeColor = "#f59e0b";
          glowColor = "rgba(245, 158, 11, 0.5)";
          radius = 18;
        } else if (pos.role === "DISTRIBUTOR_L2") {
          nodeColor = "#a855f7";
          glowColor = "rgba(168, 85, 247, 0.5)";
          radius = 17;
        } else {
          // Terminal
          nodeColor = "#ef4444";
          glowColor = "rgba(239, 68, 68, 0.6)";
          radius = 18;
        }

        // Selected halo
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
          ctx.fill();
        }

        // Ambient glow
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = glowColor;
        ctx.fill();

        // Node Body
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#090d16";
        ctx.fill();
        ctx.lineWidth = isSelected ? 3 : 1.8;
        ctx.strokeStyle = isSelected ? "#ffffff" : nodeColor;
        ctx.stroke();

        // Symbol / Role icon
        ctx.fillStyle = nodeColor;
        ctx.font = "bold 9px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const symbol = isVictim
          ? "VIC"
          : pos.role === "COLLECTOR_L1"
          ? "L1"
          : pos.role === "DISTRIBUTOR_L2"
          ? "L2"
          : pos.form?.icon || "TERM";
        ctx.fillText(symbol, pos.x, pos.y);

        // Account ID Below
        ctx.fillStyle = isSelected ? "#ffffff" : "rgba(248, 250, 252, 0.85)";
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textBaseline = "top";
        ctx.fillText(nodeId.slice(-6), pos.x, pos.y + radius + 4);

        // Sub-label (Terminal Form or Bank)
        ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
        ctx.font = "8px 'Inter', sans-serif";
        const sub = isVictim
          ? "COMPLAINANT"
          : pos.form?.form
          ? pos.form.form
          : pos.role === "COLLECTOR_L1"
          ? "COLLECTOR"
          : pos.role === "DISTRIBUTOR_L2"
          ? "DISTRIBUTOR"
          : "CASH-OUT";
        ctx.fillText(sub, pos.x, pos.y + radius + 15);
      });

      // Static render without perpetual animation loop
    };

    render();

    // Canvas Click Listener for Selecting Nodes
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      nodePositions.forEach((pos, nodeId) => {
        const dx = clickX - pos.x;
        const dy = clickY - pos.y;
        if (Math.hypot(dx, dy) <= 24) {
          setInspectedNodeId(nodeId);
        }
      });
    };

    canvas.addEventListener("click", handleCanvasClick);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [visibleNodes, visibleEdges, activeStage, inspectedNodeId, selectedCase.victimAcc, canvasDimensions]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ========================================================
          1. TOP HERO HEADER & CASE SEARCH
          ======================================================== */}
      <div
        className="glass-panel"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 24, 40, 0.8) 100%)",
          border: "1px solid rgba(6, 182, 212, 0.35)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: "0.72rem" }}>
              <Clock size={12} />
              CHRONO-FORENSIC TIMELINE REPLAY
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
              4-HOP SYNDICATE DISPERSION ENGINE
            </span>
          </div>

          <h2 style={{ fontSize: "1.45rem", marginBottom: "4px", fontWeight: 800 }}>
            Case Replay & Dynamic Correlation Graph
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", maxWidth: "750px" }}>
            Step through money laundering execution from victim origin to multi-channel terminal cash-out. As the timeline advances, the correlation graph simultaneously constructs and reveals banking, IP, and transaction forensics for every node.
          </p>
        </div>

        {/* Quick Search for Custom Case or Transaction ID */}
        <form onSubmit={handleCustomSearch} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            className="cyber-input font-mono"
            placeholder="Account No / TXN ID / FIR..."
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            style={{ width: "240px", fontSize: "0.85rem" }}
          />
          <button type="submit" className="btn-primary" style={{ padding: "8px 16px" }}>
            <Search size={15} />
            Replay Case
          </button>
        </form>
      </div>

      {/* ========================================================
          2. CASE PRESETS SELECTOR ROW
          ======================================================== */}
      <div>
        <div style={{ fontSize: "0.74rem", fontFamily: "var(--font-heading)", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 700 }}>
          SELECT PRIORITY CYBERCRIME CASE FOR 4-HOP REPLAY:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {PRESET_CASES.map((c) => {
            const isSelected = selectedCase.victimAcc === c.victimAcc;
            return (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCase(c);
                  setTimelineProgress(100);
                  setIsPlaying(false);
                }}
                className="glass-panel"
                style={{
                  padding: "12px 14px",
                  cursor: "pointer",
                  border: isSelected ? "1.8px solid #06b6d4" : "1px solid var(--border-subtle)",
                  background: isSelected ? "rgba(6, 182, 212, 0.1)" : "var(--bg-card)",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: isSelected ? "#22d3ee" : "#ffffff" }}>
                    {c.victimName}
                  </span>
                  <span className="cyber-badge cyber-badge-amber" style={{ fontSize: "0.65rem" }}>
                    ₹{(c.lossAmount / 1000).toFixed(0)}k
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.scheme}
                </div>
                <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", marginTop: "4px" }}>
                  {c.firNumber}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          3. INTERACTIVE REPLAY TIMELINE CONTROL DECK
          ======================================================== */}
      <div
        className="glass-panel-elevated"
        style={{
          padding: "18px 24px",
          border: "1px solid rgba(6, 182, 212, 0.35)",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}
      >
        {/* Top Control Bar: Buttons, Progress, Speed */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-primary"
              style={{ width: "38px", height: "38px", borderRadius: "50%", padding: 0 }}
              title={isPlaying ? "Pause Case Replay" : "Play Case Replay"}
            >
              {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: "2px" }} />}
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                setTimelineProgress(0);
                setIsPlaying(false);
              }}
              className="btn-secondary"
              style={{ width: "34px", height: "34px", borderRadius: "50%", padding: 0 }}
              title="Reset Timeline to Origin (T=0)"
            >
              <RotateCcw size={15} />
            </button>

            {/* Speed Toggle */}
            <button
              onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : s === 2 ? 5 : 1))}
              className="btn-secondary"
              style={{ fontSize: "0.75rem", padding: "5px 10px", minWidth: "46px" }}
              title="Toggle Playback Speed"
            >
              {playbackSpeed}x SPEED
            </button>

            {/* Active Stage Indicator */}
            <div style={{ marginLeft: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                ACTIVE HORIZON:
              </span>
              <span
                className="cyber-badge"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  background:
                    activeStage === 1
                      ? "rgba(6, 182, 212, 0.15)"
                      : activeStage === 2
                      ? "rgba(245, 158, 11, 0.15)"
                      : activeStage === 3
                      ? "rgba(168, 85, 247, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  color:
                    activeStage === 1
                      ? "#22d3ee"
                      : activeStage === 2
                      ? "#f59e0b"
                      : activeStage === 3
                      ? "#c084fc"
                      : "#f87171",
                  border: `1px solid ${
                    activeStage === 1
                      ? "#06b6d4"
                      : activeStage === 2
                      ? "#f59e0b"
                      : activeStage === 3
                      ? "#a855f7"
                      : "#ef4444"
                  }`
                }}
              >
                {activeStage === 1
                  ? "STAGE 1: INCIDENT ORIGIN (T+0m)"
                  : activeStage === 2
                  ? "STAGE 2: COLLECTOR POOLING (T+8m)"
                  : activeStage === 3
                  ? "STAGE 3: DISTRIBUTOR SMURFING (T+30m)"
                  : "STAGE 4: TERMINAL CASH-OUT (T+2h)"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <span style={{ color: "var(--text-muted)" }}>TIMELINE PROGRESS:</span>
            <span style={{ color: "#22d3ee", fontWeight: 700 }}>{timelineProgress}%</span>
            <span style={{ color: "var(--text-muted)" }}>•</span>
            <span style={{ color: "#ffffff" }}>{visibleNodes.length} NODES VISIBLE</span>
          </div>
        </div>

        {/* Range Slider Scrubber */}
        <input
          type="range"
          min={0}
          max={100}
          value={timelineProgress}
          onChange={(e) => setTimelineProgress(Number(e.target.value))}
          style={{
            width: "100%",
            height: "8px",
            accentColor: "#06b6d4",
            cursor: "pointer"
          }}
        />

        {/* 4 Interactive Stage Steppers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {[
            {
              stage: 1,
              title: "STAGE 1: ORIGIN",
              subtitle: "Complainant Debit",
              time: selectedCase.stageTimestamps.stage1,
              color: "#06b6d4"
            },
            {
              stage: 2,
              title: "STAGE 2: COLLECTORS",
              subtitle: "Rapid Pooling Layer",
              time: selectedCase.stageTimestamps.stage2,
              color: "#f59e0b"
            },
            {
              stage: 3,
              title: "STAGE 3: DISTRIBUTORS",
              subtitle: "Smurfing / Layering",
              time: selectedCase.stageTimestamps.stage3,
              color: "#a855f7"
            },
            {
              stage: 4,
              title: "STAGE 4: TERMINALS",
              subtitle: "ATMs / Crypto / Trades",
              time: selectedCase.stageTimestamps.stage4,
              color: "#ef4444"
            }
          ].map((st) => {
            const isStageActive = activeStage >= st.stage;
            const isCurrent = activeStage === st.stage;

            return (
              <button
                key={st.stage}
                onClick={() => jumpToStage(st.stage as any)}
                style={{
                  background: isCurrent ? "rgba(255, 255, 255, 0.08)" : isStageActive ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.2)",
                  border: isCurrent ? `1.8px solid ${st.color}` : isStageActive ? "1px solid var(--border-subtle)" : "1px solid rgba(255, 255, 255, 0.05)",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, color: isStageActive ? st.color : "var(--text-muted)", fontFamily: "var(--font-heading)" }}>
                    {st.title}
                  </span>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isStageActive ? st.color : "#475569" }} />
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: isStageActive ? "#ffffff" : "var(--text-muted)" }}>
                  {st.subtitle}
                </div>
                <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: "2px" }}>
                  ⏱️ {st.time}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          4. MAIN 2-COLUMN VIEW: LIVE CORRELATION GRAPH + NODE DOSSIER
          ======================================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: "20px", alignItems: "start" }}>
        {/* Left Column: Live Correlation Graph Canvas */}
        <div
          className="glass-panel"
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            border: "1px solid rgba(6, 182, 212, 0.3)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={16} style={{ color: "var(--accent-cyan)" }} />
              <span className="font-display" style={{ fontSize: "0.88rem", fontWeight: 800 }}>
                SIMULTANEOUSLY CONSTRUCTED CORRELATION TOPOLOGY
              </span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              CLICK ANY NODE TO INSPECT DETAILS
            </span>
          </div>

          {/* Canvas Viewport */}
          <div
            style={{
              width: "100%",
              height: "440px",
              background: "radial-gradient(ellipse at center, rgba(12, 18, 30, 0.9) 0%, rgba(5, 8, 14, 0.98) 100%)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(5, 8, 14, 0.8)",
                  backdropFilter: "blur(4px)",
                  zIndex: 10,
                  gap: "10px"
                }}
              >
                <RefreshCw size={24} className="spin" color="#06b6d4" />
                <span style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                  Reconstructing 4-Hop Chrono-Topology...
                </span>
              </div>
            )}

            {fetchError && !isLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(5, 8, 14, 0.88)",
                  zIndex: 10,
                  gap: "12px",
                  padding: "20px",
                  textAlign: "center"
                }}
              >
                <AlertTriangle size={28} color="#ef4444" />
                <span style={{ fontSize: "0.85rem", color: "#f87171" }}>{fetchError}</span>
                <button
                  onClick={() => {
                    const fetchAgain = async () => {
                      setIsLoading(true);
                      setFetchError(null);
                      try {
                        const res = await fetch(`http://localhost:8000/mule-rings/analyze/${encodeURIComponent(selectedCase.victimAcc)}`);
                        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
                        const data = await res.json();
                        setGraphData({
                          nodes: data.nodes || [],
                          edges: data.edges || [],
                          summary: data.summary || {}
                        });
                        const victimNode = (data.nodes || []).find((n: GraphNode) => n.id === selectedCase.victimAcc);
                        setInspectedNodeId(victimNode?.id || data.rootAccount || selectedCase.victimAcc);
                      } catch (err: any) {
                        setFetchError(err.message || "Failed to load case data");
                      } finally {
                        setIsLoading(false);
                      }
                    };
                    fetchAgain();
                  }}
                  className="btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <RefreshCw size={12} />
                  <span>Retry Analysis</span>
                </button>
              </div>
            )}

            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: "100%", display: "block", cursor: "pointer" }}
            />
          </div>

          {/* Quick Graph Navigation Tips */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <span>🔵 Stage 1: Victim Origin</span>
              <span>🟡 Stage 2: Collector Mules</span>
              <span>🟣 Stage 3: Distributor Mules</span>
              <span>🔴 Stage 4: Terminals (ATMs / Crypto / Trades)</span>
            </div>
            <button
              onClick={() => onSelectVictim(selectedCase.victimAcc)}
              className="btn-secondary"
              style={{ padding: "4px 10px", fontSize: "0.7rem" }}
            >
              <ExternalLink size={12} />
              Open in Full Flow Graph
            </button>
          </div>
        </div>

        {/* Right Column: Node Forensic & Banking Dossier */}
        <div
          className="glass-panel-elevated"
          style={{
            padding: "20px",
            border: "1px solid rgba(6, 182, 212, 0.35)",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}
        >
          {inspectedNode ? (
            <>
              {/* Header: Node Identity & Role Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-heading)", color: "var(--text-muted)" }}>
                    FORENSIC NODE DOSSIER
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginTop: "2px", fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                    Account {inspectedNode.id}
                  </h3>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {inspectedNode.tierName || (inspectedNode.id === selectedCase.victimAcc ? "Stage 1: Victim Origin" : "Syndicate Account")}
                  </div>
                </div>

                <span
                  className="cyber-badge"
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    background:
                      inspectedNode.id === selectedCase.victimAcc
                        ? "rgba(6, 182, 212, 0.15)"
                        : (inspectedNode.muleRiskScore || 0) >= 70
                        ? "rgba(239, 68, 68, 0.15)"
                        : "rgba(245, 158, 11, 0.15)",
                    color:
                      inspectedNode.id === selectedCase.victimAcc
                        ? "#22d3ee"
                        : (inspectedNode.muleRiskScore || 0) >= 70
                        ? "#ef4444"
                        : "#f59e0b",
                    border: `1px solid ${
                      inspectedNode.id === selectedCase.victimAcc
                        ? "#06b6d4"
                        : (inspectedNode.muleRiskScore || 0) >= 70
                        ? "#ef4444"
                        : "#f59e0b"
                    }`
                  }}
                >
                  {inspectedNode.id === selectedCase.victimAcc
                    ? "VICTIM COMPLAINANT"
                    : `MRI: ${inspectedNode.muleRiskScore || 75}/100`}
                </span>
              </div>

              {/* STAGE 4: TERMINAL FORM CARD (If Terminal Node) */}
              {(inspectedNode.role === "TERMINAL_L3" || inspectedNode.role === "DESTINATION_L4" || inspectedNode.hop >= 3 || inspectedNode.terminalForm) && (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%)",
                    border: "1.5px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 12px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.7rem", color: "#f87171", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                      STAGE 4: TERMINAL CASH-OUT CHANNEL
                    </span>
                    <span className="cyber-badge cyber-badge-crimson" style={{ fontSize: "0.68rem" }}>
                      {inspectedNode.terminalForm?.icon || "🏧"} {inspectedNode.terminalForm?.form || "ATM / CRYPTO"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
                    {inspectedNode.terminalForm?.label || "ATM Fleet Cash Dispersion"}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "2px", lineHeight: 1.35 }}>
                    {inspectedNode.terminalForm?.description || "Final exit point where stolen capital was converted into physical cash or crypto off-ramps."}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#38bdf8", fontFamily: "var(--font-mono)", background: "rgba(0, 0, 0, 0.35)", padding: "4px 8px", borderRadius: "4px", marginTop: "6px" }}>
                    📍 Location / Desk: {inspectedNode.terminalForm?.locationOrExchange || "ATM Fleet Cluster #18 (NCR / Mumbai)"}
                  </div>
                </div>
              )}

              {/* Symmetrical Banking Details Grid */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px"
                }}
              >
                <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-heading)", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 700 }}>
                  BANKING SPECIFICATION & ENTITY DETAILS
                </div>
                <div className="victim-grid-symmetrical">
                  <div className="victim-stat-cell">
                    <span className="label">Bank Entity</span>
                    <span className="value">
                      {inspectedNode.id === selectedCase.victimAcc ? selectedCase.bankName : inspectedNode.bankName || "HDFC Bank Ltd."}
                    </span>
                  </div>
                  <div className="victim-stat-cell">
                    <span className="label">IFSC Code</span>
                    <span className="value" style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                      {inspectedNode.id === selectedCase.victimAcc ? selectedCase.ifsc : inspectedNode.ifsc || "HDFC0001844"}
                    </span>
                  </div>
                  <div className="victim-stat-cell">
                    <span className="label">Account Status</span>
                    <span className="value" style={{ color: inspectedNode.id === selectedCase.victimAcc ? "#34d399" : "#f87171", fontWeight: 700 }}>
                      {inspectedNode.id === selectedCase.victimAcc ? "COMPLAINANT" : "FLAGGED MULE"}
                    </span>
                  </div>
                  <div className="victim-stat-cell">
                    <span className="label">Branch Name</span>
                    <span className="value" style={{ fontSize: "0.78rem" }}>
                      {inspectedNode.id === selectedCase.victimAcc ? selectedCase.location : "Cyber Crime Security Branch"}
                    </span>
                  </div>
                </div>
              </div>

              {/* IP Geolocation & Technical Fingerprint */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px"
                }}
              >
                <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-heading)", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 700 }}>
                  IP GEOLOCATION & DIGITAL FINGERPRINT
                </div>
                <div className="victim-grid-symmetrical">
                  <div className="victim-stat-cell">
                    <span className="label"><MapPin size={10} style={{ display: "inline", marginRight: "3px" }} /> IP Location</span>
                    <span className="value">{inspectedNode.ipLocation || selectedCase.location}</span>
                  </div>
                  <div className="victim-stat-cell">
                    <span className="label">IP Address</span>
                    <span className="value" style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                      {inspectedNode.ipAddress || "103.45.12.8"}
                    </span>
                  </div>
                  <div className="victim-stat-cell">
                    <span className="label">Device Agent</span>
                    <span className="value" style={{ fontSize: "0.76rem" }}>{inspectedNode.deviceType || "Android 14 (Mobile)"}</span>
                  </div>
                  <div className="victim-stat-cell">
                    <span className="label">First / Last Activity</span>
                    <span className="value" style={{ fontSize: "0.76rem" }}>{selectedCase.stageTimestamps.stage1.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              {/* Total Inflow / Outflow */}
              <div className="victim-grid-symmetrical">
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)"
                  }}
                >
                  <div style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                    TOTAL INFLOW
                  </div>
                  <div style={{ fontWeight: 700, color: "#34d399", fontFamily: "var(--font-mono)", marginTop: "2px", fontSize: "0.95rem" }}>
                    ₹{(inspectedNode.totalInflow || selectedCase.lossAmount).toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)"
                  }}
                >
                  <div style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                    TOTAL OUTFLOW
                  </div>
                  <div style={{ fontWeight: 700, color: "#f87171", fontFamily: "var(--font-mono)", marginTop: "2px", fontSize: "0.95rem" }}>
                    ₹{(inspectedNode.totalOutflow || selectedCase.lossAmount * 0.92).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Interconnected Peers in Replay */}
              {(() => {
                const connectedIn = visibleEdges.filter((e) => e.target === inspectedNode.id);
                const connectedOut = visibleEdges.filter((e) => e.source === inspectedNode.id);
                const peersIn = Array.from(new Set(connectedIn.map((e) => e.source)));
                const peersOut = Array.from(new Set(connectedOut.map((e) => e.target)));

                return (
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px"
                    }}
                  >
                    <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-heading)", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                      <Share2 size={13} style={{ color: "var(--accent-cyan)" }} />
                      INTERCONNECTED NETWORK PEERS ({peersIn.length + peersOut.length})
                    </div>
                    {peersIn.length > 0 && (
                      <div style={{ marginBottom: "6px" }}>
                        <div style={{ fontSize: "0.65rem", color: "#34d399", fontWeight: 700, marginBottom: "3px" }}>
                          ← INFLOW FROM:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {peersIn.slice(0, 5).map((p) => (
                            <button
                              key={p}
                              onClick={() => setInspectedNodeId(p)}
                              className="btn-secondary"
                              style={{ padding: "2px 6px", fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "#34d399" }}
                            >
                              ← {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {peersOut.length > 0 && (
                      <div>
                        <div style={{ fontSize: "0.65rem", color: "#f87171", fontWeight: 700, marginBottom: "3px" }}>
                          → OUTFLOW TO:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {peersOut.slice(0, 5).map((p) => (
                            <button
                              key={p}
                              onClick={() => setInspectedNodeId(p)}
                              className="btn-secondary"
                              style={{ padding: "2px 6px", fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "#f87171" }}
                            >
                              → {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Action Buttons: Statutory Freezing or Legal Protection */}
              {inspectedNode.id === selectedCase.victimAcc ? (
                <div className="victim-protected-badge" style={{ padding: "10px 12px" }}>
                  <Lock size={15} style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 800 }}>PROTECTED COMPLAINANT ACCOUNT</div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.9, marginTop: "2px" }}>
                      Statutory freezing is legally prohibited on this victim account. Requisition restricted to downstream money mules.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.3)", borderRadius: "var(--radius-sm)", fontSize: "0.76rem", color: "var(--accent-cyan)" }}>
                  <ShieldCheck size={15} />
                  <span>Downstream Mule Account Node • Profiled under Case {selectedCase.firNumber}</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              <Info size={32} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
              <div>Click any node on the correlation graph to inspect its forensic and banking specifications.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
