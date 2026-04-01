import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Filter,
  Search,
  List,
  LayoutGrid,
  Rows3,
  Plus,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Table } from "../components/ui/Table";
import { EmptyState } from "../components/ui/EmptyState";
import {
  investors,
  getSignalsForInvestor,
  getActionsForInvestor,
} from "../data/mock-data";

const TODAY = new Date("2026-04-01");

// ── Derived state helpers ────────────────────────────────
function getStateParam(inv, label) {
  const p = inv.stateParameters?.find(
    (sp) => sp.label.toLowerCase() === label.toLowerCase()
  );
  return p || null;
}

function deriveConviction(inv) {
  if (inv.tier === 1 && inv.holdingPct > 5) return "High";
  if (inv.tier <= 2) return "Medium";
  return "Low";
}

function deriveSentiment(inv) {
  const p = getStateParam(inv, "Sentiment");
  if (!p) return "Neutral";
  const v = p.value.toLowerCase();
  if (v.includes("positive") || v.includes("constructive")) return "Positive";
  if (v.includes("negative") || v.includes("cautious")) return "Negative";
  return "Neutral";
}

function deriveFreshness(inv) {
  let latest = null;
  for (const c of inv.contacts) {
    if (!latest || c.lastInteraction > latest) latest = c.lastInteraction;
  }
  if (!latest) return "Stale";
  const days = Math.floor((TODAY - new Date(latest)) / (1000 * 60 * 60 * 24));
  return days > 30 ? "Stale" : "Recent";
}

function deriveEngagement(inv) {
  if (inv.engagementMomentum === "positive") return "High";
  if (inv.engagementMomentum === "negative") return "Low";
  return "Medium";
}

function derivePressure(inv) {
  const signals = getSignalsForInvestor(inv.id).filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  );
  const highUrgency = signals.some((s) => s.urgency === "high");
  if (highUrgency || inv.holdingTrend === "down") return "HIGH";
  if (signals.length > 0) return "MEDIUM";
  return "LOW";
}

function deriveTrajectory(inv) {
  if (inv.holdingTrend === "up") return "INCREASING";
  if (inv.holdingTrend === "down") return "DECREASING";
  return "STABLE";
}

const trajectoryStyles = {
  STABLE: "bg-slate-100 text-slate-700",
  INCREASING: "bg-emerald-50 text-emerald-700",
  DECREASING: "bg-red-50 text-red-700",
};

const pressureDot = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-slate-300",
};

const FILTER_OPTIONS = [
  { key: "all", label: "ALL TIERS" },
  { key: "high_risk", label: "HIGH RISK" },
  { key: "opportunity", label: "OPPORTUNITY" },
  { key: "negative_sentiment", label: "NEGATIVE SENTIMENT" },
];

export function InvestorsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("list");

  const enriched = useMemo(() => {
    return investors.map((inv) => {
      const openSignals = getSignalsForInvestor(inv.id).filter(
        (s) => s.state !== "resolved" && s.state !== "dismissed"
      );
      const openActions = getActionsForInvestor(inv.id).filter(
        (a) => a.state !== "completed"
      );
      return {
        ...inv,
        openSignalCount: openSignals.length,
        openActionCount: openActions.length,
        conviction: deriveConviction(inv),
        sentiment: deriveSentiment(inv),
        freshness: deriveFreshness(inv),
        engagement: deriveEngagement(inv),
        pressure: derivePressure(inv),
        trajectory: deriveTrajectory(inv),
      };
    });
  }, []);

  const tier1Count = enriched.filter((i) => i.tier === 1).length;
  const avgSentimentPositive = enriched.filter(
    (i) => i.sentiment === "Positive"
  ).length;

  const filtered = useMemo(() => {
    let result = enriched;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          `t${i.tier}`.includes(q) ||
          `tier ${i.tier}`.includes(q)
      );
    }

    switch (activeFilter) {
      case "high_risk":
        result = result.filter(
          (i) => i.pressure === "HIGH" || i.trajectory === "DECREASING"
        );
        break;
      case "opportunity":
        result = result.filter(
          (i) => i.trajectory === "INCREASING" || i.engagement === "High"
        );
        break;
      case "negative_sentiment":
        result = result.filter((i) => i.sentiment === "Negative");
        break;
      default:
        break;
    }

    return result.sort(
      (a, b) => a.tier - b.tier || a.name.localeCompare(b.name)
    );
  }, [enriched, activeFilter, searchQuery]);

  const columns = [
    { key: "name", label: "Investor" },
    { key: "tier", label: "Tier" },
    { key: "holdingPct", label: "Ownership" },
    { key: "trajectory", label: "Trajectory" },
    { key: "conviction", label: "Conviction" },
    { key: "sentiment", label: "Sentiment" },
    { key: "freshness", label: "Freshness" },
    { key: "engagement", label: "Engagement" },
    { key: "pressure", label: "Pressure" },
  ];

  const renderCell = (row, col) => {
    switch (col.key) {
      case "name":
        return (
          <span className="font-semibold text-slate-900">{row.name}</span>
        );
      case "tier":
        return (
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full border px-2 py-0 text-xs font-semibold",
              row.tier === 1
                ? "border-slate-300 text-slate-700 bg-white"
                : row.tier === 2
                ? "border-slate-300 text-slate-500 bg-white"
                : "border-slate-200 text-slate-400 bg-white"
            )}
          >
            T{row.tier}
          </span>
        );
      case "holdingPct":
        return (
          <span className="font-mono text-sm text-slate-700">
            {row.holdingPct}%
          </span>
        );
      case "trajectory":
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              trajectoryStyles[row.trajectory]
            )}
          >
            {row.trajectory}
          </span>
        );
      case "conviction": {
        if (row.conviction === "High")
          return (
            <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-slate-900 text-white">
              High
            </span>
          );
        if (row.conviction === "Medium")
          return (
            <span className="text-xs text-slate-500 font-medium">Medium</span>
          );
        return (
          <span className="text-xs text-slate-400 font-medium">Low</span>
        );
      }
      case "sentiment": {
        if (row.sentiment === "Positive")
          return (
            <span className="text-xs font-medium text-emerald-600">
              Positive
            </span>
          );
        if (row.sentiment === "Negative")
          return (
            <span className="text-xs font-medium text-red-600">Negative</span>
          );
        return (
          <span className="text-xs font-medium text-slate-500">Neutral</span>
        );
      }
      case "freshness": {
        if (row.freshness === "Stale")
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Stale
            </span>
          );
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Recent
          </span>
        );
      }
      case "engagement": {
        if (row.engagement === "High")
          return (
            <span className="text-xs font-medium text-emerald-600">High</span>
          );
        if (row.engagement === "Low")
          return (
            <span className="text-xs font-medium text-red-500">Low</span>
          );
        return (
          <span className="text-xs font-medium text-slate-500">Medium</span>
        );
      }
      case "pressure": {
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={cn("h-2 w-2 rounded-full", pressureDot[row.pressure])}
            />
            <span
              className={cn(
                "text-xs font-medium",
                row.pressure === "HIGH"
                  ? "text-red-600"
                  : row.pressure === "MEDIUM"
                  ? "text-amber-600"
                  : "text-slate-400"
              )}
            >
              {row.pressure}
            </span>
          </div>
        );
      }
      default:
        return row[col.key];
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Investor Base</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Strategic investor intelligence and relationship management
          </p>
          <div className="mt-3 flex items-center gap-6">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                TOTAL BASE
              </span>
              <p className="font-mono text-lg font-bold text-slate-900">
                {enriched.length}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                TIER 1
              </span>
              <p className="font-mono text-lg font-bold text-slate-900">
                {tier1Count}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                AVG SENTIMENT
              </span>
              <p className="font-mono text-lg font-bold text-emerald-600">
                {avgSentimentPositive}/{enriched.length} Positive
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggles */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setActiveView("list")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                activeView === "list"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setActiveView("grid")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                activeView === "grid"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setActiveView("compact")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                activeView === "compact"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Rows3 size={14} />
            </button>
          </div>

          <button className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800">
            <Plus size={14} />
            Add Target
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find investor by name, tier, or theme..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
          <Filter size={14} />
          Filter
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setActiveFilter(opt.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeFilter === opt.key
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            {opt.label}
          </button>
        ))}
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
          description="Try adjusting your filters or search query."
        />
      )}
    </div>
  );
}
