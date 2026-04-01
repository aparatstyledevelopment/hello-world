import { cn } from "../../lib/utils";
import { AlertTriangle } from "lucide-react";

const urgencyStyles = {
  high: "text-red-500",
  medium: "text-amber-600",
  low: "text-emerald-600",
};

const urgencyIcons = {
  high: AlertTriangle,
};

const stateStyles = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  reviewing: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  action_created: "bg-purple-50 text-purple-700 border-purple-200",
  resolved: "bg-slate-50 text-slate-600 border-slate-200",
  dismissed: "bg-slate-50 text-slate-500 border-slate-200",
};

const trajectoryStyles = {
  stable: "bg-slate-100 text-slate-700",
  increasing: "bg-emerald-50 text-emerald-700",
  decreasing: "bg-red-50 text-red-700",
};

const typeLabels = {
  retention_risk: "Retention Risk",
  influence_opportunity: "Influence Opportunity",
  governance_management: "Governance",
  information_gap: "Information Gap",
  relationship_maintenance: "Relationship",
};

const typeStyles = {
  retention_risk: "bg-red-50 text-red-700 border-red-200",
  influence_opportunity: "bg-violet-50 text-violet-700 border-violet-200",
  governance_management: "bg-sky-50 text-sky-700 border-sky-200",
  information_gap: "bg-amber-50 text-amber-700 border-amber-200",
  relationship_maintenance: "bg-teal-50 text-teal-700 border-teal-200",
};

const tierStyles = {
  1: "border-slate-300 text-slate-700 bg-white",
  2: "border-slate-300 text-slate-500 bg-white",
  3: "border-slate-200 text-slate-400 bg-white",
};

const provenanceStyles = {
  observed: "bg-blue-50 text-blue-700 border-blue-200",
  inferred: "bg-amber-50 text-amber-700 border-amber-200",
  team_assessed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const freshnessStyles = {
  stale: "text-red-500",
  recent: "text-slate-500",
};

function resolveVariant(variant) {
  if (!variant) return { style: "bg-slate-100 text-slate-700 border-slate-200", label: null, kind: "default" };

  // Urgency
  if (urgencyStyles[variant]) return { style: urgencyStyles[variant], label: null, kind: "urgency" };

  // State
  if (stateStyles[variant]) return { style: stateStyles[variant], label: null, kind: "state" };

  // Trajectory
  if (trajectoryStyles[variant]) return { style: trajectoryStyles[variant], label: null, kind: "trajectory" };

  // Type
  if (typeStyles[variant]) return { style: typeStyles[variant], label: typeLabels[variant], kind: "type" };

  // Provenance
  if (provenanceStyles[variant]) return { style: provenanceStyles[variant], label: null, kind: "provenance" };

  // Freshness
  if (freshnessStyles[variant]) return { style: freshnessStyles[variant], label: null, kind: "freshness" };

  // Tier
  const tierNum = Number(variant);
  if (tierStyles[tierNum]) return { style: tierStyles[tierNum], label: `T${tierNum}`, kind: "tier" };

  return { style: "bg-slate-100 text-slate-700 border-slate-200", label: null, kind: "default" };
}

export function Badge({ variant, children, className }) {
  const { style, label, kind } = resolveVariant(variant);

  // Urgency badges: text with optional warning icon, no pill background
  if (kind === "urgency") {
    const Icon = urgencyIcons[variant];
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs font-medium", style, className)}>
        {Icon && <Icon size={12} />}
        {children ?? label ?? variant}
      </span>
    );
  }

  // Tier badges: small outlined circle pills
  if (kind === "tier") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full border px-1.5 py-0 text-[10px] font-semibold",
          style,
          className
        )}
      >
        {children ?? label ?? variant}
      </span>
    );
  }

  // Freshness badges: colored dot + text
  if (kind === "freshness") {
    const isStale = variant === "stale";
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", style, className)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", isStale ? "bg-red-500" : "bg-slate-400")} />
        {children ?? label ?? variant}
      </span>
    );
  }

  // Trajectory badges: pills without border
  if (kind === "trajectory") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase",
          style,
          className
        )}
      >
        {children ?? label ?? variant}
      </span>
    );
  }

  // Default pill badges (state, type, provenance, etc.)
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        style,
        className
      )}
    >
      {children ?? label ?? variant}
    </span>
  );
}
