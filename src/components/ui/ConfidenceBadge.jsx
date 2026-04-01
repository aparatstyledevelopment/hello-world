import { cn } from "../../lib/utils";
import { CheckCircle } from "lucide-react";

const levelColors = {
  high: { text: "text-black", icon: "text-black", bg: "bg-gray-100" },
  medium: { text: "text-gray-600", icon: "text-gray-500", bg: "bg-gray-100" },
  low: { text: "text-red-700", icon: "text-red-500", bg: "bg-red-50" },
};

export function ConfidenceBadge({
  mode = "percentage",
  value,
  level = "high",
  className,
}) {
  const colors = levelColors[level] ?? levelColors.high;

  if (mode === "percentage") {
    const displayValue = value ?? (level === "high" ? 92 : level === "medium" ? 65 : 35);

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-[0.05em] uppercase",
          colors.bg,
          colors.text,
          className
        )}
      >
        <CheckCircle size={13} className={cn("shrink-0", colors.icon)} />
        {displayValue}% Confidence
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] tracking-[0.1em] uppercase text-gray-400 font-medium",
        className
      )}
    >
      CONFIDENCE:{" "}
      <span className={cn("font-semibold", colors.text)}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    </span>
  );
}
