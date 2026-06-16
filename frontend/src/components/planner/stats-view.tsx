"use client";

import ReactECharts from "echarts-for-react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck2, Flame, Target, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import { fetchDailySchedules } from "@/components/planner/planner-api";

const monthLabels = Array.from({ length: 12 }, (_, index) => `${index + 1}月`);

function currentYear() {
  return new Date().getFullYear();
}

export function StatsView() {
  const [year, setYear] = useState(String(currentYear()));
  const tasksQuery = useQuery({ queryKey: ["daily-schedules"], queryFn: fetchDailySchedules });

  const monthlyStats = useMemo(() => {
    const base = monthLabels.map((month) => ({ month, total: 0, done: 0, rate: 0 }));
    for (const task of tasksQuery.data ?? []) {
      if (!task.due_date?.startsWith(`${year}-`)) continue;
      const monthIndex = Number(task.due_date.slice(5, 7)) - 1;
      if (monthIndex < 0 || monthIndex > 11) continue;
      base[monthIndex].total += 1;
      if (task.status === "done") {
        base[monthIndex].done += 1;
      }
    }
    return base.map((item) => ({
      ...item,
      rate: item.total ? Math.round((item.done / item.total) * 100) : 0,
    }));
  }, [tasksQuery.data, year]);

  const total = monthlyStats.reduce((sum, item) => sum + item.total, 0);
  const done = monthlyStats.reduce((sum, item) => sum + item.done, 0);
  const rate = total ? Math.round((done / total) * 100) : 0;
  const bestMonth = monthlyStats.reduce((best, item) => (item.rate > best.rate ? item : best), monthlyStats[0]);

  const option = {
    color: ["#81C784", "#6EC6FF", "#FFD54F"],
    tooltip: { trigger: "axis" },
    legend: { top: 0, textStyle: { color: "#4F6250" } },
    grid: { left: 36, right: 24, top: 56, bottom: 28 },
    xAxis: {
      type: "category",
      data: monthLabels,
      axisLine: { lineStyle: { color: "#DDEBD8" } },
      axisLabel: { color: "#6D7B67" },
    },
    yAxis: [
      {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#6D7B67" },
        splitLine: { lineStyle: { color: "#EEF5EA" } },
      },
      {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: { formatter: "{value}%", color: "#6D7B67" },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "任务数",
        type: "bar",
        data: monthlyStats.map((item) => item.total),
        barMaxWidth: 28,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "完成数",
        type: "bar",
        data: monthlyStats.map((item) => item.done),
        barMaxWidth: 28,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "完成率",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: monthlyStats.map((item) => item.rate),
      },
    ],
  };

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6D7B67]">Stats</p>
            <h2 className="mt-1 text-lg font-bold text-[#2E4B36]">年度完成统计</h2>
            <p className="mt-1 text-sm text-[#6D7B67]">按每日任务的日期统计一年内每个月的完成情况。</p>
          </div>
          <input
            className="h-10 w-28 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm font-semibold text-[#2E4B36] outline-none"
            value={year}
            onChange={(event) => setYear(event.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric icon={Target} label="全年任务" value={String(total)} />
        <Metric icon={CalendarCheck2} label="已完成" value={String(done)} />
        <Metric icon={Flame} label="完成率" value={`${rate}%`} />
        <Metric icon={Timer} label="最佳月份" value={bestMonth?.rate ? `${bestMonth.month} ${bestMonth.rate}%` : "--"} />
      </div>

      <div className="rounded-md border border-[#E8F3E3] bg-white p-4 shadow-sm">
        <ReactECharts option={option} style={{ height: 360 }} notMerge lazyUpdate />
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#E8F3E3] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#6D7B67]">
        <Icon className="h-4 w-4 text-[#6EC6FF]" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-bold text-[#23628B]">{value}</div>
    </div>
  );
}
