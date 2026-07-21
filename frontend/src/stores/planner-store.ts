import { create } from "zustand";

export type PlannerView = "overview" | "today" | "yearly" | "stats" | "tools" | "agent";

export interface AgentChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
}

interface PlannerStore {
  activeView: PlannerView;
  agentInput: string;
  agentMessages: AgentChatMessage[];
  setActiveView: (view: PlannerView) => void;
  setAgentInput: (input: string) => void;
  setAgentMessages: (messages: AgentChatMessage[]) => void;
  addAgentMessage: (message: AgentChatMessage) => void;
  updateAgentMessage: (id: string, content: string) => void;
}

const welcomeMessage: AgentChatMessage = {
  id: "agent-welcome",
  role: "agent",
  content: "我可以帮你写入或删除每日任务、周任务。比如：添加每日任务 阅读30分钟；删除本周任务 项目复盘。",
};

function keepRecentMessages(messages: AgentChatMessage[]) {
  return messages.slice(-20);
}

export const usePlannerStore = create<PlannerStore>((set) => ({
  activeView: "overview",
  agentInput: "",
  agentMessages: [welcomeMessage],
  setActiveView: (activeView) => set({ activeView }),
  setAgentInput: (agentInput) => set({ agentInput }),
  setAgentMessages: (agentMessages) => set({ agentMessages: agentMessages.length > 0 ? keepRecentMessages(agentMessages) : [welcomeMessage] }),
  addAgentMessage: (message) => set((state) => ({ agentMessages: keepRecentMessages([...state.agentMessages, message]) })),
  updateAgentMessage: (id, content) =>
    set((state) => ({
      agentMessages: state.agentMessages.map((message) => (message.id === id ? { ...message, content } : message)),
    })),
}));
