import { create } from "zustand";

export type PlannerView =
  | "overview"
  | "yearly"
  | "monthly"
  | "weekly"
  | "today"
  | "ai"
  | "stats"
  | "settings";

interface PlannerStore {
  activeView: PlannerView;
  setActiveView: (view: PlannerView) => void;
}

export const usePlannerStore = create<PlannerStore>((set) => ({
  activeView: "overview",
  setActiveView: (activeView) => set({ activeView }),
}));
