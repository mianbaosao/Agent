"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { DashboardView } from "./dashboard-view";
import { AgentTabView } from "./agent-tab-view";
import { DreamSidebar } from "./dream-sidebar";
import { GoalTreeView } from "./goal-tree-view";
import { HealthCenterView } from "./health-center-view";
import { ScheduleTaskManager } from "./schedule-task-manager";
import { StatsView } from "./stats-view";
import { ToolsView } from "./tools-view";
import { WeatherHeader } from "./weather-header";
import { usePlannerStore } from "@/stores/planner-store";

export function DreamPlannerApp() {
  const activeView = usePlannerStore((state) => state.activeView);

  return (
    <main className="min-h-screen bg-[#FFFDF7] text-[#2E4B36]">
      <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
        <DreamSidebar />
        <div className="min-w-0 flex-1 lg:overflow-y-auto">
          <WeatherHeader />
          <div className="mx-auto w-full max-w-[1500px] p-4 lg:p-6">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              {activeView === "overview" && <DashboardView />}
              {activeView === "yearly" && <ProtectedYearlyView />}
              {activeView === "today" && <TodayView />}
              {activeView === "health" && <ProtectedHealthView />}
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

function ProtectedYearlyView() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  function storedPassword() {
    if (typeof window === "undefined") return "222333";
    return window.localStorage.getItem("dream-trail-yearly-password") || "222333";
  }

  function unlock() {
    if (password === storedPassword()) {
      setUnlocked(true);
      setPassword("");
      setError("");
      return;
    }
    setError("密码不正确，请再试一次。");
  }

  function savePassword() {
    const value = newPassword.trim();
    if (value.length < 4) {
      setError("新密码至少 4 位。");
      return;
    }
    window.localStorage.setItem("dream-trail-yearly-password", value);
    setNewPassword("");
    setError("年度计划访问密码已更新。");
  }

  if (!unlocked) {
    return (
      <section className="mx-auto max-w-xl rounded-[28px] border border-[#E1EFD9] bg-white p-6 shadow-sm">
        <div className="rounded-[24px] bg-[linear-gradient(135deg,#FFF8E8,#EFF8E8)] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6D7B67]">Encrypted Year Plan</p>
          <h2 className="mt-2 text-2xl font-black text-[#2E4B36]">年度计划已加密</h2>
          <p className="mt-2 text-sm leading-6 text-[#6D7B67]">输入访问密码后查看你的长期目标。</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              type="password"
              className="h-11 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm text-[#2E4B36] outline-none focus:border-[#81C784]"
              placeholder="输入年度计划访问密码"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") unlock();
              }}
            />
            <button type="button" className="h-11 rounded-md bg-[#81C784] px-5 text-sm font-bold text-white" onClick={unlock}>
              解锁
            </button>
          </div>
          {error && <div className="mt-3 text-sm font-semibold text-[#A64B2A]">{error}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-[#E8F3E3] bg-white p-4 shadow-sm">
        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6D7B67]">Security Setting</p>
            <h3 className="mt-1 text-base font-black text-[#2E4B36]">年度计划加密设置</h3>
          </div>
          <input
            type="password"
            className="h-10 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm text-[#2E4B36] outline-none focus:border-[#81C784]"
            placeholder="设置新访问密码"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <button type="button" className="h-10 rounded-md bg-[#81C784] px-4 text-sm font-bold text-white" onClick={savePassword}>
            保存密码
          </button>
        </div>
        {error && <div className="mt-2 text-sm font-semibold text-[#6D7B67]">{error}</div>}
      </div>
      <GoalTreeView title="年度计划" />
    </section>
  );
}

function ProtectedHealthView() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  function storedPassword() {
    if (typeof window === "undefined") return "222333";
    return window.localStorage.getItem("dream-trail-health-password") || "222333";
  }

  function unlock() {
    if (password === storedPassword()) {
      setUnlocked(true);
      setPassword("");
      setMessage("");
      return;
    }
    setMessage("密码不正确，请再试一次。");
  }

  function savePassword() {
    const value = newPassword.trim();
    if (value.length < 4) {
      setMessage("新密码至少 4 位。");
      return;
    }
    window.localStorage.setItem("dream-trail-health-password", value);
    setNewPassword("");
    setMessage("健康中心访问密码已更新。");
  }

  if (!unlocked) {
    return (
      <section className="mx-auto max-w-xl rounded-[28px] border border-[#E1EFD9] bg-white p-6 shadow-sm">
        <div className="rounded-[24px] bg-[linear-gradient(135deg,#FFF8E8,#EFF8E8)] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6D7B67]">Encrypted Health Center</p>
          <h2 className="mt-2 text-2xl font-black text-[#2E4B36]">健康中心已加密</h2>
          <p className="mt-2 text-sm leading-6 text-[#6D7B67]">输入访问密码后查看饮食、训练记录。</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              type="password"
              className="h-11 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm text-[#2E4B36] outline-none focus:border-[#81C784]"
              placeholder="输入健康中心访问密码"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") unlock();
              }}
            />
            <button type="button" className="h-11 rounded-md bg-[#81C784] px-5 text-sm font-bold text-white" onClick={unlock}>
              解锁
            </button>
          </div>
          {message && <div className="mt-3 text-sm font-semibold text-[#A64B2A]">{message}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-[#E8F3E3] bg-white p-4 shadow-sm">
        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6D7B67]">Security Setting</p>
            <h3 className="mt-1 text-base font-black text-[#2E4B36]">健康中心加密设置</h3>
          </div>
          <input
            type="password"
            className="h-10 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm text-[#2E4B36] outline-none focus:border-[#81C784]"
            placeholder="设置新访问密码"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <button type="button" className="h-10 rounded-md bg-[#81C784] px-4 text-sm font-bold text-white" onClick={savePassword}>
            保存密码
          </button>
        </div>
        {message && <div className="mt-2 text-sm font-semibold text-[#6D7B67]">{message}</div>}
      </div>
      <HealthCenterView />
    </section>
  );
}
