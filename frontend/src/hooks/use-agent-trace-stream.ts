"use client";

import { useEffect, useMemo, useState } from "react";
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
  const exists = tasks.some((task) => task.id === event.taskId);
  if (!exists && event.patch?.id && event.patch.nodes) {
    const nextTask = {
      id: event.patch.id,
      name: event.patch.name ?? "Agent Task",
      objective: event.patch.objective ?? "",
      status: event.patch.status ?? "running",
      currentNodeId: event.patch.currentNodeId,
      currentToolName: event.patch.currentToolName,
      startedAt: event.patch.startedAt ?? event.timestamp,
      endedAt: event.patch.endedAt,
      durationMs: event.patch.durationMs,
      nodes: event.patch.nodes as ExecutionNode[],
      logs: appendLog(event.patch.logs ?? [], event.log),
      tags: event.patch.tags,
    } as TaskTrace;
    return [nextTask, ...tasks];
  }

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
  const [tasks, setTasks] = useState<TaskTrace[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>();
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "disconnected">("disconnected");

  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    const wsUrl =
      process.env.NEXT_PUBLIC_AGENT_WS_URL ??
      apiBaseUrl.replace(/^http/, "ws").replace(/\/$/, "") + "/ws/agent-events";

    if (wsUrl) {
      setConnectionState("connecting");
      const socket = new WebSocket(wsUrl);
      socket.onopen = () => setConnectionState("connected");
      socket.onclose = () => {
        setConnectionState("disconnected");
      };
      socket.onerror = () => {
        setConnectionState("disconnected");
      };
      socket.onmessage = (message) => {
        const event = JSON.parse(message.data) as AgentEvent;
        setTasks((current) => {
          const next = reduceEvent(current, event);
          setActiveTaskId((value) => value ?? next[0]?.id);
          return next;
        });
      };
      return () => socket.close();
    }
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
