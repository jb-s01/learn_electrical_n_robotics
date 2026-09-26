"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createScope, svg, type JSAnimation, type Scope } from "animejs";
import { useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { PlayPauseButton, Readout, Slider, VisualFrame } from "@/components/visuals/VisualFrame";

const LOOP_PATH = "M60 110 V40 H340 V180 H60 Z";
const CHARGE_COUNT = 14;
const BASE_LOOP_MS = 9000;
const REFERENCE_CURRENT_MA = 20;
const MAX_POWER_W = 1.44;

export function CurrentFlow({
  initialVoltage = 9,
  initialResistance = 450,
  tryThis = [
    "Double the resistance — watch the charges slow to half speed",
    "Double the voltage — the current (and the lamp) jump up",
    "Find two different V/R pairs that give the same current",
  ],
}: {
  initialVoltage?: number;
  initialResistance?: number;
  tryThis?: string[];
}) {
  const [voltage, setVoltage] = useState(initialVoltage);
  const [resistance, setResistance] = useState(initialResistance);
  const reduceMotion = useReducedMotion();
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const playing = userPlaying ?? !reduceMotion;

  const rootRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const scope = useRef<Scope | null>(null);

  const currentA = voltage / resistance;
  const currentMa = currentA * 1000;
  const power = voltage * currentA;
  const brightness = Math.sqrt(Math.min(power / MAX_POWER_W, 1));
  const speed = Math.min(Math.max(currentMa / REFERENCE_CURRENT_MA, 0.05), 6);

  useEffect(() => {
    const root = rootRef.current;
    const path = pathRef.current;
    if (!root || !path) return;
    scope.current = createScope({ root }).add((self) => {
      const charges: JSAnimation[] = Array.from(
        root.querySelectorAll<SVGCircleElement>("[data-charge]"),
        (dot, i) =>
          animate(dot, {
            ...svg.createMotionPath(path, (i + 0.5) / CHARGE_COUNT),
            duration: BASE_LOOP_MS,
            ease: "linear",
            loop: true,
            autoplay: false,
          })
      );
      self?.add("setSpeed", (value: number) => {
        for (const charge of charges) charge.speed = value;
      });
      self?.add("setPlaying", (value: boolean) => {
        for (const charge of charges) {
          if (value) charge.play();
          else charge.pause();
        }
      });
    });
    return () => scope.current?.revert();
  }, []);

  useEffect(() => {
    scope.current?.methods.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    scope.current?.methods.setPlaying(playing);
  }, [playing]);

  return (
    <VisualFrame
      title="Ohm's Law Explorer"
      subtitle="Each dot is a packet of charge. Speed of the dots ∝ current."
      tryThis={tryThis}
      actions={<PlayPauseButton playing={playing} onToggle={() => setUserPlaying(!playing)} />}
    >
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <svg
          ref={rootRef}
          viewBox="0 0 400 220"
          role="img"
          aria-label={`Series circuit: ${voltage} volt battery, ${resistance} ohm resistor, current ${currentMa.toFixed(1)} milliamps`}
          className="w-full rounded-xl bg-zinc-50 bg-grid dark:bg-zinc-900/60"
        >
          <path
            ref={pathRef}
            d={LOOP_PATH}
            fill="none"
            strokeWidth={4}
            strokeLinejoin="round"
            className="stroke-zinc-300 dark:stroke-zinc-700"
          />

          {Array.from({ length: CHARGE_COUNT }, (_, i) => (
            <circle key={i} data-charge r={5} className="fill-blue-500 drop-shadow-[0_0_4px_rgba(59,130,246,0.8)]" />
          ))}

          <g aria-hidden>
            <rect x={40} y={88} width={40} height={44} rx={6} className="fill-zinc-50 dark:fill-zinc-900" />
            <line x1={42} x2={78} y1={100} y2={100} strokeWidth={4} className="stroke-zinc-800 dark:stroke-zinc-200" />
            <line x1={50} x2={70} y1={118} y2={118} strokeWidth={4} className="stroke-zinc-800 dark:stroke-zinc-200" />
            <text x={88} y={104} className="fill-red-500 text-[13px] font-bold">+</text>
            <text x={88} y={124} className="fill-zinc-500 text-[13px] font-bold">−</text>
            <text x={16} y={114} className="fill-zinc-600 font-mono text-[11px] dark:fill-zinc-300">{voltage}V</text>

            <rect x={150} y={26} width={100} height={28} rx={6} className="fill-zinc-50 dark:fill-zinc-900" />
            <polyline
              points="150,40 160,40 166,28 178,52 190,28 202,52 214,28 226,52 234,40 250,40"
              fill="none"
              strokeWidth={3}
              strokeLinejoin="round"
              className="stroke-amber-600 dark:stroke-amber-400"
            />
            <text x={200} y={72} textAnchor="middle" className="fill-zinc-600 font-mono text-[11px] dark:fill-zinc-300">
              {resistance}Ω
            </text>

            <circle cx={340} cy={110} r={34} fill="rgb(250 204 21)" opacity={brightness * 0.35} />
            <circle cx={340} cy={110} r={16} strokeWidth={3} className="fill-zinc-50 stroke-zinc-800 dark:fill-zinc-900 dark:stroke-zinc-200" />
            <circle cx={340} cy={110} r={13} fill="rgb(250 204 21)" opacity={0.1 + brightness * 0.9} />
            <path d="M331 101 L349 119 M349 101 L331 119" strokeWidth={2} className="stroke-zinc-800 dark:stroke-zinc-200" />
            <text x={362} y={150} className="fill-zinc-600 font-mono text-[11px] dark:fill-zinc-300">lamp</text>

            <text x={200} y={204} textAnchor="middle" className="fill-blue-600 text-[12px] font-semibold dark:fill-blue-400">
              I →  conventional current flows clockwise
            </text>
          </g>
        </svg>

        <div className="space-y-5">
          <Slider label="Voltage (V)" value={voltage} min={1} max={12} step={0.5} unit="V" onChange={setVoltage} />
          <Slider label="Resistance (R)" value={resistance} min={100} max={1000} step={10} unit="Ω" onChange={setResistance} />
          <div className="grid grid-cols-2 gap-3">
            <Readout label="Current I = V / R" tone="blue">
              <AnimatedNumber value={currentMa} decimals={1} suffix=" mA" duration={0.4} />
            </Readout>
            <Readout label="Power P = V × I" tone="amber">
              <AnimatedNumber value={power * 1000} decimals={0} suffix=" mW" duration={0.4} />
            </Readout>
          </div>
          <p className="rounded-lg bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            I = {voltage} V ÷ {resistance} Ω = {currentA.toFixed(4)} A
          </p>
        </div>
      </div>
    </VisualFrame>
  );
}
