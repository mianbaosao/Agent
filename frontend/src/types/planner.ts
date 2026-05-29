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
