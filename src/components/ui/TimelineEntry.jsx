import { cn } from "../../lib/utils";

export function TimelineEntry({
  icon: Icon,
  title,
  date,
  type,
  description,
  isLast = false,
}) {
  return (
    <div
      className={cn(
        "relative flex gap-4 py-5",
        !isLast && "border-b border-gray-100"
      )}
    >
      {/* Left: icon circle + vertical connector line */}
      <div className="relative flex flex-col items-center">
        <div className="rounded-lg w-11 h-11 bg-gray-100 flex items-center justify-center flex-shrink-0">
          {Icon && <Icon size={20} className="text-gray-600" />}
        </div>
        {!isLast && (
          <div className="absolute top-11 bottom-0 left-1/2 w-px -translate-x-1/2 bg-gray-200" />
        )}
      </div>

      {/* Right: content area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-black">{title}</span>
          {type && (
            <span className="bg-black text-white text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded">
              {type}
            </span>
          )}
        </div>
        {date && (
          <span className="text-sm text-gray-400 mt-1 block">{date}</span>
        )}
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
