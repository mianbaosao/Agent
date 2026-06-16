"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck2,
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  createSchedule,
  deleteSchedule,
  fetchDailySchedules,
  fetchWeeklySchedules,
  updateSchedule,
} from "@/components/planner/planner-api";
import { cn } from "@/lib/utils";
import type { ScheduleTask } from "@/types/planner";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

const shortDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
});

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function shiftDate(dateKey: string, offset: number) {
  const date = parseDate(dateKey);
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
}

function weekStartKey(dateKey: string) {
  const date = parseDate(dateKey);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return toDateKey(date);
}

function weekEndKey(dateKey: string) {
  return shiftDate(weekStartKey(dateKey), 6);
}

export function ScheduleTaskManager() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTime, setDraftTime] = useState("");
  const [weeklyDraft, setWeeklyDraft] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [draggingDailyId, setDraggingDailyId] = useState<number | null>(null);
  const [dragOverDailyId, setDragOverDailyId] = useState<number | null>(null);

  const dailyQuery = useQuery({
    queryKey: ["daily-schedules"],
    queryFn: fetchDailySchedules,
  });

  const weeklyQuery = useQuery({
    queryKey: ["weekly-schedules"],
    queryFn: fetchWeeklySchedules,
  });

  const selectedWeekStart = weekStartKey(selectedDate);
  const selectedWeekEnd = weekEndKey(selectedDate);

  const dailyTasks = useMemo(() => {
    return (dailyQuery.data ?? [])
      .filter((task) => task.due_date === selectedDate)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.start_time ?? "99:99").localeCompare(b.start_time ?? "99:99") || a.id - b.id);
  }, [selectedDate, dailyQuery.data]);

  const weeklyTasks = useMemo(() => {
    return (weeklyQuery.data ?? [])
      .filter((task) => task.due_date === selectedWeekStart)
      .sort((a, b) => a.id - b.id);
  }, [selectedWeekStart, weeklyQuery.data]);

  const dailyDone = dailyTasks.filter((task) => task.status === "done").length;
  const weeklyDone = weeklyTasks.filter((task) => task.status === "done").length;

  const invalidateDaily = () => queryClient.invalidateQueries({ queryKey: ["daily-schedules"] });
  const invalidateWeekly = () => queryClient.invalidateQueries({ queryKey: ["weekly-schedules"] });

  const createDailyMutation = useMutation({
    mutationFn: () => {
      const trimmed = draftTitle.trim();
      if (!trimmed) return Promise.reject(new Error("标题不能为空"));
      return createSchedule({
        title: trimmed,
        description: "",
        type: "daily",
        status: "todo",
        due_date: selectedDate,
        start_time: draftTime || null,
        sort_order: dailyTasks.length,
      });
    },
    onSuccess: () => {
      setDraftTitle("");
      invalidateDaily();
    },
  });

  const createWeeklyMutation = useMutation({
    mutationFn: () => {
      const trimmed = weeklyDraft.trim();
      if (!trimmed) return Promise.reject(new Error("标题不能为空"));
      return createSchedule({
        title: trimmed,
        description: `${selectedWeekStart} 到 ${selectedWeekEnd}`,
        type: "weekly",
        status: "todo",
        due_date: selectedWeekStart,
      });
    },
    onSuccess: () => {
      setWeeklyDraft("");
      invalidateWeekly();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ScheduleTask> }) => updateSchedule(id, payload),
    onSuccess: () => {
      setEditingId(null);
      invalidateDaily();
      invalidateWeekly();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      invalidateDaily();
      invalidateWeekly();
    },
  });

  const reorderDailyMutation = useMutation({
    mutationFn: (orderedTasks: ScheduleTask[]) =>
      Promise.all(orderedTasks.map((task, index) => updateSchedule(task.id, { sort_order: index }))),
    onSuccess: () => {
      setDraggingDailyId(null);
      setDragOverDailyId(null);
      invalidateDaily();
    },
  });

  function reorderDailyTasks(sourceId: number, targetId: number) {
    if (sourceId === targetId || reorderDailyMutation.isPending) return;
    const sourceIndex = dailyTasks.findIndex((task) => task.id === sourceId);
    const targetIndex = dailyTasks.findIndex((task) => task.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextTasks = [...dailyTasks];
    const [moved] = nextTasks.splice(sourceIndex, 1);
    nextTasks.splice(targetIndex, 0, moved);
    reorderDailyMutation.mutate(nextTasks);
  }

  const selectedDateText = dateFormatter.format(parseDate(selectedDate));
  const weekRangeText = `${shortDateFormatter.format(parseDate(selectedWeekStart))} - ${shortDateFormatter.format(parseDate(selectedWeekEnd))}`;

  return (
    <section className="rounded-md border border-[#E8F3E3] bg-white p-5 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6D7B67]">Daily Tasks</p>
          <h2 className="mt-1 text-2xl font-bold text-[#2E4B36]">{selectedDateText}</h2>
          <p className="mt-2 text-sm text-[#6D7B67]">
            本周 {weeklyTasks.length} 个重点，完成 {weeklyDone} 个；今日 {dailyTasks.length} 个任务，完成 {dailyDone} 个。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#DDEBD8] bg-[#FFFDF7] text-[#4F6250]"
            onClick={(event) => {
              event.preventDefault();
              setSelectedDate((value) => shiftDate(value, -1));
            }}
            aria-label="前一天"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            className="h-10 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm font-medium text-[#2E4B36] outline-none focus:border-[#6EC6FF]"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#DDEBD8] bg-[#FFFDF7] text-[#4F6250]"
            onClick={(event) => {
              event.preventDefault();
              setSelectedDate((value) => shiftDate(value, 1));
            }}
            aria-label="后一天"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="h-10 rounded-md border border-[#BDE7FF] bg-[#EAF7FF] px-3 text-sm font-semibold text-[#23628B]"
            onClick={() => setSelectedDate(toDateKey(new Date()))}
          >
            今天
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-[#E8F3E3] bg-[#FFFDF7] px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#4F6250]">
              <Sparkles className="h-3.5 w-3.5 text-[#FFB74D]" />
              Week Focus
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-base font-bold text-[#2E4B36]">这周需要干的事情</h3>
              <span className="text-xs text-[#6D7B67]">{weekRangeText}</span>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:min-w-[460px]">
            <input
              className="h-10 rounded-md border border-[#DDEBD8] bg-white/85 px-3 text-sm text-[#2E4B36] outline-none placeholder:text-[#9AA894] focus:border-[#81C784]"
              placeholder="添加一个本周重点"
              value={weeklyDraft}
              onChange={(event) => setWeeklyDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === "Enter" && weeklyDraft.trim()) {
                  createWeeklyMutation.mutate();
                }
              }}
            />
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#81C784] px-4 text-sm font-semibold text-white disabled:opacity-50"
              disabled={!weeklyDraft.trim() || createWeeklyMutation.isPending}
              onClick={() => createWeeklyMutation.mutate()}
            >
              <Plus className="h-4 w-4" />
              加到本周
            </button>
          </div>
        </div>

        {weeklyQuery.isError && <div className="mt-4 text-sm text-[#A64B2A]">周任务加载失败，请确认 Java 后端已更新并启动。</div>}

        <div className="mt-3 divide-y divide-[#E8F3E3] overflow-hidden rounded-md border border-[#E8F3E3] bg-white/75">
          {weeklyTasks.map((task) => (
            <WeeklyTaskRow
              key={task.id}
              task={task}
              editing={editingId === task.id}
              editingTitle={editingTitle}
              setEditingId={setEditingId}
              setEditingTitle={setEditingTitle}
              updateTask={(payload) => updateMutation.mutate({ id: task.id, payload })}
              deleteTask={() => deleteMutation.mutate(task.id)}
            />
          ))}

          {!weeklyQuery.isLoading && weeklyTasks.length === 0 && (
            <div className="px-4 py-5 text-center text-sm text-[#6D7B67]">
              本周还没有重点。写下一件真正值得推进的事情。
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-[132px_1fr_auto]">
        <input
          type="time"
          className="h-11 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm text-[#2E4B36] outline-none focus:border-[#6EC6FF]"
          value={draftTime}
          onChange={(event) => setDraftTime(event.target.value)}
          title="可选时间"
        />
        <input
          className="h-11 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm text-[#2E4B36] outline-none placeholder:text-[#9AA894] focus:border-[#6EC6FF]"
          placeholder="为这一天添加一个任务，时间可不填"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Enter" && draftTitle.trim()) {
              createDailyMutation.mutate();
            }
          }}
        />
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#6EC6FF] px-4 text-sm font-semibold text-white disabled:opacity-50"
          disabled={!draftTitle.trim() || createDailyMutation.isPending}
          onClick={() => createDailyMutation.mutate()}
        >
          <Plus className="h-4 w-4" />
          添加任务
        </button>
      </div>

      {dailyQuery.isLoading && <div className="mt-6 text-sm text-[#6D7B67]">正在加载日程...</div>}
      {dailyQuery.isError && <div className="mt-6 text-sm text-[#A64B2A]">日程加载失败，请确认 Java 后端已启动。</div>}

      <div className="mt-6 divide-y divide-[#E8F3E3] rounded-md border border-[#E8F3E3] bg-[#FFFDF7]">
        {dailyTasks.map((task) => (
          <DailyTaskRow
            key={task.id}
            task={task}
            editing={editingId === task.id}
            editingTitle={editingTitle}
            dragging={draggingDailyId === task.id}
            dragOver={dragOverDailyId === task.id && draggingDailyId !== task.id}
            setEditingId={setEditingId}
            setEditingTitle={setEditingTitle}
            updateTask={(payload) => updateMutation.mutate({ id: task.id, payload })}
            deleteTask={() => deleteMutation.mutate(task.id)}
            onDragStart={() => setDraggingDailyId(task.id)}
            onDragOver={() => setDragOverDailyId(task.id)}
            onDrop={() => {
              if (draggingDailyId != null) {
                reorderDailyTasks(draggingDailyId, task.id);
              }
            }}
            onDragEnd={() => {
              setDraggingDailyId(null);
              setDragOverDailyId(null);
            }}
          />
        ))}

        {!dailyQuery.isLoading && dailyTasks.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-[#6D7B67]">
            这一天很清爽。添加一个任务，让计划有个落点。
          </div>
        )}
      </div>
    </section>
  );
}

function WeeklyTaskRow({
  task,
  editing,
  editingTitle,
  setEditingId,
  setEditingTitle,
  updateTask,
  deleteTask,
}: {
  task: ScheduleTask;
  editing: boolean;
  editingTitle: string;
  setEditingId: (id: number | null) => void;
  setEditingTitle: (title: string) => void;
  updateTask: (payload: Partial<ScheduleTask>) => void;
  deleteTask: () => void;
}) {
  const done = task.status === "done";

  return (
    <div className="grid gap-3 px-3 py-2.5 sm:grid-cols-[28px_1fr_auto] sm:items-center">
      <div>
        <button
          type="button"
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border bg-white transition",
            done ? "border-[#81C784] text-[#34622E]" : "border-[#DDEBD8] text-transparent hover:border-[#81C784]",
          )}
          onClick={() => updateTask({ status: done ? "todo" : "done" })}
          aria-label={done ? "标记周任务为未完成" : "标记周任务为完成"}
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="min-w-0">
        {editing ? (
          <input
            className="h-9 w-full rounded-md border border-[#BDE7FF] bg-white px-3 text-sm text-[#2E4B36] outline-none"
            value={editingTitle}
            onChange={(event) => setEditingTitle(event.target.value)}
          />
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <CalendarCheck2 className="h-4 w-4 shrink-0 text-[#81C784]" />
            <span
              className={cn(
                "truncate text-sm font-semibold text-[#2E4B36]",
                done && "text-[#8B9887] line-through decoration-[#A8BDA3] decoration-2",
              )}
            >
              {task.title}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 sm:justify-end">
        {editing ? (
          <>
            <button
              type="button"
              className="rounded-md border border-[#BDE7FF] bg-white p-2 text-[#23628B]"
              onClick={() => updateTask({ title: editingTitle.trim() || task.title })}
              aria-label="保存周任务"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-md border border-[#DDEBD8] bg-white p-2 text-[#6D7B67]"
              onClick={() => setEditingId(null)}
              aria-label="取消编辑周任务"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="rounded-md border border-transparent bg-transparent p-2 text-[#6D7B67] hover:border-[#DDEBD8] hover:bg-white"
            onClick={() => {
              setEditingId(task.id);
              setEditingTitle(task.title);
            }}
            aria-label="编辑周任务"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          className="rounded-md border border-transparent bg-transparent p-2 text-[#A64B2A] hover:border-[#F7B7A3] hover:bg-white"
          onClick={deleteTask}
          aria-label="删除周任务"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function DailyTaskRow({
  task,
  editing,
  editingTitle,
  dragging,
  dragOver,
  setEditingId,
  setEditingTitle,
  updateTask,
  deleteTask,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  task: ScheduleTask;
  editing: boolean;
  editingTitle: string;
  dragging: boolean;
  dragOver: boolean;
  setEditingId: (id: number | null) => void;
  setEditingTitle: (title: string) => void;
  updateTask: (payload: Partial<ScheduleTask>) => void;
  deleteTask: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const done = task.status === "done";

  return (
    <div
      draggable={!editing}
      className={cn(
        "grid gap-3 px-4 py-3 transition sm:grid-cols-[28px_76px_1fr_auto] sm:items-center",
        dragging && "opacity-50",
        dragOver && "bg-[#EAF7FF] ring-1 ring-inset ring-[#6EC6FF]",
      )}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(task.id));
        onDragStart();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
    >
      <div className="flex justify-center text-[#A8BDA3]">
        <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing" />
      </div>
      <div className="text-sm font-bold text-[#23628B]">{task.start_time ?? "未定"}</div>
      <div className="flex min-w-0 items-start gap-3">
        <button
          type="button"
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
            done ? "border-[#81C784] bg-[#81C784] text-white" : "border-[#A8BDA3] bg-white text-transparent hover:border-[#6EC6FF]",
          )}
          onClick={() => updateTask({ status: done ? "todo" : "done" })}
          aria-label={done ? "标记为未完成" : "标记为完成"}
        >
          <Check className="h-3.5 w-3.5" />
        </button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              className="h-9 w-full rounded-md border border-[#BDE7FF] bg-white px-3 text-sm text-[#2E4B36] outline-none"
              value={editingTitle}
              onChange={(event) => setEditingTitle(event.target.value)}
            />
          ) : (
            <div
              className={cn(
                "text-sm font-semibold leading-6 text-[#2E4B36]",
                done && "text-[#8B9887] line-through decoration-[#A8BDA3] decoration-2",
              )}
            >
              {task.title}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:justify-end">
        {editing ? (
          <>
            <button
              type="button"
              className="rounded-md border border-[#BDE7FF] bg-white p-2 text-[#23628B]"
              onClick={() => updateTask({ title: editingTitle.trim() || task.title })}
              aria-label="保存修改"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-md border border-[#DDEBD8] bg-white p-2 text-[#6D7B67]"
              onClick={() => setEditingId(null)}
              aria-label="取消修改"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="rounded-md border border-transparent bg-transparent p-2 text-[#6D7B67] hover:border-[#DDEBD8] hover:bg-white"
            onClick={() => {
              setEditingId(task.id);
              setEditingTitle(task.title);
            }}
            aria-label="编辑任务"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          className="rounded-md border border-transparent bg-transparent p-2 text-[#A64B2A] hover:border-[#F7B7A3] hover:bg-white"
          onClick={deleteTask}
          aria-label="删除任务"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
