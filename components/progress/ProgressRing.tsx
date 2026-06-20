export function ProgressRing({
  completed,
  total,
  size = 80,
  label,
}: {
  completed: number;
  total: number;
  size?: number;
  label?: string;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-zinc-200 dark:text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-blue-600 transition-all duration-500"
        />
      </svg>
      <div className="text-center">
        <p className="text-lg font-bold">{pct}%</p>
        <p className="text-xs text-zinc-500">
          {completed}/{total} {label ?? "lessons"}
        </p>
      </div>
    </div>
  );
}
