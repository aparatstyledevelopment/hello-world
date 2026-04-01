import { cn } from "../../lib/utils";

const colorMap = {
  strong: "bg-black",
  moderate: "bg-gray-400",
  weak: "bg-red-500",
  unknown: "bg-gray-200",
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
