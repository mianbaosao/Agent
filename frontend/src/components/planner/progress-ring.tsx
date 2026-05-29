"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  label: string;
  value: number;
  caption: string;
  color: string;
}

export function ProgressRing({ label, value, caption, color }: ProgressRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="rounded-md border border-[#E8F3E3] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <svg width="108" height="108" viewBox="0 0 108 108" className="shrink-0">
          <circle cx="54" cy="54" r={radius} fill="none" stroke="#EEF4EB" strokeWidth="10" />
          <motion.circle
            cx="54"
            cy="54"
            r={radius}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeWidth="10"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            transform="rotate(-90 54 54)"
          />
          <text x="54" y="58" textAnchor="middle" className="fill-[#2E4B36] text-lg font-bold">
            {value}%
          </text>
        </svg>
        <div className="min-w-0">
          <div className="text-sm font-bold text-[#2E4B36]">{label}</div>
          <div className="mt-2 text-xs leading-5 text-[#6D7B67]">{caption}</div>
        </div>
      </div>
    </div>
  );
}
