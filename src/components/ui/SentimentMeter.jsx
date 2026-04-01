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
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
          {label}
        </p>
      )}

      {/* Gradient bar */}
      <div className="relative">
        <div
          className="h-2.5 rounded-full"
          style={{
            background:
              "linear-gradient(to right, #34d399, #fde047, #f87171)",
          }}
        />

        {/* Position marker */}
        <div
          className="absolute top-0 h-2.5"
          style={{ left: position }}
        >
          <div className="w-0.5 h-full bg-black rounded-full -translate-x-1/2" />
        </div>
      </div>

      {/* Value label below marker */}
      <div className="relative">
        <span
          className="absolute text-xs font-bold uppercase text-slate-800 -translate-x-1/2"
          style={{ left: position }}
        >
          {value}
        </span>
      </div>

      {/* Description text */}
      {description && (
        <p className="text-sm text-slate-500 pt-4">{description}</p>
      )}
    </div>
  );
}
