import type { ExecutionStatus, LogLevel } from "@/types/agent-observability";

export const statusLabel: Record<ExecutionStatus, string> = {
  pending: "等待中",
  running: "执行中",
  success: "成功",
  failed: "失败",
  skipped: "跳过",
};

export const statusClassName: Record<ExecutionStatus, string> = {
  pending: "border-[#c4cad4] bg-[#eef1f5] text-[#657083]",
  running: "border-[#2d5f9a]/70 bg-[#dce8f6] text-[#153f73] shadow-[0_10px_28px_rgba(21,63,115,0.16)]",
  success: "border-[#6c9a65]/70 bg-[#e4efdf] text-[#34622e]",
  failed: "border-[#c8413a]/55 bg-[#f7dfdc] text-[#a72f2c]",
  skipped: "border-[#c4cad4] bg-[#eef1f5] text-[#657083]",
};

export const logLevelClassName: Record<LogLevel, string> = {
  debug: "text-[#657083]",
  info: "text-[#183b72]",
  success: "text-[#34622e]",
  warn: "text-[#806018]",
  error: "text-[#a72f2c]",
};
