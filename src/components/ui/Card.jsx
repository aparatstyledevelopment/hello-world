import { cn } from "../../lib/utils";

const variantStyles = {
  default: "bg-white border border-gray-200 rounded-lg p-5",
  dark: "bg-black text-white rounded-lg p-5",
  section: "bg-white border border-gray-200 rounded-lg p-5",
  fact: "bg-gray-50 border border-gray-200 rounded-lg p-5",
  inference: "bg-gray-50 border border-gray-200 rounded-lg p-5",
  recommendation: "bg-gray-50 border border-gray-200 rounded-lg p-5",
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
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-black" />
            )}
            <div>
              {title && (
                <h3
                  className={cn(
                    isSection
                      ? "text-base font-bold text-black"
                      : "text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400"
                  )}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    variant === "dark" ? "text-gray-400" : "text-gray-500"
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
