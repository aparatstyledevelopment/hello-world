import { cn } from "../../lib/utils";

const variantStyles = {
  default: "bg-white border-slate-200",
  fact: "bg-blue-50/40 border-blue-200/60",
  inference: "bg-amber-50/40 border-amber-200/60",
  recommendation: "bg-emerald-50/40 border-emerald-200/60",
};

export function Card({ variant = "default", className, children, title, subtitle }) {
  return (
    <div
      className={cn(
        "rounded-xl border shadow-sm p-5",
        variantStyles[variant] ?? variantStyles.default,
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
