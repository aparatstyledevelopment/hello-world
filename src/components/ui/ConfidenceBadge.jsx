import { cn } from "../../lib/utils";

const levelMap = { high: 5, medium: 3, low: 1 };

const levelColors = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-red-400",
};

const barHeights = [
  "h-1.5",
  "h-2.5",
  "h-3.5",
  "h-4.5",
  "h-5.5",
];

export function ConfidenceBadge({ level = "medium", showLabel = false }) {
  const filled = levelMap[level] ?? 3;
  const color = levelColors[level] ?? levelColors.medium;

  return (
    <span className="inline-flex items-end gap-0.5">
      <span className="inline-flex items-end gap-[2px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cn(
              "w-1 rounded-sm",
              barHeights[i - 1],
              i <= filled ? color : "bg-slate-200"
            )}
          />
        ))}
      </span>
      {showLabel && (
        <span className="ml-1.5 text-xs font-medium capitalize text-slate-500">
          {level}
        </span>
      )}
    </span>
  );
}
