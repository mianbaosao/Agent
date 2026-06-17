import type {
  AgentPlan,
  AgentPlanRequest,
  AuthResponse,
  HealthDietEntry,
  HealthDietEntryInput,
  HealthFoodItem,
  HealthFoodItemInput,
  HealthProfile,
  HealthTrainingPlan,
  HealthTrainingPlanInput,
  HealthWeightRecord,
  HealthWeightRecordInput,
  ScheduleTask,
  ScheduleTaskInput,
  SiteAgentRequest,
  SiteAgentMessage,
  SiteAgentResponse,
  ToolLink,
  ToolLinkInput,
} from "@/types/planner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
export const AUTH_TOKEN_KEY = "dream-trail-auth-token";

function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = typeof window === "undefined" ? "" : window.localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, {
    ...init,
    headers: authHeaders(init?.headers),
  });
}

export async function login(payload: { account: string; password: string }): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function register(payload: { account: string; password: string }): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function generatePlan(payload: AgentPlanRequest): Promise<AgentPlan> {
  const response = await apiFetch(`${API_BASE_URL}/agent/plan`, {
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
  const response = await apiFetch(`${API_BASE_URL}/schedules/daily`);
  if (!response.ok) {
    throw new Error(`Fetch schedules failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchWeeklySchedules(): Promise<ScheduleTask[]> {
  const response = await apiFetch(`${API_BASE_URL}/schedules/weekly`);
  if (!response.ok) {
    throw new Error(`Fetch weekly schedules failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchSchedules(): Promise<ScheduleTask[]> {
  const response = await apiFetch(`${API_BASE_URL}/schedules`);
  if (!response.ok) {
    throw new Error(`Fetch schedule tree failed: ${response.status}`);
  }
  return response.json();
}

export async function createSchedule(payload: ScheduleTaskInput): Promise<ScheduleTask> {
  const response = await apiFetch(`${API_BASE_URL}/schedules`, {
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
  const response = await apiFetch(`${API_BASE_URL}/schedules/${id}`, {
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
  const response = await apiFetch(`${API_BASE_URL}/schedules/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Delete schedule failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchToolLinks(): Promise<ToolLink[]> {
  const response = await apiFetch(`${API_BASE_URL}/tool-links`);
  if (!response.ok) {
    throw new Error(`Fetch tool links failed: ${response.status}`);
  }
  return response.json();
}

export async function createToolLink(payload: ToolLinkInput): Promise<ToolLink> {
  const response = await apiFetch(`${API_BASE_URL}/tool-links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Create tool link failed: ${response.status}`);
  }
  return response.json();
}

export async function updateToolLink(id: number, payload: Partial<ToolLinkInput>): Promise<ToolLink> {
  const response = await apiFetch(`${API_BASE_URL}/tool-links/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Update tool link failed: ${response.status}`);
  }
  return response.json();
}

export async function deleteToolLink(id: number): Promise<{ ok: boolean }> {
  const response = await apiFetch(`${API_BASE_URL}/tool-links/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Delete tool link failed: ${response.status}`);
  }
  return response.json();
}

export async function chatWithSiteAgent(payload: SiteAgentRequest): Promise<SiteAgentResponse> {
  const response = await apiFetch(`${API_BASE_URL}/site-agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Site agent request failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchSiteAgentMessages(): Promise<SiteAgentMessage[]> {
  const response = await apiFetch(`${API_BASE_URL}/site-agent/messages`);
  if (!response.ok) {
    throw new Error(`Fetch site agent messages failed: ${response.status}`);
  }
  return response.json();
}

export async function streamSiteAgent(
  payload: SiteAgentRequest,
  onMessage: (message: string) => void,
): Promise<SiteAgentResponse | null> {
  const response = await apiFetch(`${API_BASE_URL}/site-agent/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok || !response.body) {
    throw new Error(`Site agent stream failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResponse: SiteAgentResponse | null = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const event = chunk
        .split("\n")
        .find((line) => line.startsWith("event:"))
        ?.replace("event:", "")
        .trim();
      const data = chunk
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.replace("data:", "").trim())
        .join("\n");

      if (!data) continue;
      if (event === "done") {
        finalResponse = JSON.parse(data) as SiteAgentResponse;
      } else {
        onMessage(data);
      }
    }
  }

  return finalResponse;
}

export async function fetchHealthProfile(): Promise<HealthProfile> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/profile`);
  if (!response.ok) throw new Error(`Fetch health profile failed: ${response.status}`);
  return response.json();
}

export async function updateHealthProfile(payload: HealthProfile): Promise<HealthProfile> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Update health profile failed: ${response.status}`);
  return response.json();
}

export async function fetchHealthDiet(date: string): Promise<HealthDietEntry[]> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/diet?date=${encodeURIComponent(date)}`);
  if (!response.ok) throw new Error(`Fetch health diet failed: ${response.status}`);
  return response.json();
}

export async function createHealthDiet(payload: HealthDietEntryInput): Promise<HealthDietEntry> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/diet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Create health diet failed: ${response.status}`);
  return response.json();
}

export async function deleteHealthDiet(id: number): Promise<{ ok: boolean }> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/diet/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Delete health diet failed: ${response.status}`);
  return response.json();
}

export async function fetchHealthFoods(): Promise<HealthFoodItem[]> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/foods`);
  if (!response.ok) throw new Error(`Fetch health foods failed: ${response.status}`);
  return response.json();
}

export async function createHealthFood(payload: HealthFoodItemInput): Promise<HealthFoodItem> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/foods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Create health food failed: ${response.status}`);
  return response.json();
}

export async function deleteHealthFood(id: number): Promise<{ ok: boolean }> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/foods/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Delete health food failed: ${response.status}`);
  return response.json();
}

export async function fetchHealthTraining(date: string): Promise<HealthTrainingPlan[]> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/training?date=${encodeURIComponent(date)}`);
  if (!response.ok) throw new Error(`Fetch health training failed: ${response.status}`);
  return response.json();
}

export async function createHealthTraining(payload: HealthTrainingPlanInput): Promise<HealthTrainingPlan> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/training`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Create health training failed: ${response.status}`);
  return response.json();
}

export async function updateHealthTraining(id: number, payload: Partial<HealthTrainingPlanInput>): Promise<HealthTrainingPlan> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/training/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Update health training failed: ${response.status}`);
  return response.json();
}

export async function deleteHealthTraining(id: number): Promise<{ ok: boolean }> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/training/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Delete health training failed: ${response.status}`);
  return response.json();
}

export async function fetchHealthWeights(): Promise<HealthWeightRecord[]> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/weights`);
  if (!response.ok) throw new Error(`Fetch health weights failed: ${response.status}`);
  return response.json();
}

export async function upsertHealthWeight(payload: HealthWeightRecordInput): Promise<HealthWeightRecord> {
  const response = await apiFetch(`${API_BASE_URL}/health-center/weights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Save health weight failed: ${response.status}`);
  return response.json();
}
