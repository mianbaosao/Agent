"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Save, WandSparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generatePlan } from "./planner-api";
import { AiCompanionIllustration } from "./growth-illustrations";
import type { AgentPlan, PlanNode, PlannerLevel } from "@/types/planner";

const levels: Array<{ value: PlannerLevel; label: string }> = [
  { value: "yearly", label: "年度规划" },
  { value: "monthly", label: "月规划" },
  { value: "weekly", label: "周规划" },
  { value: "daily", label: "日规划" },
];

export function AiPlannerView() {
  const [goal, setGoal] = useState("2026年我要学完Python后端开发");
  const [level, setLevel] = useState<PlannerLevel>("yearly");
  const [autoSave, setAutoSave] = useState(true);

  const mutation = useMutation({
    mutationFn: () => generatePlan({ goal, level, auto_save: autoSave }),
  });

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <motion.section
        className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AiCompanionIllustration />
        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-bold text-[#2E4B36]">我的目标</label>
            <textarea
              className="mt-2 min-h-28 w-full resize-none rounded-md border border-[#DDEBD8] bg-[#FFFDF7] p-3 text-sm leading-6 text-[#2E4B36] outline-none focus:border-[#6EC6FF] focus:ring-2 focus:ring-[#6EC6FF]/20"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {levels.map((item) => (
              <button
                key={item.value}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  level === item.value
                    ? "border-[#6EC6FF] bg-[#EAF7FF] text-[#23628B]"
                    : "border-[#DDEBD8] bg-white text-[#4F6250]"
                }`}
                onClick={() => setLevel(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 py-2 text-sm text-[#4F6250]">
            <input checked={autoSave} onChange={(event) => setAutoSave(event.target.checked)} type="checkbox" />
            生成后自动保存到 Schedule
          </label>

          <Button className="w-full" onClick={() => mutation.mutate()} disabled={!goal.trim() || mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
            生成计划
          </Button>
        </div>
      </motion.section>

      <section className="min-h-[560px] rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#2E4B36]">AI规划结果</h2>
            <p className="mt-1 text-sm text-[#6D7B67]">这里会实时展示后端 LangChain Agent 返回的数据。</p>
          </div>
          {autoSave && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#F3E4A5] bg-[#FFF8D8] px-2 py-1 text-xs text-[#6E5318]">
              <Save className="h-3.5 w-3.5" />
              auto_save
            </span>
          )}
        </div>

        <div className="mb-4 grid gap-2 rounded-md border border-[#BDE7FF] bg-[#F8FCFF] p-3 text-xs text-[#4F6250] md:grid-cols-4">
          <StatusItem label="Agent接口" value="/agent/plan" />
          <StatusItem
            label="执行状态"
            value={mutation.isPending ? "运行中" : mutation.isSuccess ? "成功" : mutation.isError ? "失败" : "待执行"}
          />
          <StatusItem label="保存模式" value={autoSave ? "auto_save=true" : "仅预览"} />
          <StatusItem label="规划层级" value={level} />
        </div>

        {mutation.isError && (
          <div className="rounded-md border border-[#F7B7A3] bg-[#FFF0EA] p-4 text-sm text-[#A64B2A]">
            后端联调失败：{mutation.error.message}
          </div>
        )}

        {mutation.isPending && (
          <div className="grid min-h-72 place-items-center text-sm text-[#6D7B67]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#6EC6FF]" />
              AI规划师正在拆解目标...
            </div>
          </div>
        )}

        {mutation.data ? <PlanResult plan={mutation.data} /> : !mutation.isPending && !mutation.isError ? <EmptyState /> : null}
      </section>
    </div>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#EAF7FF] bg-white/80 px-3 py-2">
      <div className="text-[#7A8B73]">{label}</div>
      <div className="mt-1 font-semibold text-[#23628B]">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-72 place-items-center rounded-md border border-dashed border-[#DDEBD8] bg-[#FFFDF7] text-center">
      <div>
        <div className="text-sm font-bold text-[#2E4B36]">输入目标，生成第一版路线图</div>
        <div className="mt-2 text-xs text-[#6D7B67]">没有 API key 时会自动使用本地 RuleBasedPlanner。</div>
      </div>
    </div>
  );
}

function PlanResult({ plan }: { plan: AgentPlan }) {
  const nodes = plan.children ?? plan.plans ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-[#BDE7FF] bg-[#F8FCFF] p-4">
        <div className="text-sm font-bold text-[#23628B]">{plan.goal ?? plan.title}</div>
        <div className="mt-2 text-sm leading-6 text-[#4F6250]">{plan.summary ?? plan.description}</div>
        {plan.id && <div className="mt-2 text-xs text-[#6D7B67]">已保存 Schedule ID：{plan.id}</div>}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {nodes.map((node, index) => (
          <PlanCard key={`${node.title}-${index}`} node={node} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ node }: { node: PlanNode }) {
  return (
    <motion.div
      className="rounded-md border border-[#E8F3E3] bg-[#FFFDF7] p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[#2E4B36]">{node.title}</div>
          <p className="mt-2 text-xs leading-5 text-[#6D7B67]">{node.description}</p>
        </div>
        <span className="shrink-0 rounded-md border border-[#DDEBD8] bg-white px-2 py-0.5 text-xs text-[#4F6250]">
          {node.type}
        </span>
      </div>
      {node.children?.length ? (
        <div className="mt-3 space-y-2 border-l-2 border-[#DDEBD8] pl-3">
          {node.children.slice(0, 4).map((child, index) => (
            <div key={`${child.title}-${index}`} className="text-xs text-[#4F6250]">
              <span className="font-semibold">{child.title}</span>
              <span className="ml-2 text-[#8A9A83]">{child.type}</span>
            </div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
