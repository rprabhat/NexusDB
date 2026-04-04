import { createSignal } from "solid-js";
import type { NodeDto, EdgeDto, SchemaInfo } from "../types";

export const [activeDb, setActiveDb] = createSignal<string | null>(null);
export const [databases, setDatabases] = createSignal<string[]>([]);
export const [nodes, setNodes] = createSignal<NodeDto[]>([]);
export const [edges, setEdges] = createSignal<EdgeDto[]>([]);
export const [selectedNode, setSelectedNode] = createSignal<NodeDto | null>(null);
export const [selectedEdge, setSelectedEdge] = createSignal<EdgeDto | null>(null);
export const [schema, setSchema] = createSignal<SchemaInfo | null>(null);
export const [isLoading, setIsLoading] = createSignal(false);
export const [error, setError] = createSignal<string | null>(null);
export const [activeView, setActiveView] = createSignal<"graph" | "nodes" | "edges" | "schema" | "nql">("graph");
