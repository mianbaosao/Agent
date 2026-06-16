import type {
  AgentPlan,
  AgentPlanRequest,
  ScheduleTask,
  ScheduleTaskInput,
  SiteAgentRequest,
  SiteAgentMessage,
  SiteAgentResponse,
  ToolLink,
  ToolLinkInput,
} from "@/types/planner";

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

export async function fetchWeeklySchedules(): Promise<ScheduleTask[]> {
  const response = await fetch(`${API_BASE_URL}/schedules/weekly`);
  if (!response.ok) {
    throw new Error(`Fetch weekly schedules failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchSchedules(): Promise<ScheduleTask[]> {
  const response = await fetch(`${API_BASE_URL}/schedules`);
  if (!response.ok) {
    throw new Error(`Fetch schedule tree failed: ${response.status}`);
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

export async function fetchToolLinks(): Promise<ToolLink[]> {
  const response = await fetch(`${API_BASE_URL}/tool-links`);
  if (!response.ok) {
    throw new Error(`Fetch tool links failed: ${response.status}`);
  }
  return response.json();
}

export async function createToolLink(payload: ToolLinkInput): Promise<ToolLink> {
  const response = await fetch(`${API_BASE_URL}/tool-links`, {
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
  const response = await fetch(`${API_BASE_URL}/tool-links/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/tool-links/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Delete tool link failed: ${response.status}`);
  }
  return response.json();
}

export async function chatWithSiteAgent(payload: SiteAgentRequest): Promise<SiteAgentResponse> {
  const response = await fetch(`${API_BASE_URL}/site-agent/chat`, {
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
  const response = await fetch(`${API_BASE_URL}/site-agent/messages`);
  if (!response.ok) {
    throw new Error(`Fetch site agent messages failed: ${response.status}`);
  }
  return response.json();
}

export async function streamSiteAgent(
  payload: SiteAgentRequest,
  onMessage: (message: string) => void,
): Promise<SiteAgentResponse | null> {
  const response = await fetch(`${API_BASE_URL}/site-agent/stream`, {
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
