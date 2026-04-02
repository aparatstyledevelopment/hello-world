import { cn } from "../../lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      {Icon && (
        <div className="mb-4 rounded-2xl bg-zinc-100 p-4">
          <Icon className="h-6 w-6 text-zinc-400" strokeWidth={1.5} />
        </div>
      )}
      {title && (
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      )}
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-zinc-500">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
