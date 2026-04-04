import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Filter, FileDown, Users, BookOpen, Vote, UserCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/ui/Table";
import { HealthDots } from "../components/ui/HealthDots";
import { EmptyState } from "../components/ui/EmptyState";
import { AGMPage } from "./AGMPage";
import { PersonasPage } from "./PersonasPage";
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
  passive: "bg-zinc-100 text-zinc-600 border border-zinc-200/60",
  active: "bg-sky-50 text-sky-700 border border-sky-200/60",
  pension: "bg-amber-50 text-amber-700 border border-amber-200/60",
  sovereign: "bg-violet-50 text-violet-700 border border-violet-200/60",
};

const subTabs = [
  { key: "coverage", label: "Coverage Matrix", icon: Users },
  { key: "agm", label: "AGM Intel", icon: Vote },
  { key: "personas", label: "Personas", icon: UserCircle },
];

export function InvestorsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSubTab = searchParams.get("tab") || "coverage";
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
    { key: "name", label: "Investor & Fund", width: "180px" },
    { key: "type", label: "Type" },
    { key: "holdingPct", label: "Holding %" },
    { key: "health", label: "Relationship Health" },
    { key: "lastTouch", label: "Last Touch" },
    { key: "sensitivity", label: "Sensitivity" },
    { key: "prepare", label: "", width: "60px" },
  ];

  const renderCell = (row, col) => {
    switch (col.key) {
      case "name":
        return (
          <div>
            <span className="font-bold text-zinc-900 text-sm">{row.name}</span>
            <p className="text-xs text-zinc-400 mt-0.5">
              {investorTypeLabels[row.type] || row.type} &middot; Tier {row.tier}
            </p>
          </div>
        );
      case "type":
        return (
          <span
            className={cn(
              "inline-flex items-center text-[11px] tracking-[0.05em] uppercase font-semibold rounded-md px-2.5 py-1",
              investorTypeStyles[row.type] || "bg-zinc-100 text-zinc-700"
            )}
          >
            {row.type?.toUpperCase()}
          </span>
        );
      case "holdingPct":
        return (
          <span className="font-mono text-lg text-zinc-900">{row.holdingPct}%</span>
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
              isOld ? "text-red-600 font-semibold" : "text-zinc-600"
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
      case "prepare":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/investors/${row.id}?prepare=true`);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 shadow-sm transition-all hover:bg-zinc-900 hover:text-white hover:border-zinc-900"
            title="Prepare for meeting"
          >
            <BookOpen size={12} />
            Prep
          </button>
        );
      default:
        return row[col.key];
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Page title */}
      <h1 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">
        Investors
      </h1>

      {/* Sub-tabs */}
      <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 w-fit overflow-x-auto">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setSearchParams(tab.key === "coverage" ? {} : { tab: tab.key })}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap",
                activeSubTab === tab.key
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Coverage Matrix tab */}
      {activeSubTab === "coverage" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-zinc-500">Priority coverage matrix across your investor base</p>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-zinc-800">
                <Filter size={14} />
                Filter
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-zinc-800">
                <FileDown size={14} />
                Export PDF
              </button>
            </div>
          </div>

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
      )}

      {/* AGM Intel tab */}
      {activeSubTab === "agm" && <AGMPage embedded />}

      {/* Personas tab */}
      {activeSubTab === "personas" && <PersonasPage embedded />}
    </div>
  );
}
