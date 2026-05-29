"use client";

import { Bot, Map, Sparkles } from "lucide-react";

export function AdventurerIllustration() {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-md border border-[#DDEBD8] bg-gradient-to-br from-[#EAF7FF] via-[#FFFDF7] to-[#E9F7E9]">
      <div className="absolute left-5 top-5 rounded-full bg-[#FFD54F]/80 px-3 py-1 text-xs font-semibold text-[#6E5318]">
        小冒险家
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#81C784]/25" />
      <div className="absolute bottom-9 left-10 h-20 w-16 rounded-t-full bg-[#FFB74D] shadow-md">
        <div className="absolute -top-7 left-3 h-10 w-10 rounded-full bg-[#FFD9B3]" />
        <div className="absolute -top-2 right-[-18px] h-10 w-8 rotate-12 rounded-full bg-[#6EC6FF]" />
        <div className="absolute bottom-[-20px] left-2 h-7 w-4 rounded bg-[#2E4B36]" />
        <div className="absolute bottom-[-20px] right-2 h-7 w-4 rounded bg-[#2E4B36]" />
      </div>
      <div className="absolute bottom-11 left-24 rounded-md border border-[#B9DDB7] bg-white/80 px-3 py-2 text-xs text-[#4F6250] shadow-sm">
        <Map className="mb-1 h-4 w-4 text-[#81C784]" />
        今天也向目标前进一格
      </div>
      <div className="absolute right-8 top-8 h-9 w-20 rounded-full bg-white/80 blur-[1px]" />
      <div className="absolute right-24 top-14 h-7 w-16 rounded-full bg-white/70 blur-[1px]" />
    </div>
  );
}

export function AiCompanionIllustration() {
  return (
    <div className="relative mx-auto h-44 w-44 rounded-full border border-[#BDE7FF] bg-[#EAF7FF] shadow-[0_18px_40px_rgba(110,198,255,0.22)]">
      <div className="absolute left-1/2 top-8 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-sm">
        <Bot className="h-10 w-10 text-[#6EC6FF]" />
      </div>
      <div className="absolute bottom-9 left-1/2 h-12 w-24 -translate-x-1/2 rounded-t-full bg-[#81C784]" />
      <Sparkles className="absolute right-8 top-8 h-5 w-5 text-[#FFD54F]" />
      <Sparkles className="absolute bottom-10 left-7 h-4 w-4 text-[#FFB74D]" />
    </div>
  );
}
