"use client";

import { motion } from "framer-motion";
import { AdventurerIllustration } from "./growth-illustrations";
import { ProgressRing } from "./progress-ring";

const timeline = [
  ["08:00", "学习FastAPI", "完成依赖注入和路由练习"],
  ["10:00", "系统设计", "画出目标规划数据模型"],
  ["14:00", "健身", "保持精力和节奏"],
  ["18:00", "刷题", "巩固 Python 后端基础"],
];

export function DashboardView() {
  return (
    <div className="space-y-5">
      <motion.section
        className="grid gap-5 rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm xl:grid-cols-[360px_1fr]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AdventurerIllustration />
        <div className="flex flex-col justify-center">
          <div className="text-sm text-[#6D7B67]">早上好，包面！</div>
          <h1 className="mt-2 text-2xl font-bold text-[#2E4B36]">今天也适合向梦想前进一步。</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4F6250]">
            今天距离你的年度目标完成还有 <span className="font-bold text-[#FFB74D]">216</span> 天。
            先完成一个小任务，再让系统帮你规划下一段路。
          </p>
        </div>
      </motion.section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ProgressRing label="年度目标" value={42} caption="Python 后端开发体系学习进度" color="#6EC6FF" />
        <ProgressRing label="月目标" value={63} caption="FastAPI、SQLAlchemy、部署实践" color="#81C784" />
        <ProgressRing label="周目标" value={58} caption="本周完成 Agent 规划接口联调" color="#FFD54F" />
      </section>

      <section className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#2E4B36]">今日时间轴</h2>
          <span className="text-xs text-[#6D7B67]">清晰安排，不追求塞满</span>
        </div>
        <div className="space-y-3">
          {timeline.map(([time, title, desc]) => (
            <div key={time} className="grid grid-cols-[68px_1fr] gap-3">
              <div className="text-sm font-bold text-[#23628B]">{time}</div>
              <div className="rounded-md border border-[#EAF7FF] bg-[#F8FCFF] px-3 py-2">
                <div className="text-sm font-semibold text-[#2E4B36]">{title}</div>
                <div className="mt-1 text-xs text-[#6D7B67]">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
