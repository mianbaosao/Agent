"use client";

import { Activity, CheckCircle2, Clock3, ListTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import type { TaskTrace } from "@/types/agent-observability";
import { statusLabel } from "./status";

interface TaskSidebarProps {
  tasks: TaskTrace[];
  activeTaskId?: string;
  onSelectTask: (taskId: string) => void;
}

export function TaskSidebar({ tasks, activeTaskId, onSelectTask }: TaskSidebarProps) {
  return (
    <aside className="armor-rail flex h-44 min-h-0 w-full shrink-0 flex-col border-b border-[#b9c2d1] lg:h-auto lg:w-80 lg:border-b-0 lg:border-r">
      <div className="border-b border-[#b9c2d1] p-3 lg:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d0a719]/40 bg-[#fff2b8]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            <ListTree className="h-5 w-5 text-[#183b72]" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#17233d]">Agent Observability</h1>
            <p className="text-xs text-[#566178]">RX-style AI execution console</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden p-3 lg:block lg:space-y-3 lg:overflow-x-hidden lg:overflow-y-auto lg:p-4">
        {tasks.map((task) => (
          <Button
            key={task.id}
            variant="ghost"
            className={cn(
              "h-auto min-w-72 justify-start rounded-md border border-transparent p-0 text-left lg:w-full lg:min-w-0",
              activeTaskId === task.id && "border-[#183b72]/30 bg-white/80 shadow-[0_12px_30px_rgba(24,59,114,0.12)]",
            )}
            onClick={() => onSelectTask(task.id)}
          >
            <div className="w-full space-y-3 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#17233d]">{task.name}</div>
                  <div className="mt-1 line-clamp-2 text-xs leading-5 text-[#566178]">{task.objective}</div>
                </div>
                <Badge
                  variant={
                    task.status === "success" ? "success" : task.status === "failed" ? "danger" : "default"
                  }
                  className="shrink-0"
                >
                  {statusLabel[task.status]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#566178]">
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  {task.currentToolName ?? "idle"}
                </span>
                <span className="flex items-center justify-end gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatDuration(task.durationMs)}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {task.tags?.map((tag) => (
                  <span key={tag} className="rounded border border-[#b9c2d1] bg-white/65 px-1.5 py-0.5 text-[11px] text-[#3b4964]">
                    {tag}
                  </span>
                ))}
                {task.status === "success" && <CheckCircle2 className="ml-auto h-4 w-4 text-[#34622e]" />}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </aside>
  );
}
