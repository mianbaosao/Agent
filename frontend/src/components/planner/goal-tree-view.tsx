"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { PlanNode } from "@/types/planner";

const sampleTree: PlanNode = {
  title: "2026年学完Python后端开发",
  description: "从基础语法到可上线的后端项目。",
  type: "yearly",
  children: [
    {
      title: "Q1：Python与Web基础",
      description: "完成 Python、HTTP、FastAPI 基础。",
      type: "monthly",
      children: [
        {
          title: "第1周：FastAPI 路由与模型",
          description: "完成一个目标规划 API。",
          type: "weekly",
          children: [
            { title: "搭建项目结构", description: "完成 main.py 和 router 设计。", type: "daily" },
            { title: "实现数据模型", description: "完成 Schedule 表。", type: "daily" },
          ],
        },
      ],
    },
    {
      title: "Q2：数据库与部署",
      description: "学习 SQLAlchemy、缓存、Docker 和发布。",
      type: "monthly",
      children: [],
    },
  ],
};

export function GoalTreeView({ title = "年度目标树" }: { title?: string }) {
  return (
    <section className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#2E4B36]">{title}</h2>
        <p className="mt-1 text-sm text-[#6D7B67]">Notion + 飞书目标树风格，支持展开折叠和查看层级。</p>
      </div>
      <TreeNode node={sampleTree} depth={0} />
    </section>
  );
}

function TreeNode({ node, depth }: { node: PlanNode; depth: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = Boolean(node.children?.length);

  return (
    <div className="space-y-2">
      <button
        className="grid w-full grid-cols-[24px_1fr_auto] items-start gap-2 rounded-md border border-[#E8F3E3] bg-[#FFFDF7] px-3 py-2 text-left transition hover:border-[#BDE7FF] hover:bg-[#F8FCFF]"
        style={{ marginLeft: depth * 18 }}
        onClick={() => hasChildren && setOpen((value) => !value)}
      >
        <span className="mt-0.5 text-[#6D7B67]">
          {hasChildren ? open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : null}
        </span>
        <span>
          <span className="block text-sm font-semibold text-[#2E4B36]">{node.title}</span>
          <span className="mt-1 block text-xs leading-5 text-[#6D7B67]">{node.description}</span>
        </span>
        <span className="rounded-md border border-[#DDEBD8] bg-white px-2 py-0.5 text-xs text-[#4F6250]">
          {node.type}
        </span>
      </button>
      {open && hasChildren && (
        <div className="space-y-2">
          {node.children?.map((child) => (
            <TreeNode key={`${child.type}-${child.title}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
