"use client";

import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const metrics = [
  ["连续完成天数", "18天", "#6EC6FF"],
  ["任务完成率", "76%", "#81C784"],
  ["专注时间", "42h", "#FFD54F"],
  ["目标达成率", "39%", "#FFB74D"],
];

export function StatsView() {
  const option = {
    color: ["#6EC6FF", "#81C784"],
    tooltip: { trigger: "axis" },
    grid: { left: 36, right: 20, top: 24, bottom: 32 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      axisLine: { lineStyle: { color: "#DDEBD8" } },
      axisLabel: { color: "#6D7B67" },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#6D7B67" },
      splitLine: { lineStyle: { color: "#EEF4EB" } },
    },
    series: [
      {
        name: "完成任务",
        type: "line",
        smooth: true,
        areaStyle: { opacity: 0.18 },
        data: [3, 4, 2, 5, 4, 6, 7],
      },
      {
        name: "专注小时",
        type: "line",
        smooth: true,
        areaStyle: { opacity: 0.12 },
        data: [1.5, 2, 1, 3, 2.5, 3.5, 4],
      },
    ],
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        {metrics.map(([label, value, color]) => (
          <div key={label} className="rounded-md border border-[#E8F3E3] bg-white p-4 shadow-sm">
            <div className="text-xs text-[#6D7B67]">{label}</div>
            <div className="mt-2 text-2xl font-bold text-[#2E4B36]" style={{ color }}>
              {value}
            </div>
          </div>
        ))}
      </section>
      <section className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-[#2E4B36]">成长曲线</h2>
        <ReactECharts option={option} style={{ height: 360 }} />
      </section>
    </div>
  );
}
