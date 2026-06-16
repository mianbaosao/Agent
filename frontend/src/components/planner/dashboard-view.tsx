"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarDays, ImagePlus, Target, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { fetchDailySchedules, fetchSchedules } from "@/components/planner/planner-api";
import { ProgressRing } from "./progress-ring";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function DashboardView() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const dailyQuery = useQuery({ queryKey: ["daily-schedules"], queryFn: fetchDailySchedules });
  const treeQuery = useQuery({ queryKey: ["schedule-tree"], queryFn: fetchSchedules });

  const todayTasks = useMemo(() => {
    return (dailyQuery.data ?? [])
      .filter((task) => task.due_date === todayKey())
      .sort((a, b) => (a.start_time ?? "99:99").localeCompare(b.start_time ?? "99:99"));
  }, [dailyQuery.data]);

  const yearlyPlans = (treeQuery.data ?? []).filter((item) => item.type === "yearly");
  const completed = todayTasks.filter((task) => task.status === "done").length;
  const todayProgress = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0;
  const yearlyProgress = yearlyPlans.length ? 42 : 0;

  return (
    <div className="space-y-5">
      <motion.section
        className="grid gap-5 rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm xl:grid-cols-[minmax(280px,360px)_1fr]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <label className="group relative flex min-h-56 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-[#CFE2C9] bg-[#FFFDF7]">
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="用户上传的成长图片" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center px-6 text-center text-[#6D7B67]">
              <ImagePlus className="h-10 w-10 text-[#81C784]" />
              <div className="mt-3 text-sm font-semibold text-[#2E4B36]">上传你的目标图片</div>
              <div className="mt-1 text-xs leading-5">可以是愿景板、照片、学习桌或任何能提醒你行动的图片。</div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setImagePreview(URL.createObjectURL(file));
              }
            }}
          />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-[#23628B] shadow-sm">
            <Upload className="h-3.5 w-3.5" />
            更换
          </span>
        </label>

        <div className="flex flex-col justify-center">
          <div className="text-sm text-[#6D7B67]">早上好，包面！</div>
          <h1 className="mt-2 text-2xl font-bold text-[#2E4B36]">把年度计划落到今天的一件小事。</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4F6250]">
            今天有 <span className="font-bold text-[#23628B]">{todayTasks.length}</span> 个任务，
            已完成 <span className="font-bold text-[#81C784]">{completed}</span> 个。保持清爽、稳定、可持续。
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-[#E8F3E3] bg-[#FFFDF7] p-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#2E4B36]">
                <CalendarDays className="h-4 w-4 text-[#6EC6FF]" />
                今日任务
              </div>
              <div className="mt-2 text-2xl font-bold text-[#23628B]">{todayTasks.length}</div>
              <div className="text-xs text-[#6D7B67]">按日期从后端读取</div>
            </div>
            <div className="rounded-md border border-[#E8F3E3] bg-[#FFFDF7] p-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#2E4B36]">
                <Target className="h-4 w-4 text-[#FFD54F]" />
                年度计划
              </div>
              <div className="mt-2 text-2xl font-bold text-[#23628B]">{yearlyPlans.length}</div>
              <div className="text-xs text-[#6D7B67]">目标树来自 Schedule 表</div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ProgressRing label="今日完成率" value={todayProgress} caption={`${completed}/${todayTasks.length} 个任务完成`} color="#81C784" />
        <ProgressRing label="年度推进感" value={yearlyProgress} caption={yearlyPlans[0]?.title ?? "等待创建年度计划"} color="#6EC6FF" />
      </section>

      <section className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#2E4B36]">今日任务预览</h2>
          <span className="text-xs text-[#6D7B67]">{todayKey()}</span>
        </div>
        <div className="space-y-2">
          {todayTasks.map((task) => (
            <div key={task.id} className="grid grid-cols-[68px_1fr] gap-3 rounded-md border border-[#EAF7FF] bg-[#F8FCFF] px-3 py-2">
              <div className="text-sm font-bold text-[#23628B]">{task.start_time ?? "--:--"}</div>
              <div className={task.status === "done" ? "text-sm text-[#8B9887] line-through" : "text-sm font-semibold text-[#2E4B36]"}>
                {task.title}
              </div>
            </div>
          ))}
          {!dailyQuery.isLoading && todayTasks.length === 0 && (
            <div className="rounded-md border border-[#E8F3E3] bg-[#FFFDF7] px-4 py-8 text-center text-sm text-[#6D7B67]">
              今天还没有任务，去「每日任务」里安排一下。
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
