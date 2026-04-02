import { cn } from "../../lib/utils";
import { AlertTriangle } from "lucide-react";

const basePill =
  "inline-flex items-center text-[11px] tracking-[0.04em] uppercase font-medium rounded-lg px-2.5 py-1";

const urgencyStyles = {
  high: "bg-red-50 text-red-600 border border-red-100",
  medium: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  low: "bg-zinc-50 text-zinc-400 border border-zinc-100",
};

const urgencyLabels = {
  high: "HIGH URGENCY",
  medium: "MEDIUM URGENCY",
  low: "LOW URGENCY",
};

const stateStyles = {
  new: "bg-zinc-900 text-white",
  reviewing: "bg-zinc-200 text-zinc-700",
  confirmed: "bg-zinc-800 text-white",
  action_created: "bg-zinc-600 text-white",
  resolved: "bg-zinc-100 text-zinc-500",
  dismissed: "bg-zinc-50 text-zinc-400",
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
  retention_risk: "bg-red-50 text-red-600 border border-red-100",
  influence_opportunity: "bg-blue-50 text-blue-600 border border-blue-100",
  governance_management: "bg-amber-50 text-amber-700 border border-amber-100",
  information_gap: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  relationship_maintenance: "bg-emerald-50 text-emerald-600 border border-emerald-100",
};

const typeLabels = {
  retention_risk: "RETENTION RISK",
  influence_opportunity: "INFLUENCE OPPORTUNITY",
  governance_management: "GOVERNANCE",
  information_gap: "INFORMATION GAP",
  relationship_maintenance: "RELATIONSHIP",
};

const tierStyles = {
  T1: "bg-zinc-900 text-white",
  T2: "bg-zinc-200 text-zinc-700",
  T3: "bg-zinc-100 text-zinc-500",
};

const trajectoryStyles = {
  stable: "bg-zinc-100 text-zinc-600",
  increasing: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  declining: "bg-red-50 text-red-600 border border-red-100",
};

const trajectoryLabels = {
  stable: "STABLE",
  increasing: "INCREASING",
  declining: "DECLINING",
};

const sensitivityStyles = {
  governance: "bg-amber-50 text-amber-700 border border-amber-100",
  esg: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  "esg/proxy": "bg-emerald-50 text-emerald-700 border border-emerald-100",
  esg_proxy: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  liquidity: "bg-blue-50 text-blue-600 border border-blue-100",
  strategic_change: "bg-red-50 text-red-600 border border-red-100",
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
  esg_specialist: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  "buy-side_analyst": "bg-zinc-100 text-zinc-700",
  buyside_analyst: "bg-zinc-100 text-zinc-700",
  "proxy/stewardship": "bg-amber-50 text-amber-700 border border-amber-100",
  proxy_stewardship: "bg-amber-50 text-amber-700 border border-amber-100",
  portfolio_manager: "bg-blue-50 text-blue-600 border border-blue-100",
  sell_side_analyst: "bg-zinc-100 text-zinc-700 border border-zinc-200",
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
      style: "bg-zinc-100 text-zinc-600 border border-zinc-200",
      label: null,
      resolvedKind: "default",
    };

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

  const tierKey = `T${variant}`;
  if (tierStyles[tierKey])
    return { style: tierStyles[tierKey], label: tierKey, resolvedKind: "tier" };

  return {
    style: "bg-zinc-100 text-zinc-600 border border-zinc-200",
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
