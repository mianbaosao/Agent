"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Clock3, Wrench } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import type { ExecutionNode, TaskTrace } from "@/types/agent-observability";
import { statusClassName, statusLabel } from "./status";

interface ExecutionNodeData extends ExecutionNode {
  [key: string]: unknown;
}

type ExecutionFlowNode = Node<ExecutionNodeData, "executionNode">;

interface ExecutionDagProps {
  task: TaskTrace;
  selectedNodeId?: string;
  onSelectNode: (nodeId: string) => void;
}

const nodeTypes = {
  executionNode: ExecutionNodeCard,
};

export function ExecutionDag({ task, selectedNodeId, onSelectNode }: ExecutionDagProps) {
  const { nodes, edges } = useMemo(() => {
    const flowNodes: ExecutionFlowNode[] = task.nodes.map((node, index) => ({
      id: node.id,
      type: "executionNode",
      position: node.position ?? { x: 120 + index * 280, y: 120 },
      data: { ...node },
      selected: node.id === selectedNodeId,
    }));

    const flowEdges: Edge[] = task.nodes.flatMap((node) =>
      node.nextIds.map((nextId) => ({
        id: `${node.id}-${nextId}`,
        source: node.id,
        target: nextId,
        animated: node.status === "running",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#2d5f9a" },
        style: {
          stroke: node.status === "failed" ? "#c8413a" : node.status === "success" ? "#6c9a65" : "#2d5f9a",
          strokeWidth: 2,
        },
      })),
    );

    return { nodes: flowNodes, edges: flowEdges };
  }, [selectedNodeId, task.nodes]);

  return (
    <section className="h-[340px] shrink-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.62),transparent_16rem),linear-gradient(rgba(27,50,99,0.052)_1px,transparent_1px),linear-gradient(90deg,rgba(27,50,99,0.045)_1px,transparent_1px)] bg-[size:auto,38px_38px,38px_38px] lg:min-h-0 lg:flex-1 lg:shrink">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.35}
        maxZoom={1.6}
        onNodeClick={(_, node) => onSelectNode(node.id)}
      >
        <Background color="rgba(27, 50, 99, 0.08)" gap={38} />
        <MiniMap
          pannable
          zoomable
          style={{ width: 118, height: 82 }}
          maskColor="rgba(23, 35, 61, 0.08)"
          nodeColor={(node) => {
            const status = (node.data as ExecutionNodeData).status;
            if (status === "success") return "#6c9a65";
            if (status === "failed") return "#c8413a";
            if (status === "running") return "#2d5f9a";
            return "#c4cad4";
          }}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </section>
  );
}

function ExecutionNodeCard({ data, selected }: NodeProps<ExecutionFlowNode>) {
  return (
    <div
      className={cn(
        "w-56 rounded-md border bg-[#f8f9f4]/95 p-3 shadow-[0_18px_34px_rgba(24,59,114,0.14)] transition",
        statusClassName[data.status],
        selected && "ring-2 ring-[#e3b72f]/70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[#17233d]">{data.label}</div>
          <div className="mt-1 line-clamp-2 text-xs leading-4 text-[#566178]">{data.description ?? "Agent step"}</div>
        </div>
        <span className="rounded border border-[#b9c2d1] bg-white/60 px-1.5 py-0.5 text-[11px] text-[#3b4964]">
          {statusLabel[data.status]}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-xs text-[#4b5568]">
        <div className="flex items-center gap-2">
          <Wrench className="h-3.5 w-3.5 text-[#183b72]" />
          <span className="truncate">{data.toolCall?.name ?? "等待工具调用"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-3.5 w-3.5 text-[#657083]" />
          <span>{formatDuration(data.durationMs)}</span>
        </div>
        {data.errorMessage && <div className="text-[#a72f2c]">{data.errorMessage}</div>}
      </div>
    </div>
  );
}
