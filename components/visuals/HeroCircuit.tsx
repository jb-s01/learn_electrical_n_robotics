"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, stagger, svg, type Scope } from "animejs";
import { useReducedMotion } from "motion/react";

const TRACES = [
  "M0 60 H120 L150 30 H300 L330 60 H480",
  "M0 120 H80 L110 150 H260 L290 120 H400 L430 90 H600",
  "M40 200 H200 L230 170 H380 L410 200 H600",
  "M160 0 V40 L190 70 V140 L220 170 V240",
  "M460 0 V50 L430 80 V150 L460 180 V240",
];

const PADS = [
  [120, 60], [300, 30], [480, 60], [260, 150], [400, 120], [200, 200], [380, 170], [190, 70], [430, 80],
];

export function HeroCircuit() {
  const rootRef = useRef<SVGSVGElement>(null);
  const scope = useRef<Scope | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;
    scope.current = createScope({ root }).add(() => {
      const traces = svg.createDrawable(root.querySelectorAll("[data-trace]"));
      if (reduceMotion) {
        traces.forEach((t) => t.setAttribute("draw", "0 1"));
        return;
      }
      animate(traces, {
        draw: ["0 0", "0 1"],
        duration: 1600,
        delay: stagger(140),
        ease: "inOutQuad",
      });
      animate(root.querySelectorAll("[data-pad]"), {
        scale: [0, 1],
        opacity: [0, 1],
        delay: stagger(60, { start: 700 }),
        duration: 500,
        ease: "outBack",
      });
      root.querySelectorAll<SVGCircleElement>("[data-pulse]").forEach((pulse, i) => {
        const path = root.querySelector<SVGPathElement>(`[data-trace="${i}"]`);
        if (!path) return;
        animate(pulse, {
          ...svg.createMotionPath(path),
          opacity: [{ from: 0, to: 1, duration: 200 }, { to: 1, duration: 2200 }, { to: 0, duration: 300 }],
          duration: 2700 + i * 300,
          delay: 1400 + i * 350,
          loop: true,
          loopDelay: 800,
          ease: "inOutSine",
        });
      });
    });
    return () => scope.current?.revert();
  }, [reduceMotion]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 600 240"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      {TRACES.map((d, i) => (
        <path
          key={d}
          data-trace={i}
          d={d}
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-blue-400/40 dark:stroke-blue-400/30"
        />
      ))}
      {PADS.map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          data-pad
          cx={cx}
          cy={cy}
          r={4}
          className="fill-white stroke-blue-400/70 dark:fill-zinc-950"
          strokeWidth={2}
          style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: "view-box" }}
        />
      ))}
      {TRACES.map((d) => (
        <circle key={`pulse-${d}`} data-pulse r={3.5} opacity={0} className="fill-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
      ))}
    </svg>
  );
}
