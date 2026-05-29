export type ExecutionStatus = "pending" | "running" | "success" | "failed" | "skipped";

export type LogLevel = "debug" | "info" | "success" | "warn" | "error";

export type AgentEventType =
  | "task.started"
  | "task.completed"
  | "task.failed"
  | "node.started"
  | "node.completed"
  | "node.failed"
  | "tool.called"
  | "log.appended";

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  nodeId?: string;
  taskId?: string;
}

export interface ToolCall {
  id: string;
  nodeId: string;
  name: string;
  reason: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | string;
  logs: AgentLogEntry[];
  durationMs?: number;
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  startedAt: string;
  endedAt?: string;
  status: ExecutionStatus;
  errorMessage?: string;
}

export interface ExecutionNode {
  id: string;
  taskId: string;
  label: string;
  description?: string;
  status: ExecutionStatus;
  toolCall?: ToolCall;
  startedAt?: string;
  endedAt?: string;
  durationMs?: number;
  errorMessage?: string;
  parentIds: string[];
  nextIds: string[];
  metadata?: Record<string, unknown>;
  position?: {
    x: number;
    y: number;
  };
}

export interface TaskTrace {
  id: string;
  name: string;
  objective: string;
  status: ExecutionStatus;
  currentNodeId?: string;
  currentToolName?: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  nodes: ExecutionNode[];
  logs: AgentLogEntry[];
  tags?: string[];
}

export interface AgentEvent {
  id: string;
  type: AgentEventType;
  taskId: string;
  nodeId?: string;
  timestamp: string;
  status?: ExecutionStatus;
  toolCall?: ToolCall;
  log?: AgentLogEntry;
  patch?: Partial<TaskTrace> & {
    node?: Partial<ExecutionNode> & { id: string };
  };
}
