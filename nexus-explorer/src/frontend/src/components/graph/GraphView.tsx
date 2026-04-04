import { Component, onMount, onCleanup, createEffect } from "solid-js";
import ForceGraph from "force-graph";
import { nodes, edges, activeDb } from "../../stores/app";
import "./GraphView.css";

const GraphView: Component = () => {
  let containerRef: HTMLDivElement | undefined;
  let graph: InstanceType<typeof ForceGraph> | undefined;

  onMount(() => {
    if (!containerRef) return;
    graph = new ForceGraph(containerRef)
      .backgroundColor("#0f172a")
      .nodeLabel("label")
      .nodeAutoColorBy("label")
      .linkLabel("label")
      .linkWidth(2)
      .nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.label;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = node.color || "#3b82f6";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.fillStyle = "#f1f5f9";
        ctx.fillText(label, node.x + 12, node.y + 4);
      });
  });

  onCleanup(() => {
    if (graph) {
      graph._destructor?.();
    }
  });

  createEffect(() => {
    if (!graph || !activeDb()) return;

    const graphNodes = nodes().map(n => ({
      id: n.id,
      label: n.label,
    }));

    const graphEdges = edges().map(e => ({
      source: e.from,
      target: e.to,
      label: e.label,
    }));

    graph.graphData({ nodes: graphNodes, links: graphEdges });
  });

  return <div ref={containerRef!} class="graph-container" />;
};

export default GraphView;
