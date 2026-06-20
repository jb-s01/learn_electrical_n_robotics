import { QuizBlock } from "@/components/lesson/QuizBlock";
import { CircuitSimulator } from "@/components/simulator/CircuitSimulator";
import {
  Callout,
  DiagramBlock,
  WaterAnalogy,
  ComponentSymbol,
} from "@/components/lesson/DiagramBlock";

export const mdxComponents = {
  QuizBlock,
  CircuitSimulator,
  Callout,
  DiagramBlock,
  WaterAnalogy,
  ComponentSymbol,
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mb-4 mt-8 text-3xl font-bold first:mt-0" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-3 mt-6 text-2xl font-semibold" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-2 mt-4 text-xl font-semibold" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-7 text-zinc-700 dark:text-zinc-300" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-4 list-inside list-disc space-y-1 text-zinc-700 dark:text-zinc-300" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-4 list-inside list-decimal space-y-1 text-zinc-700 dark:text-zinc-300" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm dark:bg-zinc-800"
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100"
      {...props}
    />
  ),
};
