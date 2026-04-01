import { cn } from "../../lib/utils";
import { AlertTriangle } from "lucide-react";

const basePill =
  "inline-flex items-center text-[11px] tracking-[0.05em] uppercase font-semibold rounded-md px-2.5 py-1";

const urgencyStyles = {
  high: "bg-red-50 text-red-700 border border-red-200",
  medium: "bg-gray-100 text-gray-700 border border-gray-300",
  low: "bg-gray-50 text-gray-500 border border-gray-200",
};

const urgencyLabels = {
  high: "HIGH URGENCY",
  medium: "MEDIUM URGENCY",
  low: "LOW URGENCY",
};

const stateStyles = {
  new: "bg-black text-white",
  reviewing: "bg-gray-200 text-gray-700",
  confirmed: "bg-gray-800 text-white",
  action_created: "bg-gray-600 text-white",
  resolved: "bg-gray-100 text-gray-500",
  dismissed: "bg-gray-50 text-gray-400",
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
  influence_opportunity: "bg-gray-100 text-gray-800 border border-gray-300",
  governance_management: "bg-gray-100 text-gray-800 border border-gray-200",
  information_gap: "bg-gray-100 text-gray-700 border border-gray-300",
  relationship_maintenance: "bg-gray-50 text-gray-700 border border-gray-200",
};

const typeLabels = {
  retention_risk: "RETENTION RISK",
  influence_opportunity: "INFLUENCE OPPORTUNITY",
  governance_management: "GOVERNANCE",
  information_gap: "INFORMATION GAP",
  relationship_maintenance: "RELATIONSHIP",
};

const tierStyles = {
  T1: "bg-black text-white",
  T2: "bg-gray-300 text-gray-700",
  T3: "bg-gray-100 text-gray-500",
};

const trajectoryStyles = {
  stable: "bg-gray-100 text-gray-700",
  increasing: "bg-gray-800 text-white",
  declining: "bg-red-50 text-red-700",
};

const trajectoryLabels = {
  stable: "STABLE",
  increasing: "INCREASING",
  declining: "DECLINING",
};

const sensitivityStyles = {
  governance: "border border-gray-400 text-gray-700",
  esg: "border border-gray-400 text-gray-700",
  "esg/proxy": "border border-gray-400 text-gray-700",
  esg_proxy: "border border-gray-400 text-gray-700",
  liquidity: "border border-gray-400 text-gray-700",
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
  esg_specialist: "bg-gray-100 text-gray-800 border border-gray-300",
  "buy-side_analyst": "bg-gray-100 text-gray-800",
  buyside_analyst: "bg-gray-100 text-gray-800",
  "proxy/stewardship": "bg-gray-100 text-gray-800",
  proxy_stewardship: "bg-gray-100 text-gray-800",
  portfolio_manager: "bg-gray-200 text-gray-800 border border-gray-300",
  sell_side_analyst: "bg-gray-100 text-gray-800 border border-gray-300",
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
      style: "bg-gray-100 text-gray-700 border border-gray-200",
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
    style: "bg-gray-100 text-gray-700 border border-gray-200",
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
