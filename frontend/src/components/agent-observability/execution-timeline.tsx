"use client";

import { formatClock, formatDuration } from "@/lib/utils";
import type { TaskTrace } from "@/types/agent-observability";
import { statusClassName, statusLabel } from "./status";
import { cn } from "@/lib/utils";

interface ExecutionTimelineProps {
  task: TaskTrace;
  onSelectNode: (nodeId: string) => void;
}

export function ExecutionTimeline({ task, onSelectNode }: ExecutionTimelineProps) {
  return (
    <section className="border-t border-[#b9c2d1] bg-[#f3f5f9]/82 px-5 py-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#17233d]">执行时间线</h3>
        <span className="text-xs text-[#657083]">LangSmith / OpenTelemetry 风格 Trace</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {task.nodes.map((node) => (
          <button
            key={node.id}
            className="min-w-56 rounded-md border border-[#b9c2d1] bg-white/65 p-3 text-left shadow-[0_8px_18px_rgba(24,59,114,0.08)] transition hover:border-[#2d5f9a]/45 hover:bg-[#f8f9f4]"
            onClick={() => onSelectNode(node.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold text-[#17233d]">{node.label}</span>
              <span className={cn("rounded border px-1.5 py-0.5 text-[11px]", statusClassName[node.status])}>
                {statusLabel[node.status]}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#566178]">
              <div>
                <div className="text-[#8a94a6]">开始</div>
                <div>{formatClock(node.startedAt)}</div>
              </div>
              <div>
                <div className="text-[#8a94a6]">结束</div>
                <div>{formatClock(node.endedAt)}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-[#566178]">耗时 {formatDuration(node.durationMs)}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
