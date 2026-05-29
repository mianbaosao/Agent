"use client";

import { AlertTriangle, Braces, Clock3, FileText, Hash, Wrench, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDuration } from "@/lib/utils";
import type { ExecutionNode } from "@/types/agent-observability";
import { statusLabel } from "./status";

interface NodeDetailDrawerProps {
  node?: ExecutionNode;
  onClose: () => void;
}

export function NodeDetailDrawer({ node, onClose }: NodeDetailDrawerProps) {
  const toolCall = node?.toolCall;

  return (
    <aside className="paper-panel flex max-h-72 min-h-0 w-full shrink-0 flex-col border-t xl:max-h-none xl:w-[380px] xl:border-l xl:border-t-0">
      <div className="flex items-center justify-between border-b border-[#b9c2d1] p-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-[#657083]">Node Detail Drawer</div>
          <h3 className="mt-1 text-base font-semibold text-[#17233d]">{node?.label ?? "选择节点"}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭详情">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!node ? (
        <div className="p-5 text-sm text-[#566178]">点击 DAG 中的节点查看 Tool Call Trace。</div>
      ) : (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className="rounded-md border border-[#b9c2d1] bg-white/65 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-[#17233d]">{node.description ?? node.label}</div>
              <Badge variant={node.status === "success" ? "success" : node.status === "failed" ? "danger" : "default"}>
                {statusLabel[node.status]}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[#566178]">
              <Info label="开始" value={formatDateTime(node.startedAt)} />
              <Info label="结束" value={formatDateTime(node.endedAt)} />
              <Info label="耗时" value={formatDuration(node.durationMs)} />
              <Info label="Token" value={String(toolCall?.tokenUsage?.totalTokens ?? "预留")} />
            </div>
          </div>

          <Section icon={Wrench} title="Tool 名称">
            <div className="text-sm font-medium text-[#17233d]">{toolCall?.name ?? "尚未调用工具"}</div>
          </Section>

          <Section icon={FileText} title="调用原因 reason">
            <p className="text-sm leading-6 text-[#3b4964]">{toolCall?.reason ?? "等待 Agent 规划工具调用。"}</p>
          </Section>

          <Section icon={Braces} title="输入参数 input">
            <JsonBlock value={toolCall?.input ?? {}} />
          </Section>

          <Section icon={Hash} title="返回结果 output">
            <JsonBlock value={toolCall?.output ?? null} />
          </Section>

          <Section icon={Clock3} title="执行日志 logs">
            <div className="space-y-2">
              {(toolCall?.logs ?? []).map((log) => (
                <div key={log.id} className="rounded border border-[#b9c2d1] bg-[#f8f9f4]/80 p-2 text-xs text-[#3b4964]">
                  <span className="text-[#8a94a6]">{formatDateTime(log.timestamp)}</span> {log.message}
                </div>
              ))}
              {!toolCall?.logs?.length && <div className="text-sm text-[#657083]">暂无工具日志。</div>}
            </div>
          </Section>

          {(node.errorMessage || toolCall?.errorMessage) && (
            <Section icon={AlertTriangle} title="错误信息">
              <div className="text-sm text-[#a72f2c]">{node.errorMessage ?? toolCall?.errorMessage}</div>
            </Section>
          )}
        </div>
      )}
    </aside>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[#8a94a6]">{label}</div>
      <div className="mt-1 text-[#26324a]">{value}</div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Wrench;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-[#b9c2d1] bg-white/58 p-3 shadow-[0_6px_16px_rgba(24,59,114,0.06)]">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[#657083]">
        <Icon className="h-3.5 w-3.5 text-[#183b72]" />
        {title}
      </div>
      {children}
    </section>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-52 overflow-auto rounded-md border border-[#b9c2d1] bg-[#f4f6f9]/85 p-3 text-xs leading-5 text-[#26324a]">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
