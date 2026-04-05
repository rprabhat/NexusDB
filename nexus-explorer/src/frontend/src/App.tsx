import { Component, onMount, Show } from "solid-js";
import Sidebar from "./components/sidebar/Sidebar";
import DatabaseManager from "./components/database/DatabaseManager";
import GraphView from "./components/graph/GraphView";
import NodeList from "./components/entities/NodeList";
import EdgeList from "./components/entities/EdgeList";
import SchemaBrowser from "./components/sidebar/SchemaBrowser";
import NqlEditor from "./components/editor/NqlEditor";
import HomeView from "./components/home/HomeView";
import ChatView from "./components/chat/ChatView";
import ReportView from "./components/report/ReportView";
import { activeView, setActiveView, activeDb, nodes, edges, setDatabases, setActiveDb, setNodes, setEdges, setSchema } from "./stores/app";
import { logError, dbList as apiDbList, nodeList, edgeList, schemaGet } from "./lib/api";
import "./App.css";

const loadDbData = async (dbName: string) => {
  try {
    const nodes = await nodeList(dbName);
    setNodes(nodes);
    const edges = await edgeList(dbName);
    setEdges(edges);
    const schema = await schemaGet(dbName);
    setSchema(schema);
  } catch (err) {
    const errMsg = "[loadDbData] ERROR: " + String(err);
    logError(errMsg).catch(() => {});
  }
};

const App: Component = () => {
  onMount(async () => {
    try {
      const dbs = await apiDbList();
      setDatabases(dbs);
      if (dbs.length > 0) {
        const firstDb = dbs[0];
        setActiveDb(firstDb);
        await loadDbData(firstDb);
      }
    } catch (e) {
      // No databases open yet, that's fine
    }
  });

  return (
    <div class="app-layout">
      <header class="app-header">
        <div class="header-brand">
          <svg class="header-logo" viewBox="0 0 40 40" width="28" height="28">
            <circle cx="10" cy="10" r="3" fill="#6366f1"/>
            <circle cx="30" cy="10" r="3" fill="#6366f1"/>
            <circle cx="10" cy="30" r="3" fill="#6366f1"/>
            <circle cx="30" cy="30" r="3" fill="#6366f1"/>
            <circle cx="20" cy="20" r="4" fill="#06b6d4"/>
            <line x1="10" y1="10" x2="20" y2="20" stroke="#6366f1" stroke-width="1.5" opacity="0.6"/>
            <line x1="30" y1="10" x2="20" y2="20" stroke="#6366f1" stroke-width="1.5" opacity="0.6"/>
            <line x1="10" y1="30" x2="20" y2="20" stroke="#6366f1" stroke-width="1.5" opacity="0.6"/>
            <line x1="30" y1="30" x2="20" y2="20" stroke="#6366f1" stroke-width="1.5" opacity="0.6"/>
          </svg>
          <span class="header-title">Sensible<span class="header-accent">DB</span></span>
        </div>
        <div class="header-db-selector">
          <Show when={activeDb()}>
            <span class="badge blue">{activeDb()}</span>
          </Show>
        </div>
        <div class="header-actions">
          <button class="icon-btn" title="Settings">⚙</button>
        </div>
      </header>

      <div class="app-body">
        <Sidebar />
        <main class="main-content">
          <Show when={activeView() === "home"}>
            <HomeView />
          </Show>
          <Show when={activeView() === "graph"}>
            <GraphView />
          </Show>
          <Show when={activeView() === "chat"}>
            <ChatView />
          </Show>
          <Show when={activeView() === "report"}>
            <ReportView />
          </Show>
          <Show when={activeView() === "nodes"}>
            <NodeList />
          </Show>
          <Show when={activeView() === "edges"}>
            <EdgeList />
          </Show>
          <Show when={activeView() === "schema"}>
            <SchemaBrowser />
          </Show>
          <Show when={activeView() === "nql"}>
            <NqlEditor />
          </Show>
        </main>
        <aside class="right-panel">
          <DatabaseManager />
        </aside>
      </div>

      <footer class="status-bar">
        <Show when={activeDb()}>
          <span>Connected to <strong>{activeDb()}</strong></span>
          <span class="status-separator">•</span>
          <span>{nodes().length} items</span>
          <span class="status-separator">•</span>
          <span>{edges().length} connections</span>
        </Show>
        <Show when={!activeDb()}>
          <span>No database connected</span>
        </Show>
      </footer>
    </div>
  );
};

export default App;
