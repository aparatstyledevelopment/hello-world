import { cn } from "../../lib/utils";

const trendConfig = {
  up: { icon: "↑", color: "text-emerald-600" },
  down: { icon: "↓", color: "text-red-600" },
  neutral: { icon: "→", color: "text-slate-400" },
};

export function StatCard({ value, label, trend, className }) {
  const t = trend ? trendConfig[trend] : null;

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white px-5 py-4",
        className
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold text-slate-900">
          {value}
        </span>
        {t && (
          <span className={cn("text-sm font-medium", t.color)}>
            {t.icon}
          </span>
        )}
      </div>
    </div>
  );
}
