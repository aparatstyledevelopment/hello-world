import { cn } from "../../lib/utils";

const variantStyles = {
  default: "bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-sm",
  dark: "bg-zinc-900 text-white rounded-2xl p-5 shadow-sm",
  section: "bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-sm",
  fact: "bg-zinc-50 border border-zinc-200/60 rounded-2xl p-5",
  inference: "bg-zinc-50 border border-zinc-200/60 rounded-2xl p-5",
  recommendation: "bg-zinc-50 border border-zinc-200/60 rounded-2xl p-5",
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
            {isSection && accentColor && (
              <span className="inline-block w-1 h-4 rounded-full bg-zinc-900" />
            )}
            <div>
              {title && (
                <h3
                  className={cn(
                    isSection
                      ? "text-[15px] font-semibold text-zinc-900"
                      : "text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400"
                  )}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    variant === "dark" ? "text-zinc-400" : "text-zinc-500"
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
