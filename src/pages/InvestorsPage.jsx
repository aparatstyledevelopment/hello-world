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
  AlertTriangle,
  TrendingDown,
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
  const staleCount = enriched.filter((i) => i.freshness === "Stale").length;
  const highPressureCount = enriched.filter((i) => i.pressure === "HIGH").length;
  const decreasingCount = enriched.filter((i) => i.trajectory === "DECREASING").length;
  const atRiskTotal = new Set([
    ...enriched.filter((i) => i.freshness === "Stale").map((i) => i.id),
    ...enriched.filter((i) => i.pressure === "HIGH").map((i) => i.id),
  ]).size;

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

    // Sort: at-risk investors float to top, then by tier, then name
    return result.sort((a, b) => {
      const aRisk = a.pressure === "HIGH" || a.freshness === "Stale" ? 0 : 1;
      const bRisk = b.pressure === "HIGH" || b.freshness === "Stale" ? 0 : 1;
      if (aRisk !== bRisk) return aRisk - bRisk;
      return a.tier - b.tier || a.name.localeCompare(b.name);
    });
  }, [enriched, activeFilter, searchQuery]);

  // Determine if row is "at risk" for visual tinting
  const isAtRisk = (row) =>
    row.pressure === "HIGH" || row.freshness === "Stale";

  const rowClassName = (row) => {
    if (row.pressure === "HIGH" && row.freshness === "Stale")
      return "bg-red-50/60 border-l-4 border-l-red-400";
    if (row.pressure === "HIGH") return "bg-red-50/40 border-l-4 border-l-red-300";
    if (row.freshness === "Stale") return "bg-red-50/30 border-l-4 border-l-amber-300";
    if (row.trajectory === "DECREASING") return "bg-amber-50/20";
    return undefined;
  };

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
    const atRisk = isAtRisk(row);
    switch (col.key) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            {atRisk && (
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-red-500 animate-pulse" />
            )}
            <span
              className={cn(
                atRisk
                  ? "text-slate-900 font-bold text-sm"
                  : "text-slate-700 font-medium text-sm"
              )}
            >
              {row.name}
            </span>
          </div>
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
              "inline-flex items-center rounded-full",
              row.trajectory === "DECREASING"
                ? "px-3 py-1 text-sm font-bold bg-red-100 text-red-800 ring-1 ring-red-200"
                : row.trajectory === "INCREASING"
                ? "px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700"
                : "px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600"
            )}
          >
            {row.trajectory === "DECREASING" && (
              <TrendingDown size={14} className="mr-1" />
            )}
            {row.trajectory === "INCREASING" && (
              <span className="mr-1">&#9650;</span>
            )}
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
          <span className="text-xs text-slate-400">Low</span>
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
            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Negative
            </span>
          );
        return (
          <span className="text-xs text-slate-400">Neutral</span>
        );
      }
      case "freshness": {
        if (row.freshness === "Stale")
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse ring-2 ring-red-200" />
              Stale
            </span>
          );
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
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
            <span className="text-xs font-semibold text-red-500">Low</span>
          );
        return (
          <span className="text-xs text-slate-400">Medium</span>
        );
      }
      case "pressure": {
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-full",
                row.pressure === "HIGH"
                  ? "h-3 w-3 bg-red-500 animate-pulse ring-2 ring-red-200"
                  : "h-2.5 w-2.5",
                row.pressure === "MEDIUM" && "bg-amber-500",
                row.pressure === "LOW" && "bg-slate-300"
              )}
            />
            <span
              className={cn(
                "text-xs",
                row.pressure === "HIGH"
                  ? "font-bold text-red-700"
                  : row.pressure === "MEDIUM"
                  ? "font-medium text-amber-600"
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Investor Base
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Strategic investor intelligence and relationship management
          </p>

          {/* Stats row - alarming stats pop with 2-3x prominence */}
          <div className="mt-6 flex items-end gap-8">
            {/* Neutral stats - smaller */}
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                TOTAL
              </span>
              <p className="font-mono text-xl font-semibold text-slate-600">
                {enriched.length}
              </p>
            </div>
            <div className="h-12 w-px bg-slate-200" />
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                TIER 1
              </span>
              <p className="font-mono text-xl font-semibold text-slate-600">
                {tier1Count}
              </p>
            </div>
            <div className="h-12 w-px bg-slate-200" />

            {/* ALARMING stats - 2-3x bigger */}
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-red-400">
                STALE
              </span>
              <p
                className={cn(
                  "font-mono font-black",
                  staleCount > 0
                    ? "text-3xl text-red-600"
                    : "text-xl text-slate-300"
                )}
              >
                {staleCount}
                {staleCount > 0 && (
                  <span className="ml-2 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </p>
            </div>
            <div className="h-12 w-px bg-slate-200" />

            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-red-400">
                HIGH PRESSURE
              </span>
              <p
                className={cn(
                  "font-mono font-black",
                  highPressureCount > 0
                    ? "text-3xl text-red-600"
                    : "text-xl text-slate-300"
                )}
              >
                {highPressureCount}
              </p>
            </div>
            <div className="h-12 w-px bg-slate-200" />

            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-amber-500">
                DECREASING
              </span>
              <p
                className={cn(
                  "font-mono font-bold",
                  decreasingCount > 0
                    ? "text-2xl text-amber-600"
                    : "text-xl text-slate-300"
                )}
              >
                {decreasingCount}
              </p>
            </div>
            <div className="h-12 w-px bg-slate-200" />

            {/* Sentiment - de-emphasized */}
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                SENTIMENT
              </span>
              <p className="font-mono text-base text-slate-500">
                <span className="font-semibold text-emerald-600">{avgSentimentPositive}</span>
                <span className="text-slate-300">/{enriched.length}</span>
                <span className="ml-1 text-xs text-slate-400">positive</span>
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

      {/* At-risk summary banner - prominent */}
      {atRiskTotal > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-amber-50/50 px-5 py-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900">
              {atRiskTotal} investor{atRiskTotal !== 1 ? "s" : ""} need attention now
            </p>
            <p className="mt-0.5 text-xs text-red-700/70">
              {staleCount > 0 && (
                <span className="font-semibold">{staleCount} stale relationship{staleCount !== 1 ? "s" : ""}</span>
              )}
              {staleCount > 0 && highPressureCount > 0 && <span> &middot; </span>}
              {highPressureCount > 0 && (
                <span className="font-semibold">{highPressureCount} under high pressure</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setActiveFilter("high_risk")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
          >
            View At-Risk
          </button>
        </div>
      )}

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
                ? opt.key === "high_risk"
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-slate-900 bg-slate-900 text-white"
                : opt.key === "high_risk"
                ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            {opt.label}
            {opt.key === "high_risk" && atRiskTotal > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-100 px-1 text-[10px] font-bold text-red-700">
                {atRiskTotal}
              </span>
            )}
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
          rowClassName={rowClassName}
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
