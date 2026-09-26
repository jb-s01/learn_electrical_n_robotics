"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { animate, createScope, type Scope } from "animejs";
import { useReducedMotion } from "motion/react";
import { PlayPauseButton, Readout, Slider, VisualFrame } from "@/components/visuals/VisualFrame";

const SUPPLY_V = 5;
const WIDTH = 360;
const HIGH_Y = 30;
const LOW_Y = 130;
const PLOT_X = 40;

function squareWave(dutyPct: number, period: number) {
  const onWidth = (dutyPct / 100) * period;
  const cycles = Math.ceil((WIDTH * 2) / period) + 1;
  let d = `M0 ${dutyPct >= 100 ? HIGH_Y : LOW_Y}`;
  for (let k = 0; k < cycles; k++) {
    const start = k * period;
    if (dutyPct <= 0 || dutyPct >= 100) {
      d += ` H${start + period}`;
    } else {
      d += ` H${start} V${HIGH_Y} H${start + onWidth} V${LOW_Y} H${start + period}`;
    }
  }
  return d;
}

export function PWMVisualizer({
  initialDuty = 50,
  tryThis = [
    "Set duty cycle to 25% — the average voltage is a quarter of 5 V",
    "Change the frequency: does the LED brightness change? Why not?",
    "At 0% and 100% the signal stops switching — it's just DC",
  ],
}: {
  initialDuty?: number;
  tryThis?: string[];
}) {
  const [duty, setDuty] = useState(initialDuty);
  const [cyclesShown, setCyclesShown] = useState(4);
  const reduceMotion = useReducedMotion();
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const playing = userPlaying ?? !reduceMotion;
  const clipId = useId();

  const rootRef = useRef<SVGSVGElement>(null);
  const waveRef = useRef<SVGGElement>(null);
  const scope = useRef<Scope | null>(null);

  const period = WIDTH / cyclesShown;
  const wave = useMemo(() => squareWave(duty, period), [duty, period]);
  const averageV = (duty / 100) * SUPPLY_V;
  const averageY = LOW_Y - (duty / 100) * (LOW_Y - HIGH_Y);

  useEffect(() => {
    const root = rootRef.current;
    const waveGroup = waveRef.current;
    if (!root || !waveGroup) return;
    scope.current = createScope({ root }).add((self) => {
      const scroll = animate(waveGroup, {
        translateX: [0, -period],
        duration: 900,
        ease: "linear",
        loop: true,
        autoplay: false,
      });
      self?.add("setPlaying", (value: boolean) => {
        if (value) scroll.play();
        else scroll.pause();
      });
    });
    return () => scope.current?.revert();
  }, [period]);

  useEffect(() => {
    scope.current?.methods.setPlaying(playing);
  }, [playing, period]);

  return (
    <VisualFrame
      title="PWM Signal Visualizer"
      subtitle="A microcontroller switches the pin fully ON and OFF. The average is what the load feels."
      tryThis={tryThis}
      actions={<PlayPauseButton playing={playing} onToggle={() => setUserPlaying(!playing)} />}
    >
      <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
        <svg
          ref={rootRef}
          viewBox="0 0 420 160"
          role="img"
          aria-label={`PWM wave at ${duty} percent duty cycle, average ${averageV.toFixed(2)} volts`}
          className="w-full rounded-xl bg-zinc-950 bg-grid"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={PLOT_X} y={10} width={WIDTH} height={140} />
            </clipPath>
          </defs>
          <text x={PLOT_X - 6} y={HIGH_Y + 4} textAnchor="end" className="fill-zinc-400 font-mono text-[10px]">5V</text>
          <text x={PLOT_X - 6} y={LOW_Y + 4} textAnchor="end" className="fill-zinc-400 font-mono text-[10px]">0V</text>
          <g clipPath={`url(#${clipId})`}>
            <g transform={`translate(${PLOT_X} 0)`}>
              <g ref={waveRef}>
                <path d={wave} fill="none" strokeWidth={3} strokeLinejoin="round" className="stroke-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
              </g>
            </g>
            <line
              x1={PLOT_X}
              x2={PLOT_X + WIDTH}
              y1={averageY}
              y2={averageY}
              strokeDasharray="6 5"
              strokeWidth={2}
              className="stroke-amber-400 transition-all duration-300"
            />
          </g>
          <text x={PLOT_X + WIDTH - 4} y={averageY - 6} textAnchor="end" className="fill-amber-300 font-mono text-[10px]">
            avg {averageV.toFixed(2)}V
          </text>
        </svg>

        <div className="space-y-5">
          <Slider label="Duty cycle" value={duty} min={0} max={100} step={5} unit="%" onChange={setDuty} />
          <Slider label="Cycles on screen (frequency)" value={cyclesShown} min={2} max={10} unit="×" onChange={setCyclesShown} />
          <div className="flex items-center gap-4">
            <div className="relative grid h-16 w-16 shrink-0 place-items-center" aria-hidden>
              <div
                className="absolute inset-0 rounded-full bg-red-500 blur-xl transition-opacity duration-300"
                style={{ opacity: (duty / 100) * 0.8 }}
              />
              <div
                className="relative h-9 w-9 rounded-full border-2 border-red-900 bg-red-500 transition-opacity duration-300"
                style={{ opacity: 0.15 + (duty / 100) * 0.85 }}
              />
            </div>
            <div className="grid flex-1 grid-cols-1 gap-2">
              <Readout label="Average voltage" tone="amber">
                {averageV.toFixed(2)} V
              </Readout>
            </div>
          </div>
          <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            V_avg = duty × V_high = {duty / 100} × {SUPPLY_V} V
          </p>
        </div>
      </div>
    </VisualFrame>
  );
}
