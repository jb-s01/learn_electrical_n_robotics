"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";

export function MotionProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,
        anchors: true,
        respectReducedMotion: true,
        // Let nested scroll areas (chat history, code blocks) scroll natively.
        prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
      }}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ReactLenis>
  );
}
