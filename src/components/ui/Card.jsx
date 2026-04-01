import { cn } from "../../lib/utils";

const variantStyles = {
  default: "bg-white border border-slate-200 rounded-lg p-6",
  dark: "bg-slate-900 text-white rounded-lg p-6",
  section: "bg-white border border-slate-200 rounded-lg p-6",
  fact: "bg-blue-50/30 border border-slate-200 border-l-4 border-l-blue-500 rounded-lg p-6",
  inference: "bg-amber-50/30 border border-slate-200 border-l-4 border-l-amber-500 rounded-lg p-6",
  recommendation: "bg-emerald-50/30 border border-slate-200 border-l-4 border-l-emerald-500 rounded-lg p-6",
};

const sectionBorderColors = {
  blue: "border-l-blue-500",
  amber: "border-l-amber-500",
  emerald: "border-l-emerald-500",
  red: "border-l-red-500",
  violet: "border-l-violet-500",
  slate: "border-l-slate-400",
  teal: "border-l-teal-500",
  indigo: "border-l-indigo-500",
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
  const borderColor = accentColor
    ? sectionBorderColors[accentColor] || sectionBorderColors.blue
    : null;

  return (
    <div
      className={cn(
        variantStyles[variant] ?? variantStyles.default,
        isSection && borderColor && `border-l-4 ${borderColor}`,
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
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
