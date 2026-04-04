import { cn } from "../../lib/utils";

const annotationColors = {
  emerald: "text-emerald-600",
  red: "text-red-500",
  amber: "text-amber-600",
  blue: "text-blue-600",
  slate: "text-zinc-500",
  gray: "text-zinc-500",
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
        "rounded-2xl p-4",
        isDark ? "bg-zinc-900 text-white shadow-sm" : "border border-zinc-200/60 bg-white shadow-sm",
        className
      )}
    >
      {label && (
        <p className={cn(
          "text-[11px] font-medium uppercase tracking-[0.08em]",
          isDark ? "text-zinc-400" : "text-zinc-400"
        )}>
          {label}
        </p>
      )}

      <div className="mt-1.5">
        <span
          className={cn(
            "font-mono text-2xl md:text-3xl font-bold tracking-tight",
            isDark ? "text-white" : "text-zinc-900"
          )}
        >
          {value}
        </span>
        {threshold && (
          <span className="mt-1 block rounded-lg bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-zinc-500 w-fit">
            {threshold}
          </span>
        )}
      </div>

      {annotation && (
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            isDark
              ? "text-zinc-400"
              : annotationColors[annotationColor] ?? annotationColors.slate
          )}
        >
          {annotation}
        </p>
      )}
    </div>
  );
}
