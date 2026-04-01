import { cn } from "../../lib/utils";

const trendConfig = {
  up: { icon: "\u2191", color: "text-emerald-600" },
  down: { icon: "\u2193", color: "text-red-600" },
  neutral: { icon: "\u2192", color: "text-slate-400" },
};

export function StatCard({ value, label, trend, className }) {
  const t = trend ? trendConfig[trend] : null;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4",
        className
      )}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </span>
        {t && (
          <span className={cn("text-sm font-medium", t.color)}>
            {t.icon}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}
