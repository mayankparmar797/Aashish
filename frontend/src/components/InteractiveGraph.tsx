import React, { useRef, useEffect, useState, useMemo } from "react";
import { GraphNode, GraphEdge, NodeRole } from "../types";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Filter,
  Layers,
  Sparkles,
  ShieldAlert,
  SlidersHorizontal,
  Eye,
  Crosshair,
  Search,
  MapPin,
  Building,
  Clock,
  ArrowRight,
  TrendingUp,
  X,
  Scale,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  Info,
  Lock,
  Share2
} from "lucide-react";

export const VICTIM_REGISTRY: Record<
  string,
  {
    name: string;
    scheme: string;
    amount: number;
    bank: string;
    ifsc: string;
    branch: string;
    location: string;
    ip: string;
    isp: string;
    device: string;
    reportedAt: string;
    firNumber: string;
  }
> = {
  "900000000001": {
    name: "Ramesh Sharma",
    scheme: "Digital Arrest / Fake CBI Extortion",
    amount: 450000,
    bank: "HDFC Bank Ltd.",
    ifsc: "HDFC0005678",
    branch: "Vijay Nagar Branch, Indore",
    location: "Indore, Madhya Pradesh, India",
    ip: "103.45.12.8",
    isp: "Bharti Airtel Broadband",
    device: "Samsung Galaxy S22 (Android 14)",
    reportedAt: "2026-10-02 09:14:22 IST",
    firNumber: "FIR #MP-IND-2026/842"
  },
  "900000000002": {
    name: "Sunita Verma",
    scheme: "Customs Parcel / Courier Narcotics Scam",
    amount: 680000,
    bank: "ICICI Bank Ltd.",
    ifsc: "ICIC0001234",
    branch: "C-Scheme Branch, Jaipur",
    location: "Jaipur, Rajasthan, India",
    ip: "49.36.120.45",
    isp: "Reliance Jio Infocomm",
    device: "Apple iPhone 14 (iOS 17.4)",
    reportedAt: "2026-10-01 14:32:10 IST",
    firNumber: "FIR #RJ-JPR-2026/519"
  },
  "900000000003": {
    name: "Anand Joshi",
    scheme: "Telegram Prepaid Rating / Task Fraud",
    amount: 320000,
    bank: "State Bank of India",
    ifsc: "SBIN0004567",
    branch: "Shivajinagar Branch, Pune",
    location: "Pune, Maharashtra, India",
    ip: "157.34.89.12",
    isp: "Tata Teleservices",
    device: "Windows 11 Workstation (Chrome 122)",
    reportedAt: "2026-09-30 18:22:45 IST",
    firNumber: "FIR #MH-PUN-2026/304"
  },
  "900000000004": {
    name: "Kavita Rao",
    scheme: "Electricity Power Bill Disconnection APK",
    amount: 195000,
    bank: "Axis Bank Ltd.",
    ifsc: "UTIB0002345",
    branch: "Banjara Hills, Hyderabad",
    location: "Hyderabad, Telangana, India",
    ip: "182.72.65.10",
    isp: "ACT Fibernet Broadband",
    device: "Xiaomi Redmi Note 11 (Android 13)",
    reportedAt: "2026-09-29 11:45:00 IST",
    firNumber: "FIR #TS-HYD-2026/188"
  },
  "900000000005": {
    name: "Alok Gupta",
    scheme: "Crypto Arbitrage Phishing Investment",
    amount: 840000,
    bank: "Kotak Mahindra Bank",
    ifsc: "KKBK0008901",
    branch: "Connaught Place, New Delhi",
    location: "New Delhi, Delhi, India",
    ip: "122.161.44.78",
    isp: "Airtel Xstream Fiber",
    device: "Apple MacBook Pro (macOS 14.3)",
    reportedAt: "2026-09-28 20:10:15 IST",
    firNumber: "FIR #DL-CP-2026/993"
  }
};

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootAccount: string;
  onSelectAccount: (accountId: string) => void;
  onSelectEdge?: (edge: GraphEdge) => void;
  selectedAccountId?: string | null;
  isolatedRingNodeIds?: string[] | null;
  onClearIsolation?: () => void;
  onSearchAccount?: (accountId: string) => void;
  onGenerateNotice?: (accountId: string) => void;
  focusedTransactionId?: string | null;
}

interface SearchItem {
  id: string;
  type: "TXN" | "SENDER" | "RECEIVER";
  title: string;
  subtitle: string;
  amount?: number;
  timestamp?: string;
  sender?: string;
  receiver?: string;
}

export const getNodeLayer = (node: GraphNode, rootAcc: string): number => {
  if (node.id === rootAcc || node.role === "ORIGIN" || node.hop === 0) return 0;
  if (node.role === "COLLECTOR_L1" || (node.hop === 1 && node.id !== rootAcc)) return 1;
  if (node.role === "DISTRIBUTOR_L2" || (node.hop === 2 && node.id !== rootAcc)) return 2;
  if (node.role === "TERMINAL_L3" || (node.hop === 3 && node.id !== rootAcc)) return 3;
  if (node.role === "DESTINATION_L4" || (node.hop >= 4 && node.id !== rootAcc)) return 4;
  return -1;
};

export const LAYER_CONFIG: Record<
  number,
  {
    name: string;
    stageLabel: string;
    nodeColor: string;
    glowColor: string;
    bgFill: string;
    badgeText: string;
  }
> = {
  0: {
    name: "VICTIM COMPLAINANT",
    stageLabel: "LAYER 0 • VICTIM",
    nodeColor: "#00f0ff", // Bright Neon Cyan
    glowColor: "rgba(0, 240, 255, 0.45)",
    bgFill: "#062233",
    badgeText: "VICTIM"
  },
  1: {
    name: "COLLECTOR MULE",
    stageLabel: "LAYER 1 • COLLECTOR MULE",
    nodeColor: "#f59e0b", // Warm Gold / Amber
    glowColor: "rgba(245, 158, 11, 0.45)",
    bgFill: "#2a1b05",
    badgeText: "L1 MULE"
  },
  2: {
    name: "DISTRIBUTOR MULE",
    stageLabel: "LAYER 2 • DISTRIBUTOR MULE",
    nodeColor: "#a855f7", // Electric Purple
    glowColor: "rgba(168, 85, 247, 0.45)",
    bgFill: "#20092c",
    badgeText: "L2 MULE"
  },
  3: {
    name: "TERMINAL CASH-OUT",
    stageLabel: "LAYER 3 • TERMINAL CASHOUT",
    nodeColor: "#ef4444", // Coral Red / Crimson
    glowColor: "rgba(239, 68, 68, 0.45)",
    bgFill: "#2b0a0e",
    badgeText: "L3 END"
  },
  4: {
    name: "OFFSHORE DESTINATION",
    stageLabel: "LAYER 4 • DESTINATION RAILS",
    nodeColor: "#10b981", // Emerald Green
    glowColor: "rgba(16, 185, 129, 0.45)",
    bgFill: "#062618",
    badgeText: "L4 DEST"
  }
};

export const InteractiveGraph: React.FC<Props> = ({
  nodes,
  edges,
  rootAccount,
  onSelectAccount,
  onSelectEdge,
  selectedAccountId,
  isolatedRingNodeIds,
  onClearIsolation,
  onSearchAccount,
  onGenerateNotice,
  focusedTransactionId
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Viewport transforms
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Top-Middle Search State with Category Selection (TXN ID, Sender A/C, Receiver A/C)
  const [searchCategory, setSearchCategory] = useState<"TXN" | "SENDER" | "RECEIVER">("TXN");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [highlightedEdgeId, setHighlightedEdgeId] = useState<string | null>(null);

  // Side Node Inspector Panel State
  const [inspectedNode, setInspectedNode] = useState<GraphNode | null>(null);

  // Filters (Defaults to all 4 hops)
  const [maxHopFilter, setMaxHopFilter] = useState(4);
  const [minAmountFilter, setMinAmountFilter] = useState(0);
  const [paymentModeFilter, setPaymentModeFilter] = useState("ALL");

  // Temporal Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5>(1);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(100); // 0 to 100%

  // Simulation node positions
  const positionsRef = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map());

  // Strictly filter nodes: ONLY Victim, Mules (L1/L2), and Terminal Ends (L3/L4)
  const syndicateOnlyNodes = useMemo(() => {
    return nodes.filter((n) => {
      const layer = getNodeLayer(n, rootAccount);
      return layer >= 0 && layer <= 4;
    });
  }, [nodes, rootAccount]);

  const syndicateNodeIdSet = useMemo(() => {
    return new Set(syndicateOnlyNodes.map((n) => n.id));
  }, [syndicateOnlyNodes]);

  // Sort edges by timestamp
  const sortedEdges = useMemo(() => {
    return edges
      .filter((e) => syndicateNodeIdSet.has(e.source) && syndicateNodeIdSet.has(e.target))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [edges, syndicateNodeIdSet]);

  // Filtered edges based on temporal playback and filters
  const activeEdges = useMemo(() => {
    if (sortedEdges.length === 0) return [];

    const cutoffIndex = Math.max(1, Math.ceil((currentTimeIndex / 100) * sortedEdges.length));
    const timeSliced = sortedEdges.slice(0, cutoffIndex);

    return timeSliced.filter((e) => {
      if (e.amount < minAmountFilter) return false;
      if (paymentModeFilter !== "ALL" && e.paymentMode !== paymentModeFilter) return false;

      // Isolated ring filter
      if (isolatedRingNodeIds && isolatedRingNodeIds.length > 0) {
        if (!isolatedRingNodeIds.includes(e.source) || !isolatedRingNodeIds.includes(e.target)) {
          return false;
        }
      }

      return true;
    });
  }, [sortedEdges, currentTimeIndex, minAmountFilter, paymentModeFilter, isolatedRingNodeIds]);

  // Active nodes based on active edges and hop filter
  const activeNodes = useMemo(() => {
    const nodeSet = new Set<string>();
    nodeSet.add(rootAccount);

    activeEdges.forEach((e) => {
      nodeSet.add(e.source);
      nodeSet.add(e.target);
    });

    return syndicateOnlyNodes.filter((n) => {
      if (!nodeSet.has(n.id)) return false;
      const layer = getNodeLayer(n, rootAccount);
      if (layer > maxHopFilter) return false;
      if (isolatedRingNodeIds && isolatedRingNodeIds.length > 0) {
        if (!isolatedRingNodeIds.includes(n.id)) return false;
      }
      return true;
    });
  }, [syndicateOnlyNodes, activeEdges, maxHopFilter, rootAccount, isolatedRingNodeIds]);

  // Sync selected account with inspector
  useEffect(() => {
    if (selectedAccountId) {
      const found = nodes.find((n) => n.id === selectedAccountId);
      if (found) {
        setInspectedNode(found);
      }
    }
  }, [selectedAccountId, nodes]);

  // Handle Top-Middle Search Query
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    const results: SearchItem[] = [];

    // 1. Search locally in active edges & nodes
    edges.forEach((e) => {
      if (e.transactionId.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)) {
        results.push({
          id: e.transactionId,
          type: "TXN",
          title: `TXN: ${e.transactionId}`,
          subtitle: `₹${e.amount.toLocaleString()} • ${e.source} → ${e.target}`,
          amount: e.amount,
          timestamp: e.timestamp,
          sender: e.source,
          receiver: e.target
        });
      }
      if (e.source.toLowerCase().includes(q) && !results.some((r) => r.id === e.source)) {
        results.push({
          id: e.source,
          type: "SENDER",
          title: `Sender Acc: ${e.source}`,
          subtitle: `Sent ₹${e.amount.toLocaleString()} via ${e.paymentMode}`
        });
      }
      if (e.target.toLowerCase().includes(q) && !results.some((r) => r.id === e.target)) {
        results.push({
          id: e.target,
          type: "RECEIVER",
          title: `Receiver Acc: ${e.target}`,
          subtitle: `Received ₹${e.amount.toLocaleString()} via ${e.paymentMode}`
        });
      }
    });

    // Also fetch from backend transactions search
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:8000/transactions/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          data.results.slice(0, 10).forEach((tx: any) => {
            if (!results.some((r) => r.id === tx.transaction_id)) {
              results.push({
                id: tx.transaction_id,
                type: "TXN",
                title: `TXN: ${tx.transaction_id}`,
                subtitle: `₹${tx.amount.toLocaleString()} • ${tx.sender_account} → ${tx.receiver_account}`,
                amount: tx.amount,
                timestamp: tx.timestamp,
                sender: tx.sender_account,
                receiver: tx.receiver_account
              });
            }
          });
        }
      } catch {
        // Local results fallback
      } finally {
        setSearchResults(results.slice(0, 12));
        setShowSearchDropdown(results.length > 0);
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, edges]);

  // Handle Search Result Selection
  const handleSelectSearchResult = (item: SearchItem) => {
    setShowSearchDropdown(false);
    setSearchQuery("");

    if (item.type === "TXN") {
      setHighlightedEdgeId(item.id);
      setTimeout(() => setHighlightedEdgeId(null), 8000);

      // Focus on sender or receiver in the graph
      const targetAcc = item.sender || item.receiver;
      if (targetAcc) {
        onSelectAccount(targetAcc);
        centerOnNode(targetAcc);
      }
    } else {
      // Account selected
      onSelectAccount(item.id);
      const inCurrentGraph = activeNodes.some((n) => n.id === item.id);
      if (inCurrentGraph) {
        centerOnNode(item.id);
      } else if (onSearchAccount) {
        // Trace this account
        onSearchAccount(item.id);
      }
    }
  };

  // Center canvas on a specific node
  const centerOnNode = (nodeId: string) => {
    const pos = positionsRef.current.get(nodeId);
    if (!pos) return;
    const width = 1000;
    const height = 640;
    setPan({
      x: width / 2 - pos.x * zoom,
      y: height / 2 - pos.y * zoom
    });
  };

  // Automatically focus on transaction edge and connected nodes when focusedTransactionId changes
  useEffect(() => {
    if (focusedTransactionId) {
      setHighlightedEdgeId(focusedTransactionId);
      const edge = edges.find(
        (e) => e.transactionId === focusedTransactionId || e.id === focusedTransactionId
      );
      if (edge) {
        const nodeToSelect =
          nodes.find((n) => n.id === edge.source) ||
          nodes.find((n) => n.id === edge.target);
        if (nodeToSelect) {
          onSelectAccount(nodeToSelect.id);
          setInspectedNode(nodeToSelect);
          setTimeout(() => centerOnNode(nodeToSelect.id), 250);
        }
      }
    }
  }, [focusedTransactionId, edges, nodes]);

  // Initialize Force Layout Positions in concentric tiers
  useEffect(() => {
    const map = positionsRef.current;
    const width = 1000;
    const height = 640;
    const centerX = width / 2;
    const centerY = height / 2;

    syndicateOnlyNodes.forEach((node) => {
      if (!map.has(node.id)) {
        const layer = getNodeLayer(node, rootAccount);
        if (layer === 0) {
          map.set(node.id, { x: centerX, y: centerY, vx: 0, vy: 0 });
        } else {
          // Position nodes radially according to layer level (Concentric Tiers)
          const tierRadius = Math.max(1, layer) * 135 + (Math.random() * 30 - 15);
          const angle = Math.random() * Math.PI * 2;
          map.set(node.id, {
            x: centerX + Math.cos(angle) * tierRadius,
            y: centerY + Math.sin(angle) * tierRadius,
            vx: 0,
            vy: 0
          });
        }
      }
    });
  }, [syndicateOnlyNodes, rootAccount]);

  // Temporal Playback Interval
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTimeIndex((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return Math.min(100, prev + 1 * playbackSpeed);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Canvas Render (Static Forensic Presentation, No Perpetual Animation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Deep cyber background
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw subtle grid coordinates
      ctx.strokeStyle = "rgba(6, 182, 212, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = -width; x < width * 2; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -height);
        ctx.lineTo(x, height * 2);
        ctx.stroke();
      }
      for (let y = -height; y < height * 2; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-width, y);
        ctx.lineTo(width * 2, y);
        ctx.stroke();
      }

      // Draw Concentric Hop Tier Rings with Distinct Layer Colors
      const rootPos = positionsRef.current.get(rootAccount) || { x: width / 2, y: height / 2 };
      const tierDistances = [125, 245, 365, 485];
      const tierLabels = [
        "LAYER 1: COLLECTOR MULES (POOLING LAYER)",
        "LAYER 2: DISTRIBUTOR MULES (SMURFING LAYER)",
        "LAYER 3: TERMINAL CASH-OUT (ATMs / POS / SHELL ACCOUNTS)",
        "LAYER 4: TERMINAL DESTINATION (OFFSHORE / CRYPTO RAILS)"
      ];
      const tierRingColors = [
        "rgba(245, 158, 11, 0.35)",  // Layer 1 Gold
        "rgba(168, 85, 247, 0.35)",  // Layer 2 Purple
        "rgba(239, 68, 68, 0.35)",   // Layer 3 Crimson
        "rgba(16, 185, 129, 0.35)"   // Layer 4 Emerald
      ];

      tierDistances.forEach((dist, idx) => {
        if (idx + 1 <= maxHopFilter) {
          ctx.beginPath();
          ctx.arc(rootPos.x, rootPos.y, dist, 0, Math.PI * 2);
          ctx.strokeStyle = tierRingColors[idx];
          ctx.lineWidth = 1.3;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Layer guidance title
          ctx.fillStyle = tierRingColors[idx].replace("0.35", "0.85");
          ctx.font = "bold 9px 'Orbitron', 'Rajdhani', sans-serif";
          ctx.fillText(tierLabels[idx], rootPos.x - dist + 12, rootPos.y - 8);
        }
      });

      // 1. Draw Edges with Directional Arrows & Layer-Coordinated Colors
      activeEdges.forEach((edge) => {
        const sourcePos = positionsRef.current.get(edge.source);
        const targetPos = positionsRef.current.get(edge.target);
        if (!sourcePos || !targetPos) return;

        const sourceNode = activeNodes.find((n) => n.id === edge.source);
        const sourceLayer = sourceNode ? getNodeLayer(sourceNode, rootAccount) : 0;
        const layerCfg = LAYER_CONFIG[sourceLayer] || LAYER_CONFIG[0];

        const isHighlighted = highlightedEdgeId === edge.transactionId;
        const isHighValue = edge.amount >= 200000;

        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);

        if (isHighlighted) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 3.5;
          ctx.shadowColor = "#06b6d4";
          ctx.shadowBlur = 10;
        } else if (isHighValue) {
          ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
          ctx.lineWidth = 2.4;
        } else {
          ctx.strokeStyle = layerCfg.nodeColor;
          ctx.lineWidth = 1.8;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw directional arrowhead
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);

        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(angle);
        ctx.fillStyle = isHighlighted ? "#38bdf8" : isHighValue ? "#ef4444" : layerCfg.nodeColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-7, -4);
        ctx.lineTo(-7, 4);
        ctx.closePath();
        ctx.fill();

        // Amount label in Monospace font
        ctx.fillStyle = isHighlighted ? "#38bdf8" : "rgba(248, 250, 252, 0.9)";
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillText(`₹${(edge.amount / 1000).toFixed(0)}k`, 0, -6);
        ctx.restore();
      });

      // 2. Draw Nodes with Distinct Layer Colors & Presentation
      activeNodes.forEach((node) => {
        const pos = positionsRef.current.get(node.id);
        if (!pos) return;

        const layer = getNodeLayer(node, rootAccount);
        const cfg = LAYER_CONFIG[layer] || LAYER_CONFIG[0];
        const isRoot = layer === 0;
        const isSelected = selectedAccountId === node.id;
        const isHovered = hoveredNode?.id === node.id;

        const nodeColor = cfg.nodeColor;
        const glowColor = cfg.glowColor;
        let radius = isRoot ? 24 : layer === 1 ? 20 : layer === 2 ? 19 : layer === 3 ? 21 : 20;

        if (isSelected || isHovered) {
          radius += 4;
        }

        // Ambient Glow Halo (Layer specific color)
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = glowColor;
        ctx.fill();

        // Node Body (distinct layer background fill)
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = cfg.bgFill;
        ctx.fill();
        ctx.lineWidth = isSelected ? 3.5 : 2;
        ctx.strokeStyle = isSelected ? "#ffffff" : nodeColor;
        ctx.stroke();

        // Center Tier Symbol in Sci-Fi Font
        ctx.fillStyle = isSelected ? "#ffffff" : nodeColor;
        ctx.font = isRoot ? "bold 10px 'Orbitron', sans-serif" : "bold 9px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cfg.badgeText, pos.x, pos.y);

        // Account Label Below in Monospace
        ctx.fillStyle = isSelected ? "#ffffff" : "rgba(248, 250, 252, 0.95)";
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.textBaseline = "top";
        ctx.fillText(node.id.slice(-6), pos.x, pos.y + radius + 5);

        // Stage & Layer Tag
        ctx.fillStyle = nodeColor;
        ctx.font = "bold 8px 'Inter', sans-serif";
        ctx.fillText(cfg.stageLabel, pos.x, pos.y + radius + 17);
      });

      ctx.restore();
    };

    render();
  }, [
    activeNodes,
    activeEdges,
    pan,
    zoom,
    rootAccount,
    selectedAccountId,
    hoveredNode,
    highlightedEdgeId,
    maxHopFilter
  ]);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    // Check if clicked a node
    for (const node of activeNodes) {
      const pos = positionsRef.current.get(node.id);
      if (pos) {
        const dx = mouseX - pos.x;
        const dy = mouseY - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) <= 24) {
          setDraggedNode(node);
          onSelectAccount(node.id);
          setInspectedNode(node);
          return;
        }
      }
    }

    // Otherwise pan the canvas
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    if (draggedNode) {
      const pos = positionsRef.current.get(draggedNode.id);
      if (pos) {
        pos.x = mouseX;
        pos.y = mouseY;
      }
      return;
    }

    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      return;
    }

    // Hover detection
    let found: GraphNode | null = null;
    for (const node of activeNodes) {
      const pos = positionsRef.current.get(node.id);
      if (pos) {
        const dx = mouseX - pos.x;
        const dy = mouseY - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) <= 24) {
          found = node;
          break;
        }
      }
    }
    setHoveredNode(found);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(Math.max(0.4, z + delta), 2.5));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const exportGraphImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `TraceMind-Syndicate-${rootAccount}.png`;
    a.click();
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "670px",
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-card)"
      }}
    >
      {/* ========================================================
          TOP-MIDDLE FORENSIC SEARCH TAB
          Accepts: Transaction ID, Sender Account, Receiver Account
         ======================================================== */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 40,
          width: "min(480px, 90%)",
          pointerEvents: "auto"
        }}
      >
        <div
          className="glass-panel"
          style={{
            position: "relative",
            border: "1px solid rgba(6, 182, 212, 0.4)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(6, 182, 212, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "8px 10px"
          }}
        >
          {/* 3 Dedicated Inquiry Buttons (TXN ID, Sender A/C, Receiver A/C) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "8px" }}>
            <button
              type="button"
              onClick={() => {
                setSearchCategory("TXN");
                setSearchQuery("TXN000001");
                setShowSearchDropdown(true);
              }}
              style={{
                padding: "4px 6px",
                fontSize: "0.72rem",
                fontWeight: 700,
                borderRadius: "4px",
                border: searchCategory === "TXN" ? "1.5px solid #00f0ff" : "1px solid rgba(255, 255, 255, 0.1)",
                background: searchCategory === "TXN" ? "rgba(0, 240, 255, 0.2)" : "rgba(255, 255, 255, 0.04)",
                color: searchCategory === "TXN" ? "#00f0ff" : "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px"
              }}
              title="Search by Transaction ID"
            >
              <span>TXN ID</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchCategory("SENDER");
                setSearchQuery("900000000001");
                setShowSearchDropdown(true);
              }}
              style={{
                padding: "4px 6px",
                fontSize: "0.72rem",
                fontWeight: 700,
                borderRadius: "4px",
                border: searchCategory === "SENDER" ? "1.5px solid #f59e0b" : "1px solid rgba(255, 255, 255, 0.1)",
                background: searchCategory === "SENDER" ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.04)",
                color: searchCategory === "SENDER" ? "#f59e0b" : "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px"
              }}
              title="Search by Sender Account Number"
            >
              <span>Sender A/C</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchCategory("RECEIVER");
                setSearchQuery("100000000007");
                setShowSearchDropdown(true);
              }}
              style={{
                padding: "4px 6px",
                fontSize: "0.72rem",
                fontWeight: 700,
                borderRadius: "4px",
                border: searchCategory === "RECEIVER" ? "1.5px solid #a855f7" : "1px solid rgba(255, 255, 255, 0.1)",
                background: searchCategory === "RECEIVER" ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 255, 255, 0.04)",
                color: searchCategory === "RECEIVER" ? "#a855f7" : "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px"
              }}
              title="Search by Receiver Account Number"
            >
              <span>Receiver A/C</span>
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", padding: "4px 10px", background: "rgba(0, 0, 0, 0.35)", borderRadius: "4px" }}>
            <Search size={15} color="var(--accent-cyan)" style={{ flexShrink: 0, marginRight: "8px" }} />
            <input
              type="text"
              className="cyber-input font-mono"
              placeholder={
                searchCategory === "TXN"
                  ? "Enter Transaction ID (e.g. TXN000001)..."
                  : searchCategory === "SENDER"
                  ? "Enter Sender Account (e.g. 900000000001)..."
                  : "Enter Receiver Account (e.g. 100000000007)..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              style={{
                background: "transparent",
                border: "none",
                boxShadow: "none",
                padding: "6px 0",
                fontSize: "0.82rem",
                color: "#ffffff",
                width: "100%"
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchDropdown(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div
              className="glass-panel-elevated"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                maxHeight: "320px",
                overflowY: "auto",
                border: "1px solid rgba(6, 182, 212, 0.35)",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div
                style={{
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-heading)",
                  color: "var(--accent-cyan)",
                  padding: "4px 8px",
                  borderBottom: "1px solid var(--border-subtle)",
                  letterSpacing: "0.05em"
                }}
              >
                SEARCH RESULTS ({searchResults.length} MATCHES)
              </div>

              {searchResults.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => handleSelectSearchResult(item)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.03)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(6, 182, 212, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <span
                      className={`cyber-badge ${
                        item.type === "TXN"
                          ? "cyber-badge-cyan"
                          : item.type === "SENDER"
                          ? "cyber-badge-amber"
                          : "cyber-badge-purple"
                      }`}
                      style={{ fontSize: "0.62rem", padding: "2px 6px" }}
                    >
                      {item.type}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#ffffff",
                          fontFamily: "var(--font-mono)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {item.title}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={14} color="#06b6d4" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Floating Control Bar */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          right: "16px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pointerEvents: "none"
        }}
      >
        {/* Left: Syndicate Stats & Hop Filter */}
        <div
          className="glass-panel"
          style={{
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            pointerEvents: "auto",
            border: "1px solid rgba(6, 182, 212, 0.3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Crosshair size={15} color="#06b6d4" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              ROOT: {rootAccount}
            </span>
          </div>

          <div style={{ height: "16px", width: "1px", background: "var(--border-subtle)" }} />

          {/* Hop Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
              MAX HOPS:
            </span>
            {[1, 2, 3].map((h) => (
              <button
                key={h}
                onClick={() => setMaxHopFilter(h)}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: maxHopFilter === h ? "1px solid #06b6d4" : "1px solid var(--border-subtle)",
                  background: maxHopFilter === h ? "rgba(6, 182, 212, 0.25)" : "rgba(255, 255, 255, 0.05)",
                  color: maxHopFilter === h ? "#22d3ee" : "var(--text-secondary)"
                }}
              >
                {h}
              </button>
            ))}
          </div>

          <div style={{ height: "16px", width: "1px", background: "var(--border-subtle)" }} />

          {/* Payment Rail Filter */}
          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            style={{
              background: "rgba(12, 18, 29, 0.9)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
              padding: "3px 8px",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <option value="ALL">All Payment Rails</option>
            <option value="UPI">UPI Only</option>
            <option value="IMPS">IMPS Only</option>
            <option value="RTGS">RTGS Only</option>
          </select>
        </div>

        {/* Right: Zoom & Export Controls */}
        <div
          className="glass-panel"
          style={{
            padding: "6px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            pointerEvents: "auto"
          }}
        >
          {isolatedRingNodeIds && onClearIsolation && (
            <button
              onClick={onClearIsolation}
              className="btn-cyber cyber-badge-amber"
              style={{ fontSize: "0.72rem", padding: "4px 8px" }}
              title="Clear isolated subgraph view"
            >
              Reset Isolation
            </button>
          )}

          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
            className="btn-secondary"
            style={{ padding: "6px 8px" }}
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
            className="btn-secondary"
            style={{ padding: "6px 8px" }}
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={resetView}
            className="btn-secondary"
            style={{ padding: "6px 8px" }}
            title="Reset Viewport"
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={exportGraphImage}
            className="btn-primary"
            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
            title="Export High-Res Graph PNG"
          >
            <Download size={14} />
            Export PNG
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={670}
        style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* ========================================================
          INTERACTIVE NODE FORENSIC INSPECTOR CARD
          Contains: Victim Complainant Dossier / Mule Analysis
         ======================================================== */}
      {inspectedNode && (
        <div
          className="glass-panel-elevated"
          style={{
            position: "absolute",
            top: "80px",
            right: "16px",
            width: "385px",
            maxHeight: "560px",
            overflowY: "auto",
            zIndex: 25,
            padding: "16px",
            border: "1.5px solid rgba(6, 182, 212, 0.4)",
            boxShadow: "0 12px 45px rgba(0, 0, 0, 0.85), 0 0 25px rgba(6, 182, 212, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                {inspectedNode.id === rootAccount || inspectedNode.role === "ORIGIN" ? (
                  <span className="cyber-badge cyber-badge-cyan" style={{ border: "1.5px solid #06b6d4" }}>
                    <ShieldCheck size={13} />
                    COMPLAINANT • BONAFIDE VICTIM
                  </span>
                ) : (
                  <span
                    className={`cyber-badge ${
                      inspectedNode.hop === 1
                        ? "cyber-badge-amber"
                        : inspectedNode.hop === 2
                        ? "cyber-badge-purple"
                        : "cyber-badge-crimson"
                    }`}
                  >
                    {inspectedNode.tierName || "MULE NODE"}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "#ffffff",
                  letterSpacing: "0.02em"
                }}
              >
                ACC #{inspectedNode.id}
              </div>
            </div>

            <button
              onClick={() => setInspectedNode(null)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* ========================================================
              CASE A: VICTIM COMPLAINANT NODE DOSSIER (ALL DETAILS ALIGNED)
             ======================================================== */}
          {inspectedNode.id === rootAccount || inspectedNode.role === "ORIGIN" ? (
            (() => {
              const victim = VICTIM_REGISTRY[inspectedNode.id] || {
                name: "Ramesh Sharma",
                scheme: "Digital Arrest / Fake CBI Extortion",
                amount: 450000,
                bank: inspectedNode.bankName || "HDFC Bank Ltd.",
                ifsc: inspectedNode.ifsc || "HDFC0005678",
                branch: "Vijay Nagar Branch, Indore",
                location: inspectedNode.ipLocation || "Indore, Madhya Pradesh, India",
                ip: inspectedNode.ipAddress || "103.45.12.8",
                isp: "Bharti Airtel Broadband",
                device: inspectedNode.deviceType || "Samsung Galaxy S22 (Android 14)",
                reportedAt: "2026-10-02 09:14:22 IST",
                firNumber: "FIR #MP-IND-2026/842"
              };

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Complainant Identity Box */}
                  <div
                    style={{
                      background: "rgba(6, 182, 212, 0.06)",
                      border: "1px solid rgba(6, 182, 212, 0.25)",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 12px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="font-display" style={{ fontSize: "0.88rem", fontWeight: 700, color: "#ffffff" }}>
                        {victim.name}
                      </span>
                      <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: "0.68rem" }}>
                        {victim.firNumber}
                      </span>
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.74rem", marginTop: "4px" }}>
                      <span style={{ color: "var(--accent-amber)", fontWeight: 600 }}>Fraud Scheme:</span> {victim.scheme}
                    </div>
                  </div>

                  {/* Disputed Crime Loss Hero Card */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(12, 18, 30, 0.95) 100%)",
                      border: "1.5px solid rgba(6, 182, 212, 0.5)",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px",
                      textAlign: "center"
                    }}
                  >
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", fontFamily: "var(--font-heading)" }}>
                      TOTAL COMPLAINANT DISPUTED LOSS
                    </div>
                    <div className="victim-hero-amount" style={{ margin: "4px 0" }}>
                      ₹{victim.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                      <Clock size={11} color="var(--accent-cyan)" /> Reported: {victim.reportedAt}
                    </div>
                  </div>

                  {/* Banking Details Symmetrical Grid */}
                  <div>
                    <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-heading)", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 700 }}>
                      COMPLAINANT BANKING RECORDS
                    </div>
                    <div className="victim-grid-symmetrical">
                      <div className="victim-stat-cell">
                        <span className="label">Bank Name</span>
                        <span className="value">{victim.bank}</span>
                      </div>
                      <div className="victim-stat-cell">
                        <span className="label">IFSC Code</span>
                        <span className="value" style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                          {victim.ifsc}
                        </span>
                      </div>
                      <div className="victim-stat-cell">
                        <span className="label">Account Number</span>
                        <span className="value" style={{ fontFamily: "var(--font-mono)" }}>
                          {inspectedNode.id}
                        </span>
                      </div>
                      <div className="victim-stat-cell">
                        <span className="label">Branch Name</span>
                        <span className="value" style={{ fontSize: "0.78rem" }}>
                          {victim.branch}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Geo-Location & Technical Fingerprint Grid */}
                  <div>
                    <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-heading)", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 700 }}>
                      LOCATION & IP FORENSIC DETAILS
                    </div>
                    <div className="victim-grid-symmetrical">
                      <div className="victim-stat-cell">
                        <span className="label"><MapPin size={10} style={{ display: "inline", marginRight: "3px" }} /> IP Location</span>
                        <span className="value">{victim.location}</span>
                      </div>
                      <div className="victim-stat-cell">
                        <span className="label">IP Address</span>
                        <span className="value" style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                          {victim.ip}
                        </span>
                      </div>
                      <div className="victim-stat-cell">
                        <span className="label">Telecom ISP</span>
                        <span className="value" style={{ fontSize: "0.76rem" }}>{victim.isp}</span>
                      </div>
                      <div className="victim-stat-cell">
                        <span className="label">Device Platform</span>
                        <span className="value" style={{ fontSize: "0.76rem" }}>{victim.device}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interconnected Downstream Syndicate Links */}
                  {(() => {
                    const outEdges = edges.filter((e) => e.source === inspectedNode.id);
                    const downstreamPeers = Array.from(new Set(outEdges.map((e) => e.target)));
                    return (
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "10px"
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.68rem",
                            fontFamily: "var(--font-heading)",
                            color: "var(--text-muted)",
                            marginBottom: "8px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Share2 size={13} style={{ color: "var(--accent-cyan)" }} />
                            INTERCONNECTED MULE RECIPIENTS (LAYER 1)
                          </div>
                          <span style={{ fontSize: "0.68rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                            {downstreamPeers.length} RECIPIENTS
                          </span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {downstreamPeers.slice(0, 10).map((peerAcc) => (
                            <button
                              key={peerAcc}
                              onClick={() => {
                                onSelectAccount(peerAcc);
                                centerOnNode(peerAcc);
                              }}
                              className="btn-secondary"
                              style={{
                                padding: "3px 8px",
                                fontSize: "0.72rem",
                                fontFamily: "var(--font-mono)",
                                background: "rgba(245, 158, 11, 0.12)",
                                border: "1px solid rgba(245, 158, 11, 0.35)",
                                color: "#fbbf24",
                                cursor: "pointer",
                                borderRadius: "4px"
                              }}
                              title={`Inspect L1 Mule ${peerAcc}`}
                            >
                              → Acc {peerAcc}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Legal Protection Status - Exempt from Section 91 Freezing */}
                  <div className="victim-protected-badge">
                    <Lock size={15} style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 800 }}>PROTECTED COMPLAINANT ACCOUNT</div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 400, opacity: 0.9, marginTop: "2px" }}>
                        Section 91 BNSS / CrPC Freezing Requisitions are prohibited on this complainant account. Statutory freezing is restricted to high-risk downstream money mules.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            /* ========================================================
               CASE B: MULE ACCOUNT DOSSIER (L1, L2, L3)
               Section 91 Freezing ONLY for High-Risk Rate (MRI >= 70)
               ======================================================== */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* 0-100 Mule Risk Index Bar */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-heading)" }}>
                    MULE RISK INDEX (MRI)
                  </span>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-heading)",
                      color:
                        (inspectedNode.muleRiskScore || 0) >= 80
                          ? "#ef4444"
                          : (inspectedNode.muleRiskScore || 0) >= 60
                          ? "#f59e0b"
                          : "#10b981"
                    }}
                  >
                    {inspectedNode.muleRiskScore || 75} / 100 [{inspectedNode.riskSeverity || "HIGH"}]
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "3px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${inspectedNode.muleRiskScore || 75}%`,
                      background:
                        (inspectedNode.muleRiskScore || 0) >= 80
                          ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                          : (inspectedNode.muleRiskScore || 0) >= 60
                          ? "linear-gradient(90deg, #10b981, #f59e0b)"
                          : "#10b981"
                    }}
                  />
                </div>
              </div>

              {/* Symmetrical Banking Details Grid */}
              <div className="victim-grid-symmetrical">
                <div className="victim-stat-cell">
                  <span className="label">Bank Name</span>
                  <span className="value">{inspectedNode.bankName || "State Bank of India"}</span>
                </div>
                <div className="victim-stat-cell">
                  <span className="label">IFSC Code</span>
                  <span className="value" style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                    {inspectedNode.ifsc || "SBIN0001244"}
                  </span>
                </div>
              </div>

              {/* Location Based on IP Address */}
              <div className="victim-stat-cell">
                <span className="label"><MapPin size={11} style={{ display: "inline", marginRight: "3px" }} /> IP Geo-Location & Device</span>
                <span className="value">{inspectedNode.ipLocation || "Indore, Madhya Pradesh, India"}</span>
                <span className="sub">
                  IP: {inspectedNode.ipAddress || "103.45.12.8"} • Agent: {inspectedNode.deviceType || "Android 13"}
                </span>
              </div>

              {/* Amount Inflow / Outflow */}
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
                    ₹{(inspectedNode.totalInflow || 450000).toLocaleString()}
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
                    ₹{(inspectedNode.totalOutflow || 420000).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* STAGE 4: TERMINAL CASH-OUT CHANNEL SPECIFICATION */}
              {(inspectedNode.role === "TERMINAL_L3" || inspectedNode.role === "DESTINATION_L4" || (inspectedNode.hop && inspectedNode.hop >= 3) || inspectedNode.terminalForm) && (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%)",
                    border: "1.5px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "var(--radius-sm)",
                    padding: "11px 13px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.72rem", color: "#f87171", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                      STAGE 4: TERMINAL CASH-OUT CHANNEL
                    </span>
                    <span className="cyber-badge cyber-badge-crimson" style={{ fontSize: "0.68rem" }}>
                      {inspectedNode.terminalForm?.icon || "🏧"} {inspectedNode.terminalForm?.form || "ATM / CRYPTO"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", marginBottom: "3px" }}>
                    {inspectedNode.terminalForm?.label || "ATM / P2P Terminal Cash Dispersion"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.35, marginBottom: "8px" }}>
                    {inspectedNode.terminalForm?.description || "Final cash-out dispersion terminal where stolen money exits formal domestic banking rails into physical cash, crypto, or overseas hawala."}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#38bdf8", fontFamily: "var(--font-mono)", background: "rgba(0, 0, 0, 0.35)", padding: "5px 8px", borderRadius: "4px" }}>
                    📍 Channel Location / Desk: {inspectedNode.terminalForm?.locationOrExchange || "ATM Fleet Cluster #18 (NCR / Mumbai)"}
                  </div>
                </div>
              )}

              {/* Interconnected Syndicate Links & Peer Accounts */}
              {(() => {
                const connectedInflow = edges.filter((e) => e.target === inspectedNode.id);
                const connectedOutflow = edges.filter((e) => e.source === inspectedNode.id);
                const inflowPeers = Array.from(new Set(connectedInflow.map((e) => e.source)));
                const outflowPeers = Array.from(new Set(connectedOutflow.map((e) => e.target)));

                return (
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.68rem",
                        fontFamily: "var(--font-heading)",
                        color: "var(--text-muted)",
                        marginBottom: "8px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Share2 size={13} style={{ color: "var(--accent-cyan)" }} />
                        INTERCONNECTED SYNDICATE LINKS & PEERS
                      </div>
                      <span style={{ fontSize: "0.68rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                        {connectedInflow.length + connectedOutflow.length} EDGES
                      </span>
                    </div>

                    {/* Inflow Sources */}
                    {inflowPeers.length > 0 && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "0.65rem", color: "#34d399", fontWeight: 700, marginBottom: "4px" }}>
                          ← INFLOW SOURCES ({inflowPeers.length}):
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                          {inflowPeers.slice(0, 8).map((peerAcc) => (
                            <button
                              key={peerAcc}
                              onClick={() => {
                                onSelectAccount(peerAcc);
                                centerOnNode(peerAcc);
                              }}
                              className="btn-secondary"
                              style={{
                                padding: "2px 6px",
                                fontSize: "0.68rem",
                                fontFamily: "var(--font-mono)",
                                background: "rgba(16, 185, 129, 0.12)",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                color: "#34d399",
                                cursor: "pointer",
                                borderRadius: "4px"
                              }}
                              title={`Inspect source account ${peerAcc}`}
                            >
                              ← {peerAcc}
                            </button>
                          ))}
                          {inflowPeers.length > 8 && (
                            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", alignSelf: "center" }}>
                              +{inflowPeers.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Outflow Targets */}
                    {outflowPeers.length > 0 && (
                      <div>
                        <div style={{ fontSize: "0.65rem", color: "#f87171", fontWeight: 700, marginBottom: "4px" }}>
                          → OUTFLOW TARGETS ({outflowPeers.length}):
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                          {outflowPeers.slice(0, 8).map((peerAcc) => (
                            <button
                              key={peerAcc}
                              onClick={() => {
                                onSelectAccount(peerAcc);
                                centerOnNode(peerAcc);
                              }}
                              className="btn-secondary"
                              style={{
                                padding: "2px 6px",
                                fontSize: "0.68rem",
                                fontFamily: "var(--font-mono)",
                                background: "rgba(239, 68, 68, 0.12)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#f87171",
                                cursor: "pointer",
                                borderRadius: "4px"
                              }}
                              title={`Inspect target account ${peerAcc}`}
                            >
                              → {peerAcc}
                            </button>
                          ))}
                          {outflowPeers.length > 8 && (
                            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", alignSelf: "center" }}>
                              +{outflowPeers.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Disputed Transactions */}
              {inspectedNode.transactions && inspectedNode.transactions.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      fontFamily: "var(--font-heading)",
                      color: "var(--text-muted)",
                      marginBottom: "6px",
                      fontWeight: 700
                    }}
                  >
                    DISPUTED TRANSACTIONS ({inspectedNode.transactions.length})
                  </div>
                  <div
                    style={{
                      maxHeight: "120px",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}
                  >
                    {inspectedNode.transactions.map((tx: any, i: number) => (
                      <div
                        key={i}
                        onClick={() => {
                          setHighlightedEdgeId(tx.transaction_id);
                          setTimeout(() => setHighlightedEdgeId(null), 8000);
                        }}
                        style={{
                          background: "rgba(0, 0, 0, 0.3)",
                          border: "1px solid var(--border-subtle)",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer"
                        }}
                        title="Click to illuminate transaction edge on graph"
                      >
                        <div>
                          <div style={{ fontFamily: "var(--font-mono)", color: "#22d3ee", fontWeight: 600 }}>
                            {tx.transaction_id}
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>
                            {tx.payment_mode} • {String(tx.timestamp).substring(0, 16)}
                          </div>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#ffffff" }}>
                          ₹{Number(tx.amount).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Bottom Floating Temporal Playback Scrubber Bar */}
      <div
        className="glass-panel-elevated"
        style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          right: "16px",
          zIndex: 10,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "18px",
          border: "1px solid rgba(6, 182, 212, 0.25)"
        }}
      >
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="btn-primary"
          style={{ width: "36px", height: "36px", borderRadius: "50%", padding: 0 }}
          title={isPlaying ? "Pause Timeline" : "Play Timeline Propagation"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: "2px" }} />}
        </button>

        <button
          onClick={() => {
            setCurrentTimeIndex(0);
            setIsPlaying(false);
          }}
          className="btn-secondary"
          style={{ width: "32px", height: "32px", borderRadius: "50%", padding: 0 }}
          title="Restart Scrubber to T=0"
        >
          <RotateCcw size={14} />
        </button>

        {/* Speed Toggle */}
        <button
          onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : s === 2 ? 5 : 1))}
          className="btn-secondary"
          style={{ fontSize: "0.72rem", padding: "4px 8px", minWidth: "40px" }}
          title="Toggle Playback Speed"
        >
          {playbackSpeed}x
        </button>

        {/* Timeline Range Slider */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
            <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              ⏱️ 15-DAY INVESTIGATION TIMELINE
            </span>
            <span style={{ color: "#22d3ee", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
              {activeEdges.length} / {sortedEdges.length} TRANSACTIONS SHOWN ({currentTimeIndex}%)
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={100}
            value={currentTimeIndex}
            onChange={(e) => setCurrentTimeIndex(Number(e.target.value))}
            style={{
              width: "100%",
              height: "6px",
              accentColor: "#06b6d4",
              cursor: "pointer"
            }}
          />
        </div>

        {/* Tier Legend with Distinct Layer Colors */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "0.72rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#00f0ff", boxShadow: "0 0 6px #00f0ff" }} />
            <span style={{ fontFamily: "var(--font-heading)", color: "#00f0ff", fontWeight: 700 }}>LAYER 0: VICTIM</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 6px #f59e0b" }} />
            <span style={{ fontFamily: "var(--font-heading)", color: "#f59e0b", fontWeight: 700 }}>LAYER 1: COLLECTOR</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 6px #a855f7" }} />
            <span style={{ fontFamily: "var(--font-heading)", color: "#a855f7", fontWeight: 700 }}>LAYER 2: DISTRIBUTOR</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px #ef4444" }} />
            <span style={{ fontFamily: "var(--font-heading)", color: "#ef4444", fontWeight: 700 }}>LAYER 3: TERMINAL CASHOUT</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            <span style={{ fontFamily: "var(--font-heading)", color: "#10b981", fontWeight: 700 }}>LAYER 4: TERMINAL DESTINATION</span>
          </div>
        </div>
      </div>
    </div>
  );
};
