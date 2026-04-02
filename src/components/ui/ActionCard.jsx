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
        "rounded-2xl p-5 flex flex-col transition-all",
        isPrimary
          ? "bg-white border border-zinc-200/60 shadow-sm"
          : "bg-zinc-50/50 border border-zinc-200/60"
      )}
    >
      {isPrimary && (
        <span className="self-start bg-zinc-900 text-white rounded-lg text-[10px] tracking-wider uppercase font-semibold px-3 py-1 mb-3">
          RECOMMENDED
        </span>
      )}

      <div className="flex items-start justify-between gap-2">
        <h4 className="text-lg font-semibold text-zinc-900">{title}</h4>
        {Icon && <Icon size={20} className="text-zinc-300 flex-shrink-0 mt-1" />}
      </div>

      {description && (
        <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{description}</p>
      )}

      {(objective || channel || timing) && (
        <div className="mt-4 space-y-3">
          {objective && (
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-zinc-400 font-medium">OBJECTIVE</p>
              <p className="text-sm font-medium text-zinc-700 mt-0.5">{objective}</p>
            </div>
          )}
          {channel && (
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-zinc-400 font-medium">CHANNEL</p>
              <p className="text-sm font-medium text-zinc-700 mt-0.5">{channel}</p>
            </div>
          )}
          {timing && (
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-zinc-400 font-medium">TIMING</p>
              <p className="text-sm font-medium text-zinc-700 mt-0.5">{timing}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex-1" />

      {onAction && (
        <button
          onClick={onAction}
          className={cn(
            "mt-4 self-start rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all",
            isPrimary
              ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"
              : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
          )}
        >
          CREATE ACTION
        </button>
      )}
    </div>
  );
}
