import { cn } from "../../lib/utils";

const urgencyStyles = {
  high: "bg-red-50 text-red-700 ring-red-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

const stateStyles = {
  new: "bg-blue-50 text-blue-700 ring-blue-600/20",
  reviewing: "bg-amber-50 text-amber-700 ring-amber-600/20",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  action_created: "bg-purple-50 text-purple-700 ring-purple-600/20",
  resolved: "bg-slate-50 text-slate-600 ring-slate-500/20",
  dismissed: "bg-slate-50 text-slate-500 ring-slate-400/20",
};

const typeLabels = {
  retention_risk: "Retention Risk",
  influence_opportunity: "Influence Opportunity",
  governance_management: "Governance",
  information_gap: "Information Gap",
  relationship_maintenance: "Relationship",
};

const typeStyles = {
  retention_risk: "bg-red-50 text-red-700 ring-red-600/20",
  influence_opportunity: "bg-violet-50 text-violet-700 ring-violet-600/20",
  governance_management: "bg-sky-50 text-sky-700 ring-sky-600/20",
  information_gap: "bg-amber-50 text-amber-700 ring-amber-600/20",
  relationship_maintenance: "bg-teal-50 text-teal-700 ring-teal-600/20",
};

const tierStyles = {
  1: "bg-blue-50 text-blue-700 ring-blue-600/20",
  2: "bg-slate-100 text-slate-700 ring-slate-500/20",
  3: "bg-slate-50 text-slate-500 ring-slate-400/20",
};

const provenanceStyles = {
  observed: "bg-blue-50 text-blue-700 ring-blue-600/20",
  inferred: "bg-amber-50 text-amber-700 ring-amber-600/20",
  team_assessed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

function resolveVariant(variant) {
  if (!variant) return { style: "bg-slate-100 text-slate-700 ring-slate-500/20", label: null };

  if (urgencyStyles[variant]) return { style: urgencyStyles[variant], label: null };
  if (stateStyles[variant]) return { style: stateStyles[variant], label: null };
  if (typeStyles[variant]) return { style: typeStyles[variant], label: typeLabels[variant] };
  if (provenanceStyles[variant]) return { style: provenanceStyles[variant], label: null };

  const tierNum = Number(variant);
  if (tierStyles[tierNum]) return { style: tierStyles[tierNum], label: null };

  return { style: "bg-slate-100 text-slate-700 ring-slate-500/20", label: null };
}

export function Badge({ variant, children, className }) {
  const { style, label } = resolveVariant(variant);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        style,
        className
      )}
    >
      {children ?? label ?? variant}
    </span>
  );
}
