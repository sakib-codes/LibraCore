"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Network,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Info,
  Sparkles,
  Share2,
  Layers,
  ChevronRight,
  X,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CitationNode,
  CitationEdge,
  CitationGraphData,
  fetchCitationGraphData,
  DISCIPLINE_PALETTE,
} from "@/lib/citation-graph";
import { cn } from "@/lib/utils";

interface CitationGraphViewProps {
  initialFocusId?: string;
}

export function CitationGraphView({ initialFocusId }: CitationGraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Graph Data State
  const [data, setData] = useState<CitationGraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Interactive Viewport State (Pan & Zoom)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.95 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<CitationNode | null>(null);

  // Selection & Hover State
  const [selectedNode, setSelectedNode] = useState<CitationNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<CitationNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Filter & Control State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [minCitations, setMinCitations] = useState<number>(0);
  const [isPhysicsRunning, setIsPhysicsRunning] = useState(true);
  const [filterLibraryOnly, setFilterLibraryOnly] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Nodes & Edges references for physics loop
  const nodesRef = useRef<CitationNode[]>([]);
  const edgesRef = useRef<CitationEdge[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Load Graph Data
  useEffect(() => {
    let mounted = true;
    async function loadGraph() {
      setIsLoading(true);
      const graphData = await fetchCitationGraphData(initialFocusId);
      if (mounted) {
        // Initialize circular or randomized starting positions
        const width = 1200;
        const height = 800;
        const total = graphData.nodes.length;

        graphData.nodes.forEach((node, i) => {
          const angle = (i / total) * 2 * Math.PI;
          const radiusDist = 260 + (i % 3) * 80;
          node.x = width / 2 + Math.cos(angle) * radiusDist;
          node.y = height / 2 + Math.sin(angle) * radiusDist;
          node.vx = (Math.random() - 0.5) * 1.5;
          node.vy = (Math.random() - 0.5) * 1.5;
          node.radius = Math.max(18, Math.min(36, 14 + Math.sqrt(node.inCitations) * 2.4));
        });

        nodesRef.current = graphData.nodes;
        edgesRef.current = graphData.edges;
        setData(graphData);
        setIsLoading(false);

        if (initialFocusId) {
          const target = graphData.nodes.find((n) => n.id === initialFocusId);
          if (target) {
            setSelectedNode(target);
          }
        }
      }
    }
    loadGraph();
    return () => {
      mounted = false;
    };
  }, [initialFocusId]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Center Graph View on Specific Node
  const focusOnNode = useCallback((node: CitationNode) => {
    if (!canvasRef.current || !node.x || !node.y) return;
    const canvas = canvasRef.current;
    const targetScale = 1.25;
    const centerX = canvas.width / (2 * (window.devicePixelRatio || 1));
    const centerY = canvas.height / (2 * (window.devicePixelRatio || 1));
    setTransform({
      x: centerX - node.x * targetScale,
      y: centerY - node.y * targetScale,
      scale: targetScale,
    });
    setSelectedNode(node);
  }, []);

  // Reset View to fit all nodes
  const resetView = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    setTransform({
      x: width / 2 - 600 * 0.85,
      y: height / 2 - 400 * 0.85,
      scale: 0.85,
    });
  }, []);

  // Physics Simulation Step
  const stepPhysics = useCallback(() => {
    if (!isPhysicsRunning) return;
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    if (nodes.length === 0) return;

    const centerX = 600;
    const centerY = 400;
    const damping = 0.88;
    const repulsionStrength = 2200;
    const springLength = 170;
    const springK = 0.0035;

    // 1. Repulsion between all pairs of nodes (Coulomb)
    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];
      if (!n1.x || !n1.y) continue;

      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        if (!n2.x || !n2.y) continue;

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);

        if (dist < 450) {
          const force = repulsionStrength / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (draggedNode?.id !== n1.id) {
            n1.vx = (n1.vx || 0) - fx;
            n1.vy = (n1.vy || 0) - fy;
          }
          if (draggedNode?.id !== n2.id) {
            n2.vx = (n2.vx || 0) + fx;
            n2.vy = (n2.vy || 0) + fy;
          }
        }
      }

      // Center Gravity to keep disconnected components clustered
      const cDx = centerX - n1.x;
      const cDy = centerY - n1.y;
      if (draggedNode?.id !== n1.id) {
        n1.vx = (n1.vx || 0) + cDx * 0.0006;
        n1.vy = (n1.vy || 0) + cDy * 0.0006;
      }
    }

    // 2. Attraction along edges (Hooke's Spring)
    for (const edge of edges) {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (!source || !target || !source.x || !source.y || !target.x || !target.y) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const displacement = dist - springLength;
      const force = displacement * springK * edge.weight;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (draggedNode?.id !== source.id) {
        source.vx = (source.vx || 0) + fx;
        source.vy = (source.vy || 0) + fy;
      }
      if (draggedNode?.id !== target.id) {
        target.vx = (target.vx || 0) - fx;
        target.vy = (target.vy || 0) - fy;
      }
    }

    // 3. Update positions with velocity damping
    for (const n of nodes) {
      if (draggedNode?.id === n.id) continue;
      n.vx = (n.vx || 0) * damping;
      n.vy = (n.vy || 0) * damping;

      n.x = (n.x || 0) + (n.vx || 0);
      n.y = (n.y || 0) + (n.vy || 0);
    }
  }, [isPhysicsRunning, draggedNode]);

  // Render Loop on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      stepPhysics();

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(dpr, dpr);

      // Apply Pan & Zoom Transform
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Filter Nodes
      const isNodeVisible = (node: CitationNode) => {
        if (selectedDiscipline !== "all" && node.discipline !== selectedDiscipline) return false;
        if (node.inCitations < minCitations) return false;
        if (filterLibraryOnly && !node.isLibraryBook) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = node.title.toLowerCase().includes(q);
          const matchAuthor = node.author.toLowerCase().includes(q);
          const matchConcept = node.topConcepts.some((c) => c.toLowerCase().includes(q));
          if (!matchTitle && !matchAuthor && !matchConcept) return false;
        }
        return true;
      };

      // Set of highlighted IDs when a node is hovered or selected
      const activeFocus = hoveredNode || selectedNode;
      const connectedNodeIds = new Set<string>();
      if (activeFocus) {
        connectedNodeIds.add(activeFocus.id);
        edges.forEach((edge) => {
          if (edge.source === activeFocus.id) connectedNodeIds.add(edge.target);
          if (edge.target === activeFocus.id) connectedNodeIds.add(edge.source);
        });
      }

      // Draw Edges (Citation Links)
      edges.forEach((edge) => {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target || !source.x || !source.y || !target.x || !target.y) return;

        const isSourceVisible = isNodeVisible(source);
        const isTargetVisible = isNodeVisible(target);
        if (!isSourceVisible || !isTargetVisible) return;

        const isConnectedToFocus =
          activeFocus && (edge.source === activeFocus.id || edge.target === activeFocus.id);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (activeFocus) {
          if (isConnectedToFocus) {
            ctx.strokeStyle = edge.source === activeFocus.id ? "#818cf8" : "#38bdf8";
            ctx.lineWidth = Math.max(2.5, edge.weight * 1.5);
            ctx.globalAlpha = 0.95;
          } else {
            ctx.strokeStyle = "rgba(100, 116, 139, 0.15)";
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.15;
          }
        } else {
          ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
          ctx.lineWidth = edge.weight >= 3 ? 2 : 1.2;
          ctx.globalAlpha = 0.6;
        }

        ctx.stroke();

        // Draw directional citation arrow
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 30) {
          const targetRadius = target.radius || 20;
          const arrowX = target.x - (dx / dist) * (targetRadius + 6);
          const arrowY = target.y - (dy / dist) * (targetRadius + 6);
          const angle = Math.atan2(dy, dx);

          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - 8 * Math.cos(angle - Math.PI / 6),
            arrowY - 8 * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            arrowX - 8 * Math.cos(angle + Math.PI / 6),
            arrowY - 8 * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fill();
        }
      });

      // Draw Nodes (Monographs & Reference Papers)
      nodes.forEach((node) => {
        if (!node.x || !node.y) return;
        const visible = isNodeVisible(node);
        if (!visible) return;

        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isConnected = connectedNodeIds.has(node.id);
        const radius = node.radius || 22;

        ctx.save();

        // Node Opacity
        if (activeFocus && !isConnected) {
          ctx.globalAlpha = 0.2;
        } else {
          ctx.globalAlpha = 1;
        }

        // Selection / Focus Halo Ring
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 7, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? "rgba(129, 140, 248, 0.25)" : "rgba(56, 189, 248, 0.2)";
          ctx.fill();

          ctx.lineWidth = 2;
          ctx.strokeStyle = isSelected ? "#818cf8" : "#38bdf8";
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Library Book Outer Accent Ring
        if (node.isLibraryBook) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 3, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(129, 140, 248, 0.7)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.disciplineColor || "#818cf8";
        ctx.fill();

        ctx.strokeStyle = node.isLibraryBook ? "#ffffff" : "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = node.isLibraryBook ? 2 : 1;
        ctx.stroke();

        // Node Icon / Citation count inside circle
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(node.inCitations), node.x, node.y);

        // Monograph Title Label below node
        const showLabel =
          transform.scale > 0.75 || isSelected || isHovered || isConnected || node.inCitations > 25;

        if (showLabel) {
          ctx.font = isSelected || isHovered ? "600 12px system-ui" : "500 11px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";

          const label =
            node.title.length > 28 ? node.title.substring(0, 26) + "…" : node.title;

          // Label Background Pill
          const textMetrics = ctx.measureText(label);
          const pillWidth = textMetrics.width + 12;
          const pillHeight = 18;
          const pillX = node.x - pillWidth / 2;
          const pillY = node.y + radius + 5;

          ctx.fillStyle = "rgba(18, 22, 32, 0.85)";
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 4);
          ctx.fill();

          ctx.strokeStyle = isSelected ? "#818cf8" : "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = isSelected ? "#a5b4fc" : "#e2e8f0";
          ctx.fillText(label, node.x, pillY + 3);
        }

        ctx.restore();
      });

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    transform,
    stepPhysics,
    selectedNode,
    hoveredNode,
    selectedDiscipline,
    minCitations,
    filterLibraryOnly,
    searchQuery,
  ]);

  // Resize Canvas to fit container with high-DPI scaling
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Convert screen coordinates to canvas world coordinates
  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      return {
        x: (screenX - transform.x) / transform.scale,
        y: (screenY - transform.y) / transform.scale,
      };
    },
    [transform]
  );

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    const nodes = nodesRef.current;

    // Check if clicked on a node
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (!node.x || !node.y) continue;
      const dx = worldPos.x - node.x;
      const dy = worldPos.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= (node.radius || 22) + 6) {
        setDraggedNode(node);
        setSelectedNode(node);
        return;
      }
    }

    // Otherwise pan canvas
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNode) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      draggedNode.x = worldPos.x;
      draggedNode.y = worldPos.y;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
      return;
    }

    if (isDragging) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
      return;
    }

    // Check hover
    const worldPos = screenToWorld(e.clientX, e.clientY);
    const nodes = nodesRef.current;
    let found: CitationNode | null = null;

    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (!node.x || !node.y) continue;
      const dx = worldPos.x - node.x;
      const dy = worldPos.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= (node.radius || 22) + 6) {
        found = node;
        break;
      }
    }

    setHoveredNode(found);
    if (found) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    } else {
      setTooltipPos(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.35, Math.min(2.8, transform.scale * zoomFactor));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom centered on pointer
    const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
    const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

    setTransform({
      x: newX,
      y: newY,
      scale: newScale,
    });
  };

  // Find incoming and outgoing citations for selected node
  const incomingCitations = selectedNode && data
    ? data.edges
        .filter((e) => e.target === selectedNode.id)
        .map((e) => ({
          edge: e,
          node: data.nodes.find((n) => n.id === e.source),
        }))
        .filter((item): item is { edge: CitationEdge; node: CitationNode } => Boolean(item.node))
    : [];

  const outgoingCitations = selectedNode && data
    ? data.edges
        .filter((e) => e.source === selectedNode.id)
        .map((e) => ({
          edge: e,
          node: data.nodes.find((n) => n.id === e.target),
        }))
        .filter((item): item is { edge: CitationEdge; node: CitationNode } => Boolean(item.node))
    : [];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col w-full bg-slate-950/60 dark:bg-[#121620] border border-border/70 rounded-2xl overflow-hidden shadow-2xl transition-all",
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen" : "h-[860px]"
      )}
    >
      {/* Top Header & Metrics Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border/80 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-sm">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Citation Network & Knowledge Graph
              </h2>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/25">
                Live Topology
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Mapping cross-monograph citations, foundational predecessors, and disciplinary clusters
            </p>
          </div>
        </div>

        {/* Global Topology Summary Chips */}
        {data && (
          <div className="hidden md:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border/60">
              <span className="text-muted-foreground">Monographs:</span>
              <span className="font-semibold text-foreground">{data.metrics.totalNodes}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border/60">
              <span className="text-muted-foreground">Directed Citations:</span>
              <span className="font-semibold text-primary">{data.metrics.totalEdges}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border/60">
              <span className="text-muted-foreground">In Library:</span>
              <span className="font-semibold text-emerald-400">{data.metrics.libraryBookCount}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs"
            onClick={() => setIsPhysicsRunning((prev) => !prev)}
            title={isPhysicsRunning ? "Pause Physics Simulation" : "Resume Physics Simulation"}
          >
            {isPhysicsRunning ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isPhysicsRunning ? "Pause" : "Play"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs"
            onClick={resetView}
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Fit View</span>
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Graph"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Sub-Toolbar: Search, Discipline Filter, Min Citations Slider */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 border-b border-border/60 bg-muted/30 backdrop-blur-sm z-10 text-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, author, concept…"
            className="h-8 pl-8 text-xs bg-background/70 border-border/70 rounded-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Discipline Cluster Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none max-w-full">
          <button
            onClick={() => setSelectedDiscipline("all")}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap",
              selectedDiscipline === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            All Fields
          </button>
          {data?.disciplines.map((disc) => (
            <button
              key={disc.id}
              onClick={() => setSelectedDiscipline(disc.id === selectedDiscipline ? "all" : disc.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
                selectedDiscipline === disc.id
                  ? "bg-secondary text-foreground border-primary/50 shadow-xs"
                  : "bg-background/50 text-muted-foreground border-border/50 hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: disc.color }}
              />
              <span>{disc.name.replace(" & ", "/")}</span>
              <span className="text-[10px] text-muted-foreground">({disc.count})</span>
            </button>
          ))}
        </div>

        {/* Library Only Toggle & Citation Threshold */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={filterLibraryOnly}
              onChange={(e) => setFilterLibraryOnly(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary/40 h-3.5 w-3.5"
            />
            <span>LibraCore Monographs Only</span>
          </label>
        </div>
      </div>

      {/* Main Canvas & Detail Drawer Area */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Canvas Surface */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing bg-radial from-slate-900/30 via-slate-950/60 to-[#0e121a]"
        />

        {/* Hover Tooltip Overlay */}
        {hoveredNode && tooltipPos && !selectedNode && (
          <div
            className="fixed pointer-events-none z-30 rounded-xl bg-slate-900/95 dark:bg-[#161c28]/95 border border-border/90 px-3.5 py-2.5 shadow-2xl backdrop-blur-md max-w-xs transition-opacity duration-150 animate-in fade-in"
            style={{
              left: `${tooltipPos.x + 14}px`,
              top: `${tooltipPos.y + 14}px`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: hoveredNode.disciplineColor }}
              />
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                {hoveredNode.discipline}
              </span>
            </div>
            <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
              {hoveredNode.title}
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {hoveredNode.author} ({hoveredNode.year})
            </p>
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/60 text-[10px]">
              <span className="text-primary font-semibold">
                {hoveredNode.inCitations} Direct Citations
              </span>
              <span className="text-muted-foreground">
                H-Index: {hoveredNode.hIndexImpact}
              </span>
            </div>
          </div>
        )}

        {/* Floating Zoom Navigation Widget */}
        <div className="absolute left-4 bottom-4 z-20 flex flex-col gap-1 rounded-xl bg-background/85 border border-border/80 p-1.5 shadow-xl backdrop-blur-md">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(2.5, prev.scale * 1.2) }))}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(0.4, prev.scale * 0.8) }))}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={resetView}
            title="Recenter"
          >
            <Compass className="h-4 w-4" />
          </Button>
        </div>

        {/* Monograph Detail & Citation Drawer */}
        {selectedNode && (
          <div className="absolute right-0 top-0 bottom-0 z-20 w-full sm:w-[420px] bg-background/95 border-l border-border/80 p-5 shadow-2xl backdrop-blur-xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedNode.disciplineColor }}
                />
                <Badge variant="outline" className="text-[11px] font-medium border-border/80">
                  {selectedNode.discipline}
                </Badge>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedNode(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Monograph Core Details */}
            <div className="mt-4 space-y-3">
              <h3 className="text-base font-bold text-foreground tracking-tight leading-snug">
                {selectedNode.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{selectedNode.author}</span>
                <span>Published {selectedNode.year}</span>
              </div>

              {/* DOI and Impact Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-center">
                  <div className="text-lg font-bold text-primary">{selectedNode.inCitations}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Citations Received</div>
                </div>
                <div className="rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-center">
                  <div className="text-lg font-bold text-emerald-400">{selectedNode.hIndexImpact}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Impact Score</div>
                </div>
              </div>

              {/* Research Synopsis */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  Research Abstract
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 p-3 rounded-xl border border-border/50">
                  {selectedNode.summary}
                </p>
              </div>

              {/* Top Conceptual Keywords */}
              {selectedNode.topConcepts && selectedNode.topConcepts.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Foundational Concepts
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.topConcepts.map((concept, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] font-normal py-0.5">
                        #{concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* In-Library Deep Link Action */}
              {selectedNode.isLibraryBook ? (
                <div className="pt-2">
                  <Link href={`/books/${selectedNode.id}`} className="block w-full">
                    <Button className="w-full gap-2 text-xs font-medium bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-indigo-600">
                      <BookOpen className="h-3.5 w-3.5" />
                      Open Full Manuscript in Reader
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span>Foundational external landmark reference. Full text cataloged under academic DOI: {selectedNode.doi}</span>
                </div>
              )}

              {/* Connected Academic Citations (Incoming & Outgoing) */}
              <div className="pt-3 border-t border-border/70 space-y-4">
                {/* Outgoing References (Foundations this monograph cites) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
                      Builds Upon ({outgoingCitations.length})
                    </h4>
                    <span className="text-[10px] text-muted-foreground">Predecessors</span>
                  </div>
                  {outgoingCitations.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Pioneering root work; no prior recorded library predecessors.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {outgoingCitations.map(({ edge, node }) => (
                        <div
                          key={edge.id}
                          onClick={() => focusOnNode(node)}
                          className="group cursor-pointer rounded-xl border border-border/60 bg-secondary/30 p-2.5 hover:bg-secondary/70 hover:border-primary/40 transition-all text-xs"
                        >
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {node.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {node.author} ({node.year})
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 italic border-l-2 border-indigo-500/40 pl-2">
                            {edge.context}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Incoming Citations (Works that cite this monograph) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-emerald-400" />
                      Cited By In Library ({incomingCitations.length})
                    </h4>
                    <span className="text-[10px] text-muted-foreground">Descendants</span>
                  </div>
                  {incomingCitations.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Current cutting-edge monograph; incoming citations in review.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {incomingCitations.map(({ edge, node }) => (
                        <div
                          key={edge.id}
                          onClick={() => focusOnNode(node)}
                          className="group cursor-pointer rounded-xl border border-border/60 bg-secondary/30 p-2.5 hover:bg-secondary/70 hover:border-emerald-500/40 transition-all text-xs"
                        >
                          <div className="font-medium text-foreground group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {node.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {node.author} ({node.year})
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 italic border-l-2 border-emerald-500/40 pl-2">
                            {edge.context}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
