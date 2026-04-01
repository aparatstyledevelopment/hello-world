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
          ? "bg-white border border-gray-200 shadow-sm"
          : "bg-gray-50 border border-gray-200"
      )}
    >
      {isPrimary && (
        <span className="self-start bg-black text-white rounded-full text-[10px] tracking-wider uppercase font-semibold px-3 py-1 mb-3">
          RECOMMENDED NEXT BEST ACTION
        </span>
      )}

      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xl font-bold text-black">{title}</h4>
        {Icon && <Icon size={20} className="text-gray-400 flex-shrink-0 mt-1" />}
      </div>

      {description && (
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      )}

      {(objective || channel || timing) && (
        <div className="mt-4 space-y-3">
          {objective && (
            <div>
              <p className="text-[11px] tracking-[0.1em] uppercase text-gray-400">OBJECTIVE</p>
              <p className="text-sm font-semibold text-black mt-0.5">{objective}</p>
            </div>
          )}
          {channel && (
            <div>
              <p className="text-[11px] tracking-[0.1em] uppercase text-gray-400">CHANNEL</p>
              <p className="text-sm font-semibold text-black mt-0.5">{channel}</p>
            </div>
          )}
          {timing && (
            <div>
              <p className="text-[11px] tracking-[0.1em] uppercase text-gray-400">TIMING</p>
              <p className="text-sm font-semibold text-black mt-0.5">{timing}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex-1" />

      {onAction && (
        <button
          onClick={onAction}
          className={cn(
            "mt-4 self-start rounded-lg px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors",
            isPrimary
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          )}
        >
          CREATE ACTION
        </button>
      )}
    </div>
  );
}
