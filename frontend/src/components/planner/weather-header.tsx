"use client";

import { motion } from "framer-motion";
import { CalendarDays, Sun } from "lucide-react";

export function WeatherHeader() {
  const today = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  return (
    <motion.header
      className="grid gap-3 border-b border-[#E8F3E3] bg-[#FFFDF7]/92 px-5 py-4 xl:grid-cols-[1fr_auto]"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <div className="text-sm font-semibold text-[#2E4B36]">面包屋</div>
        <div className="mt-1 text-xs text-[#6D7B67]">KEEP GOING！！！</div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-[#BDE7FF] bg-[#EAF7FF] px-3 py-2">
          <Sun className="h-5 w-5 text-[#FFB74D]" />
          <div>
            <div className="text-sm font-semibold text-[#23628B]">北京海淀 26℃</div>
            <div className="text-xs text-[#5D788A]">适合专注学习</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#F3E4A5] bg-[#FFF8D8] px-3 py-2 text-sm text-[#6E5318]">
          <CalendarDays className="h-4 w-4" />
          {today}
        </div>
      </div>
    </motion.header>
  );
}
