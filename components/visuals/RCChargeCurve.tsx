"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, createScope, svg, type Scope } from "animejs";
import { useReducedMotion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { Readout, Slider, VisualFrame } from "@/components/visuals/VisualFrame";
import { cn } from "@/lib/utils";

type Mode = "charge" | "discharge";

const SUPPLY_V = 5;
const T_MAX_S = 10;
const SAMPLES = 160;
const PLOT = { left: 44, right: 404, top: 16, bottom: 196 };
const PLOT_W = PLOT.right - PLOT.left;
const PLOT_H = PLOT.bottom - PLOT.top;
const TAU_LEVELS = [63.2, 86.5, 95.0, 98.2, 99.3];

function capacitorVoltage(mode: Mode, t: number, tau: number) {
  switch (mode) {
    case "charge":
      return SUPPLY_V * (1 - Math.exp(-t / tau));
    case "discharge":
      return SUPPLY_V * Math.exp(-t / tau);
    default: {
      const exhaustive: never = mode;
      return exhaustive;
    }
  }
}

const toX = (t: number) => PLOT.left + (t / T_MAX_S) * PLOT_W;
const toY = (v: number) => PLOT.bottom - (v / SUPPLY_V) * PLOT_H;

export function RCChargeCurve({
  initialResistanceK = 10,
  initialCapacitanceU = 100,
  tryThis = [
    "Set R = 10 kΩ and C = 100 µF: τ = 1 s. Where is the curve at t = 1 s?",
    "Halve C — how does the curve's shape change?",
    "Switch to discharge: after 1τ how much voltage is left?",
  ],
}: {
  initialResistanceK?: number;
  initialCapacitanceU?: number;
  tryThis?: string[];
}) {
  const [resistanceK, setResistanceK] = useState(initialResistanceK);
  const [capacitanceU, setCapacitanceU] = useState(initialCapacitanceU);
  const [mode, setMode] = useState<Mode>("charge");
  const [replay, setReplay] = useState(0);
  const [probe, setProbe] = useState({ t: 0, v: capacitorVoltage("charge", 0, 1) });
  const reduceMotion = useReducedMotion();

  const rootRef = useRef<SVGSVGElement>(null);
  const curveRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const scope = useRef<Scope | null>(null);

  const tau = resistanceK * 1e3 * capacitanceU * 1e-6;

  const curve = useMemo(() => {
    const points = Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const t = (i / SAMPLES) * T_MAX_S;
      return `${toX(t).toFixed(2)},${toY(capacitorVoltage(mode, t, tau)).toFixed(2)}`;
    });
    return `M${points.join(" L")}`;
  }, [mode, tau]);

  useEffect(() => {
    const root = rootRef.current;
    const path = curveRef.current;
    const dot = dotRef.current;
    if (!root || !path || !dot) return;

    const placeProbe = (fraction: number) => {
      const point = path.getPointAtLength(fraction * path.getTotalLength());
      dot.setAttribute("cx", `${point.x}`);
      dot.setAttribute("cy", `${point.y}`);
      const t = ((point.x - PLOT.left) / PLOT_W) * T_MAX_S;
      setProbe({ t, v: capacitorVoltage(mode, t, tau) });
    };

    const timer = window.setTimeout(() => {
      scope.current?.revert();
      scope.current = createScope({ root }).add(() => {
        const [drawable] = svg.createDrawable(path);
        if (reduceMotion) {
          drawable.setAttribute("draw", "0 1");
          placeProbe(1);
          return;
        }
        animate(drawable, {
          draw: ["0 0", "0 1"],
          duration: 2400,
          ease: "inOutSine",
          onUpdate: (anim) => placeProbe(anim.progress),
        });
      });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [curve, mode, tau, replay, reduceMotion]);

  useEffect(() => () => scope.current?.revert(), []);

  const fillPct = (probe.v / SUPPLY_V) * 100;

  return (
    <VisualFrame
      title="RC Time Constant Plotter"
      subtitle={`Capacitor voltage vs time for a ${SUPPLY_V} V supply. τ = R × C`}
      tryThis={tryThis}
      actions={
        <button
          type="button"
          onClick={() => setReplay((n) => n + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Replay
        </button>
      }
    >
      <div className="mb-4 inline-flex rounded-lg border border-zinc-200 p-0.5 text-sm dark:border-zinc-800">
        {(["charge", "discharge"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={cn(
              "rounded-md px-3 py-1 capitalize transition-colors",
              mode === m
                ? "bg-blue-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
        <div className="flex gap-3">
          <svg
            ref={rootRef}
            viewBox="0 0 420 224"
            role="img"
            aria-label={`${mode} curve with time constant ${tau.toFixed(2)} seconds`}
            className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/60"
          >
            {[0, 1, 2, 3, 4, 5].map((v) => (
              <g key={v}>
                <line x1={PLOT.left} x2={PLOT.right} y1={toY(v)} y2={toY(v)} className="stroke-zinc-200 dark:stroke-zinc-800" />
                <text x={PLOT.left - 8} y={toY(v) + 4} textAnchor="end" className="fill-zinc-500 font-mono text-[10px]">
                  {v}V
                </text>
              </g>
            ))}
            {[0, 2, 4, 6, 8, 10].map((t) => (
              <text key={t} x={toX(t)} y={PLOT.bottom + 16} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px]">
                {t}s
              </text>
            ))}

            {TAU_LEVELS.map((level, i) => {
              const t = (i + 1) * tau;
              if (t > T_MAX_S) return null;
              return (
                <g key={level}>
                  <line
                    x1={toX(t)}
                    x2={toX(t)}
                    y1={PLOT.top}
                    y2={PLOT.bottom}
                    strokeDasharray="3 4"
                    className="stroke-cyan-500/60"
                  />
                  <text x={toX(t) + 3} y={PLOT.top + 10 + i * 12} className="fill-cyan-700 font-mono text-[9px] dark:fill-cyan-300">
                    {i + 1}τ {mode === "charge" ? level : (100 - level).toFixed(1)}%
                  </text>
                </g>
              );
            })}

            <path
              ref={curveRef}
              d={curve}
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              className="stroke-blue-600 dark:stroke-blue-400"
            />
            <circle ref={dotRef} r={6} cx={PLOT.left} cy={PLOT.bottom} className="fill-white stroke-blue-600 dark:fill-zinc-950" strokeWidth={3} />
          </svg>

          <div className="flex w-10 shrink-0 flex-col items-center gap-1" aria-hidden>
            <div className="relative w-full flex-1 overflow-hidden rounded-lg border-2 border-zinc-300 dark:border-zinc-700">
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-blue-600 to-cyan-400"
                style={{ height: `${fillPct}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500">cap</span>
          </div>
        </div>

        <div className="space-y-5">
          <Slider label="Resistance (R)" value={resistanceK} min={1} max={47} unit="kΩ" onChange={setResistanceK} />
          <Slider label="Capacitance (C)" value={capacitanceU} min={10} max={220} step={10} unit="µF" onChange={setCapacitanceU} />
          <div className="grid grid-cols-2 gap-3">
            <Readout label="τ = R × C" tone="blue">
              {tau.toFixed(2)} s
            </Readout>
            <Readout label={`Vc at t = ${probe.t.toFixed(1)} s`} tone="green">
              {probe.v.toFixed(2)} V
            </Readout>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            After 5τ ({(5 * tau).toFixed(1)} s) the capacitor is considered fully {mode === "charge" ? "charged" : "discharged"}.
          </p>
        </div>
      </div>
    </VisualFrame>
  );
}
