import type { AgentPlan, AgentPlanRequest, ScheduleTask, ScheduleTaskInput } from "@/types/planner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function generatePlan(payload: AgentPlanRequest): Promise<AgentPlan> {
  const response = await fetch(`${API_BASE_URL}/agent/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Agent plan request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchDailySchedules(): Promise<ScheduleTask[]> {
  const response = await fetch(`${API_BASE_URL}/schedules/daily`);
  if (!response.ok) {
    throw new Error(`Fetch schedules failed: ${response.status}`);
  }
  return response.json();
}

export async function createSchedule(payload: ScheduleTaskInput): Promise<ScheduleTask> {
  const response = await fetch(`${API_BASE_URL}/schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Create schedule failed: ${response.status}`);
  }
  return response.json();
}

export async function updateSchedule(id: number, payload: Partial<ScheduleTaskInput>): Promise<ScheduleTask> {
  const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Update schedule failed: ${response.status}`);
  }
  return response.json();
}

export async function deleteSchedule(id: number): Promise<{ ok: boolean }> {
  const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Delete schedule failed: ${response.status}`);
  }
  return response.json();
}
