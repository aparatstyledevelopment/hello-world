import { cn } from "../../lib/utils";
import { AlertTriangle } from "lucide-react";

const basePill =
  "inline-flex items-center text-[11px] tracking-[0.05em] uppercase font-semibold rounded-md px-2.5 py-1";

// --- Variant style maps ---

const urgencyStyles = {
  high: "bg-red-50 text-red-700 border border-red-200",
  medium: "bg-amber-50 text-amber-700 border border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const urgencyLabels = {
  high: "HIGH URGENCY",
  medium: "MEDIUM URGENCY",
  low: "LOW URGENCY",
};

const stateStyles = {
  new: "bg-blue-50 text-blue-700",
  reviewing: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  action_created: "bg-purple-50 text-purple-700",
  resolved: "bg-slate-100 text-slate-500",
  dismissed: "bg-slate-50 text-slate-400",
};

const stateLabels = {
  new: "NEW",
  reviewing: "REVIEWING",
  confirmed: "CONFIRMED",
  action_created: "ACTION CREATED",
  resolved: "RESOLVED",
  dismissed: "DISMISSED",
};

const typeStyles = {
  retention_risk: "bg-red-50 text-red-800 border border-red-200",
  influence_opportunity: "bg-teal-50 text-teal-800 border border-teal-200",
  governance_management: "bg-slate-100 text-slate-800 border border-slate-200",
  information_gap: "bg-amber-50 text-amber-800 border border-amber-200",
  relationship_maintenance: "bg-blue-50 text-blue-800 border border-blue-200",
};

const typeLabels = {
  retention_risk: "RETENTION RISK",
  influence_opportunity: "INFLUENCE OPPORTUNITY",
  governance_management: "GOVERNANCE",
  information_gap: "INFORMATION GAP",
  relationship_maintenance: "RELATIONSHIP",
};

const tierStyles = {
  T1: "bg-slate-800 text-white",
  T2: "bg-slate-200 text-slate-700",
  T3: "bg-slate-100 text-slate-500",
};

const trajectoryStyles = {
  stable: "bg-slate-100 text-slate-700",
  increasing: "bg-emerald-50 text-emerald-700",
  declining: "bg-red-50 text-red-700",
};

const trajectoryLabels = {
  stable: "STABLE",
  increasing: "INCREASING",
  declining: "DECLINING",
};

const sensitivityStyles = {
  governance: "border border-slate-300 text-slate-700",
  esg: "border border-emerald-300 text-emerald-700",
  "esg/proxy": "border border-emerald-300 text-emerald-700",
  esg_proxy: "border border-emerald-300 text-emerald-700",
  liquidity: "border border-blue-300 text-blue-700",
  strategic_change: "bg-red-50 text-red-700 border border-red-200",
};

const sensitivityLabels = {
  governance: "GOVERNANCE",
  esg: "ESG",
  "esg/proxy": "ESG/PROXY",
  esg_proxy: "ESG/PROXY",
  liquidity: "LIQUIDITY",
  strategic_change: "STRATEGIC CHANGE",
};

const roleStyles = {
  esg_specialist: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  "buy-side_analyst": "bg-blue-50 text-blue-800",
  buyside_analyst: "bg-blue-50 text-blue-800",
  "proxy/stewardship": "bg-slate-100 text-slate-800",
  proxy_stewardship: "bg-slate-100 text-slate-800",
  portfolio_manager: "bg-indigo-50 text-indigo-800 border border-indigo-200",
  sell_side_analyst: "bg-cyan-50 text-cyan-800 border border-cyan-200",
};

const roleLabels = {
  esg_specialist: "ESG SPECIALIST",
  "buy-side_analyst": "BUY-SIDE ANALYST",
  buyside_analyst: "BUY-SIDE ANALYST",
  "proxy/stewardship": "PROXY/STEWARDSHIP",
  proxy_stewardship: "PROXY/STEWARDSHIP",
  portfolio_manager: "PORTFOLIO MANAGER",
  sell_side_analyst: "SELL-SIDE ANALYST",
};

function resolveVariant(variant, kind) {
  if (!variant)
    return {
      style: "bg-slate-100 text-slate-700 border border-slate-200",
      label: null,
      resolvedKind: "default",
    };

  // Explicit kind resolution
  if (kind === "urgency" && urgencyStyles[variant])
    return { style: urgencyStyles[variant], label: urgencyLabels[variant], resolvedKind: "urgency" };
  if (kind === "state" && stateStyles[variant])
    return { style: stateStyles[variant], label: stateLabels[variant], resolvedKind: "state" };
  if (kind === "type" && typeStyles[variant])
    return { style: typeStyles[variant], label: typeLabels[variant], resolvedKind: "type" };
  if (kind === "tier" && tierStyles[variant])
    return { style: tierStyles[variant], label: variant, resolvedKind: "tier" };
  if (kind === "trajectory" && trajectoryStyles[variant])
    return { style: trajectoryStyles[variant], label: trajectoryLabels[variant], resolvedKind: "trajectory" };
  if (kind === "sensitivity" && sensitivityStyles[variant])
    return { style: sensitivityStyles[variant], label: sensitivityLabels[variant], resolvedKind: "sensitivity" };
  if (kind === "role" && roleStyles[variant])
    return { style: roleStyles[variant], label: roleLabels[variant], resolvedKind: "role" };

  // Auto-detect by variant value
  if (urgencyStyles[variant])
    return { style: urgencyStyles[variant], label: urgencyLabels[variant], resolvedKind: "urgency" };
  if (stateStyles[variant])
    return { style: stateStyles[variant], label: stateLabels[variant], resolvedKind: "state" };
  if (typeStyles[variant])
    return { style: typeStyles[variant], label: typeLabels[variant], resolvedKind: "type" };
  if (tierStyles[variant])
    return { style: tierStyles[variant], label: variant, resolvedKind: "tier" };
  if (trajectoryStyles[variant])
    return { style: trajectoryStyles[variant], label: trajectoryLabels[variant], resolvedKind: "trajectory" };
  if (sensitivityStyles[variant])
    return { style: sensitivityStyles[variant], label: sensitivityLabels[variant], resolvedKind: "sensitivity" };
  if (roleStyles[variant])
    return { style: roleStyles[variant], label: roleLabels[variant], resolvedKind: "role" };

  // Numeric tier fallback (1, 2, 3)
  const tierKey = `T${variant}`;
  if (tierStyles[tierKey])
    return { style: tierStyles[tierKey], label: tierKey, resolvedKind: "tier" };

  return {
    style: "bg-slate-100 text-slate-700 border border-slate-200",
    label: null,
    resolvedKind: "default",
  };
}

export function Badge({ variant, kind, children, className, icon: CustomIcon }) {
  const { style, label, resolvedKind } = resolveVariant(variant, kind);

  const Icon = CustomIcon || (resolvedKind === "urgency" && variant === "high" ? AlertTriangle : null);

  return (
    <span className={cn(basePill, style, className)}>
      {Icon && <Icon size={12} className="mr-1.5 shrink-0" />}
      {children ?? label ?? variant}
    </span>
  );
}
