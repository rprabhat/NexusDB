import { Component, For } from "solid-js";
import { activeView, setActiveView, databases, activeDb, setActiveDb, setNodes, setEdges, setSchema } from "../../stores/app";
import { nodeList, edgeList, schemaGet } from "../../lib/api";
import "./Sidebar.css";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  tooltip: string;
}

const navItems: NavItem[] = [
  { id: "home", icon: "🏠", label: "Home", tooltip: "Overview and getting started" },
  { id: "graph", icon: "🔗", label: "Graph", tooltip: "Visualize connections between items" },
  { id: "chat", icon: "💬", label: "Chat", tooltip: "Ask questions about your data" },
  { id: "report", icon: "📊", label: "Report", tooltip: "Generate summaries and insights" },
];

const dataNavItems: NavItem[] = [
  { id: "nodes", icon: "📦", label: "Items", tooltip: "Browse all items in your database" },
  { id: "edges", icon: "🔀", label: "Connections", tooltip: "View relationships between items" },
  { id: "schema", icon: "🏗️", label: "Structure", tooltip: "See how your data is organized" },
  { id: "nql", icon: "⌨️", label: "NQL Editor", tooltip: "Write advanced queries" },
];

const Sidebar: Component = () => {
  const loadDbData = async (dbName: string) => {
    const nodes = await nodeList(dbName);
    setNodes(nodes);
    const edges = await edgeList(dbName);
    setEdges(edges);
    const schema = await schemaGet(dbName);
    setSchema(schema);
  };

  const handleNavClick = (id: string) => {
    setActiveView(id as any);
  };

  const handleDbClick = async (db: string) => {
    setActiveDb(db);
    await loadDbData(db);
  };

  return (
    <nav class="sidebar">
      <div class="sidebar-section">
        <For each={navItems}>
          {(item) => (
            <button
              classList={{ "nav-item": true, active: activeView() === item.id }}
              onClick={() => handleNavClick(item.id)}
              title={item.tooltip}
            >
              <span class="nav-icon">{item.icon}</span>
              <span class="nav-label">{item.label}</span>
            </button>
          )}
        </For>
      </div>

      <div class="sidebar-divider" />

      <div class="sidebar-section">
        <h3 class="sidebar-heading">Data</h3>
        <For each={dataNavItems}>
          {(item) => (
            <button
              classList={{ "nav-item": true, active: activeView() === item.id }}
              onClick={() => handleNavClick(item.id)}
              title={item.tooltip}
            >
              <span class="nav-icon">{item.icon}</span>
              <span class="nav-label">{item.label}</span>
            </button>
          )}
        </For>
      </div>

      <div class="sidebar-divider" />

      <div class="sidebar-section">
        <h3 class="sidebar-heading">Databases</h3>
        <For each={databases()}>
          {(db) => (
            <button
              classList={{ "db-item": true, active: activeDb() === db }}
              onClick={() => handleDbClick(db)}
              title={db === "health-patterns" ? "Health & symptom tracking demo" : db === "project-management" ? "Project management demo" : `Database: ${db}`}
            >
              <span class="db-icon">{db === "health-patterns" ? "🏥" : db === "project-management" ? "📋" : "🗄️"}</span>
              <span class="db-name">{db}</span>
            </button>
          )}
        </For>
      </div>
    </nav>
  );
};

export default Sidebar;
