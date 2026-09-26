import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

const calloutStyles = {
  info: {
    className: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200",
    icon: Info,
  },
  warning: {
    className: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
    icon: AlertTriangle,
  },
  tip: {
    className: "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200",
    icon: Lightbulb,
  },
};

export function Callout({
  type = "info",
  children,
}: {
  type?: keyof typeof calloutStyles;
  children: React.ReactNode;
}) {
  const { className, icon: Icon } = calloutStyles[type];

  return (
    <Reveal y={10}>
      <div className={cn("my-4 flex gap-3 rounded-lg border-l-4 p-4 text-sm", className)}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="[&>p]:mb-0">{children}</div>
      </div>
    </Reveal>
  );
}

export function DiagramBlock({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <figure className="my-6 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        {title && (
          <figcaption className="mb-4 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {title}
          </figcaption>
        )}
        {children}
      </figure>
    </Reveal>
  );
}

export function ComponentSymbol({ name, symbol }: { name: string; symbol: string }) {
  return (
    <div className="inline-flex flex-col items-center rounded-lg border border-zinc-200 px-4 py-3 transition-transform hover:-translate-y-0.5 dark:border-zinc-700">
      <span className="font-mono text-2xl">{symbol}</span>
      <span className="mt-1 text-xs text-zinc-500">{name}</span>
    </div>
  );
}
