import { cn } from "../../lib/utils";

const colorMap = {
  strong: "bg-slate-700",
  moderate: "bg-amber-400",
  weak: "bg-red-400",
  unknown: "bg-slate-200",
};

export function HealthDots({ values = [] }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {values.map((status, i) => (
        <span
          key={i}
          className={cn(
            "w-3.5 h-3.5 rounded-full",
            colorMap[status] ?? colorMap.unknown
          )}
        />
      ))}
    </span>
  );
}
