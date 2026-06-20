import { cn } from "@/lib/utils";

export function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "tip";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200",
    warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
    tip: "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200",
  };

  return (
    <div className={cn("my-4 rounded-lg border-l-4 p-4 text-sm", styles[type])}>
      {children}
    </div>
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
    <figure className="my-6 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      {title && (
        <figcaption className="mb-4 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {title}
        </figcaption>
      )}
      {children}
    </figure>
  );
}

export function WaterAnalogy() {
  return (
    <DiagramBlock title="Water Pipe Analogy">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 text-center dark:bg-zinc-950">
          <p className="text-2xl">💧</p>
          <p className="mt-2 font-semibold">Voltage</p>
          <p className="text-xs text-zinc-500">Water pressure — pushes charge</p>
        </div>
        <div className="rounded-lg bg-white p-4 text-center dark:bg-zinc-950">
          <p className="text-2xl">🌊</p>
          <p className="mt-2 font-semibold">Current</p>
          <p className="text-xs text-zinc-500">Flow rate — charge per second</p>
        </div>
        <div className="rounded-lg bg-white p-4 text-center dark:bg-zinc-950">
          <p className="text-2xl">🔧</p>
          <p className="mt-2 font-semibold">Resistance</p>
          <p className="text-xs text-zinc-500">Narrow pipe — opposes flow</p>
        </div>
      </div>
    </DiagramBlock>
  );
}

export function ComponentSymbol({ name, symbol }: { name: string; symbol: string }) {
  return (
    <div className="inline-flex flex-col items-center rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700">
      <span className="font-mono text-2xl">{symbol}</span>
      <span className="mt-1 text-xs text-zinc-500">{name}</span>
    </div>
  );
}
