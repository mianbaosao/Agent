"use client";

import { motion } from "framer-motion";
import { AiPlannerView } from "./ai-planner-view";
import { DashboardView } from "./dashboard-view";
import { DreamSidebar } from "./dream-sidebar";
import { GoalTreeView } from "./goal-tree-view";
import { ScheduleTaskManager } from "./schedule-task-manager";
import { StatsView } from "./stats-view";
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
              {activeView === "yearly" && <GoalTreeView title="年度目标" />}
              {activeView === "monthly" && <GoalTreeView title="月度规划" />}
              {activeView === "weekly" && <GoalTreeView title="周计划" />}
              {activeView === "today" && <TodayView />}
              {activeView === "ai" && <AiPlannerView />}
              {activeView === "stats" && <StatsView />}
              {activeView === "settings" && <SettingsView />}
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

function SettingsView() {
  return (
    <section className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#2E4B36]">设置</h2>
      <p className="mt-2 text-sm text-[#6D7B67]">这里预留 API 地址、提醒时间、主题偏好等长期使用配置。</p>
    </section>
  );
}
