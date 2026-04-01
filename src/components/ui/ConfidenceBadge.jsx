import { cn } from "../../lib/utils";
import { CheckCircle } from "lucide-react";

const levelColors = {
  high: { text: "text-emerald-700", icon: "text-emerald-500", bg: "bg-emerald-50" },
  medium: { text: "text-amber-700", icon: "text-amber-500", bg: "bg-amber-50" },
  low: { text: "text-red-700", icon: "text-red-500", bg: "bg-red-50" },
};

/**
 * ConfidenceBadge supports two display modes:
 *
 * 1. `mode="percentage"` (default): Shows "92% Confidence" with a green checkmark icon.
 *    Use `value` prop for the percentage number.
 *
 * 2. `mode="label"`: Shows "CONFIDENCE: High" in uppercase label style
 *    with the level word in font-semibold.
 *    Use `level` prop ("high" | "medium" | "low").
 */
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

  // mode === "label"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] tracking-[0.1em] uppercase text-slate-400 font-medium",
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
