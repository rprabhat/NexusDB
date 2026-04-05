import { Component, createEffect, createSignal, onMount, onCleanup } from "solid-js";
import { nodes, edges, activeDb } from "../../stores/app";
import type { NodeDto, EdgeDto } from "../../types";
import "./GraphView.css";

interface GraphNode {
  id: number;
  label: string;
  x: number;
  y: number;
  color: string;
  selected?: boolean;
}

const colors = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1"
];

const GraphView: Component = () => {
  const [graphNodes, setGraphNodes] = createSignal<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = createSignal<EdgeDto[]>([]);
  const [selectedNode, setSelectedNode] = createSignal<GraphNode | null>(null);
  const [transform, setTransform] = createSignal({ x: 0, y: 0, k: 1 });
  const [dragging, setDragging] = createSignal<GraphNode | null>(null);
  const [panning, setPanning] = createSignal(false);
  const [panStart, setPanStart] = createSignal({ x: 0, y: 0 });
  let svgRef: SVGSVGElement | undefined;

  createEffect(() => {
    if (!activeDb()) {
      setGraphNodes([]);
      setGraphEdges([]);
      return;
    }

    const n = nodes();
    const e = edges();
    if (n.length === 0) {
      setGraphNodes([]);
      setGraphEdges([]);
      return;
    }

    const nodeMap = new Map<number, GraphNode>();
    const width = 800;
    const height = 600;
    const cx = width / 2;
    const cy = height / 2;

    n.forEach((node: NodeDto, i: number) => {
      const angle = (2 * Math.PI * i) / n.length;
      const r = Math.min(width, height) * 0.3;
      nodeMap.set(node.id, {
        id: node.id,
        label: node.label,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        color: colors[i % colors.length],
      });
    });

    // Force simulation
    for (let iter = 0; iter < 100; iter++) {
      const arr = Array.from(nodeMap.values());
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const dx = arr[j].x - arr[i].x;
          const dy = arr[j].y - arr[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 5000 / (dist * dist);
          arr[i].x -= (dx / dist) * force;
          arr[i].y -= (dy / dist) * force;
          arr[j].x += (dx / dist) * force;
          arr[j].y += (dy / dist) * force;
        }
      }
      e.forEach((edge: EdgeDto) => {
        const s = nodeMap.get(edge.from);
        const t = nodeMap.get(edge.to);
        if (s && t) {
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 100) * 0.01;
          s.x += (dx / dist) * force;
          s.y += (dy / dist) * force;
          t.x -= (dx / dist) * force;
          t.y -= (dy / dist) * force;
        }
      });
      arr.forEach(node => {
        node.x += (cx - node.x) * 0.01;
        node.y += (cy - node.y) * 0.01;
      });
    }

    setGraphNodes(Array.from(nodeMap.values()));
    setGraphEdges(e);
    setSelectedNode(null);
    setTransform({ x: 0, y: 0, k: 1 });
  });

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const t = transform();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newK = Math.max(0.1, Math.min(5, t.k * delta));
    setTransform({ ...t, k: newK });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.target === svgRef || (e.target as Element).tagName === 'rect') {
      setPanning(true);
      setPanStart({ x: e.clientX - transform().x, y: e.clientY - transform().y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const dragNode = dragging();
    if (dragNode) {
      const t = transform();
      const svg = svgRef!;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left - t.x) / t.k;
      const y = (e.clientY - rect.top - t.y) / t.k;
      setGraphNodes(prev => prev.map(n => n.id === dragNode.id ? { ...n, x, y } : n));
    } else if (panning()) {
      const ps = panStart();
      setTransform(prev => ({ ...prev, x: e.clientX - ps.x, y: e.clientY - ps.y }));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setPanning(false);
  };

  const handleNodeMouseDown = (node: GraphNode, e: MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(node);
    setDragging(node);
  };

  return (
    <div class="graph-container">
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        class="graph-svg"
        xmlns="http://www.w3.org/2000/svg"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <rect width="100%" height="100%" fill="transparent" />
        <g transform={`translate(${transform().x},${transform().y}) scale(${transform().k})`}>
          {/* Edges */}
          {graphEdges().map(edge => {
            const source = graphNodes().find(n => n.id === edge.from);
            const target = graphNodes().find(n => n.id === edge.to);
            if (!source || !target) return null;
            return (
              <g>
                <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="#475569" stroke-width="2" />
                <text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 - 5} fill="#94a3b8" font-size="10" text-anchor="middle">{edge.label}</text>
              </g>
            );
          })}

          {/* Nodes */}
          {graphNodes().map(node => (
            <g
              style={{ cursor: 'grab' }}
              onMouseDown={(e) => handleNodeMouseDown(node, e)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={selectedNode()?.id === node.id ? 12 : 8}
                fill={node.color}
                stroke={selectedNode()?.id === node.id ? "#fff" : "#1e293b"}
                stroke-width={selectedNode()?.id === node.id ? 3 : 2}
              />
              <text
                x={node.x + 14}
                y={node.y + 4}
                fill="#f1f5f9"
                font-size="11"
                font-family="sans-serif"
                style={{ 'pointer-events': 'none' }}
              >
                {node.label}
              </text>
            </g>
          ))}

          {graphNodes().length === 0 && (
            <text x="400" y="300" fill="#94a3b8" font-size="16" text-anchor="middle">No data to display</text>
          )}
        </g>
      </svg>

      {/* Node info panel */}
      {selectedNode() && (
        <div class="node-info-panel">
          <h4>{selectedNode()!.label}</h4>
          <p>ID: {selectedNode()!.id}</p>
          <p>Connections: {graphEdges().filter(e => e.from === selectedNode()!.id || e.to === selectedNode()!.id).length}</p>
          <button onClick={() => setSelectedNode(null)}>Close</button>
        </div>
      )}

      {/* Zoom controls */}
      <div class="zoom-controls">
        <button onClick={() => setTransform(t => ({ ...t, k: Math.min(5, t.k * 1.2) }))}>+</button>
        <button onClick={() => setTransform(t => ({ ...t, k: Math.max(0.1, t.k / 1.2) }))}>−</button>
        <button onClick={() => setTransform({ x: 0, y: 0, k: 1 })}>⟲</button>
      </div>
    </div>
  );
};

export default GraphView;
