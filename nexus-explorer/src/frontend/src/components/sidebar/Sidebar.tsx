import { Component } from "solid-js";
import { activeView, setActiveView, activeDb } from "../../stores/app";
import "./Sidebar.css";

const Sidebar: Component = () => {
  const views = [
    { id: "graph" as const, label: "Graph", icon: "🔗" },
    { id: "nodes" as const, label: "Nodes", icon: "⚫" },
    { id: "edges" as const, label: "Edges", icon: "➡️" },
    { id: "schema" as const, label: "Schema", icon: "📋" },
    { id: "nql" as const, label: "NQL", icon: "💻" },
  ];

  return (
    <nav class="sidebar">
      <div class="sidebar-header">
        <h2>NexusDB</h2>
        {activeDb() && <span class="db-badge">{activeDb()}</span>}
      </div>
      <ul class="nav-list">
        {views.map((view) => (
          <li
            classList={{ "nav-item": true, active: activeView() === view.id }}
            onClick={() => setActiveView(view.id)}
          >
            <span class="nav-icon">{view.icon}</span>
            <span class="nav-label">{view.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
