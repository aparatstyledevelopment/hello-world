import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Filter } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/ui/Table";
import { Sparkline } from "../components/ui/Sparkline";
import { EmptyState } from "../components/ui/EmptyState";
import {
  investors,
  getSignalsForInvestor,
  getActionsForInvestor,
} from "../data/mock-data";

const TODAY = new Date("2026-04-01");

const typeLabels = {
  passive: "Passive",
  active: "Active",
  pension: "Pension",
  sovereign: "Sovereign",
};

const typeBadgeColors = {
  passive: "bg-sky-50 text-sky-700 ring-sky-600/20",
  active: "bg-violet-50 text-violet-700 ring-violet-600/20",
  pension: "bg-teal-50 text-teal-700 ring-teal-600/20",
  sovereign: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
};

const momentumConfig = {
  positive: { color: "bg-emerald-500", label: "Positive" },
  neutral: { color: "bg-slate-400", label: "Neutral" },
  negative: { color: "bg-red-500", label: "Negative" },
};

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = TODAY - new Date(dateStr);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getLastInteraction(investor) {
  let latest = null;
  for (const c of investor.contacts) {
    if (!latest || c.lastInteraction > latest) {
      latest = c.lastInteraction;
    }
  }
  return latest;
}

export function InvestorsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ type: "", tier: "" });

  const enriched = useMemo(() => {
    return investors.map((inv) => {
      const openSignals = getSignalsForInvestor(inv.id).filter(
        (s) => s.state !== "resolved" && s.state !== "dismissed"
      );
      const openActions = getActionsForInvestor(inv.id).filter(
        (a) => a.state !== "completed"
      );
      const lastInteraction = getLastInteraction(inv);
      const daysSinceInteraction = daysSince(lastInteraction);
      const primaryContact = inv.contacts[0] || null;

      return {
        ...inv,
        openSignalCount: openSignals.length,
        openActionCount: openActions.length,
        lastInteraction,
        daysSinceInteraction,
        primaryContact,
      };
    });
  }, []);

  const filtered = useMemo(() => {
    let result = enriched;
    if (filters.type) result = result.filter((i) => i.type === filters.type);
    if (filters.tier) result = result.filter((i) => i.tier === Number(filters.tier));
    // Sort by tier then name
    return result.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
  }, [enriched, filters]);

  const columns = [
    { key: "name", label: "Investor" },
    { key: "type", label: "Type" },
    { key: "holdingPct", label: "Holding %" },
    { key: "sparkline", label: "Trend" },
    { key: "tier", label: "Tier" },
    { key: "primaryContact", label: "Primary Contact" },
    { key: "lastInteraction", label: "Last Interaction" },
    { key: "momentum", label: "Momentum" },
    { key: "openSignals", label: "Signals", className: "text-center" },
    { key: "openActions", label: "Actions", className: "text-center" },
  ];

  const renderCell = (row, col) => {
    switch (col.key) {
      case "name":
        return <span className="font-semibold text-slate-900">{row.name}</span>;
      case "type":
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
              typeBadgeColors[row.type]
            )}
          >
            {typeLabels[row.type]}
          </span>
        );
      case "holdingPct":
        return <span className="font-medium">{row.holdingPct}%</span>;
      case "sparkline":
        return (
          <Sparkline
            data={row.holdingHistory}
            width={64}
            height={20}
            color={
              row.holdingTrend === "up"
                ? "#10b981"
                : row.holdingTrend === "down"
                ? "#ef4444"
                : "#94a3b8"
            }
          />
        );
      case "tier":
        return <Badge variant={String(row.tier)}>Tier {row.tier}</Badge>;
      case "primaryContact":
        return (
          <span className="text-slate-600">
            {row.primaryContact?.name ?? "-"}
          </span>
        );
      case "lastInteraction": {
        const days = row.daysSinceInteraction;
        return (
          <span
            className={cn(
              "text-sm",
              days !== null && days > 30
                ? "font-semibold text-red-600"
                : "text-slate-600"
            )}
          >
            {days !== null ? `${days}d ago` : "-"}
          </span>
        );
      }
      case "momentum": {
        const m = momentumConfig[row.engagementMomentum] || momentumConfig.neutral;
        return (
          <div className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", m.color)} />
            <span className="text-xs text-slate-500">{m.label}</span>
          </div>
        );
      }
      case "openSignals":
        return row.openSignalCount > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-semibold text-red-700">
            {row.openSignalCount}
          </span>
        ) : (
          <span className="text-slate-300">0</span>
        );
      case "openActions":
        return (
          <span className="text-sm text-slate-600">{row.openActionCount}</span>
        );
      default:
        return row[col.key];
    }
  };

  const uniqueTypes = [...new Set(investors.map((i) => i.type))];
  const uniqueTiers = [...new Set(investors.map((i) => i.tier))].sort();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Investors</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {filtered.length} investor{filtered.length !== 1 && "s"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-slate-400" />

        <select
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Types</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>
              {typeLabels[t]}
            </option>
          ))}
        </select>

        <select
          value={filters.tier}
          onChange={(e) => setFilters((f) => ({ ...f, tier: e.target.value }))}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Tiers</option>
          {uniqueTiers.map((t) => (
            <option key={t} value={t}>
              Tier {t}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <Table
          columns={columns}
          data={filtered}
          onRowClick={(row) => navigate(`/investors/${row.id}`)}
          renderCell={renderCell}
        />
      ) : (
        <EmptyState
          icon={Users}
          title="No investors found"
          description="Try adjusting your filters."
        />
      )}
    </div>
  );
}
