import { Component, onMount, Show } from "solid-js";
import Sidebar from "./components/sidebar/Sidebar";
import DatabaseManager from "./components/database/DatabaseManager";
import GraphView from "./components/graph/GraphView";
import NodeList from "./components/entities/NodeList";
import EdgeList from "./components/entities/EdgeList";
import SchemaBrowser from "./components/sidebar/SchemaBrowser";
import NqlEditor from "./components/editor/NqlEditor";
import { activeView, setDatabases } from "./stores/app";
import { dbList as apiDbList } from "./lib/api";
import "./App.css";

const App: Component = () => {
  onMount(async () => {
    try {
      const dbs = await apiDbList();
      setDatabases(dbs);
    } catch (e) {
      // No databases open yet, that's fine
    }
  });

  return (
    <div class="app-layout">
      <Sidebar />
      <main class="main-content">
        <Show when={activeView() === "graph"}>
          <GraphView />
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
  );
};

export default App;
