"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  createSchedule,
  deleteSchedule,
  fetchSchedules,
  updateSchedule,
} from "@/components/planner/planner-api";
import type { ScheduleTask, ScheduleTaskInput } from "@/types/planner";

type NodeType = "yearly" | "monthly" | "weekly" | "daily";

const nodeTypes: Array<{ value: NodeType; label: string }> = [
  { value: "yearly", label: "年度" },
  { value: "monthly", label: "月度" },
  { value: "weekly", label: "周度" },
  { value: "daily", label: "日任务" },
];

function flattenTree(nodes: ScheduleTask[], depth = 0): Array<ScheduleTask & { depth: number }> {
  return nodes.flatMap((node) => [
    { ...node, depth },
    ...flattenTree(node.children ?? [], depth + 1),
  ]);
}

export function GoalTreeView({ title = "年度计划" }: { title?: string }) {
  const queryClient = useQueryClient();
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftType, setDraftType] = useState<NodeType>("yearly");
  const [draftParentId, setDraftParentId] = useState<string>("root");

  const schedulesQuery = useQuery({
    queryKey: ["schedule-tree"],
    queryFn: fetchSchedules,
  });

  const yearlyPlans = useMemo(
    () => (schedulesQuery.data ?? []).filter((item) => item.type === "yearly"),
    [schedulesQuery.data],
  );
  const flatNodes = useMemo(() => flattenTree(yearlyPlans), [yearlyPlans]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["schedule-tree"] });
    queryClient.invalidateQueries({ queryKey: ["daily-schedules"] });
  };

  const createMutation = useMutation({
    mutationFn: () => {
      const titleValue = draftTitle.trim();
      if (!titleValue) return Promise.reject(new Error("标题不能为空"));
      const payload: ScheduleTaskInput = {
        title: titleValue,
        description: draftDescription.trim(),
        type: draftType,
        status: draftType === "yearly" ? "doing" : "todo",
        parent_id: draftParentId === "root" ? null : Number(draftParentId),
        sort_order: flatNodes.length,
      };
      return createSchedule(payload);
    },
    onSuccess: () => {
      setDraftTitle("");
      setDraftDescription("");
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ScheduleTaskInput> }) => updateSchedule(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: invalidate,
  });

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6D7B67]">Year Plan</p>
            <h2 className="mt-1 text-lg font-bold text-[#2E4B36]">{title}</h2>
            <p className="mt-1 text-sm text-[#6D7B67]">支持新增、编辑、删除年度计划节点，并通过 parent_id 维护层级。</p>
          </div>
          <span className="text-xs text-[#6D7B67]">{yearlyPlans.length} 个年度计划</span>
        </div>

        <div className="grid gap-2 rounded-md border border-[#E8F3E3] bg-[#FFFDF7] p-3 lg:grid-cols-[120px_180px_1fr_1fr_auto]">
          <select
            className="h-10 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm text-[#2E4B36] outline-none"
            value={draftType}
            onChange={(event) => setDraftType(event.target.value as NodeType)}
          >
            {nodeTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm text-[#2E4B36] outline-none"
            value={draftParentId}
            onChange={(event) => setDraftParentId(event.target.value)}
          >
            <option value="root">根节点</option>
            {flatNodes.map((node) => (
              <option key={node.id} value={node.id}>
                {"　".repeat(Math.min(node.depth, 4))}
                {node.title}
              </option>
            ))}
          </select>
          <input
            className="h-10 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm text-[#2E4B36] outline-none"
            placeholder="计划标题"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
          />
          <input
            className="h-10 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm text-[#2E4B36] outline-none"
            placeholder="计划说明"
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
          />
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6EC6FF] px-4 text-sm font-semibold text-white disabled:opacity-50"
            disabled={!draftTitle.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            <Plus className="h-4 w-4" />
            新增
          </button>
        </div>
      </div>

      <div className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
        {schedulesQuery.isLoading && <div className="text-sm text-[#6D7B67]">正在加载年度计划...</div>}
        {schedulesQuery.isError && <div className="text-sm text-[#A64B2A]">年度计划加载失败，请确认 Java 后端已启动。</div>}

        <div className="space-y-2">
          {yearlyPlans.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              onUpdate={(id, payload) => updateMutation.mutate({ id, payload })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
          {!schedulesQuery.isLoading && yearlyPlans.length === 0 && (
            <div className="rounded-md border border-[#E8F3E3] bg-[#FFFDF7] px-4 py-10 text-center text-sm text-[#6D7B67]">
              还没有年度计划。先在上方创建一个年度根节点。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TreeNode({
  node,
  depth,
  onUpdate,
  onDelete,
}: {
  node: ScheduleTask;
  depth: number;
  onUpdate: (id: number, payload: Partial<ScheduleTaskInput>) => void;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(node.title);
  const [description, setDescription] = useState(node.description);
  const hasChildren = Boolean(node.children?.length);

  return (
    <div className="space-y-2">
      <div
        className="grid gap-2 rounded-md border border-[#E8F3E3] bg-[#FFFDF7] px-3 py-2 transition hover:border-[#BDE7FF] hover:bg-[#F8FCFF] md:grid-cols-[24px_1fr_auto]"
        style={{ marginLeft: Math.min(depth * 18, 72) }}
      >
        <button
          type="button"
          className="mt-0.5 text-[#6D7B67]"
          onClick={() => hasChildren && setOpen((value) => !value)}
          aria-label={open ? "折叠节点" : "展开节点"}
        >
          {hasChildren ? open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : null}
        </button>

        <div className="min-w-0">
          {editing ? (
            <div className="grid gap-2 md:grid-cols-2">
              <input
                className="h-9 rounded-md border border-[#BDE7FF] bg-white px-3 text-sm text-[#2E4B36] outline-none"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <input
                className="h-9 rounded-md border border-[#BDE7FF] bg-white px-3 text-sm text-[#2E4B36] outline-none"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          ) : (
            <>
              <div className="truncate text-sm font-semibold text-[#2E4B36]">{node.title}</div>
              {node.description && <div className="mt-1 text-xs leading-5 text-[#6D7B67]">{node.description}</div>}
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:justify-end">
          <span className="mr-1 rounded-md border border-[#DDEBD8] bg-white px-2 py-0.5 text-xs text-[#4F6250]">
            {node.type}
          </span>
          {editing ? (
            <>
              <button
                type="button"
                className="rounded-md border border-[#BDE7FF] bg-white p-2 text-[#23628B]"
                onClick={() => {
                  onUpdate(node.id, { title: title.trim() || node.title, description: description.trim() });
                  setEditing(false);
                }}
                aria-label="保存节点"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-md border border-[#DDEBD8] bg-white p-2 text-[#6D7B67]"
                onClick={() => {
                  setTitle(node.title);
                  setDescription(node.description);
                  setEditing(false);
                }}
                aria-label="取消编辑"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rounded-md border border-transparent bg-transparent p-2 text-[#6D7B67] hover:border-[#DDEBD8] hover:bg-white"
              onClick={() => setEditing(true)}
              aria-label="编辑节点"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            className="rounded-md border border-transparent bg-transparent p-2 text-[#A64B2A] hover:border-[#F7B7A3] hover:bg-white"
            onClick={() => onDelete(node.id)}
            aria-label="删除节点"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && hasChildren && (
        <div className="space-y-2">
          {node.children?.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
