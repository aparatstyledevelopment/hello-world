import { cn } from "../../lib/utils";

const positionMap = {
  low: "20%",
  medium: "50%",
  high: "80%",
};

export function SentimentMeter({ value = "low", label, description }) {
  const position = positionMap[value] ?? positionMap.low;

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
          {label}
        </p>
      )}

      <div className="relative">
        <div
          className="h-2 rounded-full"
          style={{
            background: "linear-gradient(to right, #d4d4d8, #a1a1aa, #ef4444)",
          }}
        />
        <div className="absolute top-0 h-2" style={{ left: position }}>
          <div className="w-1 h-full bg-zinc-900 rounded-full -translate-x-1/2 shadow-sm" />
        </div>
      </div>

      <div className="relative">
        <span
          className="absolute text-xs font-bold uppercase text-zinc-700 -translate-x-1/2"
          style={{ left: position }}
        >
          {value}
        </span>
      </div>

      {description && (
        <p className="text-sm text-zinc-500 pt-4 leading-relaxed">{description}</p>
      )}
    </div>
  );
}
