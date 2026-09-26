"use client";

import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";

export function ProgressRing({
  completed,
  total,
  size = 80,
  label,
}: {
  completed: number;
  total: number;
  size?: number;
  label?: string;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="progress-ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-zinc-200 dark:text-zinc-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progress-ring-gradient)"
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <div className="text-center">
        <p className="text-lg font-bold">
          <AnimatedNumber value={pct} suffix="%" duration={1.2} />
        </p>
        <p className="text-xs text-zinc-500">
          {completed}/{total} {label ?? "lessons"}
        </p>
      </div>
    </div>
  );
}
