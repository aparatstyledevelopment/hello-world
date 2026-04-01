import { cn } from "../../lib/utils";

export function ActionCard({
  title,
  description,
  objective,
  channel,
  timing,
  isPrimary = false,
  icon: Icon,
  onAction,
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-5 flex flex-col",
        isPrimary
          ? "bg-white border border-slate-200 shadow-sm"
          : "bg-slate-50 border border-slate-200"
      )}
    >
      {/* Recommended badge for primary */}
      {isPrimary && (
        <span className="self-start bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] tracking-wider uppercase font-semibold px-3 py-1 mb-3">
          RECOMMENDED NEXT BEST ACTION
        </span>
      )}

      {/* Title row with optional icon */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xl font-bold text-slate-800">{title}</h4>
        {Icon && <Icon size={20} className="text-slate-400 flex-shrink-0 mt-1" />}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-500 mt-2">{description}</p>
      )}

      {/* Info grid */}
      {(objective || channel || timing) && (
        <div className="mt-4 space-y-3">
          {objective && (
            <div>
              <p className="text-[11px] tracking-[0.1em] uppercase text-slate-400">
                OBJECTIVE
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {objective}
              </p>
            </div>
          )}
          {channel && (
            <div>
              <p className="text-[11px] tracking-[0.1em] uppercase text-slate-400">
                CHANNEL
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {channel}
              </p>
            </div>
          )}
          {timing && (
            <div>
              <p className="text-[11px] tracking-[0.1em] uppercase text-slate-400">
                TIMING
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {timing}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* CTA button */}
      {onAction && (
        <button
          onClick={onAction}
          className={cn(
            "mt-4 self-start rounded-lg px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors",
            isPrimary
              ? "bg-slate-800 text-white hover:bg-slate-700"
              : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          )}
        >
          CREATE ACTION
        </button>
      )}
    </div>
  );
}
