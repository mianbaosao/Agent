"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Send, Sparkles, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExecutionDag } from "@/components/agent-observability/execution-dag";
import { ExecutionTimeline } from "@/components/agent-observability/execution-timeline";
import { LogConsole } from "@/components/agent-observability/log-console";
import { NodeDetailDrawer } from "@/components/agent-observability/node-detail-drawer";
import { fetchSiteAgentMessages, streamSiteAgent } from "@/components/planner/planner-api";
import { usePlannerStore } from "@/stores/planner-store";
import type { AgentLogEntry, ExecutionNode, TaskTrace, ToolCall } from "@/types/agent-observability";

const now = new Date("2026-06-12T10:21:11+08:00");

function iso(offsetSeconds: number) {
  return new Date(now.getTime() + offsetSeconds * 1000).toISOString();
}

function log(id: string, nodeId: string | undefined, level: AgentLogEntry["level"], message: string): AgentLogEntry {
  return {
    id,
    nodeId,
    taskId: "agent-plan-demo",
    timestamp: iso(Number(id.replace(/\D/g, "")) || 0),
    level,
    message,
  };
}

function toolCall(
  nodeId: string,
  name: string,
  reason: string,
  input: Record<string, unknown>,
  output: Record<string, unknown> | string,
  durationMs: number,
): ToolCall {
  return {
    id: `tool-${nodeId}`,
    nodeId,
    name,
    reason,
    input,
    output,
    logs: [log(`log-${nodeId}-1`, nodeId, "info", `${name} 开始执行`), log(`log-${nodeId}-2`, nodeId, "success", `${name} 执行完成`)],
    durationMs,
    tokenUsage: { promptTokens: 420, completionTokens: 188, totalTokens: 608 },
    startedAt: iso(1),
    endedAt: iso(1 + Math.ceil(durationMs / 1000)),
    status: "success",
  };
}

const nodes: ExecutionNode[] = [
  {
    id: "receive-goal",
    taskId: "agent-plan-demo",
    label: "接收目标",
    description: "读取用户输入并校验 level / auto_save 参数。",
    status: "success",
    startedAt: iso(0),
    endedAt: iso(1),
    durationMs: 820,
    parentIds: [],
    nextIds: ["plan-breakdown"],
    position: { x: 60, y: 120 },
    toolCall: toolCall("receive-goal", "RequestValidator", "确保目标规划请求结构完整。", { level: "yearly", auto_save: true }, { valid: true }, 820),
  },
  {
    id: "plan-breakdown",
    taskId: "agent-plan-demo",
    label: "目标拆解",
    description: "生成年度、月度、周度、日任务结构。",
    status: "success",
    startedAt: iso(2),
    endedAt: iso(5),
    durationMs: 3100,
    parentIds: ["receive-goal"],
    nextIds: ["save-schedule"],
    position: { x: 340, y: 120 },
    toolCall: toolCall("plan-breakdown", "RuleBasedPlanner", "将长期目标拆成可执行计划树。", { goal: "2026年学完Java后端开发" }, { plans: 12, depth: 4 }, 3100),
  },
  {
    id: "save-schedule",
    taskId: "agent-plan-demo",
    label: "保存日程",
    description: "递归写入 Schedule 表并维护 parent_id。",
    status: "running",
    startedAt: iso(6),
    durationMs: 1800,
    parentIds: ["plan-breakdown"],
    nextIds: ["emit-trace"],
    position: { x: 620, y: 120 },
    toolCall: {
      ...toolCall("save-schedule", "ScheduleRepository", "将 Agent 计划保存到 MySQL。", { table: "schedules" }, { inserted: 31 }, 1800),
      status: "running",
      endedAt: undefined,
    },
  },
  {
    id: "emit-trace",
    taskId: "agent-plan-demo",
    label: "推送 Trace",
    description: "通过 WebSocket 推送 AgentEvent 给可观测面板。",
    status: "pending",
    parentIds: ["save-schedule"],
    nextIds: [],
    position: { x: 900, y: 120 },
  },
];

const task: TaskTrace = {
  id: "agent-plan-demo",
  name: "AI目标规划 Agent",
  objective: "演示 /agent/plan 的执行链路、Tool Call Trace 和实时日志。",
  status: "running",
  currentNodeId: "save-schedule",
  currentToolName: "ScheduleRepository",
  startedAt: iso(0),
  durationMs: 7200,
  nodes,
  logs: [
    log("log-1", "receive-goal", "info", "开始执行目标规划"),
    log("log-2", "receive-goal", "success", "请求参数校验通过"),
    log("log-3", "plan-breakdown", "info", "生成年度计划树"),
    log("log-4", "plan-breakdown", "success", "计划拆解完成"),
    log("log-5", "save-schedule", "info", "正在写入 MySQL schedules 表"),
  ],
  tags: ["mock", "planner", "trace"],
};

export function AgentTabView() {
  const queryClient = useQueryClient();
  const [selectedNodeId, setSelectedNodeId] = useState(task.currentNodeId);
  const [streaming, setStreaming] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const {
    agentInput: input,
    agentMessages: messages,
    setAgentInput: setInput,
    setAgentMessages,
    addAgentMessage,
    updateAgentMessage,
  } = usePlannerStore();
  const historyQuery = useQuery({
    queryKey: ["site-agent-messages"],
    queryFn: fetchSiteAgentMessages,
    staleTime: 5_000,
  });
  const selectedNode = useMemo(() => task.nodes.find((node) => node.id === selectedNodeId), [selectedNodeId]);

  useEffect(() => {
    if (!historyQuery.data) return;
    setAgentMessages(
      historyQuery.data.map((message) => ({
        id: `db-${message.id}`,
        role: message.role,
        content: message.content,
      })),
    );
  }, [historyQuery.data, setAgentMessages]);

  useEffect(() => {
    const element = chatScrollRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [messages]);

  function todayKey() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function sendMessage() {
    const text = input.trim();
    if (!text || streaming) return;
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const agentMessageId = `agent-${requestId}`;
    addAgentMessage({ id: `user-${requestId}`, role: "user", content: text });
    addAgentMessage({ id: agentMessageId, role: "agent", content: "正在理解你的任务..." });
    setInput("");
    setStreaming(true);
    let streamedContent = "";

    streamSiteAgent({ message: text, date: todayKey() }, (chunk) => {
      streamedContent = streamedContent && chunk === "正在理解你的任务..." ? streamedContent : `${streamedContent}${streamedContent ? "\n" : ""}${chunk}`;
      updateAgentMessage(agentMessageId, streamedContent);
    })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["daily-schedules"] });
        queryClient.invalidateQueries({ queryKey: ["weekly-schedules"] });
        queryClient.invalidateQueries({ queryKey: ["schedule-tree"] });
        queryClient.invalidateQueries({ queryKey: ["site-agent-messages"] });
      })
      .catch(() => {
        updateAgentMessage(agentMessageId, "站内 Agent 暂时没有成功执行，请确认 Java 后端和模型配置已启动。");
      })
      .finally(() => setStreaming(false));
  }

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6D7B67]">Site Agent</p>
            <h2 className="mt-1 text-lg font-bold text-[#2E4B36]">站内 Agent</h2>
            <p className="mt-1 text-sm text-[#6D7B67]">用 LangChain 调用模型，帮你新增/删除每日任务和周任务。</p>
          </div>
          <div className="rounded-md border border-[#E8F3E3] bg-[#FFFDF7] px-3 py-2 text-xs text-[#6D7B67]">
            gpt-5.2 · LangChain4j
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_420px]">
          <div ref={chatScrollRef} className="h-[360px] overflow-y-auto rounded-md border border-[#E8F3E3] bg-[#FFFDF7] p-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "agent" && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF7FF] text-[#23628B]">
                      <Bot className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={`max-w-[78%] whitespace-pre-wrap break-words rounded-md px-3 py-2 text-sm leading-6 ${
                      message.role === "user" ? "bg-[#6EC6FF] text-white" : "border border-[#E8F3E3] bg-white text-[#2E4B36]"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F2FAF1] text-[#4F6250]">
                      <UserRound className="h-4 w-4" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-[#E8F3E3] bg-white p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#2E4B36]">
              <Sparkles className="h-4 w-4 text-[#FFB74D]" />
              快捷示例
            </div>
            <div className="grid gap-2 text-sm">
              {[
                "查询今天的每日任务",
                "查询本周任务",
                "添加每日任务 晚上读书30分钟",
                "把每日任务 晚上读书 标记为完成",
                "把本周任务 项目复盘 改成 完成项目复盘报告",
                "删除本周任务 项目复盘",
              ].map((example) => (
                <button
                  key={example}
                  type="button"
                  className="rounded-md border border-[#E8F3E3] bg-[#FFFDF7] px-3 py-2 text-left text-[#4F6250] hover:border-[#BDE7FF] hover:bg-[#F8FCFF]"
                  onClick={() => setInput(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            className="h-11 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm text-[#2E4B36] outline-none focus:border-[#6EC6FF]"
            placeholder="告诉 Agent 要新增或删除什么任务"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Enter") sendMessage();
            }}
          />
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#6EC6FF] px-4 text-sm font-semibold text-white disabled:opacity-50"
            disabled={!input.trim() || streaming}
            onClick={sendMessage}
          >
            <Send className="h-4 w-4" />
            {streaming ? "执行中" : "发送"}
          </button>
        </div>
      </div>

      {/* Agent Observability 展示区暂时隐藏，保留代码方便后续恢复。
      <div className="overflow-hidden rounded-md border border-[#E8F3E3] bg-white shadow-sm">
        <div className="border-b border-[#E8F3E3] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6D7B67]">Agent Observability</p>
          <h2 className="mt-1 text-lg font-bold text-[#2E4B36]">Agent 执行展示</h2>
          <p className="mt-1 text-sm text-[#6D7B67]">这里放一组 mock Agent 数据，用来展示 3000 端口根页面的执行流能力。</p>
        </div>

        <div className="grid min-h-[720px] xl:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <ExecutionDag task={task} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
            <ExecutionTimeline task={task} onSelectNode={setSelectedNodeId} />
            <LogConsole logs={task.logs} />
          </div>
          <NodeDetailDrawer node={selectedNode} onClose={() => setSelectedNodeId(undefined)} />
        </div>
      </div>
      */}
    </section>
  );
}
