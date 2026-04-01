import { cn } from "../../lib/utils";

const annotationColors = {
  emerald: "text-emerald-600",
  red: "text-red-600",
  amber: "text-amber-600",
  blue: "text-blue-600",
  slate: "text-slate-500",
};

export function StatCard({
  label,
  value,
  annotation,
  annotationColor = "emerald",
  threshold,
  variant = "light",
  className,
}) {
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "rounded-lg p-4",
        isDark ? "bg-slate-900 text-white" : "border border-slate-200 bg-white",
        className
      )}
    >
      {label && (
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.1em]",
            isDark ? "text-slate-400" : "text-slate-400"
          )}
        >
          {label}
        </p>
      )}

      <div className="mt-1.5 flex items-baseline gap-3">
        <span
          className={cn(
            "font-mono text-3xl font-bold",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          {value}
        </span>
        {threshold && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
            {threshold}
          </span>
        )}
      </div>

      {annotation && (
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            isDark
              ? "text-emerald-400"
              : annotationColors[annotationColor] ?? annotationColors.slate
          )}
        >
          {annotation}
        </p>
      )}
    </div>
  );
}
