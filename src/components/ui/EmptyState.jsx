import { cn } from "../../lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      {Icon && (
        <div className="mb-4 rounded-xl bg-slate-100 p-3">
          <Icon className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
        </div>
      )}
      {title && (
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      )}
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
