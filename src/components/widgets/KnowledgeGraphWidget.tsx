"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { KnowledgeGraphData } from "@/lib/tools";

const TYPE_COLORS: Record<string, string> = {
  person: "#f97316",
  concept: "#8b5cf6",
  org: "#3b82f6",
  event: "#10b981",
  place: "#ef4444",
  default: "#6b7280",
};

function layoutNodes(
  graphNodes: KnowledgeGraphData["nodes"]
): Node[] {
  const radius = Math.max(150, graphNodes.length * 30);
  return graphNodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / graphNodes.length;
    return {
      id: n.id,
      position: {
        x: 300 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle),
      },
      data: { label: n.label },
      style: {
        background: TYPE_COLORS[n.type] || TYPE_COLORS.default,
        color: "#fff",
        border: "none",
        borderRadius: "9999px",
        padding: "8px 16px",
        fontSize: "12px",
        fontWeight: 600,
      },
    };
  });
}

export default function KnowledgeGraphWidget({
  nodes: graphNodes,
  edges: graphEdges,
}: KnowledgeGraphData) {
  const initialNodes = useMemo(() => layoutNodes(graphNodes), [graphNodes]);
  const initialEdges: Edge[] = useMemo(
    () =>
      graphEdges.map((e, i) => ({
        id: `edge-${i}`,
        source: e.source,
        target: e.target,
        label: e.label,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#94a3b8" },
        labelStyle: { fontSize: 10, fill: "#64748b" },
      })),
    [graphEdges]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback(() => {}, []);

  return (
    <div className="h-full min-h-[300px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
