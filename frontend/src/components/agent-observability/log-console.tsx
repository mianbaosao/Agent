"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { formatClock } from "@/lib/utils";
import type { AgentLogEntry } from "@/types/agent-observability";
import { logLevelClassName } from "./status";

interface LogConsoleProps {
  logs: AgentLogEntry[];
}

export function LogConsole({ logs }: LogConsoleProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [logs.length]);

  return (
    <section className="flex h-44 min-h-0 shrink-0 flex-col border-t border-[#b9c2d1] bg-[#f4f6f9]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_-12px_28px_rgba(24,59,114,0.08)] lg:h-52">
      <div className="flex items-center justify-between border-b border-[#b9c2d1] bg-[#eef2f8]/95 px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#17233d]">
          <Terminal className="h-4 w-4 text-[#183b72]" />
          实时日志 Console
        </div>
        <span className="text-xs text-[#657083]">auto-scroll enabled</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-6">
        {logs.map((log) => (
          <div key={log.id} className="whitespace-pre-wrap">
            <span className="text-[#6b7486]">[{formatClock(log.timestamp)}]</span>{" "}
            <span className={logLevelClassName[log.level]}>{log.level.toUpperCase()}</span>{" "}
            <span className="text-[#17233d]">{log.message}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </section>
  );
}
