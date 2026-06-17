"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AUTH_TOKEN_KEY, login, register } from "@/components/planner/planner-api";
import type { AuthUser } from "@/types/planner";
import type { ReactNode } from "react";

const USER_KEY = "dream-trail-auth-user";

export function AuthGate({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(USER_KEY);
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (raw && token) setUser(JSON.parse(raw) as AuthUser);
  }, []);

  const authMutation = useMutation({
    mutationFn: () => (mode === "login" ? login({ account, password }) : register({ account, password })),
    onSuccess: (response) => {
      window.localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      queryClient.clear();
      setUser(response.user);
      setError("");
    },
    onError: (err) => setError(err instanceof Error ? err.message : "操作失败"),
  });

  if (user) {
    return children;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#FFFDF7,#EFF8E8,#EAF7FF)] p-4 text-[#2E4B36]">
      <section className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_80px_rgba(70,104,64,0.16)] backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6D7B67]">Dream Trail</p>
        <h1 className="mt-2 text-2xl font-black">登录你的 AI 生活管理平台</h1>
        <p className="mt-2 text-sm leading-6 text-[#6D7B67]">账号只能使用数字，6-20 位；密码长度 6-32 位。</p>
        <div className="mt-5 space-y-3">
          <input
            className="h-11 w-full rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm outline-none focus:border-[#81C784]"
            placeholder="数字账号"
            inputMode="numeric"
            value={account}
            onChange={(event) => setAccount(event.target.value.replace(/\D/g, "").slice(0, 20))}
          />
          <input
            type="password"
            className="h-11 w-full rounded-md border border-[#DDEBD8] bg-[#FFFDF7] px-3 text-sm outline-none focus:border-[#81C784]"
            placeholder="密码"
            value={password}
            onChange={(event) => setPassword(event.target.value.slice(0, 32))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && account && password) authMutation.mutate();
            }}
          />
        </div>
        {error && <div className="mt-3 rounded-md bg-[#FFF3DF] px-3 py-2 text-sm font-semibold text-[#A64B2A]">{error}</div>}
        <button
          className="mt-5 h-11 w-full rounded-md bg-[#81C784] text-sm font-bold text-white disabled:opacity-50"
          disabled={!account || password.length < 6 || authMutation.isPending}
          onClick={() => authMutation.mutate()}
        >
          {mode === "login" ? "登录" : "注册"}
        </button>
        <button className="mt-3 w-full text-sm font-bold text-[#23628B]" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "没有账号？去注册" : "已有账号？去登录"}
        </button>
      </section>
    </main>
  );
}
