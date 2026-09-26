"use client";

import { useId } from "react";
import { Lightbulb, Pause, Play } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export function VisualFrame({
  title,
  subtitle,
  tryThis,
  actions,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  tryThis?: string[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className="my-8">
      <figure
        className={cn(
          "overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
          className
        )}
      >
        <figcaption className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 bg-gradient-to-r from-blue-50/80 via-white to-cyan-50/60 px-5 py-3 dark:border-zinc-800 dark:from-blue-950/30 dark:via-zinc-950 dark:to-cyan-950/20">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
            {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </figcaption>
        <div className="p-5">{children}</div>
        {tryThis && tryThis.length > 0 && (
          <div className="border-t border-zinc-100 bg-amber-50/60 px-5 py-3 dark:border-zinc-800 dark:bg-amber-950/10">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              <Lightbulb className="h-3.5 w-3.5" /> Try this
            </p>
            <ul className="list-inside list-disc space-y-0.5 text-sm text-zinc-700 dark:text-zinc-300">
              {tryThis.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}
      </figure>
    </Reveal>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <label htmlFor={id} className="font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
          {format ? format(value) : value} {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-slider w-full"
        style={{ "--range-pct": `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}

export function PlayPauseButton({
  playing,
  onToggle,
}: {
  playing: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!playing}
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      {playing ? "Pause" : "Play"}
    </button>
  );
}

export function Readout({
  label,
  children,
  tone = "default",
}: {
  label: string;
  children: React.ReactNode;
  tone?: "default" | "blue" | "green" | "amber";
}) {
  const tones = {
    default: "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60",
    blue: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
    green: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
    amber: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
  };
  return (
    <div className={cn("rounded-xl border px-3 py-2", tones[tone])}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
        {children}
      </p>
    </div>
  );
}
