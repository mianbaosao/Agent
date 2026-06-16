export type PlannerLevel = "yearly" | "monthly" | "weekly" | "daily";

export interface PlanNode {
  id?: number;
  parent_id?: number | null;
  title: string;
  description: string;
  type: PlannerLevel | string;
  status?: string;
  due_date?: string | null;
  start_time?: string | null;
  children?: PlanNode[];
}

export interface AgentPlan {
  id?: number;
  parent_id?: number | null;
  goal: string;
  level: PlannerLevel;
  summary?: string;
  title?: string;
  description?: string;
  type?: string;
  plans?: PlanNode[];
  children?: PlanNode[];
}

export interface AgentPlanRequest {
  goal: string;
  level: PlannerLevel;
  auto_save: boolean;
}

export interface ScheduleTask {
  id: number;
  parent_id?: number | null;
  goal?: string | null;
  level?: string | null;
  title: string;
  description: string;
  type: string;
  status: string;
  due_date?: string | null;
  start_time?: string | null;
  sort_order?: number;
  children?: ScheduleTask[];
}

export interface ScheduleTaskInput {
  title: string;
  description?: string;
  type?: string;
  parent_id?: number | null;
  status?: string;
  due_date?: string | null;
  start_time?: string | null;
  sort_order?: number;
}

export type ToolGroupId = "learning" | "work" | "search" | "utility";

export interface ToolLink {
  id: number;
  group_id: ToolGroupId;
  label: string;
  href: string;
  sort_order?: number;
}

export interface ToolLinkInput {
  group_id: ToolGroupId;
  label: string;
  href: string;
  sort_order?: number;
}

export interface SiteAgentRequest {
  message: string;
  date: string;
}

export interface SiteAgentResponse {
  reply: string;
  action: string;
  schedule_id?: number | null;
}

export interface SiteAgentMessage {
  id: number;
  role: "user" | "agent";
  content: string;
  action?: string | null;
  schedule_id?: number | null;
  created_at: string;
}
