"use client";

import { useEffect, useMemo, useState } from "react";
import { initialTaskTraces, mockAgentEvents } from "@/data/mock-agent-traces";
import type { AgentEvent, AgentLogEntry, ExecutionNode, TaskTrace } from "@/types/agent-observability";

function appendLog(logs: AgentLogEntry[], log?: AgentLogEntry) {
  if (!log || logs.some((item) => item.id === log.id)) return logs;
  return [...logs, log];
}

function mergeNode(node: ExecutionNode, patch: Partial<ExecutionNode> & { id: string }, log?: AgentLogEntry) {
  const nextToolCall = patch.toolCall
    ? {
        ...node.toolCall,
        ...patch.toolCall,
        logs: appendLog(patch.toolCall.logs ?? node.toolCall?.logs ?? [], log),
      }
    : node.toolCall
      ? { ...node.toolCall, logs: appendLog(node.toolCall.logs, log) }
      : undefined;

  return {
    ...node,
    ...patch,
    toolCall: nextToolCall,
  };
}

function reduceEvent(tasks: TaskTrace[], event: AgentEvent) {
  return tasks.map((task) => {
    if (task.id !== event.taskId) return task;

    const nodePatch = event.patch?.node;
    const nodes = nodePatch
      ? task.nodes.map((node) => (node.id === nodePatch.id ? mergeNode(node, nodePatch, event.log) : node))
      : task.nodes.map((node) =>
          node.id === event.nodeId && node.toolCall
            ? { ...node, toolCall: { ...node.toolCall, logs: appendLog(node.toolCall.logs, event.log) } }
            : node,
        );

    return {
      ...task,
      ...event.patch,
      node: undefined,
      nodes,
      logs: appendLog(task.logs, event.log),
    } as TaskTrace;
  });
}

export function useAgentTraceStream() {
  const [tasks, setTasks] = useState<TaskTrace[]>(initialTaskTraces);
  const [activeTaskId, setActiveTaskId] = useState(initialTaskTraces[0]?.id);
  const [connectionState, setConnectionState] = useState<"mock" | "connecting" | "connected" | "disconnected">("mock");

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_AGENT_WS_URL;

    if (wsUrl) {
      setConnectionState("connecting");
      const socket = new WebSocket(wsUrl);
      socket.onopen = () => setConnectionState("connected");
      socket.onclose = () => setConnectionState("disconnected");
      socket.onerror = () => setConnectionState("disconnected");
      socket.onmessage = (message) => {
        const event = JSON.parse(message.data) as AgentEvent;
        setTasks((current) => reduceEvent(current, event));
      };
      return () => socket.close();
    }

    let index = 0;
    const interval = window.setInterval(() => {
      const event = mockAgentEvents[index];
      if (!event) {
        window.clearInterval(interval);
        return;
      }

      setTasks((current) => reduceEvent(current, event));
      index += 1;
    }, 1650);

    return () => window.clearInterval(interval);
  }, []);

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? tasks[0],
    [activeTaskId, tasks],
  );

  return {
    tasks,
    activeTask,
    activeTaskId,
    setActiveTaskId,
    connectionState,
  };
}
