import { cn } from "../../lib/utils";

const variantStyles = {
  default: "bg-white border border-slate-200 rounded-lg p-5",
  dark: "bg-slate-900 text-white rounded-lg p-5",
  section: "bg-white border border-slate-200 rounded-lg p-5",
  fact: "bg-blue-50/30 border border-blue-100 rounded-lg p-5",
  inference: "bg-amber-50/30 border border-amber-100 rounded-lg p-5",
  recommendation: "bg-emerald-50/30 border border-emerald-100 rounded-lg p-5",
};

const accentChipColors = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export function Card({
  variant = "default",
  className,
  children,
  title,
  subtitle,
  accentColor,
  headerRight,
}) {
  const isSection = variant === "section";
  const chipColor = accentColor ? accentChipColors[accentColor] : null;

  return (
    <div
      className={cn(
        variantStyles[variant] ?? variantStyles.default,
        className
      )}
    >
      {(title || subtitle || headerRight) && (
        <div
          className={cn(
            "mb-4",
            (title || subtitle) && headerRight && "flex items-start justify-between"
          )}
        >
          <div className="flex items-center gap-2">
            {isSection && chipColor && (
              <span className={cn("inline-block w-1.5 h-1.5 rounded-full", chipColor.split(" ")[0].replace("bg-", "bg-").replace("/50", "-500"))} />
            )}
            <div>
              {title && (
                <h3
                  className={cn(
                    isSection
                      ? "text-base font-bold text-slate-900"
                      : "text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400"
                  )}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    variant === "dark" ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
