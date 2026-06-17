"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Leaf, Plus, Trash2 } from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useMemo, useState } from "react";
import {
  createHealthDiet,
  createHealthFood,
  createHealthTraining,
  deleteHealthDiet,
  deleteHealthFood,
  deleteHealthTraining,
  fetchHealthDiet,
  fetchHealthFoods,
  fetchHealthProfile,
  fetchHealthTraining,
  fetchHealthWeights,
  updateHealthProfile,
  updateHealthTraining,
  upsertHealthWeight,
} from "@/components/planner/planner-api";
import { cn } from "@/lib/utils";
import type {
  HealthDietEntry,
  HealthDietEntryInput,
  HealthFoodItem,
  HealthFoodItemInput,
  HealthProfile,
  HealthTrainingPlan,
  HealthTrainingPlanInput,
  HealthWeightRecord,
} from "@/types/planner";

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const dateFormatter = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

export function HealthCenterView() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [profileDraft, setProfileDraft] = useState<HealthProfile>({});
  const [foodDraft, setFoodDraft] = useState({ name: "", serving: "100g", protein: "", carbs: "", fat: "", calories: "" });
  const [dietDraft, setDietDraft] = useState({ meal_type: "早餐", food_id: "", amount: "1" });
  const [trainingDraft, setTrainingDraft] = useState({ title: "", description: "" });
  const [weightDraft, setWeightDraft] = useState("");

  const profileQuery = useQuery({ queryKey: ["health-profile"], queryFn: fetchHealthProfile });
  const foodsQuery = useQuery({ queryKey: ["health-foods"], queryFn: fetchHealthFoods });
  const dietQuery = useQuery({ queryKey: ["health-diet", selectedDate], queryFn: () => fetchHealthDiet(selectedDate) });
  const trainingQuery = useQuery({ queryKey: ["health-training", selectedDate], queryFn: () => fetchHealthTraining(selectedDate) });
  const weightsQuery = useQuery({ queryKey: ["health-weights"], queryFn: fetchHealthWeights });

  const foods = foodsQuery.data ?? [];
  const selectedFood = foods.find((food) => food.id === Number(dietDraft.food_id));
  const multiplier = Number(dietDraft.amount) || 1;
  const profile = { ...profileQuery.data, ...profileDraft };
  const dietTotals = useMemo(() => sumDiet(dietQuery.data ?? []), [dietQuery.data]);

  const saveProfile = useMutation({
    mutationFn: () => updateHealthProfile(profileDraft),
    onSuccess: () => {
      setProfileDraft({});
      queryClient.invalidateQueries({ queryKey: ["health-profile"] });
    },
  });

  const addFood = useMutation({
    mutationFn: () => {
      const payload: HealthFoodItemInput = {
        name: foodDraft.name.trim(),
        serving: foodDraft.serving.trim(),
        protein: Number(foodDraft.protein) || 0,
        carbs: Number(foodDraft.carbs) || 0,
        fat: Number(foodDraft.fat) || 0,
        calories: Number(foodDraft.calories) || 0,
      };
      return createHealthFood(payload);
    },
    onSuccess: () => {
      setFoodDraft({ name: "", serving: "100g", protein: "", carbs: "", fat: "", calories: "" });
      queryClient.invalidateQueries({ queryKey: ["health-foods"] });
    },
  });

  const addDiet = useMutation({
    mutationFn: () => {
      if (!selectedFood) return Promise.reject(new Error("请选择食物"));
      const payload: HealthDietEntryInput = {
        entry_date: selectedDate,
        meal_type: dietDraft.meal_type,
        food_name: selectedFood.name,
        amount: `${multiplier} x ${selectedFood.serving || "1份"}`,
        protein: round((selectedFood.protein ?? 0) * multiplier),
        carbs: round((selectedFood.carbs ?? 0) * multiplier),
        fat: round((selectedFood.fat ?? 0) * multiplier),
        calories: round((selectedFood.calories ?? 0) * multiplier),
        sort_order: dietQuery.data?.length ?? 0,
      };
      return createHealthDiet(payload);
    },
    onSuccess: () => {
      setDietDraft((draft) => ({ ...draft, amount: "1" }));
      queryClient.invalidateQueries({ queryKey: ["health-diet", selectedDate] });
    },
  });

  const addTraining = useMutation({
    mutationFn: () => {
      const payload: HealthTrainingPlanInput = {
        plan_date: selectedDate,
        title: trainingDraft.title.trim(),
        description: trainingDraft.description.trim(),
        status: "todo",
        sort_order: trainingQuery.data?.length ?? 0,
      };
      return createHealthTraining(payload);
    },
    onSuccess: () => {
      setTrainingDraft({ title: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["health-training", selectedDate] });
    },
  });

  const toggleTraining = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateHealthTraining(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["health-training", selectedDate] }),
  });

  const saveWeight = useMutation({
    mutationFn: () => upsertHealthWeight({ record_date: selectedDate, weight: Number(weightDraft), note: "" }),
    onSuccess: () => {
      setWeightDraft("");
      queryClient.invalidateQueries({ queryKey: ["health-weights"] });
    },
  });

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[28px] border border-[#DDEBD8] bg-[linear-gradient(135deg,#FFFDF7_0%,#F0F8EA_58%,#EAF7FF_100%)] p-5 shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <BasicInfoCard profile={profile} setProfileDraft={setProfileDraft} saveProfile={() => saveProfile.mutate()} />
          <div className="relative min-h-44 rounded-[24px] border border-white/70 bg-white/55 p-5">
            <Leaf className="absolute right-6 top-5 h-16 w-16 text-[#81C784]/25" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6D7B67]">Dream Trail Health</p>
            <h2 className="mt-2 text-2xl font-black text-[#2E4B36]">健康中心</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5D6F57]">食物库存营养标准，每日饮食只选择食物和份量，系统自动汇总碳水、蛋白、脂肪与热量。</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <input
                type="date"
                className="h-10 rounded-md border border-[#DDEBD8] bg-white px-3 text-sm font-semibold text-[#2E4B36] outline-none focus:border-[#81C784]"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
              <span className="text-sm font-bold text-[#2E4B36]">{dateFormatter.format(new Date(`${selectedDate}T00:00:00`))}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 2xl:grid-cols-[0.85fr_1.15fr_1fr]">
        <FoodLibraryPanel foods={foods} draft={foodDraft} setDraft={setFoodDraft} add={() => addFood.mutate()} remove={(id) => deleteHealthFood(id).then(() => queryClient.invalidateQueries({ queryKey: ["health-foods"] }))} />
        <DietPanel
          items={dietQuery.data ?? []}
          totals={dietTotals}
          target={profile}
          foods={foods}
          selectedFood={selectedFood}
          multiplier={multiplier}
          draft={dietDraft}
          setDraft={setDietDraft}
          add={() => addDiet.mutate()}
          remove={(id) => deleteHealthDiet(id).then(() => queryClient.invalidateQueries({ queryKey: ["health-diet", selectedDate] }))}
        />
        <TrainingPanel
          items={trainingQuery.data ?? []}
          draft={trainingDraft}
          setDraft={setTrainingDraft}
          add={() => addTraining.mutate()}
          toggle={(id, done) => toggleTraining.mutate({ id, status: done ? "todo" : "done" })}
          remove={(id) => deleteHealthTraining(id).then(() => queryClient.invalidateQueries({ queryKey: ["health-training", selectedDate] }))}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <WeightRecorder weightDraft={weightDraft} setWeightDraft={setWeightDraft} saveWeight={() => saveWeight.mutate()} />
        <WeightTrend records={weightsQuery.data ?? []} />
      </div>
    </section>
  );
}

function sumDiet(items: HealthDietEntry[]) {
  return items.reduce(
    (sum, item) => ({
      protein: sum.protein + (item.protein ?? 0),
      carbs: sum.carbs + (item.carbs ?? 0),
      fat: sum.fat + (item.fat ?? 0),
      calories: sum.calories + (item.calories ?? 0),
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 },
  );
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function BasicInfoCard({ profile, setProfileDraft, saveProfile }: {
  profile: HealthProfile;
  setProfileDraft: Dispatch<SetStateAction<HealthProfile>>;
  saveProfile: () => void;
}) {
  const fields: Array<[keyof HealthProfile, string, string]> = [
    ["current_weight", "体重", "kg"],
    ["target_weight", "目标", "kg"],
    ["daily_protein", "蛋白", "g"],
    ["daily_carbs", "碳水", "g"],
    ["daily_fat", "脂肪", "g"],
    ["daily_calories", "热量", "kcal"],
  ];
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6D7B67]">Basic Info</p>
      <h3 className="mt-1 text-xl font-black text-[#2E4B36]">基础信息</h3>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {fields.map(([key, label, unit]) => (
          <label key={key} className="rounded-2xl border border-[#E8F3E3] bg-[#FFFDF7] p-3">
            <span className="text-xs text-[#6D7B67]">{label} / {unit}</span>
            <input
              type="number"
              className="mt-1 w-full bg-transparent text-lg font-black text-[#2E4B36] outline-none"
              value={(profile[key] as number | undefined | null) ?? ""}
              onChange={(event) => setProfileDraft((draft) => ({ ...draft, [key]: Number(event.target.value) }))}
            />
          </label>
        ))}
      </div>
      <button type="button" className="mt-3 h-10 w-full rounded-md bg-[#81C784] text-sm font-bold text-white" onClick={saveProfile}>保存基础信息</button>
    </div>
  );
}

function FoodLibraryPanel({ foods, draft, setDraft, add, remove }: {
  foods: HealthFoodItem[];
  draft: Record<string, string>;
  setDraft: Dispatch<SetStateAction<{ name: string; serving: string; protein: string; carbs: string; fat: string; calories: string }>>;
  add: () => void;
  remove: (id: number) => void;
}) {
  const fields = [
    ["name", "食物名称"],
    ["serving", "单位/份量"],
    ["protein", "蛋白"],
    ["carbs", "碳水"],
    ["fat", "脂肪"],
    ["calories", "热量"],
  ];
  return (
    <Panel title="食物库" subtitle="维护你常吃食物的标准碳蛋脂">
      <div className="grid gap-2 sm:grid-cols-2">
        {fields.map(([key, placeholder]) => (
          <input
            key={key}
            className="h-10 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm text-[#2E4B36] outline-none focus:border-[#81C784]"
            placeholder={placeholder}
            value={draft[key] ?? ""}
            onChange={(event) => setDraft((value) => ({ ...value, [key]: event.target.value }))}
          />
        ))}
      </div>
      <button className="mt-2 h-10 w-full rounded-md bg-[#81C784] text-sm font-bold text-white disabled:opacity-50" disabled={!draft.name.trim()} onClick={add}>
        加入食物库
      </button>
      <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {foods.map((food) => (
          <div key={food.id} className="rounded-2xl border border-[#E8F3E3] bg-[#FFFDF7] p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-[#2E4B36]">{food.name}</div>
                <div className="mt-1 text-xs text-[#6D7B67]">{food.serving || "1份"} · P {food.protein ?? 0} / C {food.carbs ?? 0} / F {food.fat ?? 0} · {food.calories ?? 0}kcal</div>
              </div>
              <button className="shrink-0 text-[#A64B2A]" onClick={() => remove(food.id)}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {foods.length === 0 && <div className="rounded-2xl bg-[#FFFDF7] px-4 py-8 text-center text-sm text-[#6D7B67]">先上传一个食物，之后每日饮食就能直接选择。</div>}
      </div>
    </Panel>
  );
}

function DietPanel({ items, totals, target, foods, selectedFood, multiplier, draft, setDraft, add, remove }: {
  items: HealthDietEntry[];
  totals: { protein: number; carbs: number; fat: number; calories: number };
  target: HealthProfile;
  foods: HealthFoodItem[];
  selectedFood?: HealthFoodItem;
  multiplier: number;
  draft: { meal_type: string; food_id: string; amount: string };
  setDraft: Dispatch<SetStateAction<{ meal_type: string; food_id: string; amount: string }>>;
  add: () => void;
  remove: (id: number) => void;
}) {
  const preview = selectedFood
    ? {
        protein: round((selectedFood.protein ?? 0) * multiplier),
        carbs: round((selectedFood.carbs ?? 0) * multiplier),
        fat: round((selectedFood.fat ?? 0) * multiplier),
        calories: round((selectedFood.calories ?? 0) * multiplier),
      }
    : null;
  return (
    <Panel title="今日饮食" subtitle="从食物库选择，自动计算营养">
      <div className="grid gap-2 md:grid-cols-[90px_1fr_88px_auto]">
        <select className="h-10 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-2 text-sm outline-none" value={draft.meal_type} onChange={(e) => setDraft((d) => ({ ...d, meal_type: e.target.value }))}>
          {["早餐", "午餐", "晚餐", "加餐"].map((meal) => <option key={meal}>{meal}</option>)}
        </select>
        <select className="h-10 min-w-0 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-2 text-sm outline-none" value={draft.food_id} onChange={(e) => setDraft((d) => ({ ...d, food_id: e.target.value }))}>
          <option value="">选择食物</option>
          {foods.map((food) => <option key={food.id} value={food.id}>{food.name} · {food.serving || "1份"}</option>)}
        </select>
        <input className="h-10 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-2 text-sm outline-none" placeholder="倍数" value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))} />
        <button className="h-10 rounded-md bg-[#81C784] px-3 text-white disabled:opacity-50" disabled={!draft.food_id} onClick={add}><Plus className="mx-auto h-4 w-4" /></button>
      </div>
      {preview && <div className="mt-2 rounded-2xl bg-[#EFF8E8] px-3 py-2 text-xs font-semibold text-[#4F6250]">本次：P {preview.protein} / C {preview.carbs} / F {preview.fat} · {preview.calories}kcal</div>}
      <div className="mt-4 divide-y divide-[#E8F3E3] rounded-md border border-[#E8F3E3] bg-[#FFFDF7]">
        {items.map((item) => (
          <div key={item.id} className="grid gap-2 px-3 py-3 text-sm md:grid-cols-[70px_1fr_100px_150px_70px] md:items-center">
            <span className="font-bold text-[#4F6250]">{item.meal_type}</span>
            <span className="min-w-0 truncate font-semibold text-[#2E4B36]">{item.food_name}</span>
            <span className="text-[#6D7B67]">{item.amount}</span>
            <span className="text-[#4F6250]">P {item.protein ?? 0} / C {item.carbs ?? 0} / F {item.fat ?? 0}</span>
            <button onClick={() => remove(item.id)} className="justify-self-start text-[#A64B2A] md:justify-self-end"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {items.length === 0 && <div className="px-4 py-8 text-center text-sm text-[#6D7B67]">这一天还没有饮食记录。</div>}
      </div>
      <MacroSummary totals={totals} target={target} />
    </Panel>
  );
}

function TrainingPanel({ items, draft, setDraft, add, toggle, remove }: {
  items: HealthTrainingPlan[];
  draft: { title: string; description: string };
  setDraft: Dispatch<SetStateAction<{ title: string; description: string }>>;
  add: () => void;
  toggle: (id: number, done: boolean) => void;
  remove: (id: number) => void;
}) {
  return (
    <Panel title="训练计划" subtitle="同饮食日期联动">
      <div className="grid gap-2 md:grid-cols-[1fr_1.1fr_auto]">
        <input className="h-10 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm outline-none" placeholder="训练标题" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
        <input className="h-10 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm outline-none" placeholder="训练说明" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
        <button className="h-10 rounded-md bg-[#6EC6FF] px-4 text-sm font-bold text-white disabled:opacity-50" disabled={!draft.title.trim()} onClick={add}>新增</button>
      </div>
      <div className="mt-4 divide-y divide-[#E8F3E3] rounded-md border border-[#E8F3E3] bg-[#FFFDF7]">
        {items.map((item) => {
          const done = item.status === "done";
          return (
            <div key={item.id} className="grid gap-3 px-3 py-3 md:grid-cols-[28px_1fr_auto] md:items-center">
              <button className={cn("flex h-5 w-5 items-center justify-center rounded-full border", done ? "border-[#81C784] bg-[#81C784] text-white" : "border-[#A8BDA3] text-transparent")} onClick={() => toggle(item.id, done)}><Check className="h-3.5 w-3.5" /></button>
              <div className="min-w-0"><div className={cn("truncate text-sm font-bold text-[#2E4B36]", done && "line-through text-[#8B9887]")}>{item.title}</div>{item.description && <div className="truncate text-xs text-[#6D7B67]">{item.description}</div>}</div>
              <button onClick={() => remove(item.id)} className="text-[#A64B2A]"><Trash2 className="h-4 w-4" /></button>
            </div>
          );
        })}
        {items.length === 0 && <div className="px-4 py-8 text-center text-sm text-[#6D7B67]">这一天还没有训练计划。</div>}
      </div>
    </Panel>
  );
}

function MacroSummary({ totals, target }: { totals: { protein: number; carbs: number; fat: number; calories: number }; target: HealthProfile }) {
  const rows = [
    ["蛋白", totals.protein, target.daily_protein, "g"],
    ["碳水", totals.carbs, target.daily_carbs, "g"],
    ["脂肪", totals.fat, target.daily_fat, "g"],
    ["热量", totals.calories, target.daily_calories, "kcal"],
  ];
  return <div className="mt-4 grid gap-2 sm:grid-cols-4">{rows.map(([label, value, goal, unit]) => <div key={label as string} className="rounded-2xl bg-white p-3 text-sm"><div className="text-[#6D7B67]">{label}</div><div className="mt-1 font-black text-[#2E4B36]">{Number(value).toFixed(1)} / {goal ?? 0}{unit}</div></div>)}</div>;
}

function WeightRecorder({ weightDraft, setWeightDraft, saveWeight }: { weightDraft: string; setWeightDraft: (value: string) => void; saveWeight: () => void }) {
  return (
    <Panel title="体重记录" subtitle="记录选中日期的体重">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input className="h-10 rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm outline-none" placeholder="输入体重 kg" value={weightDraft} onChange={(e) => setWeightDraft(e.target.value)} />
        <button type="button" className="h-10 rounded-md bg-[#6EC6FF] px-4 text-sm font-bold text-white disabled:opacity-50" disabled={!weightDraft} onClick={saveWeight}>记录</button>
      </div>
    </Panel>
  );
}

function WeightTrend({ records }: { records: HealthWeightRecord[] }) {
  const max = Math.max(...records.map((r) => r.weight), 1);
  const min = Math.min(...records.map((r) => r.weight), 0);
  return (
    <Panel title="体重趋势变化" subtitle="最近 30 条记录">
      <div className="flex h-56 min-w-0 items-end gap-2 overflow-x-auto rounded-md border border-[#E8F3E3] bg-[#FFFDF7] p-4">
        {records.map((record) => {
          const height = max === min ? 50 : 18 + ((record.weight - min) / (max - min)) * 74;
          return <div key={record.id} className="flex min-w-10 flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-md bg-[#81C784]" style={{ height: `${height}%` }} /><div className="text-[10px] text-[#6D7B67]">{record.record_date.slice(5)}</div></div>;
        })}
        {records.length === 0 && <div className="m-auto text-sm text-[#6D7B67]">暂无体重记录。</div>}
      </div>
    </Panel>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <section className="min-w-0 rounded-[22px] border border-[#E1EFD9] bg-white p-5 shadow-sm"><div className="mb-4"><h3 className="text-lg font-black text-[#2E4B36]">{title}</h3><p className="mt-1 text-sm text-[#6D7B67]">{subtitle}</p></div>{children}</section>;
}
