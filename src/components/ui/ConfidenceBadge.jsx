import { cn } from "../../lib/utils";

const levelMap = { high: 3, medium: 2, low: 1 };

const levelColors = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-red-400",
};

export function ConfidenceBadge({ level = "medium", showLabel = false }) {
  const filled = levelMap[level] ?? 2;
  const color = levelColors[level] ?? levelColors.medium;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-3 rounded-full",
              i <= filled ? color : "bg-slate-200"
            )}
          />
        ))}
      </span>
      {showLabel && (
        <span className="text-xs font-medium capitalize text-slate-500">
          {level}
        </span>
      )}
    </span>
  );
}
