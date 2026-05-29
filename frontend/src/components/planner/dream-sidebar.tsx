"use client";

import {
  BarChart3,
  Bot,
  CalendarDays,
  CalendarRange,
  Home,
  Settings,
  Sun,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type PlannerView, usePlannerStore } from "@/stores/planner-store";

const navItems: Array<{
  id: PlannerView;
  label: string;
  icon: typeof Home;
  emoji: string;
}> = [
  { id: "overview", label: "总览", icon: Home, emoji: "🏠" },
  { id: "yearly", label: "年度目标", icon: Target, emoji: "🎯" },
  { id: "monthly", label: "月度规划", icon: CalendarRange, emoji: "📅" },
  { id: "weekly", label: "周计划", icon: CalendarDays, emoji: "🗓️" },
  { id: "today", label: "今日任务", icon: Sun, emoji: "☀️" },
  { id: "ai", label: "AI规划师", icon: Bot, emoji: "🤖" },
  { id: "stats", label: "成长统计", icon: BarChart3, emoji: "📈" },
  { id: "settings", label: "设置", icon: Settings, emoji: "⚙️" },
];

export function DreamSidebar() {
  const { activeView, setActiveView } = usePlannerStore();

  return (
    <aside className="flex h-20 shrink-0 border-b border-[#DDEBD8] bg-[#FFFDF7]/95 px-4 shadow-sm lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="hidden border-b border-[#E8F3E3] px-2 py-5 lg:block">
        <div className="text-lg font-bold text-[#2E4B36]">Dream Trail</div>
        <div className="mt-1 text-xs text-[#6D7B67]">一整年的目标陪伴系统</div>
      </div>

      <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-3 lg:block lg:space-y-1 lg:overflow-visible lg:px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              className={cn(
                "flex h-12 min-w-32 items-center gap-2 rounded-md border px-3 text-left text-sm font-medium transition lg:w-full",
                active
                  ? "border-[#6EC6FF]/70 bg-[#EAF7FF] text-[#23628B] shadow-[0_8px_20px_rgba(110,198,255,0.18)]"
                  : "border-transparent bg-transparent text-[#4F6250] hover:border-[#DDEBD8] hover:bg-white",
              )}
              onClick={() => setActiveView(item.id)}
            >
              <span aria-hidden>{item.emoji}</span>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
