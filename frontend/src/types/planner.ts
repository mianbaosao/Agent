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

export interface HealthProfile {
  id?: number;
  current_weight?: number | null;
  target_weight?: number | null;
  daily_protein?: number | null;
  daily_carbs?: number | null;
  daily_fat?: number | null;
  daily_calories?: number | null;
}

export interface HealthDietEntry {
  id: number;
  entry_date: string;
  meal_type?: string | null;
  food_name: string;
  amount?: string | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  calories?: number | null;
  sort_order?: number;
}

export type HealthDietEntryInput = Omit<HealthDietEntry, "id">;

export interface HealthFoodItem {
  id: number;
  name: string;
  serving?: string | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  calories?: number | null;
}

export type HealthFoodItemInput = Omit<HealthFoodItem, "id">;

export interface HealthTrainingPlan {
  id: number;
  plan_date: string;
  title: string;
  description?: string | null;
  status: string;
  sort_order?: number;
}

export type HealthTrainingPlanInput = Omit<HealthTrainingPlan, "id">;

export interface HealthWeightRecord {
  id: number;
  record_date: string;
  weight: number;
  note?: string | null;
}

export type HealthWeightRecordInput = Omit<HealthWeightRecord, "id">;

export interface AuthUser {
  id: number;
  account: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
