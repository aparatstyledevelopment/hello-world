import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, FileDown, Users } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/ui/Table";
import { HealthDots } from "../components/ui/HealthDots";
import { EmptyState } from "../components/ui/EmptyState";
import {
  investors,
  getSignalsForInvestor,
} from "../data/mock-data";

const TODAY = new Date("2026-04-01");

// ── Derived helpers ─────────────────────────────────────
function deriveFreshness(inv) {
  let latest = null;
  for (const c of inv.contacts) {
    if (!latest || c.lastInteraction > latest) latest = c.lastInteraction;
  }
  if (!latest) return { label: "Stale", date: null, days: null };
  const days = Math.floor((TODAY - new Date(latest)) / (1000 * 60 * 60 * 24));
  return { label: days > 30 ? "Stale" : "Recent", date: latest, days };
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

function deriveHealthDots(inv) {
  const dots = [];
  dots.push(
    inv.engagementMomentum === "positive"
      ? "strong"
      : inv.engagementMomentum === "negative"
      ? "weak"
      : "moderate"
  );
  dots.push(
    inv.holdingTrend === "up"
      ? "strong"
      : inv.holdingTrend === "down"
      ? "weak"
      : "moderate"
  );
  const fresh = deriveFreshness(inv);
  dots.push(fresh.label === "Recent" ? "strong" : "weak");
  const pressure = derivePressure(inv);
  dots.push(
    pressure === "LOW" ? "strong" : pressure === "MEDIUM" ? "moderate" : "weak"
  );
  return dots;
}

function deriveSensitivity(inv) {
  const params = inv.stateParameters || [];
  const hasGov = params.some(
    (p) =>
      p.label.toLowerCase().includes("voting") ||
      p.label.toLowerCase().includes("governance")
  );
  const hasESG = params.some(
    (p) =>
      p.label.toLowerCase().includes("esg") ||
      p.label.toLowerCase().includes("climate") ||
      (p.value && p.value.toLowerCase().includes("climate"))
  );
  const hasLiquidity = inv.holdingTrend === "down";

  const tags = [];
  if (hasGov) tags.push("governance");
  if (hasESG) tags.push("esg");
  if (hasLiquidity) tags.push("liquidity");
  if (tags.length === 0) tags.push("governance");
  return tags;
}

function getLastTouchDate(inv) {
  let latest = null;
  for (const c of inv.contacts) {
    if (!latest || c.lastInteraction > latest) latest = c.lastInteraction;
  }
  return latest;
}

const investorTypeLabels = {
  passive: "Passive Index",
  active: "Active Manager",
  pension: "Pension Fund",
  sovereign: "Sovereign Wealth",
};

const investorTypeStyles = {
  passive: "bg-blue-50 text-blue-700 border border-blue-200",
  active: "bg-violet-50 text-violet-700 border border-violet-200",
  pension: "bg-amber-50 text-amber-700 border border-amber-200",
  sovereign: "bg-teal-50 text-teal-700 border border-teal-200",
};

export function InvestorsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const enriched = useMemo(() => {
    return investors.map((inv) => ({
      ...inv,
      freshness: deriveFreshness(inv),
      pressure: derivePressure(inv),
      healthDots: deriveHealthDots(inv),
      sensitivity: deriveSensitivity(inv),
      lastTouch: getLastTouchDate(inv),
    }));
  }, []);

  const filtered = useMemo(() => {
    let result = enriched;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.type && i.type.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => {
      const aRisk =
        a.pressure === "HIGH" || a.freshness.label === "Stale" ? 0 : 1;
      const bRisk =
        b.pressure === "HIGH" || b.freshness.label === "Stale" ? 0 : 1;
      if (aRisk !== bRisk) return aRisk - bRisk;
      return a.tier - b.tier || a.name.localeCompare(b.name);
    });
  }, [enriched, searchQuery]);

  const rowClassName = (row) => {
    if (row.pressure === "HIGH" && row.freshness.label === "Stale")
      return "bg-red-50/60";
    if (row.pressure === "HIGH") return "bg-red-50/40";
    if (row.freshness.label === "Stale") return "bg-red-50/20";
    return undefined;
  };

  const columns = [
    { key: "name", label: "Investor & Fund", width: "260px" },
    { key: "type", label: "Type" },
    { key: "holdingPct", label: "Holding %" },
    { key: "health", label: "Relationship Health" },
    { key: "lastTouch", label: "Last Touch" },
    { key: "sensitivity", label: "Sensitivity" },
  ];

  const renderCell = (row, col) => {
    switch (col.key) {
      case "name":
        return (
          <div>
            <span className="font-bold text-slate-900 text-sm">{row.name}</span>
            <p className="text-xs text-slate-400 mt-0.5">
              {investorTypeLabels[row.type] || row.type} &middot; Tier {row.tier}
            </p>
          </div>
        );
      case "type":
        return (
          <span
            className={cn(
              "inline-flex items-center text-[11px] tracking-[0.05em] uppercase font-semibold rounded-md px-2.5 py-1",
              investorTypeStyles[row.type] || "bg-slate-100 text-slate-700"
            )}
          >
            {row.type?.toUpperCase()}
          </span>
        );
      case "holdingPct":
        return (
          <span className="font-mono text-lg text-slate-900">{row.holdingPct}%</span>
        );
      case "health":
        return <HealthDots values={row.healthDots} />;
      case "lastTouch": {
        const days = row.freshness.days;
        const isOld = days !== null && days > 30;
        return (
          <span
            className={cn(
              "text-sm",
              isOld ? "text-red-600 font-semibold" : "text-slate-600"
            )}
          >
            {row.lastTouch || "No contact"}
          </span>
        );
      }
      case "sensitivity":
        return (
          <div className="flex flex-wrap gap-1.5">
            {row.sensitivity.map((s) => (
              <Badge key={s} variant={s} kind="sensitivity" />
            ))}
          </div>
        );
      default:
        return row[col.key];
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Priority Coverage Matrix
        </h1>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800">
            <Filter size={14} />
            Filter
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800">
            <FileDown size={14} />
            Export PDF
          </button>
        </div>
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
          description="Try adjusting your search query."
        />
      )}
    </div>
  );
}
