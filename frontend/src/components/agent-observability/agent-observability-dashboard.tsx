"use client";

import { useEffect, useMemo, useState } from "react";
import { ExecutionDag } from "@/components/agent-observability/execution-dag";
import { ExecutionSummary } from "@/components/agent-observability/execution-summary";
import { ExecutionTimeline } from "@/components/agent-observability/execution-timeline";
import { LogConsole } from "@/components/agent-observability/log-console";
import { NodeDetailDrawer } from "@/components/agent-observability/node-detail-drawer";
import { TaskSidebar } from "@/components/agent-observability/task-sidebar";
import { useAgentTraceStream } from "@/hooks/use-agent-trace-stream";

export function AgentObservabilityDashboard() {
  const { tasks, activeTask, activeTaskId, setActiveTaskId, connectionState } = useAgentTraceStream();
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(activeTask?.currentNodeId);

  useEffect(() => {
    setSelectedNodeId(activeTask?.currentNodeId ?? activeTask?.nodes[0]?.id);
  }, [activeTask?.id, activeTask?.currentNodeId, activeTask?.nodes]);

  const selectedNode = useMemo(
    () => activeTask?.nodes.find((node) => node.id === selectedNodeId),
    [activeTask?.nodes, selectedNodeId],
  );

  if (!activeTask) {
    return <main className="grid min-h-screen place-items-center text-[#4b5568]">暂无 Agent Trace 数据</main>;
  }

  return (
    <main className="flex min-h-screen flex-col overflow-auto text-[#1b2741] lg:h-screen lg:min-h-0 lg:flex-row lg:overflow-hidden">
      <TaskSidebar tasks={tasks} activeTaskId={activeTaskId} onSelectTask={setActiveTaskId} />

      <div className="flex min-h-[760px] min-w-0 flex-1 flex-col lg:min-h-0">
        <ExecutionSummary task={activeTask} connectionState={connectionState} />

        <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
          <div className="flex min-w-0 flex-1 flex-col">
            <ExecutionDag task={activeTask} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
            <ExecutionTimeline task={activeTask} onSelectNode={setSelectedNodeId} />
          </div>
          <NodeDetailDrawer node={selectedNode} onClose={() => setSelectedNodeId(undefined)} />
        </div>

        <LogConsole logs={activeTask.logs} />
      </div>
    </main>
  );
}
