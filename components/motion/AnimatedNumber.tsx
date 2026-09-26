"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  duration = 0.8,
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(0);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;
    const format = (v: number) => `${v.toFixed(decimals)}${suffix}`;
    if (reduceMotion) {
      node.textContent = format(value);
      previous.current = value;
      return;
    }
    const controls = animate(previous.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, decimals, suffix, duration, inView, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      {`${value.toFixed(decimals)}${suffix}`}
    </span>
  );
}
