import { Component, createSignal, createEffect } from "solid-js";
import { activeDb, nodes, edges } from "../../stores/app";
import "./ReportView.css";

const ReportView: Component = () => {
  const [period, setPeriod] = createSignal("all");

  const nodeCount = nodes().length;
  const edgeCount = edges().length;

  // Count unique types
  const nodeTypes = new Set(nodes().map(n => n.label.split(":")[0]));
  const edgeTypes = new Set(edges().map(e => e.label));

  // Most connected nodes
  const connectionCount = new Map<number, number>();
  edges().forEach(e => {
    connectionCount.set(e.from, (connectionCount.get(e.from) || 0) + 1);
    connectionCount.set(e.to, (connectionCount.get(e.to) || 0) + 1);
  });
  const mostConnected = [...connectionCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const getNodeLabel = (id: number) => {
    return nodes().find(n => n.id === id)?.label || `ID: ${id}`;
  };

  return (
    <div class="report-view">
      <div class="report-header">
        <h1>Summary Report</h1>
        <div class="report-controls">
          <select value={period()} onChange={(e) => setPeriod(e.currentTarget.value)}>
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          <button class="secondary" onClick={() => {
            const text = generateReport();
            navigator.clipboard?.writeText(text);
          }}>
            📋 Copy Report
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div class="metric-row">
        <div class="metric-card">
          <span class="metric-value">{nodeCount}</span>
          <span class="metric-label">Total Items</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{edgeCount}</span>
          <span class="metric-label">Connections</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{nodeTypes.size}</span>
          <span class="metric-label">Item Types</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{edgeTypes.size}</span>
          <span class="metric-label">Relationship Types</span>
        </div>
      </div>

      {/* Key findings */}
      <div class="report-section">
        <h2>Key Findings</h2>
        <div class="findings-list">
          {mostConnected.length > 0 && (
            <div class="finding">
              <span class="finding-icon">🔗</span>
              <div class="finding-text">
                <strong>{getNodeLabel(mostConnected[0][0])}</strong> is the most connected item with {mostConnected[0][1]} connections
              </div>
            </div>
          )}
          <div class="finding">
            <span class="finding-icon">📊</span>
            <div class="finding-text">
              Your data contains {nodeTypes.size} different types: {Array.from(nodeTypes).join(", ")}
            </div>
          </div>
          <div class="finding">
            <span class="finding-icon">🔀</span>
            <div class="finding-text">
              {edgeTypes.size} types of relationships connect your items: {Array.from(edgeTypes).join(", ")}
            </div>
          </div>
        </div>
      </div>

      {/* Most connected */}
      {mostConnected.length > 0 && (
        <div class="report-section">
          <h2>Most Connected Items</h2>
          <div class="connected-list">
            {mostConnected.map(([id, count]) => (
              <div class="connected-item">
                <span class="connected-name">{getNodeLabel(id)}</span>
                <span class="connected-count">{count} connections</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item type breakdown */}
      <div class="report-section">
        <h2>Item Breakdown by Type</h2>
        <div class="type-breakdown">
          {Array.from(nodeTypes).map(type => {
            const count = nodes().filter(n => n.label.startsWith(type)).length;
            const pct = nodeCount > 0 ? Math.round((count / nodeCount) * 100) : 0;
            return (
              <div class="type-row">
                <span class="type-name">{type}</span>
                <div class="type-bar">
                  <div class="type-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <span class="type-count">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function generateReport(): string {
  return "Report generation - connect to a database to see data";
}

export default ReportView;
