"use client";

import { Cpu, Gauge, Radio, Timer } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import type { TaskTrace } from "@/types/agent-observability";
import { statusLabel } from "./status";

interface ExecutionSummaryProps {
  task: TaskTrace;
  connectionState: string;
}

export function ExecutionSummary({ task, connectionState }: ExecutionSummaryProps) {
  const completed = task.nodes.filter((node) => node.status === "success").length;

  return (
    <section className="paper-panel border-b px-4 py-3 lg:px-5 lg:py-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="truncate text-lg font-semibold text-[#17233d]">{task.name}</h2>
            <Badge variant={task.status === "success" ? "success" : task.status === "failed" ? "danger" : "default"}>
              {statusLabel[task.status]}
            </Badge>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#e3b72f]/55 bg-[#fff2b8]/85 px-2 py-1 text-xs font-medium text-[#806018]">
              <Radio className="h-3.5 w-3.5" />
              {connectionState}
            </span>
            <Link
              href="/planner"
              className="inline-flex h-8 items-center rounded-md border border-[#b9c2d1] bg-white/65 px-3 text-sm font-medium text-[#26324a] transition hover:bg-[#f4f6f9]"
            >
              AI目标规划
            </Link>
          </div>
          <p className="mt-1 text-sm leading-5 text-[#566178]">{task.objective}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
          <Metric icon={Cpu} label="当前工具" value={task.currentToolName ?? "None"} />
          <Metric icon={Gauge} label="步骤进度" value={`${completed}/${task.nodes.length}`} />
          <Metric icon={Timer} label="总耗时" value={formatDuration(task.durationMs)} />
          <Metric icon={Radio} label="日志数" value={String(task.logs.length)} />
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-28 rounded-md border border-[#b9c2d1] bg-white/65 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="flex items-center gap-1.5 text-[11px] uppercase text-[#657083]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 max-w-36 truncate text-sm font-semibold text-[#17233d]">{value}</div>
    </div>
  );
}
