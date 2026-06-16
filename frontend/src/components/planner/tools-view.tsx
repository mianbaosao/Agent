"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Check,
  ExternalLink,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  createToolLink,
  deleteToolLink,
  fetchToolLinks,
  updateToolLink,
} from "@/components/planner/planner-api";
import type { ToolGroupId, ToolLink, ToolLinkInput } from "@/types/planner";

interface ToolGroup {
  id: ToolGroupId;
  title: string;
  icon: typeof GraduationCap;
}

const groups: ToolGroup[] = [
  { id: "learning", title: "学习", icon: GraduationCap },
  { id: "work", title: "工作", icon: BriefcaseBusiness },
  { id: "search", title: "检索", icon: Search },
  { id: "utility", title: "工具", icon: Wrench },
];

function normalizeHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function faviconUrl(href: string) {
  try {
    const url = new URL(href);
    return `${url.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

export function ToolsView() {
  const queryClient = useQueryClient();
  const [draftGroupId, setDraftGroupId] = useState<ToolGroupId>("learning");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftHref, setDraftHref] = useState("");

  const linksQuery = useQuery({
    queryKey: ["tool-links"],
    queryFn: fetchToolLinks,
  });

  const links = linksQuery.data ?? [];
  const totalLinks = links.length;

  const linksByGroup = useMemo(() => {
    return groups.reduce<Record<ToolGroupId, ToolLink[]>>(
      (result, group) => {
        result[group.id] = links
          .filter((link) => link.group_id === group.id)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
        return result;
      },
      { learning: [], work: [], search: [], utility: [] },
    );
  }, [links]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tool-links"] });

  const createMutation = useMutation({
    mutationFn: () => {
      const label = draftLabel.trim();
      const href = normalizeHref(draftHref);
      if (!label || !href) return Promise.reject(new Error("链接名称和地址不能为空"));
      return createToolLink({
        group_id: draftGroupId,
        label,
        href,
        sort_order: linksByGroup[draftGroupId].length,
      });
    },
    onSuccess: () => {
      setDraftLabel("");
      setDraftHref("");
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ToolLinkInput> }) => updateToolLink(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteToolLink,
    onSuccess: invalidate,
  });

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6D7B67]">Daily Tools</p>
            <h2 className="mt-1 text-lg font-bold text-[#2E4B36]">日常工具</h2>
            <p className="mt-1 text-sm text-[#6D7B67]">快捷链接已保存到 MySQL，可自行新增、编辑、删除。</p>
          </div>
          <div className="rounded-md border border-[#E8F3E3] bg-[#FFFDF7] px-3 py-2 text-sm font-semibold text-[#23628B]">
            {totalLinks} 个入口
          </div>
        </div>

        <div className="mt-4 grid gap-2 rounded-md border border-[#E8F3E3] bg-[#FFFDF7] p-3 lg:grid-cols-[140px_1fr_1.3fr_auto]">
          <select
            className="h-10 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm text-[#2E4B36] outline-none"
            value={draftGroupId}
            onChange={(event) => setDraftGroupId(event.target.value as ToolGroupId)}
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.title}
              </option>
            ))}
          </select>
          <input
            className="h-10 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm text-[#2E4B36] outline-none"
            placeholder="链接名称"
            value={draftLabel}
            onChange={(event) => setDraftLabel(event.target.value)}
          />
          <input
            className="h-10 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm text-[#2E4B36] outline-none"
            placeholder="https://example.com"
            value={draftHref}
            onChange={(event) => setDraftHref(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && draftLabel.trim() && draftHref.trim()) {
                createMutation.mutate();
              }
            }}
          />
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6EC6FF] px-4 text-sm font-semibold text-white disabled:opacity-50"
            disabled={!draftLabel.trim() || !draftHref.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            <Plus className="h-4 w-4" />
            添加
          </button>
        </div>

        {linksQuery.isError && <div className="mt-3 text-sm text-[#A64B2A]">工具链接加载失败，请确认 Java 后端已启动。</div>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <ToolGroupCard
            key={group.id}
            group={group}
            links={linksByGroup[group.id]}
            onUpdate={(id, payload) => updateMutation.mutate({ id, payload })}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>
    </section>
  );
}

function ToolGroupCard({
  group,
  links,
  onUpdate,
  onDelete,
}: {
  group: ToolGroup;
  links: ToolLink[];
  onUpdate: (id: number, payload: Partial<ToolLinkInput>) => void;
  onDelete: (id: number) => void;
}) {
  const Icon = group.icon;
  return (
    <div className="rounded-md border border-[#E8F3E3] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-base font-bold text-[#2E4B36]">
        <Icon className="h-5 w-5 text-[#81C784]" />
        {group.title}
      </div>
      <div className="grid gap-2">
        {links.map((link) => (
          <EditableToolLink key={link.id} link={link} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
        {links.length === 0 && (
          <div className="rounded-md border border-dashed border-[#DDEBD8] bg-[#FFFDF7] px-3 py-6 text-center text-sm text-[#6D7B67]">
            这个分组还没有链接。
          </div>
        )}
      </div>
    </div>
  );
}

function EditableToolLink({
  link,
  onUpdate,
  onDelete,
}: {
  link: ToolLink;
  onUpdate: (id: number, payload: Partial<ToolLinkInput>) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(link.label);
  const [href, setHref] = useState(link.href);
  const [iconFailed, setIconFailed] = useState(false);

  if (editing) {
    return (
      <div className="grid gap-2 rounded-md border border-[#BDE7FF] bg-[#F8FCFF] p-2 sm:grid-cols-[1fr_1.2fr_auto]">
        <input
          className="h-9 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm text-[#2E4B36] outline-none"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        <input
          className="h-9 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm text-[#2E4B36] outline-none"
          value={href}
          onChange={(event) => setHref(event.target.value)}
        />
        <div className="flex gap-1">
          <button
            type="button"
            className="rounded-md border border-[#BDE7FF] bg-white p-2 text-[#23628B]"
            onClick={() => {
              onUpdate(link.id, { label: label.trim() || link.label, href: normalizeHref(href) });
              setEditing(false);
              setIconFailed(false);
            }}
            aria-label="保存链接"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-md border border-[#DDEBD8] bg-white p-2 text-[#6D7B67]"
            onClick={() => {
              setLabel(link.label);
              setHref(link.href);
              setEditing(false);
            }}
            aria-label="取消编辑"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-[#E8F3E3] bg-[#FFFDF7] px-2 py-2 transition hover:border-[#BDE7FF] hover:bg-[#F8FCFF]">
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-[#2E4B36]"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#DDEBD8] bg-white text-xs font-bold text-[#23628B]">
          {!iconFailed && faviconUrl(link.href) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={faviconUrl(link.href)} alt="" className="h-4 w-4" onError={() => setIconFailed(true)} />
          ) : (
            link.label.slice(0, 1).toUpperCase()
          )}
        </span>
        <span className="truncate">{link.label}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#6D7B67]" />
      </a>
      <button
        type="button"
        className="rounded-md border border-transparent bg-transparent p-2 text-[#6D7B67] hover:border-[#DDEBD8] hover:bg-white"
        onClick={() => setEditing(true)}
        aria-label="编辑链接"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="rounded-md border border-transparent bg-transparent p-2 text-[#A64B2A] hover:border-[#F7B7A3] hover:bg-white"
        onClick={() => onDelete(link.id)}
        aria-label="删除链接"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
