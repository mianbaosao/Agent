"use client";

import { motion } from "framer-motion";
import { DashboardView } from "./dashboard-view";
import { AgentTabView } from "./agent-tab-view";
import { DreamSidebar } from "./dream-sidebar";
import { GoalTreeView } from "./goal-tree-view";
import { ScheduleTaskManager } from "./schedule-task-manager";
import { StatsView } from "./stats-view";
import { ToolsView } from "./tools-view";
import { WeatherHeader } from "./weather-header";
import { usePlannerStore } from "@/stores/planner-store";

export function DreamPlannerApp() {
  const activeView = usePlannerStore((state) => state.activeView);

  return (
    <main className="min-h-screen bg-[#FFFDF7] text-[#2E4B36]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <DreamSidebar />
        <div className="min-w-0 flex-1">
          <WeatherHeader />
          <div className="p-4 lg:p-6">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              {activeView === "overview" && <DashboardView />}
              {activeView === "yearly" && <GoalTreeView title="年度计划" />}
              {activeView === "today" && <TodayView />}
              {activeView === "stats" && <StatsView />}
              {activeView === "tools" && <ToolsView />}
              {activeView === "agent" && <AgentTabView />}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}

function TodayView() {
  return <ScheduleTaskManager />;
}
